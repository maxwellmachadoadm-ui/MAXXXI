import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

export function AppProvider({ children }) {
  const [presentationMode, setPresentationMode] = useState(false)

  function togglePresentation() {
    setPresentationMode(prev => !prev)
  }

  function fmtPresentation(value, fmtFn) {
    if (!presentationMode) return fmtFn(value)
    if (!value && value !== 0) return '—'
    return '••••'
  }

  return (
    <AppContext.Provider value={{ presentationMode, togglePresentation, fmtPresentation }}>
      {children}
    </AppContext.Provider>
  )
}
