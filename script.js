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
let user_destination = new markerIcon({iconUrl: 'icons/destination.png',});

function successCallback(pos){
    lat = pos.coords.latitude;
    lng = pos.coords.longitude;
    accuracy = pos.coords.accuracy;
 
    sessionStorage.setItem('home_coords', `${lat},${lng}`);
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
        let routes = e.routes;
        console.log(routes);
        let routes_info = '';
        if (routes.length > 1){
            console.log('More than one route');
            for (let i = 0; i < routes.length; i++) {
                let route = calculateDistanceTime(routes[i]);
                routes_info += `
                    <h5>Main Route (Road): ${route['road_name']}</h5>
                    <p>Distance: ${route['distance']} km</p>
                    <p>Estimated Time: ${route["time"]} minutes</p>
                    <p>Home Coordinate - latitiude: ${lat}, longitude: ${lng} </p>
                    <p>Destination Coordinate - latitiude: ${destinationLat}, longitude: ${destinationLng} </p>
                `;
            };

            sessionStorage.setItem('route-info', JSON.stringify(routes_info));
            console.log('Saved to route information to session storage');
            return;
        } else {
            let summary = routes[0].summary;
            let distance = (summary.totalDistance / 1000).toFixed(2);
            let time = (summary.totalTime / 60).toFixed(0);
            let route_info_view = `
            <h5>Main Route (Road): ${routes[0]['name']}
            <p>Distance: ${distance} km</p>
            <p>Estimated Time: ${time} minutes</p>
            <p>Home Coordinate - latitiude: ${lat}, longitude: ${lng} </p>
            <p>Destination Coordinate - latitiude: ${destinationLat}, longitude: ${destinationLng} </p>
            `;
            sessionStorage.setItem('route-info', JSON.stringify(route_info_view));
        }
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

function calculateDistanceTime(route){
    let summary = route.summary;
    let distance = (summary.totalDistance / 1000).toFixed(2);
    let time = (summary.totalTime / 60).toFixed(0);
    let road_name = route.name;
    return {"distance": distance, "time": time, "road_name": road_name}
}


if (GEOLOCATION) {
    GEOLOCATION.getCurrentPosition(successCallback, errorCallback, options)
    GEOLOCATION.watchPosition(successCallback2, errorCallback, options)
} else {
    errMessage = 'Your browser does not support geolocation. Please download a browser with geolocation support.'
}

console.log(`Destination Coordinates: ${destinationLat}, ${destinationLng}`);

