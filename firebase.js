// firebase.js - client. Exports `auth` and `db`.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2loL7RcZu5aKubaLRbN4_O8Fvt1zKk6U",
  authDomain: "diamond-magic-1cd40.firebaseapp.com",
  databaseURL: "https://diamond-magic-1cd40-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "diamond-magic-1cd40",
  storageBucket: "diamond-magic-1cd40.firebasedestorage.app",
  messagingSenderId: "535030313734",
  appId: "1:535030313734:web:0fc186db8e58e082752487"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
