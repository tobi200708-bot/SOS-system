/* =========================================
   SCRIPT.JS
   AUTOMATIC EMERGENCY ALERT
========================================= */

import {
    saveAutomaticAlert,
    saveManualAlert
} from "./firebase.js";


/* =========================================
   SETTINGS
========================================= */


/*
   Sensor threshold.

   Normal movement:
   usually lower.

   Sudden strong movement:
   higher.

   This is only a prototype detection method.
*/

const ALERT_THRESHOLD = 25;


/*
   Prevent repeated alerts.
*/

const ALERT_COOLDOWN = 30000;


let protectionActive = false;

let alertSent = false;

let lastAlertTime = 0;


/* =========================================
   ELEMENTS
========================================= */

const startProtection =
    document.getElementById(
        "startProtection"
    );


const manualSOS =
    document.getElementById(
        "manualSOS"
    );


const systemStatus =
    document.getElementById(
        "systemStatus"
    );


const sensorStatus =
    document.getElementById(
        "sensorStatus"
    );


const locationStatus =
    document.getElementById(
        "locationStatus"
    );


const alertStatus =
    document.getElementById(
        "alertStatus"
    );


const message =
    document.getElementById(
        "message"
    );


const acceleration =
    document.getElementById(
        "acceleration"
    );


const xValue =
    document.getElementById(
        "xValue"
    );


const yValue =
    document.getElementById(
        "yValue"
    );


const zValue =
    document.getElementById(
        "zValue"
    );


const alertBox =
    document.getElementById(
        "alertBox"
    );


/* =========================================
   START PROTECTION
========================================= */

startProtection.addEventListener(
    "click",
    startAutomaticProtection
);


async function startAutomaticProtection() {

    try {

        /*
           Some mobile browsers require
           explicit motion permission.
        */

        if (
            typeof DeviceMotionEvent !==
            "undefined" &&

            typeof DeviceMotionEvent
                .requestPermission ===
            "function"
        ) {

            const permission =
                await DeviceMotionEvent
                    .requestPermission();


            if (
                permission !==
                "granted"
            ) {

                message.textContent =
                    "Motion sensor permission denied.";

                return;
            }
        }


        protectionActive = true;

        alertSent = false;


        systemStatus.textContent =
            "ACTIVE";


        sensorStatus.textContent =
            "ON";


        startProtection.textContent =
            "Protection Active ✓";


        startProtection.disabled =
            true;


        message.textContent =
            "Automatic protection started.";


        /*
           Request location
        */

        requestLocation();


        /*
           Start motion listener
        */

        window.addEventListener(
            "devicemotion",
            handleMotion
        );


    }
    catch (error) {

        console.error(error);

        message.textContent =
            "Unable to start automatic protection.";

    }
}


/* =========================================
   MOTION SENSOR
========================================= */

function handleMotion(event) {

    if (!protectionActive) {
        return;
    }


    const data =
        event.accelerationIncludingGravity;


    if (!data) {
        return;
    }


    const x =
        Number(data.x) || 0;


    const y =
        Number(data.y) || 0;


    const z =
        Number(data.z) || 0;


    /*
       Calculate acceleration magnitude
    */

    const total =
        Math.sqrt(
            (x * x) +
            (y * y) +
            (z * z)
        );


    /*
       Display sensor data
    */

    xValue.textContent =
        x.toFixed(2);


    yValue.textContent =
        y.toFixed(2);


    zValue.textContent =
        z.toFixed(2);


    acceleration.textContent =
        total.toFixed(2);


    /*
       Automatic emergency detection
    */

    if (
        total >= ALERT_THRESHOLD
    ) {

        const now =
            Date.now();


        if (
            !alertSent &&
            now - lastAlertTime >
            ALERT_COOLDOWN
        ) {

            lastAlertTime =
                now;

            triggerAutomaticAlert(
                total
            );
        }
    }
}


/* =========================================
   AUTOMATIC ALERT
========================================= */

async function triggerAutomaticAlert(
    sensorValue
) {

    if (alertSent) {
        return;
    }


    alertSent = true;


    systemStatus.textContent =
        "EMERGENCY";


    alertStatus.textContent =
        "ALERT SENT";


    alertStatus.style.color =
        "#ff3347";


    alertBox.className =
        "danger-box";


    alertBox.textContent =
        "🚨 EMERGENCY DETECTED";


    message.textContent =
        "Sending automatic emergency alert...";


    /*
       Get GPS location
    */

    if (
        !navigator.geolocation
    ) {

        await saveAlertWithoutLocation(
            sensorValue
        );

        return;
    }


    navigator.geolocation.getCurrentPosition(

        async (position) => {

            const latitude =
                position.coords.latitude;


            const longitude =
                position.coords.longitude;


            const accuracy =
                position.coords.accuracy;


            locationStatus.textContent =
                "READY ✓";


            try {

                await saveAutomaticAlert(

                    latitude,

                    longitude,

                    accuracy,

                    sensorValue

                );


                message.textContent =
                    "🚨 Automatic emergency alert sent to Firebase.";

            }
            catch (error) {

                console.error(error);

                message.textContent =
                    "Emergency detected, but Firebase save failed.";
            }

        },


        async (error) => {

            console.error(error);

            await saveAlertWithoutLocation(
                sensorValue
            );

        },


        {

            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 0

        }

    );
}


/* =========================================
   SAVE WITHOUT GPS
========================================= */

async function saveAlertWithoutLocation(
    sensorValue
) {

    try {

        await saveAutomaticAlert(
            null,
            null,
            null,
            sensorValue
        );


        locationStatus.textContent =
            "NOT AVAILABLE";


        message.textContent =
            "🚨 Emergency alert sent without location.";

    }
    catch (error) {

        console.error(error);

        message.textContent =
            "Could not save emergency alert.";
    }
}


/* =========================================
   LOCATION
========================================= */

function requestLocation() {

    if (
        !navigator.geolocation
    ) {

        locationStatus.textContent =
            "NOT SUPPORTED";

        return;
    }


    navigator.geolocation.getCurrentPosition(

        () => {

            locationStatus.textContent =
                "READY ✓";

        },

        () => {

            locationStatus.textContent =
                "ALLOW LOCATION";

        },

        {

            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 0

        }

    );
}


/* =========================================
   MANUAL SOS
========================================= */

manualSOS.addEventListener(
    "click",
    manualEmergency
);


async function manualEmergency() {

    manualSOS.disabled =
        true;


    manualSOS.textContent =
        "SENDING...";


    message.textContent =
        "Creating emergency alert...";


    if (
        !navigator.geolocation
    ) {

        try {

            await saveManualAlert(
                null,
                null,
                null
            );


            manualSOS.textContent =
                "SOS SENT ✓";

            message.textContent =
                "Emergency alert created.";

        }
        catch (error) {

            console.error(error);

            manualSOS.disabled =
                false;

            manualSOS.textContent =
                "🚨 EMERGENCY SOS";
        }

        return;
    }


    navigator.geolocation.getCurrentPosition(

        async (position) => {

            try {

                await saveManualAlert(

                    position.coords.latitude,

                    position.coords.longitude,

                    position.coords.accuracy

                );


                manualSOS.textContent =
                    "SOS SENT ✓";


                message.textContent =
                    "Emergency alert created.";

            }
            catch (error) {

                console.error(error);

                manualSOS.disabled =
                    false;

                manualSOS.textContent =
                    "🚨 EMERGENCY SOS";
            }

        },


        async () => {

            try {

                await saveManualAlert(
                    null,
                    null,
                    null
                );


                manualSOS.textContent =
                    "SOS SENT ✓";


                message.textContent =
                    "Emergency alert created without location.";

            }
            catch (error) {

                console.error(error);

                manualSOS.disabled =
                    false;

                manualSOS.textContent =
                    "🚨 EMERGENCY SOS";
            }

        },

        {

            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 0

        }

    );
}
