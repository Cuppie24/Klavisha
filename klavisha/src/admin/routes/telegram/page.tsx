import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useState, useEffect, useCallback } from "react"

export const config = defineRouteConfig({
  label: "Telegram",
})

interface TelegramSettings {
  bot_token: string
  chat_ids: string[]
  template: string
}

const DEFAULT_TEMPLATE = `🛒 <b>Новый заказ!</b>
{{order_id_line}}
👤 Имя: {{name}}
📞 Телефон: {{phone}}
📍 Адрес: {{address}}
{{comment_line}}
📦 <b>Товары:</b>
{{items}}

💰 <b>Итого: {{total}}</b>`

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  fontSize: 14,
  fontFamily: 'monospace',
  boxSizing: 'border-box',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  marginBottom: 6,
  fontSize: 14,
}

const hintStyle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: 13,
  marginBottom: 10,
  lineHeight: 1.5,
}

export default function TelegramSettingsPage() {
  const [settings, setSettings] = useState<TelegramSettings>({
    bot_token: '',
    chat_ids: [],
    template: DEFAULT_TEMPLATE,
  })
  const [newChatId, setNewChatId] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/admin/telegram-settings', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json() as { settings: Partial<TelegramSettings> }
        setSettings({
          bot_token: data.settings?.bot_token ?? '',
          chat_ids: data.settings?.chat_ids ?? [],
          template: data.settings?.template ?? DEFAULT_TEMPLATE,
        })
      }
    } catch {
      setError('Не удалось загрузить настройки')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const save = async () => {
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const res = await fetch('/admin/telegram-settings', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Не удалось сохранить настройки')
    } finally {
      setSaving(false)
    }
  }

  const addChatId = () => {
    const id = newChatId.trim()
    if (id && !settings.chat_ids.includes(id)) {
      setSettings(s => ({ ...s, chat_ids: [...s.chat_ids, id] }))
      setNewChatId('')
    }
  }

  const removeChatId = (id: string) => {
    setSettings(s => ({ ...s, chat_ids: s.chat_ids.filter(c => c !== id) }))
  }

  if (loading) {
    return (
      <div style={{ padding: 32, color: '#6b7280', fontSize: 14 }}>
        Загрузка настроек...
      </div>
    )
  }

  return (
    <div style={{ padding: 32, maxWidth: 680 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
        Уведомления Telegram
      </h1>
      <p style={{ color: '#6b7280', marginBottom: 32, fontSize: 14 }}>
        Бот отправляет сообщение менеджерам при каждом новом заказе с сайта.
      </p>

      {/* Bot token */}
      <div style={{ marginBottom: 28 }}>
        <label style={labelStyle}>Токен бота</label>
        <p style={hintStyle}>
          Создайте бота через <b>@BotFather</b> в Telegram → скопируйте токен сюда.
        </p>
        <input
          type="password"
          value={settings.bot_token}
          onChange={e => setSettings(s => ({ ...s, bot_token: e.target.value }))}
          placeholder="1234567890:AABBCCDDeeffggHHIIjjKK..."
          style={inputStyle}
        />
      </div>

      {/* Chat IDs */}
      <div style={{ marginBottom: 28 }}>
        <label style={labelStyle}>Chat ID менеджеров</label>
        <p style={hintStyle}>
          Узнайте свой Chat ID через <b>@userinfobot</b>. Можно добавить несколько менеджеров.
          Для групп/каналов ID начинается с «-100».
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            type="text"
            value={newChatId}
            onChange={e => setNewChatId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addChatId()}
            placeholder="-1001234567890"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={addChatId}
            style={{
              padding: '10px 20px',
              background: '#111827',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              whiteSpace: 'nowrap',
            }}
          >
            + Добавить
          </button>
        </div>
        {settings.chat_ids.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {settings.chat_ids.map(id => (
              <span
                key={id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#f3f4f6',
                  borderRadius: 6,
                  padding: '5px 10px',
                  fontSize: 13,
                  fontFamily: 'monospace',
                }}
              >
                {id}
                <button
                  onClick={() => removeChatId(id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    padding: 0,
                    lineHeight: 1,
                    fontSize: 16,
                  }}
                  title="Удалить"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p style={{ color: '#9ca3af', fontSize: 13 }}>Менеджеры не добавлены</p>
        )}
      </div>

      {/* Template */}
      <div style={{ marginBottom: 32 }}>
        <label style={labelStyle}>Шаблон сообщения</label>
        <p style={hintStyle}>
          Поддерживаются переменные:{' '}
          {['{{order_id_line}}', '{{name}}', '{{phone}}', '{{address}}', '{{comment_line}}', '{{items}}', '{{total}}'].map(v => (
            <code key={v} style={{ background: '#f3f4f6', borderRadius: 4, padding: '1px 5px', marginRight: 4 }}>{v}</code>
          ))}
          <br />
          Разрешена HTML-разметка Telegram: <code style={{ background: '#f3f4f6', borderRadius: 4, padding: '1px 5px' }}>&lt;b&gt;</code>,{' '}
          <code style={{ background: '#f3f4f6', borderRadius: 4, padding: '1px 5px' }}>&lt;i&gt;</code>,{' '}
          <code style={{ background: '#f3f4f6', borderRadius: 4, padding: '1px 5px' }}>&lt;code&gt;</code>.
        </p>
        <textarea
          value={settings.template}
          onChange={e => setSettings(s => ({ ...s, template: e.target.value }))}
          rows={13}
          style={{
            ...inputStyle,
            resize: 'vertical',
            lineHeight: 1.6,
          }}
        />
        <button
          onClick={() => setSettings(s => ({ ...s, template: DEFAULT_TEMPLATE }))}
          style={{
            marginTop: 8,
            background: 'none',
            border: 'none',
            color: '#6b7280',
            fontSize: 13,
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
          }}
        >
          Сбросить к стандартному
        </button>
      </div>

      {error && (
        <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 16 }}>{error}</p>
      )}

      <button
        onClick={save}
        disabled={saving}
        style={{
          padding: '12px 36px',
          background: saved ? '#10b981' : '#111827',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: saving ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: 15,
          transition: 'background 0.25s',
        }}
      >
        {saving ? 'Сохранение...' : saved ? '✓ Сохранено' : 'Сохранить настройки'}
      </button>
    </div>
  )
}
