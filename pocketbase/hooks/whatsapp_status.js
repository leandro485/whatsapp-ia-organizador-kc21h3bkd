routerAdd(
  'GET',
  '/backend/v1/whatsapp/status',
  (e) => {
    const instanceId = $secrets.get('ZAPI_INSTANCE_ID')
    const token = $secrets.get('ZAPI_TOKEN')

    if (!instanceId || !token) {
      throw new BadRequestError('Z-API credentials missing')
    }

    const res = $http.send({
      url: `https://api.z-api.io/instances/${instanceId}/token/${token}/status`,
      method: 'GET',
    })

    if (res.statusCode !== 200) {
      throw new BadRequestError('Failed to fetch status from Z-API: ' + res.statusCode)
    }

    return e.json(200, res.json)
  },
  $apis.requireAuth(),
)
