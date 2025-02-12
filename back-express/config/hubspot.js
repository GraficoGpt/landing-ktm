require('dotenv').config();

const hubspotConfig = {
  apiKey: process.env.HUBSPOT_API_KEY,
};

// Validación más específica
if (!hubspotConfig.apiKey) {
  throw new Error('HUBSPOT_API_KEY es requerida en las variables de entorno');
}

module.exports = hubspotConfig;