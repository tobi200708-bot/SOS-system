/* =========================================
   FIREBASE.JS
   EMERGENCY SOS SYSTEM
========================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* =========================================
   FIREBASE CONFIG
========================================= */

const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain:
        "emergency-sos-system-2717b.firebaseapp.com",

    projectId:
        "emergency-sos-system-2717b",

    storageBucket:
        "emergency-sos-system-2717b.firebasestorage.app",

    messagingSenderId:
        "831859323537",

    appId: "YOUR_APP_ID",

    measurementId:
        "G-T8V9F5B3Q8"
};


/* =========================================
   INITIALIZE FIREBASE
========================================= */

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getFirestore(app);


/* =========================================
   USER
========================================= */

let currentUser = null;

onAuthStateChanged(auth, (user) => {

    currentUser = user;

    window.firebaseUser = user;

});


/* =========================================
   ANONYMOUS LOGIN
========================================= */

signInAnonymously(auth)
    .then(() => {

        console.log(
            "Firebase authentication successful"
        );

    })
    .catch((error) => {

        console.error(
            "Authentication error:",
            error
        );

    });


/* =========================================
   AUTOMATIC ALERT
========================================= */

export async function saveAutomaticAlert(
    latitude,
    longitude,
    accuracy,
    sensorValue
) {

    const alertData = {

        type: "AUTOMATIC_SOS",

        status: "ACTIVE",

        source: "MOTION_SENSOR",

        message:
            "Emergency detected automatically by device sensor.",

        userId:
            currentUser
                ? currentUser.uid
                : "anonymous",

        location: {

            latitude:
                latitude ?? null,

            longitude:
                longitude ?? null,

            accuracy:
                accuracy ?? null
        },

        sensor: {

            acceleration:
                sensorValue ?? null
        },

        createdAt:
            serverTimestamp()
    };


    const docRef =
        await addDoc(
            collection(
                db,
                "emergencyAlerts"
            ),
            alertData
        );


    console.log(
        "Automatic alert created:",
        docRef.id
    );


    return docRef.id;
}


/* =========================================
   MANUAL SOS
========================================= */

export async function saveManualAlert(
    latitude,
    longitude,
    accuracy
) {

    const alertData = {

        type: "MANUAL_SOS",

        status: "ACTIVE",

        source: "SOS_BUTTON",

        message:
            "Emergency SOS activated manually.",

        userId:
            currentUser
                ? currentUser.uid
                : "anonymous",

        location: {

            latitude:
                latitude ?? null,

            longitude:
                longitude ?? null,

            accuracy:
                accuracy ?? null
        },

        createdAt:
            serverTimestamp()
    };


    const docRef =
        await addDoc(
            collection(
                db,
                "emergencyAlerts"
            ),
            alertData
        );


    console.log(
        "Manual alert created:",
        docRef.id
    );


    return docRef.id;
}


/* =========================================
   GLOBAL
========================================= */

window.firebaseDB = db;

window.firebaseAuth = auth;

window.saveAutomaticAlert =
    saveAutomaticAlert;

window.saveManualAlert =
    saveManualAlert;
