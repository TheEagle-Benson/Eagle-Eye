// Eagle Eye
let lat;
let lng;
let destinationLat;
let destinationLng;
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


let markerIcon = L.icon({
    iconUrl: './gps.png',
    shadowUrl: '',
    iconSize: [32, 52],
    shadowSize: '',
    iconAchor: [32, 52],
    popupAnchor: [38, 92]
});

function successCallback(pos){
    lat = pos.coords.latitude;
    lng = pos.coords.longitude;
    accuracy = pos.coords.accuracy;
 
 marker.setLatLng([lat,lng]).bindPopup('<b>Benson location</b>').update();
 map.setView([lat,long],10);
}

function errorCallback(err){
    switch (err.code) {
        case err.UNKNOWN_ERROR:
            errMessage = 'An unknown error occurred';
            console.log(`${err.code} — ${err.message}`)
        case err.PERMISSION_DENIED:
            errMessage = 'You denied Eagle Eye to retrieve your location';
            console.log(`${err.code} — ${err.message}`)
        case err.POSITION_UNAVAILABLE:
            errMessage = 'Unable to retrieve your location. Refresh the page and try again';
            console.log(`${err.code} — ${err.message}`)
        case err.TIMEOUT:
            errMessage = 'Location retrieval service timeout. Refresh and try again';
            console.log(`${err.code} — ${err.message}`)
    }
}

options = {
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 0,
}


if (GEOLOCATION) {
    GEOLOCATION.getCurrentPosition(successCallback, errorCallback, options)
} else {
    errMessage = 'Your browser does not support geolocation. Please download a browser with geolocation support.'
}

