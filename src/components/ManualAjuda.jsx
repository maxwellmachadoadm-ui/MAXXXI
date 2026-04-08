import { useState } from 'react'
import { getManualAba, getManualEmpresa, gerarTextoManual, MANUAL_VERSION, MANUAL_DATE } from '../lib/manual'

// ── Botão ❓ que aparece ao lado do título de cada aba ──
export function BotaoAjuda({ empresaId, nomeAba }) {
  const [open, setOpen] = useState(false)
  const manual = getManualAba(empresaId, nomeAba)
  if (!manual) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={`Ajuda: ${nomeAba}`}
        style={{
          background: 'none', border: '1px solid var(--border)', borderRadius: 6,
          color: 'var(--tx3)', cursor: 'pointer', fontSize: 13, padding: '2px 8px',
          display: 'inline-flex', alignItems: 'center', gap: 4, transition: '.15s',
        }}
        onMouseEnter={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.color = 'var(--blue)' }}
        onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--tx3)' }}
      >
        ❓
      </button>

      {open && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="modal" style={{ maxWidth: 520, maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="modal-title">
              <span>{manual.icone} {manual.titulo}</span>
              <button className="modal-close" onClick={() => setOpen(false)}>×</button>
            </div>

            <div style={{ padding: '0 4px' }}>
              {/* Objetivo */}
              <div style={{ background: 'rgba(59,130,246,.08)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, borderLeft: '3px solid var(--blue)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--blue)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Objetivo</div>
                <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{manual.objetivo}</div>
              </div>

              {/* Como usar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Como Usar</div>
                {manual.como_usar.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
                    <span style={{ background: 'var(--blue)', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              {/* Dica */}
              <div style={{ background: 'rgba(245,158,11,.08)', borderRadius: 8, padding: '10px 14px', borderLeft: '3px solid var(--gold)' }}>
                <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
                  💡 <strong>Dica:</strong> {manual.dica}
                </div>
              </div>

              <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 12, textAlign: 'right' }}>
                Manual v{MANUAL_VERSION} · {MANUAL_DATE}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Botão 📖 Manual Completo da Empresa ──
export function BotaoManualEmpresa({ empresaId }) {
  const [open, setOpen] = useState(false)
  const manual = getManualEmpresa(empresaId)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn btn-secondary btn-sm"
        style={{ gap: 4, fontSize: 11 }}
        title="Manual da empresa"
      >
        📖 Manual
      </button>

      {open && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="modal" style={{ maxWidth: 600, maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="modal-title">
              <span>📖 {manual.titulo}</span>
              <button className="modal-close" onClick={() => setOpen(false)}>×</button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--tx3)', marginBottom: 16, lineHeight: 1.6 }}>{manual.descricao}</p>

            {/* Lista de abas */}
            {Object.entries(manual.abas).map(([nome, aba]) => (
              <div key={nome} className="card" style={{ padding: '12px 16px', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{aba.icone}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{aba.titulo}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--tx2)', lineHeight: 1.6, marginBottom: 6 }}>{aba.objetivo}</div>
                <div style={{ fontSize: 11, color: 'var(--tx3)' }}>💡 {aba.dica}</div>
              </div>
            ))}

            {/* Botão baixar */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-primary btn-sm" onClick={() => {
                const texto = gerarTextoManual(empresaId)
                const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url; a.download = `Manual_ORION_${empresaId.toUpperCase()}.txt`; a.click()
                URL.revokeObjectURL(url)
              }}>
                ⬇ Baixar Manual (.txt)
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setOpen(false)}>Fechar</button>
            </div>

            <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 8 }}>
              Versão {MANUAL_VERSION} · Atualizado em {MANUAL_DATE}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
