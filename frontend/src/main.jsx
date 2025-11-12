import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/design-tokens.css'
import './styles/glass-components.css'
import './styles/ui-enhancements.css'
import './styles/components.css'
import './styles/dropdown.css'
import '@fortawesome/fontawesome-free/css/all.min.css';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
