import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({ error: 'Falta id' })
    }

    const { error } = await supabase
      .from('qr_codes')
      .update({ usado: false, usado_en: null })
      .eq('id', id)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
