import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

---

**ETAPA 4 — SUBIR NO GITHUB**

**1.** No repositório criado, clique em **"Add file"** → **"Upload files"**

**2.** Crie a seguinte estrutura:
```
maxxxi/
  index.html
  package.json
  vite.config.js
  src/
    main.jsx
    App.jsx
