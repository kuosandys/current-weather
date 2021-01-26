const mainDiv = document.querySelector("main");
const userInput = document.getElementById("country");
const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  weatherApp(userInput.value);
  userInput.textContent = "";
});

// main function for the weather app
// gets data then calls render to display to page
async function weatherApp(cityName) {
  try {
    // get the weaher data
    const weatherData = await getWeatherData(cityName);
    // make a weather data object
    const weatherObj = await createWeatherObject(weatherData);
    // get country flag
    const countryData = await getCountryData(weatherObj.country);
    const countryFlagURL = countryData.flag;

    //return results
    renderWeatherData(weatherObj, "metric", countryFlagURL);
  } catch (e) {
    console.log(e);
    // console.log("couldn't find weather data for that city...");
  }
}

async function createWeatherObject(weatherData) {
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
  // icon
  const iconURL = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;

  // temp and windspeed in metric
  const metric = {
    temp: `${Math.round(weatherData.main.temp - 273.15)}°C`,
    feelTemp: `${Math.round(weatherData.main.feels_like - 273.15)}°C`,
    maxTemp: `${Math.round(weatherData.main.temp_max - 273.15)}°C`,
    minTemp: `${Math.round(weatherData.main.temp_min - 273.15)}°C`,
    windSpeed: `${Math.round(weatherData.wind.speed * 3.6)}km/hr`,
  };

  const imperial = {
    temp: `${Math.round((weatherData.main.temp - 273.15) * (9 / 5) + 32)}°F`,
    feelTemp: `${Math.round(
      (weatherData.main.feels_like - 273.15) * (9 / 5) + 32
    )}°F`,
    maxTemp: `${Math.round(
      (weatherData.main.temp_max - 273.15) * (9 / 5) + 32
    )}°F`,
    minTemp: `${Math.round(
      (weatherData.main.temp_min - 273.15) * (9 / 5) + 32
    )}°F`,
    windSpeed: `${Math.round(weatherData.wind.speed * 2.237)}mph`,
  };

  // % humidity
  const humidity = `${weatherData.main.humidity}%`;

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
    iconURL,
    metric,
    imperial,
    humidity,
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
async function getWeatherData(cityName) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=8bc34d5ff8628186b68c3c4af2106ea0`
  );
  if (response.status == 200) {
    const result = await response.json();
    return result;
  } else {
    return new Error(response.status);
  }
}

// renders the weather data on the page
function renderWeatherData(weatherObject, units, countryFlagURL) {
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
  let weatherIcon = document.createElement("img");
  weatherIcon.src = weatherObject.iconURL;
  descriptionDiv.append(description, weatherIcon);

  // temperature
  let temperatureDiv = document.createElement("div");
  temperatureDiv.id = "wa-temperature-info";

  // metric
  let currentTempM = document.createElement("p");
  currentTempM.textContent = weatherObject.metric.temp;
  currentTempM.classList.add("metric-element");

  let feelTempM = document.createElement("p");
  feelTempM.textContent = `feels like: ${weatherObject.metric.feelTemp}`;
  feelTempM.classList.add("metric-element");

  let maxTempM = document.createElement("p");
  maxTempM.textContent = `max: ${weatherObject.metric.maxTemp}`;
  maxTempM.classList.add("metric-element");

  let minTempM = document.createElement("p");
  minTempM.textContent = `min: ${weatherObject.metric.minTemp}`;
  minTempM.classList.add("metric-element");

  // imperial
  let currentTempI = document.createElement("p");
  currentTempI.textContent = weatherObject.imperial.temp;
  currentTempI.classList.add("imperial-element");

  let feelTempI = document.createElement("p");
  feelTempI.textContent = `feels like: ${weatherObject.imperial.feelTemp}`;
  feelTempI.classList.add("imperial-element");

  let maxTempI = document.createElement("p");
  maxTempI.textContent = `max: ${weatherObject.imperial.maxTemp}`;
  maxTempI.classList.add("imperial-element");

  let minTempI = document.createElement("p");
  minTempI.textContent = `min: ${weatherObject.imperial.minTemp}`;
  minTempI.classList.add("imperial-element");

  temperatureDiv.append(
    currentTempM,
    currentTempI,
    feelTempM,
    feelTempI,
    maxTempM,
    maxTempI,
    minTempM,
    minTempI
  );

  // wind
  let windDiv = document.createElement("div");
  windDiv.id = "wa-wind";

  // metric
  let windSpeedM = document.createElement("p");
  windSpeedM.textContent = `${weatherObject.windDirection} ${weatherObject.metric.windSpeed}`;
  windSpeedM.classList.add("metric-element");

  // imperial
  let windSpeedI = document.createElement("p");
  windSpeedI.textContent = `${weatherObject.windDirection} ${weatherObject.imperial.windSpeed}`;
  windSpeedI.classList.add("imperial-element");

  windDiv.append(windSpeedM, windSpeedI);

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

  // select elements based on unit specified and hide/show
  let selectedElements = Array.from(
    document.getElementsByClassName(`${units}-element`)
  );
  selectedElements.forEach((element) => {
    element.classList.add("show-element");
  });
}

// returns formatted time in format: HH:MM:SS in local time
function formatTime(datetime) {
  let formattedTime = `${("0" + datetime.getUTCHours()).slice(-2)}:${(
    "0" + datetime.getMinutes()
  ).slice(-2)}`;
  return formattedTime;
}

// returns date in format Wed, 23 JAN 2019
function formatDate(datetime) {
  // Wed Jan 23 2019
  let array = datetime.toDateString().split(" ");
  let formattedDate = `${array[0]}, ${array[2]} ${array[1]}`;
  return formattedDate;
}
