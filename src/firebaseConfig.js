import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_2YBkgDsLDtqC-iM-Q0uM-Ic2m_cHiyM",
  authDomain: "endotrack-5a5ff.firebaseapp.com",
  projectId: "endotrack-5a5ff",
  storageBucket: "endotrack-5a5ff.appspot.com",
  messagingSenderId: "750828514",
  appId: "1:750828514:web:c3a90414e6946bd13f97bb",
  measurementId: "G-YQ4SHB24TN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
