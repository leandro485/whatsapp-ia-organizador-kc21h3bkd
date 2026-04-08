migrate(
  (app) => {
    const settings = app.findCollectionByNameOrId('user_settings')
    settings.fields.add(new BoolField({ name: 'reminders_enabled' }))
    settings.fields.add(new NumberField({ name: 'reminder_lead_time' }))
    app.save(settings)

    const tasks = app.findCollectionByNameOrId('tasks')
    if (!tasks.fields.getByName('priority')) {
      tasks.fields.add(
        new SelectField({ name: 'priority', maxSelect: 1, values: ['low', 'medium', 'high'] }),
      )
    }
    app.save(tasks)
  },
  (app) => {
    const settings = app.findCollectionByNameOrId('user_settings')
    settings.fields.removeByName('reminders_enabled')
    settings.fields.removeByName('reminder_lead_time')
    app.save(settings)

    const tasks = app.findCollectionByNameOrId('tasks')
    tasks.fields.removeByName('priority')
    app.save(tasks)
  },
)
