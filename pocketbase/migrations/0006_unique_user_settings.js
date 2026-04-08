migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('user_settings')
    col.addIndex('idx_user_settings_user', true, 'user', '')
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('user_settings')
    col.removeIndex('idx_user_settings_user')
    app.save(col)
  },
)
