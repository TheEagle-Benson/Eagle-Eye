// Eagle Eye
import { GEOLOCATION, options, errorCallback, showToast, activeStateIndicator } from "./utils.js";

let lat;
let lng;
let accuracy;
let destination = sessionStorage.getItem('destination').split(',');
let [destinationLat, destinationLng] = destination;
let currentMarker;
let turfRoute = null;

activeStateIndicator();

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
        let coords = routes[0].coordinates.map(coord => [coord.lng, coord.lat]);
        turfRoute = turf.lineString(coords);
        console.log('Turf route created');
        console.log(turfRoute);
        console.log(routes);
        let routes_info = '';
        if (routes.length > 1){
            console.log('More than one route');
            for (let i = 0; i < routes.length; i++) {
                let route = calculateDistanceTime(routes[i]);
                routes_info += `
                    <h5><span class="text-xl text-blue-400 font-bold">Main Route (Road):</span> <span class="text-xl text-gray-500 font-extrabold">${route['road_name']}</span></h5>
                    <p><span class="text-xl text-blue-400 font-bold">Distance:</span> <span class="text-xl text-gray-500 font-extrabold">${route['distance']} km</span></p>
                    <p><span class="text-xl text-blue-400 font-bold">Estimated Time:</span> <span class="text-xl text-gray-500 font-extrabold">${minsHour(route["time"])}</span></p>
                    <p><span class="text-xl text-blue-400 font-bold">Home Coordinate:</span><span class="text-xl text-gray-500 font-extrabold"> latitude: ${lat} - longitude: ${lng}</span></p>
                    <p><span class="text-xl text-blue-400 font-bold">Destination Coordinate:</span><span class="text-xl text-gray-500 font-extrabold"> latitude ${destinationLat} - longitude: ${destinationLng}</span></p>
                    ${insertHr(i, routes)}
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
            <h5><span class="text-xl text-blue-400 font-bold">Main Route (Road):</span><span class="text-xl text-gray-500 font-extrabold"> ${routes[0]['name']}</span></h5>
            <p><span class="text-xl text-blue-400 font-bold">Distance:</span> <span class="text-xl text-gray-500 font-extrabold">${distance} km</span></p>
            <p><span class="text-xl text-blue-400 font-bold">Estimated Time:</span> <span class="text-xl text-gray-500 font-extrabold">${minsHour(time)}</span></p>
            <p><span class="text-xl text-blue-400 font-bold">Home Coordinate:</span><span class="text-xl text-gray-500 font-extrabold"> latitiude: ${lat} - longitude: ${lng}</span> </p>
            <p><span class="text-xl text-blue-400 font-bold">Destination Coordinate:</span><span class="text-xl text-gray-500 font-extrabold"> latitiude: ${destinationLat} - longitude: ${destinationLng}</span> </p>
            `;
            sessionStorage.setItem('route-info', JSON.stringify(route_info_view));
        }
    });
}


function successCallback2(pos){
    lat = pos.coords.latitude;
    lng = pos.coords.longitude;
    accuracy = pos.coords.accuracy;
    if (!turfRoute){
        console.log('Turf route not yet created');
        if (currentMarker){
        currentMarker.setLatLng([lat, lng]);
    } else {
        currentMarker = L.marker([lat, lng], {icon: user_current}).addTo(map).bindPopup("Your Current Location");
    }
    return;
    }

    let userPoint = turf.point([lng, lat]);
    let snapped = turf.nearestPointOnLine(turfRoute, userPoint);
    let snappedCoords = snapped.geometry.coordinates;
    let snappedLat = snappedCoords[1];
    let snappedLng = snappedCoords[0];

    console.log(`User Coordinates: ${lat}, ${lng}`);
    console.log(`Snapped Coordinates: ${snappedLat}, ${snappedLng}`);
    if (currentMarker){
        currentMarker.setLatLng([snappedLat, snappedLng]);
    } else {
        currentMarker = L.marker([snappedLat, snappedLng], {icon: user_current}).addTo(map).bindPopup("Your Current Location");
    }
 
}

function calculateDistanceTime(route){
    let summary = route.summary;
    let distance = (summary.totalDistance / 1000).toFixed(2);
    let time = (summary.totalTime / 60).toFixed(0);
    let road_name = route.name;
    return {"distance": distance, "time": time, "road_name": road_name}
}

function minsHour(minute){
    if (minute > 59){
        const hours = Math.floor(minute / 60);
        const minutes = hours % 60;
        let result;
        if (hours > 1 && minutes > 1){
            result = `${hours} hours ${minutes} minutes`;
        } else if (hours > 1 && minutes == 1){
            result = `${hours} hours ${minutes} minute`;
        }
        return result;
    }
    return `${minute} minutes`;
}

function insertHr(index, routes){
    if(index !== routes.length -1) {
        return `<div class="flex items-center my-1">
                <hr class="grow border-gray-500">
                <span class="text-blue-500 px-2 font-medium">Alternative Route</span>
                <hr class="grow border-gray-500">
                </div>`;
    };
    return '';
};


if (GEOLOCATION) {
    GEOLOCATION.getCurrentPosition(successCallback, errorCallback, options)
    GEOLOCATION.watchPosition(successCallback2, errorCallback, options)
} else {
    showToast('Geolocation is not supported by your browser', 'error');
    console.log('Your browser does not support geolocation. Please download a browser with geolocation support.');
}

console.log(`Destination Coordinates: ${destinationLat}, ${destinationLng}`);

