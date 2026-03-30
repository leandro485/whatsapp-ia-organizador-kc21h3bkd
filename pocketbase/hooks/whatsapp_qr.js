routerAdd(
  'GET',
  '/backend/v1/whatsapp/qr',
  (e) => {
    const qrData = 'wa-live-' + $security.randomString(20)
    return e.json(200, { qr: qrData })
  },
  $apis.requireAuth(),
)
