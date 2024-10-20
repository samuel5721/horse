// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCuJ0KgZF79NsjtDF28FVbhlgYi17kbAsE",
  authDomain: "horse-fd31b.firebaseapp.com",
  projectId: "horse-fd31b",
  storageBucket: "horse-fd31b.appspot.com",
  messagingSenderId: "658791227008",
  appId: "1:658791227008:web:a33a9e702e631d11bed065",
  measurementId: "G-TT5CQ68J0G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };