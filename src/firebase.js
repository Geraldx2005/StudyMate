// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDRj_UO-_z_93LjUXc54x4NHiEsAfte1e0",
  authDomain: "studymate-xo.firebaseapp.com",
  projectId: "studymate-xo",
  storageBucket: "studymate-xo.firebasestorage.app",
  messagingSenderId: "522008513722",
  appId: "1:522008513722:web:39c73850860d5f76994683",
  measurementId: "G-BJP3KP34VN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);