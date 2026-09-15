/* =========================================
   SCRIPT.JS
   AUTOMATIC EMERGENCY SOS
========================================= */

import {
    saveAutomaticAlert,
    saveManualAlert
} from "./firebase.js";


/* =========================================
   SETTINGS
========================================= */

const ALERT_THRESHOLD = 25;

const ALERT_COOLDOWN = 30000;


/* =========================================
   VARIABLES
========================================= */

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
   START AUTOMATIC PROTECTION
========================================= */

startProtection.addEventListener(
    "click",
    startProtectionMode
);


async function startProtectionMode() {

    try {

        /*
         * iPhone/iPad permission
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
                    "Motion permission denied.";

                return;
            }
        }


        protectionActive = true;

        alertSent = false;


        systemStatus.textContent =
            "ACTIVE";

        sensorStatus.textContent =
            "ON";

        alertStatus.textContent =
            "SAFE";


        startProtection.textContent =
            "Protection Active ✓";

        startProtection.disabled =
            true;


        message.textContent =
            "Automatic protection started.";


        requestLocation();


        window.addEventListener(
            "devicemotion",
            handleMotion
        );

    }

    catch (error) {

        console.error(error);

        message.textContent =
            "Could not start protection.";
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


    const total =
        Math.sqrt(
            x * x +
            y * y +
            z * z
        );


    xValue.textContent =
        x.toFixed(2);

    yValue.textContent =
        y.toFixed(2);

    zValue.textContent =
        z.toFixed(2);

    acceleration.textContent =
        total.toFixed(2);


    /*
     * Automatic detection
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

            triggerAutomaticSOS(
                total
            );
        }
    }
}


/* =========================================
   AUTOMATIC SOS
========================================= */

async function triggerAutomaticSOS(
    sensorValue
) {

    if (alertSent) {
        return;
    }


    alertSent = true;


    systemStatus.textContent =
        "EMERGENCY";


    alertStatus.textContent =
        "ALERT";


    alertStatus.style.color =
        "#ff3347";


    alertBox.className =
        "danger-box";


    alertBox.textContent =
        "🚨 EMERGENCY DETECTED";


    message.textContent =
        "Getting location and sending alert...";


    /*
     * Get GPS
     */

    if (
        !navigator.geolocation
    ) {

        await saveWithoutLocation(
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
                    "🚨 Emergency alert sent successfully.";

            }

            catch (error) {

                console.error(error);

                message.textContent =
                    "Emergency detected, but Firebase failed.";
            }

        },

        async (error) => {

            console.error(error);

            await saveWithoutLocation(
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
   SAVE WITHOUT LOCATION
========================================= */

async function saveWithoutLocation(
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
            "UNAVAILABLE";


        message.textContent =
            "🚨 Alert sent without location.";

    }

    catch (error) {

        console.error(error);

        message.textContent =
            "Unable to save emergency alert.";
    }
}


/* =========================================
   LOCATION REQUEST
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
    sendManualSOS
);


async function sendManualSOS() {

    manualSOS.disabled =
        true;

    manualSOS.textContent =
        "SENDING...";


    message.textContent =
        "Creating emergency alert...";


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

                resetManualButton();
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
                    "Emergency alert created.";

            }

            catch (error) {

                console.error(error);

                resetManualButton();
            }
        },

        {

            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 0
        }
    );
}


/* =========================================
   RESET BUTTON
========================================= */

function resetManualButton() {

    manualSOS.disabled =
        false;

    manualSOS.textContent =
        "🚨 EMERGENCY SOS";

    message.textContent =
        "Failed to create alert.";
}
