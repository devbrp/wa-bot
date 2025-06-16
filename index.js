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

app.use('/images', express.static(path.join(__dirname, 'public/images')));

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
        replyMessage(messages.from, 'Respuesta a tu pregunta', messages.id)
      }

      if(text === '1'){
      const botones = [
            { type: 'reply', reply: { id: 'opt1', title: 'IMPORTACIÓN' } },
            { type: 'reply', reply: { id: 'opt2', title: 'EXPORTACIÓN' } }
          ];
        sendButtons(messages.from, 'Transportes Oscori srl.', 'Bienvenid@, Que necesitas?', '', botones)
      }
      if(text === '2'){
        const botones = [
            { type: 'reply', reply: { id: 'opt1', title: 'ARICA' } },
            { type: 'reply', reply: { id: 'opt2', title: 'IQUIQUE' } }
          ];
        sendButtons(messages.from, 'Transportes Oscori srl.', 'Lugar de carga o destino', '', botones)
      }
      if(text === '3'){
        const botones = [
            { type: 'reply', reply: { id: 'opt1', title: '20"' } },
            { type: 'reply', reply: { id: 'opt2', title: '40"' } },
            { type: 'reply', reply: { id: 'opt3', title: '40" Refrigerador' } }
          ];
        sendButtons(messages.from, 'Transportes Oscori srl.', 'Tamaño de Contenedor', '', botones)
      }
      if (text === '4') {
        const opciones = [
            {
              title: 'NAVIERAS',
              rows: [
                {
                  id: 'opt1',
                  title: 'MSC'
                  //description: 'Esta es la primera empresa'
                },
                {
                  id: 'opt2',
                  title: 'Maersk',
                },
                {
                  id: 'opt3',
                  title: 'HAPAG LLOYD',
                },
                {
                  id: 'opt4',
                  title: 'Cosco',
                },
                {
                  id: 'opt5',
                  title: 'ONE',
                },
                {
                  id: 'opt6',
                  title: 'MSL',
                }
              ]
            }
          ]
        sendButtonsSection(messages.from, 'Transportes Oscori srl.', 'En que naviera', '', 'NAVIERAS', opciones)
      }
      if(text === '5'){
        sendImage(messages.from)
      }
      if(text === '6'){
        sendText(from, `Peso`, messages.id);
      }
      

      if (text === 'lista') {
        await sendList(from);
      }
    }

    if (msgType === 'interactive') {
      const reply = messages.interactive?.button_reply || messages.interactive?.list_reply;
      if (reply) {
        await sendText(from, `Seleccionaste: ${reply.title}`, messages.id);
      }
      console.log(JSON.stringify(messages, null, 2));
    }

    console.log(JSON.stringify(messages, null, 2));
  }

  res.sendStatus(200);
});

async function sendButtons(to, header, body, footer, botones) {
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
        type: 'button',
        header: {
          type: 'image',
          text: 'https://wa-bot-g6h9.onrender.com/images/header.jpeg'
        },
        body: {
          text: body
        },
        footer: {
          text: footer
        },
        action: {
          buttons: botones
        }
      }
    })
  })
}

async function sendImage(to) {
  await axios({
    url: `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`,
    method: 'post',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "image",
      image: {
        link: 'https://wa-bot-g6h9.onrender.com/images/header.jpeg',
        caption: 'IMAGEN DE PRUEBA'
      }
    })
  })
}

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
      recipient_type: 'individual',
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

async function sendText(to, body, messageId) {
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

async function sendButtonsSection(to, header, body, footer, textbuttons, secciones) {
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
          sections: secciones
        }
      }
    })
  })
}

async function sendButtons(to, header, body, footer, botones) {
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
        type: 'button',
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
          buttons: botones
        }
      }
    })
  })
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

async function sendFlowMessage(to, messageId, flowParams) {
  await axios({
    url: `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`,
    method: 'post',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    data: {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      context: {
        message_id: messageId
      },
      interactive: {
        type: 'flow',
        header: {
          type: 'text',
          text: flowParams.header || 'Flow message header'
        },
        body: {
          text: flowParams.body || 'Flow message body'
        },
        footer: {
          text: flowParams.footer || 'Flow message footer'
        },
        action: {
          name: 'flow',
          parameters: {
            flow_message_version: '3',
            flow_token: flowParams.flow_token,
            flow_id: flowParams.flow_id,
            flow_cta: flowParams.flow_cta || 'Continuar',
            flow_action: flowParams.flow_action || 'navigate',
            flow_action_payload: {
              screen: flowParams.screen,
              data: flowParams.data
            }
          }
        }
      }
    }
  });
}

app.listen(PORT || 3000, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT || 3000}`);
});
