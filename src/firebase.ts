import { initializeApp, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const initializeFirebase = () => {
    const firebaseConfig = {
        apiKey: "AIzaSyAqu_Y4VsHhqE6JFagisbYtnv8sRNNhdPA",
        authDomain: "myao-3e15e.firebaseapp.com",
        databaseURL: "https://myao-3e15e-default-rtdb.firebaseio.com",
        projectId: "myao-3e15e",
        storageBucket: "myao-3e15e.appspot.com",
        messagingSenderId: "887359265547",
        appId: "1:887359265547:web:656298242e43fccccba00e"
      };
  
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
  
    return db;
  };


