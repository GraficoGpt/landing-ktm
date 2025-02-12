const tursoClient = require('../../config/turso');
const hubspotService = require('../../services/hubspotService');

const helloWorld = async (req, res) => {
  try {
    // Validar conexión con Turso
    const tursoResult = await tursoClient.execute('SELECT 1');

    // Validar conexión con HubSpot
    const hubspotResult = await hubspotService.testConnection();

    res.json({
      turso: {
        status: tursoResult ? 'connected' : 'failed',
        message: tursoResult ? 'Turso connection is working.' : 'Turso connection failed.'
      },
      hubspot: {
        status: hubspotResult ? 'connected' : 'failed',
        message: hubspotResult ? 'HubSpot connection is working.' : 'HubSpot connection failed.'
      }
    });

  } catch (error) {
    console.error('Error checking connections:', error);
    res.status(500).json({
      error: 'Connection check failed',
      details: error.message
    });
  }
};

const getHubSpotProperties = async (req, res) => {
  try {
    const properties = await hubspotService.getAvailableProperties();

    // Formateamos la respuesta para hacerla más útil
    const formattedProperties = properties.map(prop => ({
      name: prop.name,
      label: prop.label,
      type: prop.type,
      fieldType: prop.fieldType,
      groupName: prop.groupName,
      description: prop.description,
      options: prop.options
    }));

    res.json({
      count: formattedProperties.length,
      properties: formattedProperties
    });
  } catch (error) {
    console.error('Error obteniendo propiedades:', error);
    res.status(500).json({
      error: 'Error al obtener propiedades de HubSpot',
      details: error.message
    });
  }
};

module.exports = {
  helloWorld,
  getHubSpotProperties
};
