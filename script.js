/* =========================================
   FIREBASE.JS
========================================= */

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    limit,
    onSnapshot
} from
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* =========================================
   FIREBASE CONFIGURATION
   IMPORTANT: Replace these with your
   Firebase project values.
========================================= */

const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain:
        "YOUR_PROJECT.firebaseapp.com",

    projectId:
        "YOUR_PROJECT_ID",

    storageBucket:
        "YOUR_PROJECT.firebasestorage.app",

    messagingSenderId:
        "YOUR_MESSAGING_SENDER_ID",

    appId:
        "YOUR_APP_ID"
};


/* =========================================
   INITIALIZE FIREBASE
========================================= */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


/* =========================================
   AUTHENTICATION STATE
========================================= */

onAuthStateChanged(auth, (user) => {

    window.firebaseUser = user || null;

    if (user) {

        console.log(
            "User logged in:",
            user.email || user.uid
        );

    } else {

        console.log(
            "No authenticated user."
        );
    }
});


/* =========================================
   GLOBAL FIREBASE ACCESS
========================================= */

window.firebaseDB = db;

window.firebaseAuth = auth;

window.firebaseFunctions = {

    collection,
    addDoc,
    serverTimestamp,

    query,
    where,
    orderBy,
    limit,

    onSnapshot
};

console.log("Firebase initialized successfully.");
