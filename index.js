require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const WHATSAPP_ACCESS_TOKEN = 'EAAIe5iFGKQUBO2taDw3hLm4U4omr1IJcUNRRe5NSriabfrIT8wYqEooUESxbQrzLK4WfZAlOwTSPNgV7kZCzxFUQLwb9wSCcDwZCFfxqzzGmx14ohxuuPRVEWsgvY9ZAnfSQ76pV4QO1QIguRkXc5l9V9sX6a6LuZBUXsuNUlr40L7TieEiyUS9cZACtr0mudfHLfB2udSLzAZD'

const {
  VERIFY_TOKEN,
  ACCESS_TOKEN,
  PHONE_ID,
  PORT
} = process.env;

app.get('/', (req, res) => {
  res.send('WhatsApp Bot funcionando');
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0]?.value;

  const messages = changes?.messages?.[0];
  const statuses = changes?.statuses?.[0];

  if (statuses) {
    console.log(`📩 Estado del mensaje: ${statuses.status}`);
  }

  if (messages) {
    const from = messages.from;
    const msgType = messages.type;

    if (msgType === 'text') {
      const text = messages.text.body.toLowerCase();

      if (text === 'hola') {
        sendButtons(messages.from, 'Transportes Oscori srl.', 'Bienvenid@, de que empresa nos hablas', 'Selecciona una opción')
        //replyMessage(messages.from, 'Bienvenid@ a Transportes Oscori srl.', messages.id)
      }

      if (text === 'menu') {
        sendButtons(from);
      }

      if (text === 'lista') {
        await sendList(from);
      }
    }

    if (msgType === 'interactive') {
      const reply = messages.interactive?.button_reply || messages.interactive?.list_reply;
      if (reply) {
        await sendText(from, `Seleccionaste: ${reply.title}`);
      }
    }

    console.log(JSON.stringify(messages, null, 2));
  }

  res.sendStatus(200);
});

async function replyMessage(to, body, messageId) {
  await axios({
    url: `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`,
    method: 'post',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: {
        body
      },
      context: {
        message_id: messageId
      }
    })
  })
}

async function sendText(to, body) {
  await axios({
    url: `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`,
    method: 'post',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: {
        body
      },
      context: {
        message_id: messageId
      }
    })
  })
}

async function sendButtonsSection(to, header, body, footer, textbuttons) {
  await axios({
    url: `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`,
    method: 'post',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: {
          type: 'text',
          text: header
        },
        body: {
          text: body
        },
        footer: {
          text: footer
        },
        action: {
          button: textbuttons,
          sections: [
            {
              title: 'First Section',
              rows: [
                {
                  id: 'first_option',
                  title: 'First option',
                  description: 'This is the description of the first option'
                },
                {
                  id: 'second_option',
                  title: 'Second option',
                  description: 'This is the description of the second option'
                }
              ]
            },
            {
              title: 'Second Section',
              rows: [
                {
                  id: 'third_option',
                  title: 'Third option'
                }
              ]
            }
          ]
        }
      }
    })
  })
}

async function sendButtons(to, header, body, footer) {
  await axios({
    url: `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`,
    method: 'post',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: {
          type: 'text',
          text: header
        },
        body: {
          text: body
        },
        footer: {
          text: footer
        },
        action: {
          buttons: [
            { type: 'reply', reply: { id: 'opt1', title: 'LA PAPELERA' } },
            { type: 'reply', reply: { id: 'opt2', title: 'COMPANEX' } }
          ]
        }
      }
    })
  })
}

async function sendButtons2(to) {
  await axios.post(`https://graph.facebook.com/v22.0/${PHONE_ID}/messages`, {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: 'Elige una opción:' },
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'opt1', title: 'Productos' } },
          { type: 'reply', reply: { id: 'opt2', title: 'Asesor' } }
        ]
      }
    }
  }, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
}

async function sendList(to) {
  await axios.post(`https://graph.facebook.com/v22.0/${PHONE_ID}/messages`, {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      header: { type: 'text', text: 'Menú' },
      body: { text: 'Selecciona una categoría:' },
      footer: { text: 'Gracias por tu interés.' },
      action: {
        button: 'Ver opciones',
        sections: [
          {
            title: 'Opciones',
            rows: [
              { id: 'row1', title: 'Productos', description: 'Ver productos disponibles' },
              { id: 'row2', title: 'Asesor', description: 'Hablar con un asesor' }
            ]
          }
        ]
      }
    }
  }, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
}

app.listen(PORT || 3000, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT || 3000}`);
});
