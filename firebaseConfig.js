import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyDr7HSw2kfDJOsB2N9qRBKZ9dzq3TG8Ydc",
    authDomain: "sanify-12b57.firebaseapp.com",
    databaseURL: "https://sanify-12b57-default-rtdb.firebaseio.com",
    projectId: "sanify-12b57",
    storageBucket: "sanify-12b57.firebasestorage.app",
    messagingSenderId: "560159613123",
    appId: "1:560159613123:web:60e1df38ee154bf6efc276"
  };

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
