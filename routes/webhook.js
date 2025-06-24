const express = require('express');
const router = express.Router();
const { handleWebhookPost, handleWebhookGet } = require('../controllers/webhookController');

router.get('/', (req, res) => {
  res.send('WhatsApp Bot funcionando');
});

router.get('/webhook', handleWebhookGet);

router.post('/webhook', handleWebhookPost);

module.exports = router;
