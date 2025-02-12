const { Client } = require('@hubspot/api-client');
const config = require('../config/config');

class HubspotService {
  constructor() {
    this.hubspotClient = new Client({ accessToken: config.hubspot.apiKey });
    this.apiKey = config.hubspot.apiKey;
    this.portalId = config.hubspot.portalId;
  }

  validateLeadData(leadData) {
    const requiredFields = ['email', 'nombres', 'apellidos', 'telefono', 'cedula'];
    for (const field of requiredFields) {
      if (!leadData[field]) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }
    // Validar formato de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)) {
      throw new Error('Formato de email inválido');
    }
  }

  async sendLead(leadData) {
    this.validateLeadData(leadData);
    try {
      // Primero buscamos si existe un contacto con la misma cédula
      const existingContact = await this.searchContactByCedula(leadData.cedula);

      const properties = {
        email: leadData.email,
        firstname: leadData.nombres,
        lastname: leadData.apellidos,
        phone: leadData.telefono,
        city: leadData.ciudad,
        message: leadData.modelo,
        cedula: leadData.cedula,
        terminoscondiciones: leadData.terminos ? "true" : "false"
      };

      let contactResponse;

      if (existingContact) {
        // Si existe, actualizamos el contacto
        contactResponse = await this.hubspotClient.crm.contacts.basicApi.update(
          existingContact.id,
          { properties }
        );
      } else {
        // Si no existe, creamos uno nuevo
        contactResponse = await this.hubspotClient.crm.contacts.basicApi.create({
          properties
        });
      }

      // Si necesitas asociar el contacto con un formulario específico
      if (config.hubspot.formId) {
        await this.hubspotClient.forms.submitForm({
          formId: config.hubspot.formId,
          portalId: config.hubspot.portalId,
          fields: [
            { name: 'email', value: leadData.email },
            { name: 'firstname', value: leadData.nombres },
            { name: 'lastname', value: leadData.apellidos },
            { name: 'phone', value: leadData.telefono },
            { name: 'city', value: leadData.ciudad },
            { name: 'message', value: leadData.modelo },
            { name: 'cedula', value: leadData.cedula },
            { name: 'terminoscondiciones', value: leadData.terminos ? "true" : "false" }
          ]
        });
      }

      return contactResponse;
    } catch (error) {
      console.error('Error en HubspotService:', error);
      throw error;
    }
  }

  async searchContactByCedula(cedula) {
    try {
      const filter = {
        filterGroups: [{
          filters: [{
            propertyName: 'cedula',
            operator: 'EQ',
            value: cedula
          }]
        }]
      };

      const searchResponse = await this.hubspotClient.crm.contacts.searchApi.doSearch({
        ...filter,
        limit: 1
      });

      return searchResponse.results[0] || null;
    } catch (error) {
      console.error('Error buscando contacto por cédula en HubSpot:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      const response = await this.hubspotClient.crm.contacts.basicApi.getPage(1);
      return true;
    } catch (error) {
      console.error('Error testing HubSpot connection:', error);
      return false;
    }
  }

  async getAvailableProperties() {
    try {
      const properties = await this.hubspotClient.crm.properties.coreApi.getAll('contacts');
      return properties.results;
    } catch (error) {
      console.error('Error obteniendo propiedades de HubSpot:', error);
      throw error;
    }
  }
}

module.exports = new HubspotService();