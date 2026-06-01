import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: 動作確認後、環境変数に戻すこと
const firebaseConfig = {
    apiKey: "AIzaSyDbhLrj7jIvfDkdbdVShqJqTfdqfSZ5vII",
    authDomain: "infodemic-chronicle.firebaseapp.com",
    projectId: "infodemic-chronicle",
    storageBucket: "infodemic-chronicle.firebasestorage.app",
    messagingSenderId: "605886051102",
    appId: "1:605886051102:web:7e95134a8e55e294d50f0f",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
