migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('user_settings')
    col.addIndex('CREATE UNIQUE INDEX idx_user_settings_user ON user_settings (user)')
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('user_settings')
    col.removeIndex('idx_user_settings_user')
    app.save(col)
  },
)
