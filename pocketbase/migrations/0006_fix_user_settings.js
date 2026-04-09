migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('user_settings')

    if (!collection.fields.getByName('reminders_enabled')) {
      collection.fields.add(new BoolField({ name: 'reminders_enabled' }))
    }

    if (!collection.fields.getByName('reminder_lead_time')) {
      collection.fields.add(new NumberField({ name: 'reminder_lead_time' }))
    }

    collection.addIndex('idx_user_settings_user', true, 'user', '')

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('user_settings')
    collection.removeIndex('idx_user_settings_user')
    app.save(collection)
  },
)
