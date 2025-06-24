const supabase = require('../services/supabaseService');

async function getMensaje(id) {
  const { data, error } = await supabase
    .from('mensajes')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('❌ No existe el mensaje', error.message);
    return null;
  }

  return data || null;
}

module.exports = {
    getMensaje
};
