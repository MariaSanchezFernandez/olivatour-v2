import { initializeApp, getApps } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// ─── RELLENA ESTOS VALORES CON TU PROYECTO DE FIREBASE ───────────────────────
// 1. Ve a https://console.firebase.google.com
// 2. Crea un proyecto (o usa uno existente)
// 3. Añade una app web (</> botón)
// 4. Copia los valores de firebaseConfig aquí
// 5. En Firebase Console → Storage → Reglas, ponlas en modo público temporal:
//    allow read, write: if true;
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            'PEGA_TU_API_KEY',
  authDomain:        'PEGA_TU_PROJECT_ID.firebaseapp.com',
  projectId:         'PEGA_TU_PROJECT_ID',
  storageBucket:     'PEGA_TU_PROJECT_ID.appspot.com',
  messagingSenderId: 'PEGA_TU_MESSAGING_SENDER_ID',
  appId:             'PEGA_TU_APP_ID',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const storage = getStorage(app);
