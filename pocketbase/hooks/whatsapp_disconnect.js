routerAdd(
  'POST',
  '/backend/v1/whatsapp/disconnect',
  (e) => {
    const userId = e.auth.id
    try {
      const settings = $app.findFirstRecordByFilter('user_settings', 'user = {:userId}', { userId })
      settings.set('whatsapp_connected', false)
      $app.save(settings)
      return e.json(200, { success: true, message: 'Session purged and disconnected' })
    } catch (err) {
      // If no settings exist, the user is technically already disconnected
      return e.json(200, { success: true, message: 'No active session found' })
    }
  },
  $apis.requireAuth(),
)
