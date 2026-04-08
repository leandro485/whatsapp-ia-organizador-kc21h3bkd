migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'leandro@lelusacolas.com.br')
      return // already seeded
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('leandro@lelusacolas.com.br')
    record.setPassword('Skip@Pass')
    record.set('username', 'leandro')
    record.setVerified(true)
    record.set('name', 'Leandro')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'leandro@lelusacolas.com.br')
      app.delete(record)
    } catch (_) {}
  },
)
