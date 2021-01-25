const mainDiv = document.querySelector("main");
const userInput = document.getElementById("country");
const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  weatherApp(userInput.value, "metric");
  userInput.textContent = "";
});

// main function for the weather app
// gets data then calls render to display to page
async function weatherApp(cityName, units) {
  try {
    // get the weaher data
    const weatherData = await getWeatherData(cityName, units);
    // make a weather data object
    const weatherObj = await createWeatherObject(weatherData, units);
    // get country flag
    const countryData = await getCountryData(weatherObj.country);
    const countryFlagURL = countryData.flag;

    //return results
    renderWeatherData(weatherObj, countryFlagURL);
  } catch (e) {
    // console.log(e);
    console.log("couldn't find weather data for that city...");
  }
}

async function createWeatherObject(weatherData, units) {
  const _windDirectionLookup = (degree) => {
    let array = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];
    let index = parseInt(degree / 22.5 + 0.5) % 16;
    return array[index];
  };

  const city = weatherData.name;
  const country = weatherData.sys.country;
  // description in lower case
  const description = weatherData.weather[0].description;
  // temp
  const temp = `${Math.round(weatherData.main.temp)} ${
    units == "metric" ? "°C" : "°F"
  }`;
  const feelTemp = `${Math.round(weatherData.main.feels_like)} ${
    units == "metric" ? "°C" : "°F"
  }`;
  const maxTemp = `${Math.round(weatherData.main.temp_max)} ${
    units == "metric" ? "°C" : "°F"
  }`;
  const minTemp = `${Math.round(weatherData.main.temp_min)} ${
    units == "metric" ? "°C" : "°F"
  }`;
  // % humidity
  const humidity = `${weatherData.main.humidity}%`;
  // m/s
  const windSpeed = `${
    units == "metric"
      ? Math.round(weatherData.wind.speed * 3.6) + "km/h"
      : Math.round(weatherData.wind.speed) + "miles/hr"
  }`;
  const windDirection = _windDirectionLookup(weatherData.wind.deg);

  const _getDateTime = (unixTime) => {
    let date = new Date((unixTime + weatherData.timezone) * 1000);
    return date;
  };

  const currentDateTime = _getDateTime(weatherData.dt);
  const sunrise = _getDateTime(weatherData.sys.sunrise);
  const sunset = _getDateTime(weatherData.sys.sunset);

  return {
    city,
    country,
    description,
    temp,
    feelTemp,
    maxTemp,
    minTemp,
    humidity,
    windSpeed,
    windDirection,
    currentDateTime,
    sunrise,
    sunset,
  };
}

// get the country flag from country code from restcountries.eu
async function getCountryData(countryCode) {
  const response = await fetch(
    `https://restcountries.eu/rest/v2/alpha/${countryCode}`
  );
  if (response.status == 200) {
    const data = await response.json();
    return data;
  }
}

// gets the weather data in metric units by city name
async function getWeatherData(cityName, units) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=8bc34d5ff8628186b68c3c4af2106ea0&units=${units}`
  );
  if (response.status == 200) {
    const result = await response.json();
    return result;
  } else {
    return new Error(response.status);
  }
}

// renders the weather data on the page
function renderWeatherData(weatherObject, countryFlagURL) {
  if (document.getElementById("weather-app")) {
    document.getElementById("weather-app").remove();
  }
  // create a div
  let weatherDiv = document.createElement("div");
  weatherDiv.id = "weather-app";

  // location: city, country, current time
  let locationDiv = document.createElement("div");
  locationDiv.id = "wa-location-info";
  let city = document.createElement("p");
  city.textContent = weatherObject.city;
  let country = document.createElement("p");
  country.textContent = weatherObject.country;
  let flag = document.createElement("img");
  // flag.src = countryFlagURL;
  let currentDate = document.createElement("p");
  currentDate.textContent = formatDate(weatherObject.currentDateTime);
  let currentTime = document.createElement("p");
  currentTime.textContent = `last updated: ${formatTime(
    weatherObject.currentDateTime
  )}`;
  locationDiv.append(city, country, flag, currentDate, currentTime);

  // weather info
  let descriptionDiv = document.createElement("div");
  descriptionDiv.id = "wa-description";
  let description = document.createElement("p");
  description.textContent = weatherObject.description;
  descriptionDiv.appendChild(description);

  // temperature
  let temperatureDiv = document.createElement("div");
  temperatureDiv.id = "wa-temperature-info";
  let currentTemp = document.createElement("p");
  currentTemp.textContent = weatherObject.temp;
  let feelTemp = document.createElement("p");
  feelTemp.textContent = `feels like: ${weatherObject.feelTemp}`;
  let maxTemp = document.createElement("p");
  maxTemp.textContent = `max: ${weatherObject.maxTemp}`;
  let minTemp = document.createElement("p");
  minTemp.textContent = `min: ${weatherObject.minTemp}`;
  temperatureDiv.append(currentTemp, feelTemp, maxTemp, minTemp);

  // wind
  let windDiv = document.createElement("div");
  windDiv.id = "wa-wind";
  let windSpeed = document.createElement("p");
  windSpeed.textContent = `${weatherObject.windDirection} ${weatherObject.windSpeed}`;
  windDiv.appendChild(windSpeed);

  // humidity
  let humidityDiv = document.createElement("div");
  humidityDiv.id = "wa-humidity";
  let humidity = document.createElement("p");
  humidity.textContent = `humidity: ${weatherObject.humidity}`;
  humidityDiv.appendChild(humidity);

  // sunrise sunset
  let sunDiv = document.createElement("div");
  sunDiv.id = "wa-sun";
  let sunrise = document.createElement("p");
  sunrise.textContent = `sunrise: ${formatTime(weatherObject.sunrise)}`;
  let sunset = document.createElement("p");
  sunset.textContent = `sunset: ${formatTime(weatherObject.sunset)}`;
  sunDiv.append(sunrise, sunset);

  // append all component divs to weatherDiv
  weatherDiv.append(
    locationDiv,
    descriptionDiv,
    temperatureDiv,
    humidityDiv,
    windDiv,
    sunDiv
  );

  // append to main
  mainDiv.appendChild(weatherDiv);
  //
}

// returns formatted time in format: HH:MM:SS in local time
function formatTime(datetime) {
  let formattedTime = `${("0" + datetime.getUTCHours()).slice(
    -2
  )}:${datetime.getMinutes()}`;
  return formattedTime;
}

// returns date in format Wed, 23 JAN 2019
function formatDate(datetime) {
  // Wed Jan 23 2019
  let array = datetime.toDateString().split(" ");
  let formattedDate = `${array[0]}, ${array[2]} ${array[1]}`;
  return formattedDate;
}
