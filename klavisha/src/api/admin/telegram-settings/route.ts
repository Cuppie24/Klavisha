import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

const META_KEY = 'telegram_settings'

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const storeService = req.scope.resolve(Modules.STORE)
  const [store] = await storeService.listStores({}, { select: ["metadata"] })
  const settings = (store?.metadata?.[META_KEY] as Record<string, unknown>) ?? {}
  res.json({ settings })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const storeService = req.scope.resolve(Modules.STORE)
  const [store] = await storeService.listStores({}, { select: ["id", "metadata"] })
  const body = req.body as Record<string, unknown>

  await storeService.updateStores(store.id, {
    metadata: {
      ...(store?.metadata ?? {}),
      [META_KEY]: body,
    },
  })

  res.json({ success: true })
}
