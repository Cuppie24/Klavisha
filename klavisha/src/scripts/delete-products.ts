import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows";

// Deletes products. By default deletes ALL products (clean slate before a full
// re-import). Set KEEP_UZUM=1 to keep products with metadata.source === "uzum".
// Run: npx medusa exec ./src/scripts/delete-products.ts
export default async function deleteProductsScript({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const keepUzum = process.env.KEEP_UZUM === "1";

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "metadata"],
  });

  const toDelete = products.filter(
    (p: any) => !(keepUzum && p?.metadata?.source === "uzum")
  );

  logger.info(
    `products total: ${products.length} | deleting: ${toDelete.length}${keepUzum ? " (keeping uzum-sourced)" : " (ALL)"}`
  );
  if (!toDelete.length) {
    logger.info("nothing to delete.");
    return;
  }
  toDelete.forEach((p: any) => logger.info(`  - ${p.handle}`));

  await deleteProductsWorkflow(container).run({
    input: { ids: toDelete.map((p: any) => p.id) },
  });

  logger.info(`Deleted ${toDelete.length} products.`);
}
