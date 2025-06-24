const supabase = require('../services/supabaseService');

async function getMensajeSiguiente(id) {
  const { data, error } = await supabase
    .from('opciones')
    .select('mensaje_siguiente')
    .eq('id_mensaje', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('❌ No se pudo obtener opciones', error.message);
    return null;
  }

  return data || null;
}


async function getOpciones(id) {
  const { data, error } = await supabase
    .from('opciones')
    .select('*')
    .eq('id_mensaje', id);

  if (error && error.code !== 'PGRST116') {
    console.error('❌ No se pudo obtener opciones', error.message);
    return [];
  }

  if (!data || data.length === 0) return [];

  const opcionesFormateadas = data.map((opcion) => ({
  type: 'reply',
  reply: {
    id: opcion.id_opcion,
    title: opcion.title || ''
  }
}));

  return opcionesFormateadas;
}

async function getOpcionesSection(id) {
  const { data, error } = await supabase
    .from('opciones')
    .select('*')
    .eq('id_mensaje', id);

  if (error && error.code !== 'PGRST116') {
    console.error('❌ No se pudo obtener opciones', error.message);
    return [];
  }

  if (!data || data.length === 0) return [];

  const agrupadas = {};
  data.forEach(opcion => {
    const section = opcion.section || 'Otras'; 
    if (!agrupadas[section]) agrupadas[section] = [];

    agrupadas[section].push({
      id: opcion.cod_opcion,     
      title: opcion.title,
      description: opcion.description || ''
    });
  });

  const secciones = Object.entries(agrupadas).map(([title, rows]) => ({
    title,
    rows
  }));

  return secciones;
}

module.exports = {
    getOpciones,
    getOpcionesSection,
    getMensajeSiguiente
};
