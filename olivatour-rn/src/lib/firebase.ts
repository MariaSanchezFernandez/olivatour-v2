import { initializeApp, getApps } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            'AIzaSyCvPEP87UmMSEQAOijbAKa_AIkDrNDymw4',
  authDomain:        'olivatour-fd159.firebaseapp.com',
  projectId:         'olivatour-fd159',
  storageBucket:     'olivatour-fd159.firebasestorage.app',
  messagingSenderId: '184171593074',
  appId:             '1:184171593074:web:c02fcc336dc53f3f76f1eb',
  measurementId:     'G-VS9ZC8Y6EP',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const storage = getStorage(app);
