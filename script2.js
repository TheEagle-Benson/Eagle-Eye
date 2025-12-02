import { GEOLOCATION, options, errorCallback } from "./utils.js";

const api_key = '94b2d37909e04685b36401282b3ddad9';
const map_container = document.querySelector('#map_wrapper');
const submit_btn = document.querySelector('#submit_coords');
const place_btn = document.querySelector('#place-btn');
const close_map_btn = document.querySelector('#close_map');
const show_map_btn = document.querySelector('#dest_map');
const destination = document.querySelector('#destination');
let destMarker;

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
    iconUrl: 'icons/marked1.png',
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

async function fetch_fromOpenCage(location){
    const urlOpenCage = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${api_key}&limit=1`;
    let response = await fetch(urlOpenCage);
    let data = await response.json();
    return data;
}

async function fetch_fromNominatim(location){
    const urlNominatim = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    let response = await fetch(urlNominatim);
    let data = await response.json();
    return data;
}

async function geocodeLocation(location){
    let latitude, longitude;
    try {
        let data = await fetch_fromOpenCage(location);
        if (data.status.code !== 200 || data.results.length === 0){
            try {
                data = await fetch_fromNominatim(location);
                if (data.length === 0){
                    console.log('Location not found');
                    return;
                } else {
                    latitude = data[0].lat;
                    longitude = data[0].lon;
                    console.log(`Nominatim Geocode: ${location} => Latitude: ${latitude}, Longitude: ${longitude}`);
                }
            } catch (error) {
                console.log('Error fetching from Nominatim:', error);
            }
        } else {
            latitude = data.results[0].geometry.lat;
            longitude = data.results[0].geometry.lng;
            console.log(`OpenCage Geocode: ${location} => Latitude: ${latitude}, Longitude: ${longitude}`);
        }
    } catch (error) {
        console.log('Error fetching from OpenCage:', error);
    }

    return { latitude, longitude}
}

place_btn.addEventListener('click', async (e) => {
    e.preventDefault();
    let location = destination.value;
    try {
         if (typeof location === 'string'){
        location = location.trim();
        let coords = location.split(',');
        if (coords.length === 2){
            let lat = parseFloat(coords[0]);
            let lng = parseFloat(coords[1]);
            if (!isNaN(lat) && !isNaN(lng)){
                sessionStorage.setItem('destination', `${lat}, ${lng}`);
                window.location.assign('map.html');
                return;
            }
        }
    }
    } catch (error) {
        console.log('Error parsing coordinates:', error);
    }

   try {
     let coords = await geocodeLocation(location);
    if (coords){
        let latlng = `${coords.latitude}, ${coords.longitude}`;
        sessionStorage.setItem('destination', latlng);
        window.location.assign('map.html');
    }
   } catch (error) {
    console.log('Error in geocoding location:', error);
   }
});

show_map_btn.addEventListener('click', showMap);
close_map_btn.addEventListener('click', closeMap);
submit_btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.assign('map.html');
});