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
            showToast(errMessage, 'error');
            console.log(`${err.code} — ${err.message}`)
            break;
        case err.PERMISSION_DENIED:
            errMessage = 'You denied Eagle Eye to retrieve your location';
            showToast(errMessage, 'error');
            console.log(`${err.code} — ${err.message}`)
            break;
        case err.POSITION_UNAVAILABLE:
            errMessage = 'Unable to retrieve your location. Refresh the page and try again';
            showToast(errMessage, 'error');
            console.log(`${err.code} — ${err.message}`)
            break;
        case err.TIMEOUT:
            errMessage = 'Location retrieval service timeout. Refresh and try again';
            showToast(errMessage, 'error');
            console.log(`${err.code} — ${err.message}`)
            break;
    }
}

function showToast(message = 'Hello World!', type = 'info'){
    Toastify({
                text: message,
                duration: 4000,
                close: true,
                gravity: "top", 
                position: "center",
                stopOnFocus: true, 
                style: {
                            background: type === 'error' ? "#ef4444" : "#0ea5e9",
                            display: "flex",
                            alignItems: "center",
                            justifySelf: "center",
                            gap: "10px",
                            borderRadius: "10px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                            margin: "3.2rem 1.5rem 0 1.5rem",
                },

            }).showToast();

}

export {GEOLOCATION, options, errorCallback, showToast};