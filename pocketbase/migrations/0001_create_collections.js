migrate(
  (app) => {
    const chats = new Collection({
      name: 'chats',
      type: 'base',
      listRule: 'owner = @request.auth.id',
      viewRule: 'owner = @request.auth.id',
      createRule: 'owner = @request.auth.id',
      updateRule: 'owner = @request.auth.id',
      deleteRule: 'owner = @request.auth.id',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'last_message', type: 'text' },
        { name: 'priority', type: 'select', values: ['low', 'medium', 'high'], maxSelect: 1 },
        { name: 'summary', type: 'text' },
        {
          name: 'owner',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(chats)

    const tasks = new Collection({
      name: 'tasks',
      type: 'base',
      listRule: 'owner = @request.auth.id',
      viewRule: 'owner = @request.auth.id',
      createRule: 'owner = @request.auth.id',
      updateRule: 'owner = @request.auth.id',
      deleteRule: 'owner = @request.auth.id',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['detected', 'in_progress', 'completed'],
          maxSelect: 1,
        },
        { name: 'deadline', type: 'date' },
        { name: 'chat', type: 'relation', collectionId: chats.id, maxSelect: 1 },
        {
          name: 'owner',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(tasks)

    const userSettings = new Collection({
      name: 'user_settings',
      type: 'base',
      listRule: 'user = @request.auth.id',
      viewRule: 'user = @request.auth.id',
      createRule: 'user = @request.auth.id',
      updateRule: 'user = @request.auth.id',
      deleteRule: 'user = @request.auth.id',
      fields: [
        { name: 'whatsapp_connected', type: 'bool' },
        { name: 'ai_aggressiveness', type: 'number', min: 0, max: 100 },
        { name: 'categories', type: 'json' },
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(userSettings)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('user_settings'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('tasks'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('chats'))
    } catch (e) {}
  },
)
