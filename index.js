require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const app = express();
app.use(express.json());

const WHATSAPP_ACCESS_TOKEN = 'EAAIe5iFGKQUBO8nklZCHqzVPJqo84FISeBVAFFGCLPU0NEaEZAEmoa7YqQUGwhlqLczkZBtsQDGD2PXgbarsFOq8N8y7YAim3AAgyl4NuuZC8recpfyh2PiNZAKdPuwmMBjVVj68RgQt0dkuxYyngj3cuRNLigBkaaVomMkxQcYGZA655N4x4cCZBdTwrqrqu8LlV0yZCyJsaXcZD'

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
        bienvenida(messages, nombreUsuario);
      }
      if (text === 'imagen') {
        cargarImagenes(messages);
      }
      if (text === 'pdf') {
        cargarPdfs(messages);
      }
      //img_precios();


      // const empiezaConNumero = /^\d/.test(text);
      // if (empiezaConNumero) {
      // }
    }

    if (msgType === 'interactive') {
      const reply = messages.interactive?.button_reply || messages.interactive?.list_reply;
      if (reply) {
        await sendText(from, `Seleccionaste: ${reply.title}`, messages.id);

        const selectedId = reply.id;

        //TODO IMPORTACION
        if (selectedId.startsWith('I_')) {
          if (selectedId == 'I_0') {
            importacion(messages);
          } else {
            if (selectedId.startsWith('I_B')) {
              carga(messages)
            }
            if (selectedId.startsWith('I_CL')) {
              destino_importacion(messages)
            }
          }
        }
        //TODO EXPORTACION
        if (selectedId.startsWith('E_')) {
          if (selectedId == 'E_0') {
            exportacion(messages);
          } else {
            if (selectedId.startsWith('E_B')) {
              destino_exportacion(messages)
            }
            if (selectedId.startsWith('E_CL')) {
              carga(messages)
            }
          }
        }

        //TODO CARGA
        if (selectedId.startsWith('C_')) {
          switch (selectedId) {
            case 'C_1':
              peso(messages)
              break;
            case 'C_2':
              tipo_contenedor(messages)
              break;
            case 'C_C_1':
              contenedor_20pi(messages)
              break;
            case 'C_C_2':
              contenedor_40pi(messages)
              break;
            case 'C_C_3':
              contenedor_40pi(messages)
              break;
            case 'C_C_4':
              contenedor_refer_20pi(messages)
              break;
            case 'C_C_5':
              contenedor_refer_40pi(messages)
              break;
            case 'C_C_1_1':
            case 'C_C_1_2':
            case 'C_C_1_3':
            case 'C_C_1_4':
            case 'C_C_1_5':

              break;
            case 'C_C_2_1':
            case 'C_C_2_2':
            case 'C_C_2_3':
            case 'C_C_2_4':
            case 'C_C_2_5':
              naviera_importacion(messages)
              break;
            case 'C_C_3_1':
            case 'C_C_3_2':
            case 'C_C_3_3':
            case 'C_C_3_4':
            case 'C_C_3_5':
              naviera_importacion(messages)
              break;
            case 'C_C_4_1':
            case 'C_C_4_2':
            case 'C_C_4_3':
            case 'C_C_4_4':
            case 'C_C_4_5':
              naviera_importacion(messages)
              break;
          }

        }
        //TODO NAVIERA
        if (selectedId.startsWith() == 'N_') {
          consulta(messages)
        }

      }
      // console.log(JSON.stringify(messages, null, 2));
    }
    // console.log(JSON.stringify(messages, null, 2));
  }
  res.sendStatus(200);
});

async function cargarPdfs(messages) {
  const mediaId = await subirPDF('export');
  await enviarPDF(messages.from, mediaId);
}

async function enviarPDF(to, mediaId) {
  await axios({
    url: `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: {
      messaging_product: 'whatsapp',
      to,
      type: 'document',
      document: {
        id: mediaId,
        caption: 'Aquí tienes el PDF que solicitaste',
      },
    },
  });
}

async function cargarImagenes(messages) {
  const botones = [
    { type: 'reply', reply: { id: 'I_0', title: 'IMPORTACIÓN' } },
    { type: 'reply', reply: { id: 'E_0', title: 'EXPORTACIÓN' } }
  ];
  const mediaId = await subirImagen();
  await sendButtonsImage(messages.from, 'Transportes Oscori srl.', 'Bienvenid@, ¿Qué necesitas?', '', mediaId, botones);
}


function bienvenida(messages, nombreUsuario) {
  const mensaje = `Estimad@ ${nombreUsuario} 👋\n
                    Gracias por comunicarte con nosotros.\n
                    ¿En qué podemos ayudarte hoy?`;
  const botones = [
    { type: 'reply', reply: { id: 'I_0', title: 'IMPORTACIÓN' } },
    { type: 'reply', reply: { id: 'E_0', title: 'EXPORTACIÓN' } }
  ];
  sendButtons(messages.from, 'Transportes Oscori srl.', mensaje, '', botones)
}

function consulta(messages) {
  const mensaje = `Estimad@ ${nombreUsuario} 👋\n
                    Seleccione en qué mas podemos ayudarte?`;
  const botones = [
    { type: 'reply', reply: { id: 'I_0', title: 'IMPORTACIÓN' } },
    { type: 'reply', reply: { id: 'E_0', title: 'EXPORTACIÓN' } }
  ];
  sendButtons(messages.from, 'Transportes Oscori srl.', mensaje, '', botones)
}

function importacion(messages) {
  const text = '¿Desde qué ciudad en Chile quieres traer tu carga?'
  const opciones = [
    {
      title: 'CIUDADES',
      rows: [
        {
          id: 'I_CL_1',
          title: 'Iquique'
          //description: 'Esta es la primera empresa'
        },
        {
          id: 'I_CL_2',
          title: 'Arica',
        },
        {
          id: 'I_CL_3',
          title: 'Santiago',
        },
        {
          id: 'I_CL_4',
          title: 'Otra ciudad',
        }
      ]
    }
  ]
  sendButtonsSection(messages.from, 'Transportes Oscori srl.', text, '', 'CIUDADES', opciones)
}

function importacionTransporte(messages) {
  const text = '¿Desde qué ciudad en Chile quieres traer tu carga?'
  const opciones = [
    {
      title: 'CIUDADES',
      rows: [
        {
          id: 'I_CL_1',
          title: 'Iquique'
          //description: 'Esta es la primera empresa'
        },
        {
          id: 'I_CL_2',
          title: 'Arica',
        },
        {
          id: 'I_CL_3',
          title: 'Santiago',
        },
        {
          id: 'I_CL_4',
          title: 'Otra ciudad',
        }
      ]
    }
  ]
  sendButtonsSection(messages.from, 'Transportes Oscori srl.', text, '', 'CIUDADES', opciones)
}

function exportacion(messages) {
  const text = '¿Desde qué ciudad quieres llevar tu carga?'
  const opciones = [
    {
      title: 'CIUDADES',
      rows: [
        {
          id: 'E_B_1',
          title: 'La Paz'
          //description: 'Esta es la primera empresa'
        },
        {
          id: 'E_B_2',
          title: 'Santa Cruz',
        },
        {
          id: 'E_B_3',
          title: 'Cochabamba',
        },
        {
          id: 'E_B_4',
          title: 'Otras ciudades',
        }
      ]
    }
  ]
  sendButtonsSection(messages.from, 'Transportes Oscori srl.', text, '', 'CIUDADES', opciones)
}

function destino_importacion(messages) {
  const text = '¿Dónde deseas que entreguemos en Bolivia?'
  const opciones = [
    {
      title: 'CIUDADES',
      rows: [
        {
          id: 'I_B_1',
          title: 'La Paz'
          //description: 'Esta es la primera empresa'
        },
        {
          id: 'I_B_2',
          title: 'Santa Cruz',
        },
        {
          id: 'I_B_3',
          title: 'Cochabamba',
        },
        {
          id: 'I_B_4',
          title: 'Otras ciudades',
        }
      ]
    }
  ]
  sendButtonsSection(messages.from, 'Transportes Oscori srl.', text, '', 'CIUDADES', opciones)
}

function destino_exportacion(messages) {
  const text = '¿Dónde deseas que entreguemos en Chile?'
  const opciones = [
    {
      title: 'CIUDADES',
      rows: [
        {
          id: 'E_CL_1',
          title: 'Iquique'
          //description: 'Esta es la primera empresa'
        },
        {
          id: 'E_CL_2',
          title: 'Arica',
        },
        {
          id: 'E_CL_3',
          title: 'Santiago',
        },
        {
          id: 'E_CL_4',
          title: 'Otra ciudad',
        }
      ]
    }
  ]
  sendButtonsSection(messages.from, 'Transportes Oscori srl.', text, '', 'CIUDADES', opciones)
}

function carga(messages) {
  const text = '¿Cómo viene tu carga?'
  const opciones = [
    {
      title: 'CARGA',
      rows: [
        {
          id: 'C_1',
          title: 'Carga suelta (paquetes, palets, cajas sueltas)'
          //description: 'Esta es la primera empresa'
        },
        {
          id: 'C_2',
          title: 'Contenedor completo (20 pies / 40 pies)',
        }
      ]
    }
  ]
  sendButtonsSection(messages.from, 'Transportes Oscori srl.', text, '', 'CIUDADES', opciones)
}

function peso(messages) {
  const text4 = `¿Sabes el peso o volumen aproximado? \n
      > Ejemplo: 500 kg / 3 m³`
  // sendText(from, `Peso`, messages.id);
  replyMessage(messages.from, 'Respuesta a tu pregunta', messages.id)
}

function tipo_contenedor(messages) {
  const text = '¿Qué tipo de contenedor estás usando?'
  const opciones = [
    {
      title: 'Opciones',
      rows: [
        {
          id: 'C_C_1',
          title: '20 pies estándar'
          //description: 'Esta es la primera empresa'
        },
        {
          id: 'C_C_2',
          title: '40 pies estándar',
        },
        {
          id: 'C_C_3',
          title: '40 pies high cube'
          //description: 'Esta es la primera empresa'
        },
        {
          id: 'C_C_4',
          title: '20 pies refrigerador',
        },
        {
          id: 'C_C_5',
          title: '40 pies refrigerador',
        }
      ]
    }
  ]
  sendButtonsSection(messages.from, 'Transportes Oscori srl.', text, '', 'CIUDADES', opciones)
}

function contenedor_20pi(messages) {
  const text = `Peso de carga en contenedor de 20 pies \n
      Recuerda que el peso total permitido para el transporte en contenedor de 20 pies es de máximo 26 toneladas, incluyendo la tara del contenedor (2,2 toneladas). \n
      *¿Cuál es el peso aproximado solo de tu carga?*`
  const opciones = [
    {
      title: 'Opciones',
      rows: [
        {
          id: 'C_C_1_1',
          title: 'Menos de 10 toneladas'
          //description: 'Esta es la primera empresa'
        },
        {
          id: 'C_C_1_2',
          title: 'Entre 10 y 15 toneladas',
        },
        {
          id: 'C_C_1_3',
          title: 'Entre 15 y 20 toneladas'
          //description: 'Esta es la primera empresa'
        },
        {
          id: 'C_C_1_4',
          title: 'Entre 20 y 23,8 toneladas (límite máximo permitido)',
        },
        {
          id: 'C_C_1_5',
          title: 'Más de 24 toneladas',
        }
      ]
    }
  ]
  sendButtonsSection(messages.from, 'Transportes Oscori srl.', text, '', 'CIUDADES', opciones)
}
function contenedor_40pi(messages) {
  const text = `Peso de carga en contenedor de 40 pies \n
      Para el contenedor de 40 pies, el peso máximo total permitido es de 28 toneladas, incluyendo la tara del contenedor (3,8 toneladas). \n
      Esto significa que tu carga no debe superar los 24,2 toneladas.\n
      *¿Cuál es el peso aproximado solo de tu carga?*`
  const opciones = [
    {
      title: 'Opciones',
      rows: [
        {
          id: 'C_C_2_1',
          title: 'Menos de 10 toneladas'
          //description: 'Esta es la primera empresa'
        },
        {
          id: 'C_C_2_2',
          title: 'Entre 10 y 15 toneladas',
        },
        {
          id: 'C_C_2_3',
          title: 'Entre 15 y 20 toneladas'
          //description: 'Esta es la primera empresa'
        },
        {
          id: 'C_C_2_4',
          title: 'Entre 20 y 24,2 toneladas (límite máximo permitido)',
        },
        {
          id: 'C_C_2_5',
          title: 'Más de 24 toneladas',
        }
      ]
    }
  ]
  sendButtonsSection(messages.from, 'Transportes Oscori srl.', text, '', 'CIUDADES', opciones)
}

function contenedor_refer_20pi(messages) {
  const text = `Contenedor Reefer de 20 pies \n
      El peso total máximo permitido para un contenedor refrigerado de 20 pies es de 26 toneladas, incluyendo la tara del equipo. \n
      Tara aproximada: 3.0 toneladas\n
      Carga útil máxima: hasta 23 toneladas \n
      *¿Cuál es el peso aproximado solo de tu carga?*`
  const opciones = [
    {
      title: 'Opciones',
      rows: [
        {
          id: 'C_C_3_1',
          title: 'Menos de 10 toneladas'
          //description: 'Esta es la primera empresa'
        },
        {
          id: 'C_C_3_2',
          title: 'Entre 10 y 15 toneladas',
        },
        {
          id: 'C_C_3_3',
          title: 'Entre 15 y 20 toneladas'
          //description: 'Esta es la primera empresa'
        },
        {
          id: 'C_C_3_4',
          title: 'Entre 20 y 24,2 toneladas (límite máximo permitido)',
        },
        {
          id: 'C_C_3_5',
          title: 'Más de 24 toneladas',
        }
      ]
    }
  ]
  sendButtonsSection(messages.from, 'Transportes Oscori srl.', text, '', 'CIUDADES', opciones)
}

function contenedor_refer_40pi(messages) {
  const text = `Contenedor Reefer de 40 pies \n
      El peso total máximo permitido para un contenedor refrigerado de 40 pies es de 28 toneladas, incluyendo la tara. \n
      Tara aproximada: 4.5 toneladas\n
      Carga útil máxima: hasta 23.5 toneladas \n
      *¿Cuál es el peso aproximado solo de tu carga?*`
  const opciones = [
    {
      title: 'Opciones',
      rows: [
        {
          id: 'C_C_4_1',
          title: 'Menos de 10 toneladas'
          //description: 'Esta es la primera empresa'
        },
        {
          id: 'C_C_4_2',
          title: 'Entre 10 y 15 toneladas',
        },
        {
          id: 'C_C_4_3',
          title: 'Entre 15 y 20 toneladas'
          //description: 'Esta es la primera empresa'
        },
        {
          id: 'C_C_4_4',
          title: 'Entre 20 y 23.5 toneladas (máximo permitido)',
        },
        {
          id: 'C_C_4_5',
          title: 'Más de 23.5 toneladas',
        }
      ]
    }
  ]
  sendButtonsSection(messages.from, 'Transportes Oscori srl.', text, '', 'CIUDADES', opciones)
}

function naviera_importacion(messages) {
  const text = '¿Con que naviera esta su carga?'
  const opciones = [
    {
      title: 'NAVIERAS',
      rows: [
        {
          id: 'N_1',
          title: 'MSC'
          //description: 'Esta es la primera empresa'
        },
        {
          id: 'N_2',
          title: 'Maersk',
        },
        {
          id: 'N_3',
          title: 'HAPAG LLOYD',
        },
        {
          id: 'N_4',
          title: 'Cosco',
        },
        {
          id: 'N_5',
          title: 'ONE',
        },
        {
          id: 'N_6',
          title: 'MSL',
        }
      ]
    }
  ]
  sendButtonsSection(messages.from, 'Transportes Oscori srl.', text, '', 'CIUDADES', opciones)
}

function naviera_exportacion(messages) {
  const text = '¿A que naviera ira su carga?'
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
  sendButtonsSection(messages.from, 'Transportes Oscori srl.', text, '', 'CIUDADES', opciones)
}

function img_precios() {
  sendImage(messages.from, 'https://wa-bot-g6h9.onrender.com/images/header.jpeg')
}

async function subirImagen(messages) {
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

async function sendButtonsImage(to, header, body, footer, mediaId, botones) {
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

async function sendImage(to, link) {
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
        link: link,
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

async function subirPDF(archivo) {
  const form = new FormData();
  form.append('file', fs.createReadStream(path.join(__dirname, `public/archivos/${archivo}.pdf`)));
  form.append('messaging_product', 'whatsapp');
  form.append('type', 'application/pdf');

  const response = await axios.post(
    `https://graph.facebook.com/v22.0/${PHONE_ID}/media`,
    form,
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        ...form.getHeaders(),
      },
    }
  );

  return response.data.id; // Este es el media_id que usarás para enviar el PDF
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
