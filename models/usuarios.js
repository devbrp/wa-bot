const supabase = require('../services/supabaseService');

async function buscarUsuarioPorNumero(numero) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('numero', numero)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('❌ Error al buscar usuario:', error.message);
    return null;
  }

  return data || null;
}

async function getUltimoFlujoMensaje(numero) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('ultimo_flujo, ultimo_mensaje')
    .eq('numero', numero)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('❌ Error al buscar usuario:', error.message);
    return null;
  }

  return data || null;
}

async function crearUsuario({ numero, nombre }) {
  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ numero, nombre }])
    .select()
    .single();

  if (error) {
    console.error('❌ Error al crear usuario:', error.message);
    return null;
  }

  return data;
}

module.exports = {
    buscarUsuarioPorNumero,
    getUltimoFlujoMensaje,
    crearUsuario
};
