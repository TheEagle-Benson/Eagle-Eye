// Eagle Eye
let lat;
let lng;
let destinationLat = 5.750677437002746;
let destinationLng = -0.08736817120526819;
let accuracy;
let GEOLOCATION = navigator.geolocation
let errMessage = '';

const map = L.map('map').setView([0,0],2);

let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 20
}).addTo(map);

let googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
}).addTo(map);

let googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

let googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

let googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});


const baseTiles = {
    'OSM': osm,
    'Google Street': googleStreets,
    'Google Hybrid': googleHybrid,
    'Google Terrain': googleTerrain,
    'Google Satellite': googleSat
}

let marker = L.marker([0,0]).addTo(map)
L.control.layers(baseTiles).addTo(map)


let markerIcon = L.Icon.extend( 
    {options : {
    iconSize: [45,45],
    iconAnchor: [22,45],
    popupAnchor: [0,-45]
    }
});

let user_home = new markerIcon({iconUrl: 'icons/home1.png'});
let user_current = new markerIcon({iconUrl: 'icons/marker_person1.png'});
let user_destination = new markerIcon({iconUrl: 'icons/marked1.png', iconSize: [55, 55], iconAnchor: [27, 55], popupAnchor: [0, -45]});

function successCallback(pos){
    lat = pos.coords.latitude;
    lng = pos.coords.longitude;
    accuracy = pos.coords.accuracy;
 
    L.marker([lat,lng], {icon: user_home}).addTo(map)
    . bindPopup(`Your Current Location`);
    map.setView([lat,lng],10);

    L.Routing.control({
        waypoints: [
            L.latLng(lat, lng),
            L.latLng(destinationLat, destinationLng)
        ],
        createMarker: function(i, wp, nWps) {
                if (i === 0){
                    return L.marker(wp.latLng, {icon: user_home}).bindPopup("Your Location");
                } else if(i === nWps - 1){
                    return L.marker(wp.latLng, {icon: user_destination}).bindPopup("Destination");
                }
        },
        routeWhileDragging: true
    }).addTo(map);
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

options = {
    enableHighAccuracy: true,
    timeout: 3000,
    maximumAge: 0,
}


if (GEOLOCATION) {
    GEOLOCATION.getCurrentPosition(successCallback, errorCallback, options)
} else {
    errMessage = 'Your browser does not support geolocation. Please download a browser with geolocation support.'
}

