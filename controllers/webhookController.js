const { VERIFY_TOKEN } = process.env;
const { buscarUsuarioPorNumero, crearUsuario, getUltimoFlujoMensaje } = require("../models/usuarios");
const { guardarChat } = require("../models/chats");

const whatsapp = require("../services/whatsappService");
const w_mensaje = require("../models/mensajes");
const w_opcion = require("../models/opciones");

const mensaje_inicio = 1;
const mensaje_reinicio = 2;

const handleWebhookGet = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
};

const handleWebhookPost = async (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0]?.value;

  const messages = changes?.messages?.[0];
  const nombreUsuario = changes?.contacts?.[0]?.profile?.name || "usuario";
  const statuses = changes?.statuses?.[0];
const from = messages.from;

  let usuario = await buscarUsuarioPorNumero(from);

  if (!usuario) {
    usuario = await crearUsuario({ numero: from, nombre: nombreUsuario });
    console.log("👤 Nuevo usuario creado:", usuario);

    let mensaje = await w_mensaje.getMensaje(mensaje_inicio);
    await whatsapp.ejecutarMensaje(mensaje, messages, nombreUsuario);

  } else {
    console.log("👤 Usuario existente:", usuario);

    //  let usuario = await getUltimoFlujoMensaje(from);
    let mensaje = await w_mensaje.getMensaje(mensaje_reinicio);
    await whatsapp.ejecutarMensaje(mensaje, messages, nombreUsuario);
    // if (statuses) {
    //   const status = statuses.status;
    //   console.log(`📱 Estado del mensaje: ${status}`);
    //   if (status === "read") {
    //     await guardarMensaje({
    //       numero: from,
    //       mensaje: "Mensaje leído",
    //       tipo: "estado",
    //     });
    //   }
    // }
  }

  if (messages?.type === "text") {
    const texto = messages.text.body.toLowerCase();

    let mensaje = await w_mensaje.getMensaje(mensaje_inicial);
    await whatsapp.ejecutarMensaje(mensaje, messages, nombreUsuario);

    await guardarChat({
  id_usuario: usuario.id_usuario,
  id_flujo: mensaje.id_flujo,
  id_mensaje: mensaje.id_mensaje,
  respuesta: messages.text.body,
});
  }

  if (messages?.type === 'interactive') {
      const reply = messages.interactive?.button_reply || messages.interactive?.list_reply;
      if (reply) {
        await sendText(from, `Seleccionaste: ${reply.title}`, messages.id);

        const selectedId = reply.id;

        const mensaje_siguiente = await w_opcion.getMensajeSiguiente(selectedId);
        let mensaje = await w_mensaje.getMensaje(mensaje_siguiente);
        await whatsapp.ejecutarMensaje(mensaje, messages, nombreUsuario);

        await guardarChat({
  id_usuario: usuario.id_usuario,
  id_flujo: mensaje.id_flujo,
  id_mensaje: mensaje.id_mensaje,
  respuesta: messages.text.body || reply.title,
});
      }
    }

  res.sendStatus(200);
};

module.exports = {
  handleWebhookGet,
  handleWebhookPost,
};
