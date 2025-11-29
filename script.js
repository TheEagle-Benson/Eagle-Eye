// Eagle Eye
let lat;
let lng;
let destinationLat;
let destinationLng;
let accuracy;
let GEOLOCATION = navigator.geolocation;
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
};

let marker = L.marker([0,0]).addTo(map);
L.control.layers(baseTiles).addTo(map);

let markerIcons = L.Icon.extend({
    options: {
        iconSize: [45,45],
        iconAnchor: [16,32],
        popupAnchor: [5,-25]
    }
});
let user_home = new markerIcons({iconUrl: 'icons/home3.png'});
let user_destination = new markerIcons({iconUrl: 'icons/marked2.png', iconSize: [60,60], iconAnchor: [30,60], popupAnchor: [0,-50]});
let user_current = new markerIcons({iconUrl: 'icons/marker_person2.png'});

function successCallback(pos){
    lat = pos.coords.latitude;
    lng = pos.coords.longitude;
    accuracy = pos.coords.accuracy;
    console.log(`${lat}, ${lng}, ${accuracy}`);
 
    // marker.setLatLng([lat,lng]).bindPopup('<b>Benson location</b>').update();
    L.marker([lat, lng], {icon: user_home}).addTo(map).bindPopup("Home Location");
    map.setView([lat,lng],10);
    L.Routing.control({
        waypoints: [
            L.latLng(5.5592846, -0.1974306),
            L.latLng(5.698255697188423, -0.059635927538140544)
        ],
        createMarker: function(i, wp, nWps){
            if (i === 0){
                return L.marker(wp.latLng, {icon: user_home}).bindPopup("Journey Start Location");
            } else if (i === nWps - 1){
                return L.marker(wp.latLng, {icon: user_destination}).bindPopup("Journey End Location");
            }
        },
        routeWhileDragging: true
    }).addTo(map);
}

function successCallback2(pos){
    lat = pos.coords.latitude;
    lng = pos.coords.longitude;
    accuracy = pos.coords.accuracy;
    console.log(`${lat}, ${lng}, ${accuracy}`);

    L.marker([lat, lng], {icon: user_current}).addTo(map).bindPopup("Current Location");
    map.setView([lat,lng],10);
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
    GEOLOCATION.watchPosition(successCallback2, errorCallback, options)
} else {
    errMessage = 'Your browser does not support geolocation. Please download a browser with geolocation support.'
}

