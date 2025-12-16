import { GEOLOCATION, options, errorCallback, showToast, activeStateIndicator } from "./utils.js";

const map_container = document.querySelector('#map_wrapper');
const submit_btn = document.querySelector('#submit_coords');
const place_btn = document.querySelector('#place-btn');
const close_map_btn = document.querySelector('#close_map');
const show_map_btn = document.querySelector('#dest_map');
const destination = document.querySelector('#destination');
let destMarker;

activeStateIndicator();

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
};

let marker = L.marker([0,0]).addTo(map);
L.control.layers(baseTiles).addTo(map);

let user_destination = L.icon({
    iconUrl: 'icons/destination.png',
    iconSize: [55, 55],
    iconAnchor: [27, 55],
    popupAnchor: [0, -45]
});

function successCallback(pos){
    let lat = pos.coords.latitude;
    let lng = pos.coords.longitude;
    map.setView([lat,lng], 13);
    marker.setLatLng([lat,lng]).bindPopup('Your Current Location, choose your destination on the map and tap the submit button').openPopup();
}

map.on('click', function(e){
        let destLat = e.latlng.lat;
        let destLng = e.latlng.lng;

        if (destMarker){
            map.removeLayer(destMarker);
        }

        destMarker = L.marker([destLat, destLng], {icon: user_destination}).addTo(map)
        . bindPopup(`Destination Location:<br> Latitude: ${destLat.toFixed(5)} <br> Longitude: ${destLng.toFixed(5)}`).openPopup().on('click', (e) => {
            map.removeLayer(e.target);
            destMarker = null;
        });

        destination.value = `${destLat}, ${destLng}`;
        sessionStorage.setItem('destination', destination.value);
        console.log(`Destination set to: ${parseFloat(destLat)}, ${parseFloat(destLng)}`);
    });

if (GEOLOCATION){
    GEOLOCATION.getCurrentPosition(successCallback, errorCallback, options);
} else {
    showToast('Geolocation is not supported by your browser', 'error');
    console.log('Geolocation is not supported by your browser');
}


function showMap(){
  map_container.removeAttribute('inert');
  map_container.classList.remove('opacity-0');
}

function closeMap(){
  map_container.classList.add('opacity-0');
  map_container.setAttribute('inert', 'true');
}

async function getCoords(location) {
    const url = `https://eagle-eye-proxy.vercel.app/api/geocode?q=${location}`;
    let response = await fetch(url);
    let data = await response.json();
    return data;
}

async function geocodeLocation(location){
    let result;
   try {
    let data = await getCoords(location);
    if (data.success && data.response.lat && data.response.lng) {
        let latitude = parseFloat(data.response.lat);
        let longitude = parseFloat(data.response.lng);
        result = {latitude, longitude};
    } else {
        showToast('An unknown error occurred!', 'error');
        throw new Error("An unknown errror occurred!");
    }
   } catch (error) {
    console.log(error);
   }
   return result;
}

place_btn.addEventListener('click', async (e) => {
    e.preventDefault();
    let location = destination.value.trim();

    try {
        if (location) {
            let coords = location.split(',');
            if (coords.length === 2 && !isNaN(parseFloat(coords[0])) && !isNaN(parseFloat(coords[1]))) {
                let lat = parseFloat(coords[0]);
                let lng = parseFloat(coords[1]);
                sessionStorage.setItem('destination', `${lat}, ${lng}`);
                showToast('Destination set successfully! You will be redirected to the map page.');
                window.location.assign('map.html');
                return;
            } else {
                let coords = await geocodeLocation(location);
                if (coords){
                    let latlng = `${coords.latitude}, ${coords.longitude}`;
                    sessionStorage.setItem('destination', latlng);
                    showToast('Destination set successfully! You will be redirected to the map page.');
                    window.location.assign('map.html');
                    return;
                } else {
                    showToast('An error occurred while trying to get coordinates of the destination!', 'error');
                    console.log('An error occurred while trying to get coordinates of the destination!');
                    throw new Error('An error occurred while trying to get coordinates of the destination!')
                }
            }
            
        } else {
            showToast('Destination cannot be empty!', 'error');
            console.log('Destination is empty!')
            throw new Error('Destination is empty!')
        }
    } catch (error) {
        console.log(error);
    }
});

show_map_btn.addEventListener('click', showMap);
close_map_btn.addEventListener('click', closeMap);
submit_btn.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Destination set successfully! You will be redirected to the map page.');
    window.location.assign('map.html');
});