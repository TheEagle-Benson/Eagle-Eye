const weather_view = document.querySelector('#weather-info');
const dest_weather_view = document.querySelector('#dest-weather-info');
const error_view = document.querySelector('#error-view');
const error_view_btn = document.querySelector('#close-error-view');

async function fetchWeather(lat, lng) {
  let open_meteo_api = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&current=temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code,wind_direction_10m&timezone=GMT`;

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

