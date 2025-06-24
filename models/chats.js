const supabase = require('../services/supabaseService');

async function guardarChat({ id_usuario, id_flujo, id_mensaje, respuesta }) {
  const { data, error } = await supabase
    .from('chats')
    .insert([
      {
        id_usuario,
        id_flujo,
        id_mensaje,
        respuesta,
        // `fecha` no es necesario incluir porque tiene DEFAULT now()
      }
    ])
    .select(); // para obtener el chat insertado

  if (error) {
    console.error('❌ Error al guardar chat:', error.message);
    return null;
  }

  return data[0]; // devuelve el primer chat insertado
}

module.exports = {
    guardarChat
};
