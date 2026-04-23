import { useState, useEffect, useCallback } from 'react'
import QRCode from 'qrcode'
import { supabase } from '../lib/supabase'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

async function generarDataUrl(id) {
  return QRCode.toDataURL(`${BASE_URL}/registro?id=${id}`, { margin: 1 })
}

export default function Admin() {
  const [generando, setGenerando] = useState(false)
  const [qrsGenerados, setQrsGenerados] = useState([])
  const [qrCodes, setQrCodes] = useState([])
  const [qrImgs, setQrImgs] = useState({})
  const [leads, setLeads] = useState([])
  const [reactivando, setReactivando] = useState(null)

  const cargarDatos = useCallback(async () => {
    const [{ data: qrs }, { data: ls }] = await Promise.all([
      supabase.from('qr_codes').select('*').order('creado_en', { ascending: false }),
      supabase.from('leads').select('*').order('fecha', { ascending: false }),
    ])
    if (qrs) {
      setQrCodes(qrs)
      const imgs = {}
      await Promise.all(qrs.map(async (qr) => {
        imgs[qr.id] = await generarDataUrl(qr.id)
      }))
      setQrImgs(imgs)
    }
    if (ls) setLeads(ls)
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  async function generarQR() {
    setGenerando(true)
    const res = await fetch('/api/generar-qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const data = await res.json()
    setGenerando(false)
    if (res.ok) {
      setQrsGenerados((prev) => [data, ...prev])
      cargarDatos()
    }
  }

  async function reactivar(id) {
    setReactivando(id)
    await fetch('/api/reactivar-qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setReactivando(null)
    cargarDatos()
  }

  function descargarQR(qr, id) {
    const a = document.createElement('a')
    a.href = qr
    a.download = `qr-${id}.png`
    a.click()
  }

  function formatFecha(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Cabecera */}
        <div style={s.header}>
          <h1 style={s.h1}>Panel de administración</h1>
          <button
            onClick={generarQR}
            disabled={generando}
            style={{ ...s.btn, ...s.btnPrimary, opacity: generando ? 0.7 : 1 }}
          >
            {generando ? 'Generando...' : '+ Generar nuevo QR'}
          </button>
        </div>

        {/* QRs recién generados en esta sesión */}
        {qrsGenerados.length > 0 && (
          <section style={s.section}>
            <h2 style={s.h2}>Generados en esta sesión</h2>
            <div style={s.qrGrid}>
              {qrsGenerados.map((q) => (
                <div key={q.id} style={s.qrCard}>
                  <img src={q.qr} alt={`QR ${q.id}`} style={s.qrImg} />
                  <p style={s.qrId}>{q.id}</p>
                  <p style={s.qrUrl}>{q.url}</p>
                  <button
                    onClick={() => descargarQR(q.qr, q.id)}
                    style={{ ...s.btn, ...s.btnOutline, width: '100%' }}
                  >
                    Descargar
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tabla QR codes */}
        <section style={s.section}>
          <h2 style={s.h2}>Todos los QR codes</h2>
          {qrCodes.length === 0 ? (
            <p style={s.empty}>No hay QR codes todavía.</p>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['QR', 'ID', 'Estado', 'Fecha de uso', ''].map((col) => (
                      <th key={col} style={s.th}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {qrCodes.map((qr) => (
                    <tr key={qr.id} style={s.tr}>
                      <td style={s.td}>
                        {qrImgs[qr.id] ? (
                          <img src={qrImgs[qr.id]} alt={qr.id} style={{ width: 64, height: 64, display: 'block', cursor: 'pointer' }} onClick={() => descargarQR(qrImgs[qr.id], qr.id)} title="Clic para descargar" />
                        ) : (
                          <div style={{ width: 64, height: 64, background: '#f1f5f9', borderRadius: 6 }} />
                        )}
                      </td>
                      <td style={s.td}>
                        <span style={s.code}>{qr.id}</span>
                      </td>
                      <td style={s.td}>
                        <span style={{ ...s.badge, ...(qr.usado ? s.badgeRojo : s.badgeVerde) }}>
                          {qr.usado ? 'Usado' : 'Disponible'}
                        </span>
                      </td>
                      <td style={{ ...s.td, color: '#64748b', fontSize: 13 }}>
                        {formatFecha(qr.usado_en)}
                      </td>
                      <td style={s.td}>
                        {qr.usado && (
                          <button
                            onClick={() => reactivar(qr.id)}
                            disabled={reactivando === qr.id}
                            style={{ ...s.btn, ...s.btnOutline, padding: '5px 12px', fontSize: 13 }}
                          >
                            {reactivando === qr.id ? '...' : 'Reactivar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Tabla leads */}
        <section style={s.section}>
          <h2 style={s.h2}>Leads recogidos</h2>
          {leads.length === 0 ? (
            <p style={s.empty}>Aún no hay registros.</p>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Nombre', 'Teléfono', 'QR usado', 'Fecha'].map((col) => (
                      <th key={col} style={s.th}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} style={s.tr}>
                      <td style={s.td}>{lead.nombre || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                      <td style={s.td}>{lead.telefono}</td>
                      <td style={s.td}><span style={s.code}>{lead.qr_id}</span></td>
                      <td style={{ ...s.td, color: '#64748b', fontSize: 13 }}>
                        {formatFecha(lead.fecha)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    padding: '40px 16px',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  container: {
    maxWidth: 900,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  h1: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: '#0f172a',
  },
  h2: {
    margin: '0 0 16px',
    fontSize: 16,
    fontWeight: 600,
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  section: {
    background: '#ffffff',
    borderRadius: 14,
    padding: '24px',
    marginBottom: 24,
    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
  },
  btn: {
    border: 'none',
    borderRadius: 8,
    padding: '10px 18px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  btnPrimary: {
    background: '#6366f1',
    color: '#fff',
  },
  btnOutline: {
    background: 'transparent',
    border: '1.5px solid #cbd5e1',
    color: '#475569',
  },
  qrGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 16,
  },
  qrCard: {
    border: '1.5px solid #e2e8f0',
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  qrImg: {
    width: 140,
    height: 140,
  },
  qrId: {
    margin: 0,
    fontFamily: 'monospace',
    fontWeight: 700,
    fontSize: 15,
    color: '#0f172a',
    letterSpacing: '0.1em',
  },
  qrUrl: {
    margin: 0,
    fontSize: 11,
    color: '#94a3b8',
    wordBreak: 'break-all',
    textAlign: 'center',
  },
  tableWrap: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderBottom: '1.5px solid #e2e8f0',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '12px 12px',
    color: '#0f172a',
    verticalAlign: 'middle',
  },
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  badgeVerde: {
    background: '#dcfce7',
    color: '#16a34a',
  },
  badgeRojo: {
    background: '#fee2e2',
    color: '#dc2626',
  },
  code: {
    fontFamily: 'monospace',
    background: '#f1f5f9',
    padding: '2px 7px',
    borderRadius: 5,
    fontSize: 13,
    letterSpacing: '0.05em',
  },
  empty: {
    margin: 0,
    color: '#94a3b8',
    fontSize: 14,
  },
}
