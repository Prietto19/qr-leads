import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Registro() {
  const { query } = useRouter()
  const id = query.id

  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [cargando, setCargando] = useState(false)
  const [resultado, setResultado] = useState(null) // 'exito' | 'error'

  async function handleSubmit(e) {
    e.preventDefault()
    setCargando(true)

    const res = await fetch('/api/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, nombre, telefono }),
    })

    const data = await res.json()
    setCargando(false)
    setResultado(data.ok ? 'exito' : 'error')
  }

  if (resultado === 'exito') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.icon}>✓</div>
          <h1 style={styles.titulo}>¡Registrado correctamente!</h1>
          <p style={styles.subtitulo}>Gracias por participar. Ya puedes cerrar esta ventana.</p>
        </div>
      </div>
    )
  }

  if (resultado === 'error') {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, borderTop: '4px solid #ef4444' }}>
          <div style={{ ...styles.icon, background: '#fef2f2', color: '#ef4444' }}>✕</div>
          <h1 style={{ ...styles.titulo, color: '#ef4444' }}>QR no válido</h1>
          <p style={styles.subtitulo}>Este QR ya fue utilizado o no es válido.</p>
        </div>
      </div>
    )
  }

  const puedeEnviar = telefono.length >= 9 && !cargando

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.titulo}>Regístrate</h1>
        <p style={styles.subtitulo}>Completa el formulario para participar.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.campo}>
            <label style={styles.label}>
              Nombre <span style={styles.opcional}>(opcional)</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              style={styles.input}
              autoComplete="name"
            />
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>
              Teléfono <span style={styles.requerido}>*</span>
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="612 345 678"
              required
              style={styles.input}
              autoComplete="tel"
              inputMode="tel"
            />
            {telefono.length > 0 && telefono.length < 9 && (
              <p style={styles.aviso}>Mínimo 9 dígitos</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!puedeEnviar}
            style={{
              ...styles.boton,
              ...(puedeEnviar ? styles.botonActivo : styles.botonDesactivado),
            }}
          >
            {cargando ? 'Enviando...' : 'Confirmar registro'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
    padding: '24px 16px',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    background: '#ffffff',
    borderRadius: 16,
    padding: '40px 32px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    borderTop: '4px solid #6366f1',
    boxSizing: 'border-box',
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: '#eef2ff',
    color: '#6366f1',
    fontSize: 24,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  titulo: {
    margin: '0 0 8px',
    fontSize: 22,
    fontWeight: 700,
    color: '#0f172a',
    textAlign: 'center',
  },
  subtitulo: {
    margin: '0 0 28px',
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 1.5,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  campo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: '#374151',
  },
  opcional: {
    fontWeight: 400,
    color: '#94a3b8',
    fontSize: 12,
  },
  requerido: {
    color: '#ef4444',
  },
  input: {
    border: '1.5px solid #e2e8f0',
    borderRadius: 10,
    padding: '12px 14px',
    fontSize: 16,
    color: '#0f172a',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  aviso: {
    margin: 0,
    fontSize: 12,
    color: '#f59e0b',
  },
  boton: {
    padding: '14px',
    borderRadius: 10,
    border: 'none',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.15s, background 0.15s',
    marginTop: 4,
  },
  botonActivo: {
    background: '#6366f1',
    color: '#ffffff',
  },
  botonDesactivado: {
    background: '#e2e8f0',
    color: '#94a3b8',
    cursor: 'not-allowed',
  },
}
