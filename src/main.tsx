import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './i18n';
import './utils/messageAlert.tsx';

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId="196292942822-dit8g1hkfhnkhnk4ip66i046nco4shnr.apps.googleusercontent.com">
    <StrictMode>
      <App />
    </StrictMode>,
  </GoogleOAuthProvider>
)
