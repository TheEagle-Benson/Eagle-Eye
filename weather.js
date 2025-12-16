import { weather_codes } from './weather_codes.js';
const weather_view = document.querySelector('#weather-info');
const dest_weather_view = document.querySelector('#dest-weather-info');
const error_view = document.querySelector('#error-view');
const route_info_view = document.querySelector('#route-info');

async function fetchWeather(lat, lng) {
  let open_meteo_api = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,uv_index_max,wind_speed_10m_max,sunshine_duration,daylight_duration&current=temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code,wind_direction_10m,precipitation&timezone=GMT&forecast_days=1`;

  try {
    let response = await fetch(open_meteo_api);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    let data = await response.json();
    console.log(data);
    let weather_data = {
      "current_units": data.current_units,
      "current_weather": data.current,
      "daily_units": data.daily_units,
      "daily_weather": data.daily,
    }
    return weather_data;
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

function convertISoDate(isoDate) {
  const date = new Date(isoDate);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  };
  return date.toLocaleDateString('en-US', options);
}

async function displayWeather(lat, lng, view) {
  let weather = await fetchWeather(lat, lng);
  if (!weather){
    error_view.removeAttribute('inert');
    error_view.classList.remove('opacity-0');
    error_view.classList.add('opacity-100');
    return;
  }
  view.innerHTML = `
    <p><span class="text-xl text-blue-400 font-bold">Temperature:</span><span class="text-xl text-gray-500 font-extrabold"> ${weather.current_weather.temperature_2m}${weather.current_units.temperature_2m}</span></p>
    <p><span class="text-xl text-blue-400 font-bold">Wind Speed:</span><span class="text-xl text-gray-500 font-extrabold"> ${weather.current_weather.wind_speed_10m}${weather.current_units.wind_speed_10m}</span></p>
    <p><span class="text-xl text-blue-400 font-bold">Humidity:</span><span class="text-xl text-gray-500 font-extrabold"> ${weather.current_weather.relative_humidity_2m}${weather.current_units.relative_humidity_2m}</span></p>
    <p><span class="text-xl text-blue-400 font-bold">Weather:</span> <span class="text-xl text-gray-500 font-extrabold">${weather_codes[weather.current_weather.weather_code][1]} ${weather_codes[weather.current_weather.weather_code][0]}</span></p>
    <p><span class="text-xl text-blue-400 font-bold">Max Temperature:</span><span class="text-xl text-gray-500 font-extrabold"> ${weather.daily_weather.temperature_2m_max[0]} ${weather.daily_units.temperature_2m_max}</span></p>
    <p><span class="text-xl text-blue-400 font-bold">Min Temperature:</span><span class="text-xl text-gray-500 font-extrabold"> ${weather.daily_weather.temperature_2m_min[0]} ${weather.daily_units.temperature_2m_min}</span></p>
    <p><span class="text-xl text-blue-400 font-bold">UV Index Max:</span><span class="text-xl text-gray-500 font-extrabold"> ${weather.daily_weather.uv_index_max[0]}</span></p>
    <p><span class="text-xl text-blue-400 font-bold">Sunrise:</span><span class="text-xl text-gray-500 font-extrabold"> ${convertISoDate(weather.daily_weather.sunrise[0])}</span></p>
    <p><span class="text-xl text-blue-400 font-bold">Sunset:</span><span class="text-xl text-gray-500 font-extrabold"> ${convertISoDate(weather.daily_weather.sunset[0])}</span></p>
  `;

}

let home_coords = sessionStorage.getItem('home_coords').split(',');
let [homeLat, homeLng] = home_coords;
let destination_coords = sessionStorage.getItem('destination').split(',');
let [destLat, destLng] = destination_coords;
displayWeather(parseFloat(homeLat), parseFloat(homeLng), weather_view);
displayWeather(parseFloat(destLat), parseFloat(destLng), dest_weather_view);
route_info_view.innerHTML = JSON.parse(sessionStorage.getItem('route-info'));

console.log(weather_codes);
