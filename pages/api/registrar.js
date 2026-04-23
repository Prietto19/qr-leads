import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const { id, nombre, telefono } = req.body

    if (!id || !telefono) {
      return res.status(400).json({ error: 'Faltan campos requeridos' })
    }

    const { data, error: rpcError } = await supabase
      .rpc('canjear_qr', { qr_id_input: id })

    if (rpcError) {
      return res.status(500).json({ error: rpcError.message })
    }

    if (!data) {
      return res.status(409).json({ error: 'QR inválido o ya utilizado' })
    }

    const { error: leadError } = await supabase
      .from('leads')
      .insert({ qr_id: id, nombre: nombre || null, telefono })

    if (leadError) {
      return res.status(500).json({ error: leadError.message })
    }

    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
