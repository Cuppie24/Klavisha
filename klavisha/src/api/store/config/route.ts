import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const storeService = req.scope.resolve(Modules.STORE)
  const [store] = await storeService.listStores({}, { select: ["metadata"] })
  res.json({ metadata: store?.metadata ?? {} })
}
