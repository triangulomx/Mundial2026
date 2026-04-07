import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDlImv6yan42aWajlAuOi1g_PQvQrzcdQ8",
  authDomain: "mundial2026-563f8.firebaseapp.com",
  projectId: "mundial2026-563f8",
  storageBucket: "mundial2026-563f8.firebasestorage.app",
  messagingSenderId: "887840890026",
  appId: "1:887840890026:web:5d6cbbc2c504ff819584d3"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
