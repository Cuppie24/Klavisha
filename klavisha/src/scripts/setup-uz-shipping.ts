import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createShippingOptionsWorkflow } from "@medusajs/medusa/core-flows"

// Creates a shipping option for the UZ region so carts can be completed and
// orders created. Idempotent: skips if a shipping option already exists in the
// UZ service zone.
// Run: npx medusa exec ./src/scripts/setup-uz-shipping.ts
export default async function setupUzShipping({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const log = (s: string) => logger.info(`[setup-uz-shipping] ${s}`)

  // ── Resolve the required references ─────────────────────────────────────────
  const { data: profiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "name", "type"],
  })
  const profile = profiles.find((p: any) => p.type === "default") ?? profiles[0]
  if (!profile) throw new Error("No shipping profile found.")

  const { data: sets } = await query.graph({
    entity: "fulfillment_set",
    fields: [
      "id",
      "name",
      "service_zones.id",
      "service_zones.name",
      "service_zones.geo_zones.country_code",
      "service_zones.shipping_options.id",
    ],
  })

  // Find the service zone that covers "uz".
  let zone: any = null
  for (const set of sets) {
    for (const sz of set.service_zones ?? []) {
      if ((sz.geo_zones ?? []).some((g: any) => g.country_code === "uz")) {
        zone = sz
        break
      }
    }
    if (zone) break
  }
  if (!zone) throw new Error("No service zone covering 'uz' found. Create a fulfillment set + service zone for Uzbekistan first.")

  if ((zone.service_zones?.shipping_options ?? zone.shipping_options ?? []).length > 0) {
    log(`Service zone '${zone.name}' already has shipping options — nothing to do.`)
    return
  }

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code", "countries.iso_2"],
  })
  const region = regions.find((r: any) => (r.countries ?? []).some((c: any) => c.iso_2 === "uz")) ?? regions[0]
  if (!region) throw new Error("No region found.")

  log(`profile=${profile.id} zone=${zone.name}(${zone.id}) region=${region.name}(${region.id})`)

  // ── Ensure the manual fulfillment provider is linked to the stock location ──
  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name", "fulfillment_providers.id"],
  })
  for (const loc of locations) {
    const alreadyLinked = (loc.fulfillment_providers ?? []).some(
      (p: any) => p.id === "manual_manual"
    )
    if (alreadyLinked) {
      log(`Location '${loc.name}' already linked to manual_manual.`)
      continue
    }
    try {
      await link.create({
        [Modules.STOCK_LOCATION]: { stock_location_id: loc.id },
        [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
      })
      log(`Linked manual_manual fulfillment provider to location '${loc.name}'.`)
    } catch (e) {
      log(`Could not link provider to '${loc.name}' (may already exist): ${(e as Error).message}`)
    }
  }

  // ── Create the shipping option ──────────────────────────────────────────────
  const { result } = await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Доставка по Узбекистану",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: zone.id,
        shipping_profile_id: profile.id,
        type: {
          label: "Стандартная",
          description: "Доставка по Узбекистану.",
          code: "standard",
        },
        prices: [
          { region_id: region.id, amount: 0 },
          { currency_code: region.currency_code, amount: 0 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  })

  log(`Created shipping option: ${result?.[0]?.id ?? "(unknown id)"}`)
  log("Done. Orders can now be completed for the UZ region.")
}
