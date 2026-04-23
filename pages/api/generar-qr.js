import QRCode from 'qrcode'
import { supabase } from '../../lib/supabase'

function generarId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let id = ''
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  for (const byte of bytes) {
    id += chars[byte % chars.length]
  }
  return id
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const id = generarId()
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/registro?id=${id}`

    const { error } = await supabase
      .from('qr_codes')
      .insert({ id, usado: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    const qr = await QRCode.toDataURL(url)

    res.status(200).json({ id, url, qr })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
