require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
app.use(bodyParser.json());

const { PORT, VERIFY_TOKEN, ACCESS_TOKEN, PHONE_ID } = process.env;

app.get('/webhook', (req, res) => {
  const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': ch } = req.query;
  if (mode === 'subscribe' && token === VERIFY_TOKEN) return res.status(200).send(ch);
  res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
  const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (msg) {
    const from = msg.from;
    const text = msg.text?.body?.toLowerCase();

    if (text === 'menu') {
      await axios.post(`https://graph.facebook.com/v22.0/${PHONE_ID}/messages`, {
        messaging_product: 'whatsapp', to: from, type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: 'Elige una opción:' },
          action: {
            buttons: [
              { type: 'reply', reply: { id: 'opt1', title: 'Productos' }},
              { type: 'reply', reply: { id: 'opt2', title: 'Asesor' }}
            ]
          }
        }
      }, { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }});
    }

    if (msg.interactive?.button_reply) {
      const id = msg.interactive.button_reply.id;
      if (id === 'opt1') sendText(from, 'Aquí tienes nuestros productos...');
      if (id === 'opt2') sendImage(from, 'https://via.placeholder.com/300.png');
    }
  }
  res.sendStatus(200);
});

async function sendText(to, body) {
  await axios.post(`https://graph.facebook.com/v22.0/${PHONE_ID}/messages`, {
    messaging_product: 'whatsapp', to, type: 'text', text: { body }
  }, { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }});
}

async function sendImage(to, link) {
  await axios.post(`https://graph.facebook.com/v22.0/${PHONE_ID}/messages`, {
    messaging_product: 'whatsapp', to, type: 'image', image: { link }
  }, { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }});
}

app.listen(PORT, () => console.log(`Bot listo en puerto ${PORT}`));
