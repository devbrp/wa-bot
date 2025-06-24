const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL= 'https://xxxx.supabase.co'
const SUPABASE_KEY= 'eyJxxxxxxxxxxxx'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;