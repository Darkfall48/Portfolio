//? Libraries
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

//? Content / i18n
import './i18n'

//? Components
import App from './App'

//? Styles
import './styles/main.scss'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
