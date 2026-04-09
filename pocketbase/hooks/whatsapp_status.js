routerAdd(
  'GET',
  '/backend/v1/whatsapp/status',
  (e) => {
    const instanceId = ($secrets.get('ZAPI_INSTANCE_ID') || '').trim()
    const token = ($secrets.get('ZAPI_TOKEN') || '').trim()

    if (!instanceId || !token) {
      throw new BadRequestError(
        'Credenciais do Z-API não configuradas (ZAPI_INSTANCE_ID ou ZAPI_TOKEN).',
      )
    }

    const res = $http.send({
      url: `https://api.z-api.io/instances/${instanceId}/token/${token}/status`,
      method: 'GET',
    })

    if (res.statusCode !== 200) {
      throw new BadRequestError('Falha ao obter status do Z-API: ' + res.statusCode)
    }

    const data = res.json || {}
    const isConnected = data.connected || data.status === 'CONNECTED'

    const userId = e.auth ? e.auth.id : null
    if (userId) {
      try {
        const settings = $app.findFirstRecordByData('user_settings', 'user', userId)
        if (settings.get('whatsapp_connected') !== isConnected) {
          settings.set('whatsapp_connected', isConnected)
          $app.save(settings)
        }
      } catch (err) {
        // Ignored
      }
    }

    return e.json(200, data)
  },
  $apis.requireAuth(),
)
