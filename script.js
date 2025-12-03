// Eagle Eye
import { GEOLOCATION, options, errorCallback } from "./utils.js";

let lat;
let lng;
let accuracy;
let errMessage = '';
let destination = sessionStorage.getItem('destination').split(',');
let [destinationLat, destinationLng] = destination;
let currentMarker;

const map = L.map('map').setView([0,0],2, {touchZoom: true, doubleTapZoom: true});

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
}).addTo(map);

let googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
}).addTo(map);

let googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
}).addTo(map);


const baseTiles = { 
    'Google Street': googleStreets,
    'Google Hybrid': googleHybrid,
    'Google Terrain': googleTerrain,
    'Google Satellite': googleSat,
    'OSM': osm,
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

let user_home = new markerIcon({iconUrl: 'icons/home.png'});
let user_current = new markerIcon({iconUrl: 'icons/current.png'});
let user_destination = new markerIcon({iconUrl: 'icons/destination.png', iconSize: [55, 55], iconAnchor: [27, 55], popupAnchor: [0, -45]});

function successCallback(pos){
    lat = pos.coords.latitude;
    lng = pos.coords.longitude;
    accuracy = pos.coords.accuracy;
 
    L.marker([lat,lng], {icon: user_home}).addTo(map)
    . bindPopup(`Your Current Location`);
    map.setView([lat,lng],10);

    let route = L.Routing.control({
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
        routeWhileDragging: true,
        showAlternatives: true,
    }).addTo(map);
    route.on('routesfound', (e) => {
            console.log(e);
        
    });
}


function successCallback2(pos){
    lat = pos.coords.latitude;
    lng = pos.coords.longitude;
    accuracy = pos.coords.accuracy;
    if (currentMarker){
        currentMarker.setLatLng([lat, lng]);
    } else {
        currentMarker = L.marker([lat, lng], {icon: user_current}).addTo(map).bindPopup("Your Current Location");
    }
 
}


if (GEOLOCATION) {
    GEOLOCATION.getCurrentPosition(successCallback, errorCallback, options)
    GEOLOCATION.watchPosition(successCallback2, errorCallback, options)
} else {
    errMessage = 'Your browser does not support geolocation. Please download a browser with geolocation support.'
}

console.log(`Destination Coordinates: ${destinationLat}, ${destinationLng}`);

