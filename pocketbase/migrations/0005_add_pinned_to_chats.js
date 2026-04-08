migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('chats')
    if (!collection.fields.getByName('pinned')) {
      collection.fields.add(new BoolField({ name: 'pinned' }))
    }
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('chats')
    collection.fields.removeByName('pinned')
    app.save(collection)
  },
)
