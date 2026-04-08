routerAdd(
  'GET',
  '/backend/v1/whatsapp_qr',
  (e) => {
    // Em um cenário real, isso faria a comunicação com o gateway do WhatsApp
    // para obter um novo QR Code de pareamento.
    const mockQr = '2@mocked_qr_code_data_' + $security.randomString(32)
    return e.json(200, { qr: mockQr })
  },
  $apis.requireAuth(),
)
