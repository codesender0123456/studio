// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA1_r1Fc7ESybCMvGH1w-CI76emCtpP_RI",
  authDomain: "pheniox-academy-student-result.firebaseapp.com",
  projectId: "pheniox-academy-student-result",
  storageBucket: "pheniox-academy-student-result.firebasestorage.app",
  messagingSenderId: "75218136369",
  appId: "1:75218136369:web:08520ddc161d00a9af9410",
  measurementId: "G-LT212Q697R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
