routerAdd(
  'POST',
  '/backend/v1/whatsapp/disconnect',
  (e) => {
    const userId = e.auth.id
    try {
      const settings = $app.findFirstRecordByFilter('user_settings', 'user = {:userId}', { userId })
      settings.set('whatsapp_connected', false)
      $app.save(settings)
      return e.json(200, { success: true })
    } catch (err) {
      return e.json(400, { error: 'Settings not found' })
    }
  },
  $apis.requireAuth(),
)
