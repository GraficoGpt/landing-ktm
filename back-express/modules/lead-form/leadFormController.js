const tursoClient = require('../../config/turso');
const hubspotService = require('../../services/hubspotService');
const rateLimit = require('express-rate-limit');

const formLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 solicitudes por ventana
});

const guardarFormulario = async (req, res) => {
    try {
        const {
            nombres,
            apellidos,
            email,
            telefono,
            cedula,
            ciudad,
            modelo: modelo_interes,
            terminos: acepto_terminos
        } = req.body;

        // Estado del envío
        const estado = {
            turso: { exitoso: false, error: null },
            hubspot: { exitoso: false, error: null }
        };

        // Validación de campos requeridos
        const camposRequeridos = [
            'nombres',
            'apellidos',
            'email',
            'telefono',
            'cedula',
            'ciudad',
            'modelo',
            'terminos'
        ];

        const camposFaltantes = camposRequeridos.filter(campo => !req.body[campo]);

        if (camposFaltantes.length > 0) {
            return res.status(400).json({
                error: 'Campos requeridos faltantes',
                campos: camposFaltantes
            });
        }

        // Insertar datos en Turso
        try {
            const query = `
                INSERT INTO leads (
                    nombres,
                    apellidos,
                    email,
                    telefono,
                    cedula,
                    ciudad,
                    modelo_interes,
                    acepto_terminos
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const tursoResult = await tursoClient.execute({
                sql: query,
                args: [
                    nombres,
                    apellidos,
                    email,
                    telefono,
                    cedula,
                    ciudad,
                    modelo_interes,
                    acepto_terminos ? 1 : 0
                ]
            });

            estado.turso.exitoso = true;
            estado.turso.id = Number(tursoResult.lastInsertRowid);
        } catch (tursoError) {
            estado.turso.error = tursoError.message;
            console.error('Error al guardar en Turso:', tursoError);
        }

        // Enviar a HubSpot
        try {
            const hubspotResult = await hubspotService.sendLead(req.body);
            estado.hubspot.exitoso = true;
            estado.hubspot.id = hubspotResult.id;
        } catch (hubspotError) {
            estado.hubspot.error = hubspotError.message;
            console.error('Error al enviar a HubSpot:', hubspotError);
        }

        // Determinar el estado general de la respuesta
        if (!estado.turso.exitoso && !estado.hubspot.exitoso) {
            // Ambos servicios fallaron
            return res.status(500).json({
                error: 'Error al procesar el lead en ambos servicios',
                detalles: estado
            });
        } else if (!estado.turso.exitoso) {
            // Solo Turso falló
            return res.status(500).json({
                error: 'Error al guardar en base de datos local',
                detalles: estado
            });
        } else if (!estado.hubspot.exitoso) {
            // Solo HubSpot falló
            return res.status(207).json({
                message: 'Lead guardado parcialmente',
                advertencia: 'No se pudo sincronizar con HubSpot',
                detalles: estado
            });
        }

        // Todo exitoso
        res.status(201).json({
            message: 'Lead guardado exitosamente en todos los servicios',
            detalles: estado
        });

    } catch (error) {
        console.error('Error general al procesar el lead:', error);
        res.status(500).json({
            error: 'Error general al procesar la solicitud',
            details: error.message
        });
    }
};

module.exports = { guardarFormulario };