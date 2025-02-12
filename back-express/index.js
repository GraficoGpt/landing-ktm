require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const helloWorldRoutes = require('./modules/hello-world/helloWorldRoutes');
const formularioRoutes = require('./modules/lead-form/leadFormRoutes');
const config = require('./config/config');
const rateLimit = require('express-rate-limit');

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max
});

app.use(limiter);
app.use(cors(config.cors));
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir el archivo HTML en "/"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rutas
app.use('/api/hello-world', helloWorldRoutes);
app.use('/api/formulario', formularioRoutes);

// Servidor
app.listen(config.port, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
});
