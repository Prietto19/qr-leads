import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Registro() {
  const { query } = useRouter()
  const id = query.id

  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [cargando, setCargando] = useState(false)
  const [resultado, setResultado] = useState(null)

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
      <>
        <Head><title>Acceso confirmado</title></Head>
        <div style={s.page}>
          <div style={s.card}>
            <div style={s.logoMark}>P</div>
            <div style={s.iconCircle}>✓</div>
            <h1 style={s.heading}>ACCESO CONFIRMADO</h1>
            <p style={s.sub}>Bienvenido. Nos vemos dentro.</p>
            <div style={s.divider} />
            <p style={s.fine}>Ya puedes cerrar esta ventana.</p>
          </div>
        </div>
      </>
    )
  }

  if (resultado === 'error') {
    return (
      <>
        <Head><title>Acceso denegado</title></Head>
        <div style={s.page}>
          <div style={s.card}>
            <div style={s.logoMark}>P</div>
            <div style={{ ...s.iconCircle, borderColor: '#550000', color: '#550000' }}>✕</div>
            <h1 style={{ ...s.heading, color: '#661111' }}>ACCESO DENEGADO</h1>
            <p style={s.sub}>Este QR ya fue utilizado o no es válido.</p>
            <div style={s.divider} />
            <p style={s.fine}>Contacta con el organizador si crees que es un error.</p>
          </div>
        </div>
      </>
    )
  }

  const puedeEnviar = telefono.length >= 9 && !cargando

  return (
    <>
      <Head>
        <title>Acceso exclusivo</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div style={s.page}>
        <div style={s.card}>

          <div style={s.logoMark}>P</div>

          <div style={s.taglineWrap}>
            <span style={s.line} />
            <span style={s.tagline}>ACCESO EXCLUSIVO</span>
            <span style={s.line} />
          </div>

          <h1 style={s.heading}>CONFIRMA TU ACCESO</h1>
          <p style={s.sub}>Introduce tus datos para reservar tu plaza.</p>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.campo}>
              <label style={s.label}>
                NOMBRE <span style={s.opcional}>— opcional</span>
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                style={s.input}
                autoComplete="name"
              />
            </div>

            <div style={s.campo}>
              <label style={s.label}>TELÉFONO</label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="612 345 678"
                required
                style={s.input}
                autoComplete="tel"
                inputMode="tel"
              />
              {telefono.length > 0 && telefono.length < 9 && (
                <p style={s.aviso}>Mínimo 9 dígitos</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!puedeEnviar}
              style={{ ...s.boton, ...(puedeEnviar ? s.botonActivo : s.botonDesactivado) }}
            >
              {cargando ? 'CONFIRMANDO...' : 'CONFIRMAR ACCESO'}
            </button>
          </form>

        </div>
      </div>
    </>
  )
}

const RED = '#C8000A'
const RED_DIM = '#8B0006'
const FONT_DISPLAY = '"Cormorant Garamond", Georgia, serif'
const FONT_BODY = '"Montserrat", system-ui, sans-serif'

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#080808',
    padding: '40px 16px',
    boxSizing: 'border-box',
    fontFamily: FONT_BODY,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
  },
  logoMark: {
    fontFamily: FONT_DISPLAY,
    fontSize: 72,
    fontWeight: 700,
    color: RED,
    lineHeight: 1,
    marginBottom: 24,
    letterSpacing: '-2px',
    textShadow: `0 0 40px ${RED_DIM}`,
  },
  taglineWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    width: '100%',
  },
  line: {
    flex: 1,
    height: 1,
    background: '#2a0a0a',
  },
  tagline: {
    fontSize: 10,
    letterSpacing: '0.3em',
    color: RED_DIM,
    fontFamily: FONT_BODY,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  heading: {
    fontFamily: FONT_DISPLAY,
    fontSize: 28,
    fontWeight: 700,
    color: '#f0e8e8',
    letterSpacing: '0.12em',
    textAlign: 'center',
    margin: '0 0 10px',
  },
  sub: {
    fontSize: 12,
    color: '#5a4040',
    letterSpacing: '0.08em',
    textAlign: 'center',
    margin: '0 0 32px',
    fontWeight: 500,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    width: '100%',
  },
  campo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.2em',
    color: '#6a3030',
  },
  opcional: {
    fontWeight: 400,
    color: '#3a2020',
    letterSpacing: '0.05em',
  },
  input: {
    background: '#110808',
    border: '1px solid #2e0e0e',
    borderRadius: 4,
    padding: '14px 16px',
    fontSize: 15,
    color: '#f0e0e0',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: FONT_BODY,
    letterSpacing: '0.04em',
  },
  aviso: {
    margin: 0,
    fontSize: 11,
    color: RED_DIM,
    letterSpacing: '0.05em',
  },
  boton: {
    marginTop: 8,
    padding: '16px',
    border: 'none',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.2em',
    cursor: 'pointer',
    fontFamily: FONT_BODY,
    transition: 'opacity 0.2s',
    width: '100%',
  },
  botonActivo: {
    background: RED,
    color: '#fff',
  },
  botonDesactivado: {
    background: '#1a0808',
    color: '#3a2020',
    cursor: 'not-allowed',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    border: `2px solid ${RED}`,
    color: RED,
    fontSize: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  divider: {
    width: 40,
    height: 1,
    background: '#2a0a0a',
    margin: '20px auto',
  },
  fine: {
    fontSize: 11,
    color: '#3a2020',
    letterSpacing: '0.06em',
    textAlign: 'center',
  },
}
