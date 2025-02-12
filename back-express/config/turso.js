const { createClient } = require('@libsql/client');
require('dotenv').config();

// Cargar las variables de entorno
const tursoDbUrl = process.env.TURSO_DB_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoDbUrl || !tursoAuthToken) {
  throw new Error('TURSO_DB_URL or TURSO_AUTH_TOKEN is missing in environment variables');
}

// Crear el cliente de Turso
const tursoClient = createClient({
  url: tursoDbUrl,
  authToken: tursoAuthToken,
});

module.exports = tursoClient;