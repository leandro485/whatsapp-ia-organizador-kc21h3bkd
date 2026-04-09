routerAdd(
  'POST',
  '/backend/v1/whatsapp/disconnect',
  (e) => {
    const instanceId = ($secrets.get('ZAPI_INSTANCE_ID') || '').trim()
    const token = ($secrets.get('ZAPI_TOKEN') || '').trim()

    if (!instanceId || !token) {
      throw new BadRequestError('Z-API credentials missing')
    }

    try {
      $http.send({
        url: `https://api.z-api.io/instances/${instanceId}/token/${token}/disconnect`,
        method: 'GET',
      })
    } catch (err) {
      // Ignored if it fails to disconnect via network
    }

    const userId = e.auth?.id
    if (userId) {
      try {
        const settings = $app.findFirstRecordByData('user_settings', 'user', userId)
        settings.set('whatsapp_connected', false)
        $app.save(settings)
      } catch (err) {
        // Ignored
      }
    }

    return e.json(200, { success: true, message: 'Sessão do WhatsApp encerrada com sucesso.' })
  },
  $apis.requireAuth(),
)
