import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
  uploadFilesWorkflow,
} from "@medusajs/medusa/core-flows";
import fs from "fs";
import path from "path";

// Imports products previously normalized by .uzum-import/build.mjs into Medusa.
// Run: npx medusa exec ./src/scripts/import-uzum.ts
export default async function importUzum({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const CURRENCY = "uzs";
  const dir = path.join(process.cwd(), ".uzum-import");
  const products = JSON.parse(fs.readFileSync(path.join(dir, "data.json"), "utf8"));

  // Resolve the fixed references once.
  const first = async (entity: string, filters: any = {}) => {
    const { data } = await query.graph({ entity, fields: ["id", "name"], filters });
    return data[0];
  };
  const channel = await first("sales_channel", { name: "Uzum" });
  const category = await first("product_category", { name: "Клавиатуры" });
  const location = await first("stock_location", { name: "Tashkent" });
  const { data: profiles } = await query.graph({ entity: "shipping_profile", fields: ["id"] });
  const shippingProfileId = profiles[0]?.id;

  logger.info(
    `refs -> channel:${channel?.id ?? "-"} category:${category?.id ?? "-"} location:${location?.id ?? "-"} shippingProfile:${shippingProfileId ?? "-"}`
  );
  if (!shippingProfileId) throw new Error("No shipping profile found — cannot create products.");

  for (const p of products) {
    const { data: existing } = await query.graph({
      entity: "product",
      fields: ["id", "handle"],
      filters: { handle: p.handle },
    });
    if (existing.length) {
      logger.info(`skip (handle exists): ${p.handle}`);
      continue;
    }

    // 1) Upload images to the file module (local provider -> static/).
    const files = p.images.map((img: any) => ({
      filename: img.file,
      mimeType: "image/jpeg",
      access: "public" as const,
      content: fs.readFileSync(path.join(dir, "images", img.file)).toString("base64"),
    }));
    const { result: uploaded } = await uploadFilesWorkflow(container).run({ input: { files } });
    const urlByKey: Record<string, string> = {};
    p.images.forEach((img: any, i: number) => (urlByKey[img.key] = uploaded[i].url));
    logger.info(`${p.title}: uploaded ${uploaded.length} images`);

    // 2) Create the product with options + variants + prices.
    const productInput: any = {
      title: p.title,
      handle: p.handle,
      description: p.description,
      status: ProductStatus.PUBLISHED,
      weight: 1000,
      shipping_profile_id: shippingProfileId,
      thumbnail: p.thumbnailKey ? urlByKey[p.thumbnailKey] : uploaded[0]?.url,
      images: uploaded.map((u: any) => ({ url: u.url })),
      options: p.options.map((o: any) => ({ title: o.title, values: o.values })),
      category_ids: category ? [category.id] : [],
      sales_channels: channel ? [{ id: channel.id }] : [],
      metadata: {
        source: "uzum",
        uzum_product_id: p.uzumId,
        uzum_category: p.category,
        rating: p.rating,
        orders: p.orders,
      },
      variants: p.variants.map((v: any) => ({
        title: v.title,
        sku: v.sku,
        ...(v.barcode ? { barcode: v.barcode } : {}),
        manage_inventory: true,
        options: v.options,
        prices: [{ amount: v.price, currency_code: CURRENCY }],
        metadata: {
          uzum_full_price: v.fullPrice,
          photo: v.photoKey ? urlByKey[v.photoKey] ?? null : null,
        },
      })),
    };

    const { result: created } = await createProductsWorkflow(container).run({
      input: { products: [productInput] },
    });
    logger.info(`created ${created[0].handle} with ${created[0].variants.length} variants`);

    // 3) Set inventory levels per SKU at the Tashkent location.
    if (location) {
      const skus = p.variants.map((v: any) => v.sku);
      const { data: invItems } = await query.graph({
        entity: "inventory_item",
        fields: ["id", "sku"],
        filters: { sku: skus },
      });
      const stockBySku: Record<string, number> = {};
      p.variants.forEach((v: any) => (stockBySku[v.sku] = v.stock ?? 0));
      const levels = invItems.map((it: any) => ({
        inventory_item_id: it.id,
        location_id: location.id,
        stocked_quantity: stockBySku[it.sku] ?? 0,
      }));
      if (levels.length) {
        await createInventoryLevelsWorkflow(container).run({ input: { inventory_levels: levels } });
        logger.info(`  set ${levels.length} inventory levels`);
      }
    }
  }

  logger.info("Uzum import finished.");
}
