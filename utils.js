let errMessage;

let GEOLOCATION = navigator.geolocation;
const options = {
    enableHighAccuracy: true,
    timeout: 500000,
    maximumAge: 0,
}

function errorCallback(err){
    switch (err.code) {
        case err.UNKNOWN_ERROR:
            errMessage = 'An unknown error occurred';
            console.log(`${err.code} — ${err.message}`)
            break;
        case err.PERMISSION_DENIED:
            errMessage = 'You denied Eagle Eye to retrieve your location';
            console.log(`${err.code} — ${err.message}`)
            break;
        case err.POSITION_UNAVAILABLE:
            errMessage = 'Unable to retrieve your location. Refresh the page and try again';
            console.log(`${err.code} — ${err.message}`)
            break;
        case err.TIMEOUT:
            errMessage = 'Location retrieval service timeout. Refresh and try again';
            console.log(`${err.code} — ${err.message}`)
            break;
    }
}

export {GEOLOCATION, options, errorCallback};