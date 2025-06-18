require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const app = express();
app.use(express.json());

const WHATSAPP_ACCESS_TOKEN = 'EAAIe5iFGKQUBO6xwV3Y6x3y7EWJkvPMBPiDUMs7FZC7vDnge1pfAZC4YI7CIGf5ZBVGmUzZBv2TKUsjuDbhjDXK48ZCS4Q3RvOFoJLmAlqU17ZB2waf6zJouGeE7omeZCy9jqSxAMcDcq8hpzZCNVHVtDzF2biTTuK3ZBYd4mk3LzGr6dxqLSA8GoxAem99pbLOZCkI0b0asvlCPEZD'

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
  const nombreUsuario = changes?.contacts?.[0]?.profile?.name || 'usuario';
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

      const text1 = '¿Desde qué ciudad en Chile quieres traer tu carga?'
      const opciones1 = [
          {
            title: 'NAVIERAS',
            rows: [
              {
                id: 'opt1',
                title: 'Iquique'
                //description: 'Esta es la primera empresa'
              },
              {
                id: 'opt2',
                title: 'Arica',
              },
              {
                id: 'opt3',
                title: 'Santiago',
              },
              {
                id: 'opt4',
                title: 'Otra ciudad',
              }
            ]
          }
      ] 

      const text2 = '¿Dónde deseas que entreguemos en Bolivia?'
      const opciones2 = [
          {
            title: 'BOLIVIA',
            rows: [
              {
                id: 'opt1',
                title: 'La Paz'
                //description: 'Esta es la primera empresa'
              },
              {
                id: 'opt2',
                title: 'Santa Cruz',
              },
              {
                id: 'opt3',
                title: 'Cochabamba',
              },
              {
                id: 'opt4',
                title: 'Otras ciudades',
              }
            ]
          }
      ] 

      const text3 = '¿Cómo viene tu carga?'
      const opciones3 = [
          {
            title: 'BOLIVIA',
            rows: [
              {
                id: 'opt1',
                title: 'Carga suelta (paquetes, palets, cajas sueltas)'
                //description: 'Esta es la primera empresa'
              },
              {
                id: 'opt2',
                title: 'Contenedor completo (20 pies / 40 pies)',
              }            
            ]
          }
      ] 
      const text4 = `¿Sabes el peso o volumen aproximado? \n
      > Ejemplo: 500 kg / 3 m³`

      const text5 = '¿Qué tipo de contenedor estás usando?'
      const opciones5 = [
          {
            title: 'Opciones',
            rows: [
              {
                id: 'opt1',
                title: '20 pies estándar'
                //description: 'Esta es la primera empresa'
              },
              {
                id: 'opt2',
                title: '40 pies estándar',
              },
              {
                id: 'opt1',
                title: '40 pies high cube'
                //description: 'Esta es la primera empresa'
              },
              {
                id: 'opt2',
                title: '20 pies refrigerador',
              },
              {
                id: 'opt2',
                title: '40 pies refrigerador',
              }               
            ]
          }
      ]
      
      const text6 = `Peso de carga en contenedor de 20 pies \n
      Recuerda que el peso total permitido para el transporte en contenedor de 20 pies es de máximo 26 toneladas, incluyendo la tara del contenedor (2,2 toneladas). \n
      *¿Cuál es el peso aproximado solo de tu carga?*`
      const opciones6 = [
          {
            title: 'Opciones',
            rows: [
              {
                id: 'opt1',
                title: 'Menos de 10 toneladas'
                //description: 'Esta es la primera empresa'
              },
              {
                id: 'opt2',
                title: 'Entre 10 y 15 toneladas',
              },
              {
                id: 'opt1',
                title: 'Entre 15 y 20 toneladas'
                //description: 'Esta es la primera empresa'
              },
              {
                id: 'opt2',
                title: 'Entre 20 y 23,8 toneladas (límite máximo permitido)',
              },
              {
                id: 'opt2',
                title: 'Más de 24 toneladas',
              }               
            ]
          }
      ]

      const text7 = `Peso de carga en contenedor de 40 pies \n
      Para el contenedor de 40 pies, el peso máximo total permitido es de 28 toneladas, incluyendo la tara del contenedor (3,8 toneladas). \n
      Esto significa que tu carga no debe superar los 24,2 toneladas.\n
      *¿Cuál es el peso aproximado solo de tu carga?*`
      const opciones7 = [
          {
            title: 'Opciones',
            rows: [
              {
                id: 'opt1',
                title: 'Menos de 10 toneladas'
                //description: 'Esta es la primera empresa'
              },
              {
                id: 'opt2',
                title: 'Entre 10 y 15 toneladas',
              },
              {
                id: 'opt1',
                title: 'Entre 15 y 20 toneladas'
                //description: 'Esta es la primera empresa'
              },
              {
                id: 'opt2',
                title: 'Entre 20 y 24,2 toneladas (límite máximo permitido)',
              },
              {
                id: 'opt2',
                title: 'Más de 24 toneladas',
              }               
            ]
          }
      ]

      const text8 = `Contenedor Reefer de 20 pies \n
      El peso total máximo permitido para un contenedor refrigerado de 20 pies es de 26 toneladas, incluyendo la tara del equipo. \n
      Tara aproximada: 3.0 toneladas\n
      Carga útil máxima: hasta 23 toneladas \n
      *¿Cuál es el peso aproximado solo de tu carga?*`
      const opciones8 = [
          {
            title: 'Opciones',
            rows: [
              {
                id: 'opt1',
                title: 'Menos de 10 toneladas'
                //description: 'Esta es la primera empresa'
              },
              {
                id: 'opt2',
                title: 'Entre 10 y 15 toneladas',
              },
              {
                id: 'opt1',
                title: 'Entre 15 y 20 toneladas'
                //description: 'Esta es la primera empresa'
              },
              {
                id: 'opt2',
                title: 'Entre 20 y 24,2 toneladas (límite máximo permitido)',
              },
              {
                id: 'opt2',
                title: 'Más de 24 toneladas',
              }               
            ]
          }
      ]

      const text9 = `Contenedor Reefer de 20 pies \n
      El peso total máximo permitido para un contenedor refrigerado de 20 pies es de 26 toneladas, incluyendo la tara del equipo. \n
      Tara aproximada: 3.0 toneladas\n
      Carga útil máxima: hasta 23 toneladas \n
      *¿Cuál es el peso aproximado solo de tu carga?*`
      const opciones9 = [
          {
            title: 'Opciones',
            rows: [
              {
                id: 'opt1',
                title: 'Menos de 10 toneladas'
                //description: 'Esta es la primera empresa'
              },
              {
                id: 'opt2',
                title: 'Entre 10 y 15 toneladas',
              },
              {
                id: 'opt1',
                title: 'Entre 15 y 20 toneladas'
                //description: 'Esta es la primera empresa'
              },
              {
                id: 'opt2',
                title: 'Entre 20 y 23 toneladas (límite máximo permitido)',
              },
              {
                id: 'opt2',
                title: 'Más de 23 toneladas',
              }               
            ]
          }
      ]

const text10 = `Contenedor Reefer de 40 pies \n
      El peso total máximo permitido para un contenedor refrigerado de 40 pies es de 28 toneladas, incluyendo la tara. \n
      Tara aproximada: 4.5 toneladas\n
      Carga útil máxima: hasta 23.5 toneladas \n
      *¿Cuál es el peso aproximado solo de tu carga?*`
      const opciones10 = [
          {
            title: 'Opciones',
            rows: [
              {
                id: 'opt1',
                title: 'Menos de 10 toneladas'
                //description: 'Esta es la primera empresa'
              },
              {
                id: 'opt2',
                title: 'Entre 10 y 15 toneladas',
              },
              {
                id: 'opt1',
                title: 'Entre 15 y 20 toneladas'
                //description: 'Esta es la primera empresa'
              },
              {
                id: 'opt2',
                title: 'Entre 20 y 23.5 toneladas (máximo permitido)',
              },
              {
                id: 'opt2',
                title: 'Más de 23.5 toneladas',
              }               
            ]
          }
      ]

      if(text === '1'){
      const mensaje = `Estimad@ ${nombreUsuario} 👋\n
                    Gracias por comunicarte con nosotros.\n
                    ¿En qué podemos ayudarte hoy?`;
      const botones = [
            { type: 'reply', reply: { id: 'import', title: 'IMPORTACIÓN' } },
            { type: 'reply', reply: { id: 'export', title: 'EXPORTACIÓN' } }
          ];
        sendButtons(messages.from, 'Transportes Oscori srl.', mensaje, '', botones)
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
      if(text === '7'){
        const botones = [
            { type: 'reply', reply: { id: 'opt1', title: 'IMPORTACIÓN' } },
            { type: 'reply', reply: { id: 'opt2', title: 'EXPORTACIÓN' } }
          ];
          (async () => {
      try {
    const mediaId = await subirImagen();
    await sendButtonsImage(messages.from, 'Transportes Oscori srl.', 'Bienvenid@, ¿Qué necesitas?', '', mediaId, botones);
  } catch (err) {
    console.error('❌ Error al enviar mensaje con imagen:', err.response?.data || err.message);
  }
      })();
        
      }      

      if (text === 'lista') {
        await sendList(from);
      }
    }

    if (msgType === 'interactive') {
      const reply = messages.interactive?.button_reply || messages.interactive?.list_reply;
      if (reply) {
        await sendText(from, `Seleccionaste: ${reply.title}`, messages.id);

        const selectedId = reply.id;

        switch (selectedId) {
          case 'flujo_importacion':
            await sendText(from, 'Iniciando flujo de IMPORTACIÓN...', messages.id);
            // Aquí puedes enviar más preguntas, imágenes, etc.
            break;

          case 'flujo_exportacion':
            await sendText(from, 'Iniciando flujo de EXPORTACIÓN...', messages.id);
            // Puedes continuar el flujo según lo que elijas
            break;

          case 'opt1':
            await sendText(from, 'Elegiste opción 1', messages.id);
            break;

          case 'opt2':
            await sendText(from, 'Elegiste opción 2', messages.id);
            break;

          // Puedes seguir agregando más casos

          default:
            await sendText(from, `No reconozco esta opción: ${selectedId}`, messages.id);
            break;
        }
      }
      console.log(JSON.stringify(messages, null, 2));
    }

    console.log(JSON.stringify(messages, null, 2));
  }

  res.sendStatus(200);
});

async function subirImagen() {
  const form = new FormData();
  form.append('file', fs.createReadStream(path.join(__dirname, 'public/images/header.jpeg')));
  form.append('type', 'image/jpeg');
  form.append('messaging_product', 'whatsapp');

  const response = await axios.post(
    `https://graph.facebook.com/v22.0/${PHONE_ID}/media`,
    form,
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        ...form.getHeaders()
      }
    }
  );

  console.log('MEDIA ID:', response.data.id);
  return response.data.id;
}

async function sendButtonsImage(to, header, body, footer,mediaId, botones) {
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
          image: {
            id: mediaId
          }
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
