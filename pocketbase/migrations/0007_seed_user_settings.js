migrate(
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'leandro@lelusacolas.com.br')
      try {
        app.findFirstRecordByData('user_settings', 'user', user.id)
      } catch (_) {
        const col = app.findCollectionByNameOrId('user_settings')
        const record = new Record(col)
        record.set('user', user.id)
        record.set('whatsapp_connected', false)
        record.set('ai_aggressiveness', 50)
        record.set('categories', ['Trabalho', 'Família', 'Financeiro', 'Vendas'])
        record.set('reminders_enabled', false)
        record.set('reminder_lead_time', 30)
        app.save(record)
      }
    } catch (_) {
      // User doesn't exist, skip safely
    }
  },
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'leandro@lelusacolas.com.br')
      const record = app.findFirstRecordByData('user_settings', 'user', user.id)
      app.delete(record)
    } catch (_) {}
  },
)
