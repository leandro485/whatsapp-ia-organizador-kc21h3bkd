migrate(
  (app) => {
    try {
      app
        .db()
        .newQuery(
          'UPDATE user_settings SET whatsapp_connected = 0 WHERE whatsapp_connected IS NULL',
        )
        .execute()
    } catch (err) {
      // collection might not exist yet if this runs on fresh init
    }
  },
  (app) => {
    // no-op
  },
)
