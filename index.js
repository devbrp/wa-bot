require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const webhookRoutes = require('./routes/webhook');
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.use('/', webhookRoutes);

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});