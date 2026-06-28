import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import {
  updateCartWorkflow,
  listShippingOptionsForCartWorkflow,
  addShippingMethodToCartWorkflow,
  createPaymentCollectionForCartWorkflow,
  createPaymentSessionsWorkflow,
  completeCartWorkflow,
} from "@medusajs/medusa/core-flows"

const META_KEY = 'telegram_settings'

const DEFAULT_TEMPLATE = `🛒 <b>Новый заказ!</b>
{{order_id_line}}
👤 Имя: {{name}}
📞 Телефон: {{phone}}
📍 Адрес: {{address}}
{{comment_line}}
📦 <b>Товары:</b>
{{items}}

💰 <b>Итого: {{total}}</b>`

interface TelegramSettings {
  bot_token?: string
  chat_ids?: string[]
  template?: string
}

interface OrderItem {
  title: string
  variant_title?: string
  quantity: number
  unit_price: number
}

interface OrderRequestBody {
  cart_id: string
  name: string
  phone: string
  address: string
  comment?: string
  items: OrderItem[]
  total: number
  currency_code: string
}

async function sendTelegramMessage(botToken: string, chatId: string, text: string): Promise<void> {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('[Telegram] sendMessage failed:', JSON.stringify(err))
    }
  } catch (err) {
    console.error('[Telegram] fetch error:', err)
  }
}

async function sendOrderNotification(
  storeService: any,
  body: OrderRequestBody,
  orderId: string | null
): Promise<void> {
  const [store] = await storeService.listStores({}, { select: ["metadata"] })
  const settings = ((store?.metadata?.[META_KEY]) ?? {}) as TelegramSettings

  if (!settings.bot_token || !settings.chat_ids?.length) return

  const template = settings.template || DEFAULT_TEMPLATE

  const itemsText = (body.items ?? [])
    .map(i =>
      `• ${i.title}${i.variant_title && i.variant_title !== 'Default Title' ? ` (${i.variant_title})` : ''} × ${i.quantity}`
    )
    .join('\n')

  const commentLine = body.comment?.trim()
    ? `💬 Комментарий: ${body.comment.trim()}\n`
    : ''

  const orderIdLine = orderId ? `🔖 Заказ: <code>${orderId}</code>\n` : ''

  const currency = (body.currency_code ?? 'UZS').toUpperCase()
  const totalFormatted = `${(body.total ?? 0).toLocaleString('ru-RU')} ${currency}`

  const message = template
    .replace(/\{\{order_id_line\}\}/g, orderIdLine)
    .replace(/\{\{name\}\}/g, body.name)
    .replace(/\{\{phone\}\}/g, body.phone)
    .replace(/\{\{address\}\}/g, body.address)
    .replace(/\{\{comment_line\}\}/g, commentLine)
    .replace(/\{\{items\}\}/g, itemsText)
    .replace(/\{\{total\}\}/g, totalFormatted)

  for (const chatId of settings.chat_ids) {
    await sendTelegramMessage(settings.bot_token, chatId, message)
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as OrderRequestBody

  if (!body.cart_id || !body.name || !body.phone || !body.address) {
    return res.status(400).json({ message: 'cart_id, name, phone and address are required' })
  }

  const storeService = req.scope.resolve(Modules.STORE)
  let orderId: string | null = null
  const debug: Record<string, string> = {}

  // ── Step 1: Update cart with customer details ──────────────────────────────
  const nameParts = body.name.trim().split(/\s+/)
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ') || firstName
  const sanitizedPhone = body.phone.replace(/\D/g, '')
  const email = `${sanitizedPhone}@orders.klavisha.uz`

  const addressPayload = {
    first_name: firstName,
    last_name: lastName,
    address_1: body.address,
    phone: body.phone,
    country_code: 'uz',
  }

  try {
    await updateCartWorkflow(req.scope).run({
      input: {
        id: body.cart_id,
        email,
        shipping_address: addressPayload,
        billing_address: addressPayload,
        metadata: {
          customer_name: body.name,
          customer_phone: body.phone,
          comment: body.comment ?? '',
        },
      },
    })
    debug.update_cart = 'ok'
  } catch (err) {
    console.error('[OrderRequest] Failed to update cart:', err)
    debug.update_cart = (err as Error).message
    await sendOrderNotification(storeService, body, null)
    return res.json({ success: true, order_id: null, debug })
  }

  // ── Step 2: Add shipping method ────────────────────────────────────────────
  // Pick the first shipping option valid for the cart's region/address. A
  // shipping option (tied to the products' shipping profile) MUST be attached,
  // otherwise completeCartWorkflow rejects the cart with "shipping profiles
  // that are not satisfied". The UZ shipping option is created by
  // ./src/scripts/setup-uz-shipping.ts.
  try {
    const { result: shippingOptions } = await listShippingOptionsForCartWorkflow(req.scope).run({
      input: { cart_id: body.cart_id, is_return: false },
    })

    if (shippingOptions.length > 0) {
      await addShippingMethodToCartWorkflow(req.scope).run({
        input: {
          cart_id: body.cart_id,
          options: [{ id: shippingOptions[0].id }],
        },
      })
      debug.shipping = `ok (option ${shippingOptions[0].id})`
    } else {
      // No valid option — completion will fail. Surface this clearly instead of
      // attaching an invalid bare shipping method.
      console.error('[OrderRequest] No shipping options for cart region. Run setup-uz-shipping.ts.')
      debug.shipping = 'no shipping options available for region'
    }
  } catch (err) {
    console.warn('[OrderRequest] Shipping step failed, continuing:', (err as Error).message)
    debug.shipping = (err as Error).message
  }

  // ── Step 3: Create payment collection ─────────────────────────────────────
  let paymentCollectionId: string | null = null
  try {
    const { result: paymentCollection } = await createPaymentCollectionForCartWorkflow(req.scope).run({
      input: { cart_id: body.cart_id },
    })
    paymentCollectionId = paymentCollection.id
    debug.payment_collection = 'ok'
  } catch (err) {
    console.warn('[OrderRequest] Payment collection step failed, continuing:', (err as Error).message)
    debug.payment_collection = (err as Error).message
  }

  // ── Step 4: Initialize payment session with manual provider ────────────────
  if (paymentCollectionId) {
    try {
      await createPaymentSessionsWorkflow(req.scope).run({
        input: {
          payment_collection_id: paymentCollectionId,
          provider_id: 'pp_system_default',
        },
      })
      debug.payment_session = 'ok'
    } catch (err) {
      console.warn('[OrderRequest] Payment session step failed, continuing:', (err as Error).message)
      debug.payment_session = (err as Error).message
    }
  }

  // ── Step 5: Complete cart → create order ───────────────────────────────────
  try {
    const { result: order } = await completeCartWorkflow(req.scope).run({
      input: { id: body.cart_id },
    })
    orderId = order.id
    debug.complete_cart = 'ok'
  } catch (err) {
    console.error('[OrderRequest] Cart completion failed:', (err as Error).message)
    debug.complete_cart = (err as Error).message
  }

  // ── Step 6: Send Telegram notification ────────────────────────────────────
  await sendOrderNotification(storeService, body, orderId)

  res.json({ success: true, order_id: orderId, debug })
}
