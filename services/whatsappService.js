const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const opciones = require('../models/opciones');

const WHATSAPP_ACCESS_TOKEN = 'EAAIe5iFGKQUBO8nklZCHqzVPJqo84FISeBVAFFGCLPU0NEaEZAEmoa7YqQUGwhlqLczkZBtsQDGD2PXgbarsFOq8N8y7YAim3AAgyl4NuuZC8recpfyh2PiNZAKdPuwmMBjVVj68RgQt0dkuxYyngj3cuRNLigBkaaVomMkxQcYGZA655N4x4cCZBdTwrqrqu8LlV0yZCyJsaXcZD';

const {
  //WHATSAPP_ACCESS_TOKEN,
  PHONE_ID
} = process.env;

async function ejecutarMensaje({ mensaje, messages, nombreUsuario }) {

  const to = messages.from;
  const contextId = mensaje.referencia==1 ? messages.id : null;
  const tipoId = mensaje.id_tipo_mensaje;
  let botones;

  switch (tipoId) {
    case 1: // texto
      return await sendText(to, mensaje.body, contextId);

    case 2: // botón
        botones = await opciones.getOpciones(mensaje.id);
        if (botones.length === 0) {
            console.warn(`⚠️ No hay opciones para el mensaje con ID ${mensaje.id}`);
            return;
        }
      return await sendButtons(to, mensaje.header||'', mensaje.body||'', mensaje.footer||'', botones);

    case 3: // lista
        botones = await opciones.getOpcionesSection(mensaje.id);
        if (botones.length === 0) {
            console.warn(`⚠️ No hay opciones para el mensaje con ID ${mensaje.id}`);
            return;
        }
      return await sendButtonsSection(to, mensaje.header||'', mensaje.body||'', mensaje.footer||'', mensaje.title_button||'Ver Opciones', botones);

    case 4: { // imagen
      const mediaId = await uploadMedia(path.join(__dirname, `../public/images/${mensaje.imagen}`), 'image/jpeg');
      return await sendImage(to, mediaId, mensaje.caption || '');
    }

    case 5: { // video
      const mediaId = await uploadMedia(path.join(__dirname, `../public/videos/${mensaje.url}`), 'video/mp4');
      return await sendVideo(to, mediaId, mensaje.caption || '');
    }

    case 6: { // documento
        //TODO: ADICIONAR TIPO DE DOCUMENTO: 'application/pdf', 'application/msword', etc.
      const mediaId = await uploadMedia(path.join(__dirname, `../public/archivos/${mensaje.url}`), 'application/pdf');
      return await sendDocument(to, mediaId, mensaje.filename, mensaje.caption || '');
    }

    case 7: { // audio
        //TODO: ADICIONAR TIPO DE AUDIO: 'audio/mpeg', 'audio/ogg', etc.
      const mediaId = await uploadMedia(path.join(__dirname, `../public/audios/${mensaje.url}`), 'audio/mpeg');
      return await sendAudio(to, mediaId);
    }

    case 8: // ubicación
      return await sendLocation(to, mensaje.latitud, mensaje.longitud, mensaje.name, mensaje.address);

    case 9: // solicitud ubicación
      return await sendSolicitudLocation(to, mensaje.body, mensaje.name);

    case 10: // dirección
    //TODO: EVALUAR SI SE PUEDE USAR
    //return await sendAddress(to, `${mensaje.body}\n📍 ${mensaje.address}`);

    case 11: { // contacto
      const contacto = mensaje.contacto;
      return await sendContact(to, contacto);
    }

    case 12: // botón con URL
      return await sendUrlButton(to, mensaje.header || '', mensaje.body || '', mensaje.footer || '', mensaje.url, mensaje.title_button);

    case 13: // reacción
      return await sendReaction(to, contextId, mensaje.emoji || '👍');

    case 14: { // sticker
      const mediaId = await uploadMedia(path.join(__dirname, `../public/stickers/${mensaje.url}`), 'image/webp');
      return await sendSticker(to, mediaId);
    }

    default:
      console.warn(`⚠️ Tipo de mensaje ${tipoId} no soportado`);
      return;
  }
}

async function uploadMedia(path, type) {
  const form = new FormData();
  form.append('file', fs.createReadStream(path));
  form.append('type', type);
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

async function sendImage(to, mediaId, caption) {
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
        id: mediaId,
        caption: caption
      }
    })
  })
}

async function sendVideo(to, mediaId, caption) {
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
      type: "video",
      video: {
        id: mediaId,
        caption: caption
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
      context: messageId ? { message_id: messageId } : undefined
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
    //TODO: ADICIONAR TIPO DE HEADER: // 'text', 'image', 'video', 'document'
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

async function sendDocument(to, mediaId, filename, caption) {
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
        filename: filename,
        caption: caption
    },
    },
  });
}

async function sendAudio(to, mediaId) {
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
      type: 'audio',
      audio: {
        id: mediaId
    },
    },
  });
}

async function sendLocation(to, latitud, longitud, name, address) {
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
      type: 'location',
    location: {
    latitude: latitud,
    longitude: longitud,
    name: name,
    address: address
  }
    },
  });
}

async function sendSolicitudLocation(to, body, name) {
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
        type: 'location_request_message',
        body: {
          text: body
        },
        action: {
          name: name
        }
      }
    })
  })
}


async function sendContact(to, contacto) {
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
      type: 'contacts',
      contacts: [contacto]
    })
  })
}

async function sendUrlButton(to, header, body, footer, url, title_button) {
  await axios({
    url: `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`,
    method: 'post',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
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
          buttons: [
            {
              type: 'url',
              url: url,
              title: title_button 
            }
          ]
        }
      }
    })
  });
}

async function sendReaction(to, messageId, emoji) {
  await axios({
    url: `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`,
    method: 'post',
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: {
      messaging_product: 'whatsapp',
      to,
      type: 'reaction',
      reaction: {
        message_id: messageId,
        emoji: emoji // ejemplo: "❤️", "😂", "🔥"
      }
    }
  });
}

async function sendSticker(to, mediaId) {
  await axios({
    url: `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`,
    method: 'post',
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: {
      messaging_product: 'whatsapp',
      to,
      type: 'sticker',
      sticker: {
        id: mediaId
      }
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

module.exports = {
  ejecutarMensaje,

  // Básicos
  sendText,
  replyMessage,

  // Botones y listas
  sendButtons,
  sendButtonsSection,
  sendButtonsImage,
  sendUrlButton,

  // Multimedia
  sendImage,
  sendVideo,
  sendAudio,
  sendDocument,
  uploadMedia,

  // Stickers y reacciones
  sendSticker,
  sendReaction,

  // Ubicación y contacto
  sendLocation,
  sendSolicitudLocation,
  sendContact,

  // Flujos e imágenes fijas
  sendFlowMessage
};

