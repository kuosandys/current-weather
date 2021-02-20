// DOM elements
const mainDiv = document.querySelector("main");
const userInput = document.getElementById("city");
const form = document.querySelector("form");
const unitsDiv = document.getElementById("units-div");

// Add event listener to form submit event
form.addEventListener("submit", (e) => {
  e.preventDefault();
  weatherApp(userInput.value, unitsDiv.className);
  userInput.textContent = "";
});

// Add event listener to units toggle
unitsDiv.addEventListener("click", () => {
  toggleUnits(unitsDiv.className);
});

// Load app with some sample data
weatherApp("london", "metric");

// Main function: get data then render to page
async function weatherApp(cityName, unit) {
  try {
    const data = await getWeatherData(cityName);
    const weatherObj = createWeatherObject(data);
    renderWeatherData(weatherObj, unit);
    setWindowTitle(cityName);
  } catch (e) {
    setWindowTitle();
    displayError();
  }
}

// Get the weather data from OpenWeather by city name
async function getWeatherData(cityName) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=8bc34d5ff8628186b68c3c4af2106ea0`
    );
    if (response.status == 200) {
      const result = await response.json();
      return result;
    } else {
      // throw error if response status is not 200
      throw new Error(response.status);
    }
  } catch (error) {
    // handle other types of errors (e.g. connection error)
    throw error;
  }
}

// Create a weather data object with only the data we need
function createWeatherObject(weatherData) {
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

// Render the weather data on the page
function renderWeatherData(weatherObject, units) {
  if (document.getElementById("weather-app")) {
    document.getElementById("weather-app").remove();
  } else if (document.getElementById("error-div")) {
    document.getElementById("error-div").remove();
  }
  // Main weather app div
  let weatherDiv = document.createElement("div");
  weatherDiv.id = "weather-app";

  // location: city, country, current date
  let locationDiv = document.createElement("div");
  locationDiv.id = "wa-location-info";
  let cityCountry = document.createElement("p");
  cityCountry.textContent = `${weatherObject.city}, ${weatherObject.country}`;
  // let flag = document.createElement("img");
  // flag.src = countryFlagURL;
  let currentDate = document.createElement("p");
  currentDate.textContent = formatDate(weatherObject.currentDateTime);
  locationDiv.append(cityCountry, currentDate);

  // weather icon & description
  let descriptionDiv = document.createElement("div");
  descriptionDiv.id = "wa-description";
  let description = document.createElement("p");
  description.textContent = weatherObject.description;
  let weatherIcon = document.createElement("img");
  weatherIcon.src = weatherObject.iconURL;
  descriptionDiv.append(weatherIcon, description);

  // temperature
  let temperatureDiv = document.createElement("div");
  temperatureDiv.id = "wa-temperature-info";

  // metric
  let currentTempM = document.createElement("p");
  currentTempM.textContent = weatherObject.metric.temp;
  currentTempM.classList.add("metric-element");

  let maxTempM = document.createElement("p");
  maxTempM.textContent = `${weatherObject.metric.maxTemp}`;
  maxTempM.classList.add("metric-element");

  let minTempM = document.createElement("p");
  minTempM.textContent = `${weatherObject.metric.minTemp}`;
  minTempM.classList.add("metric-element");

  // imperial
  let currentTempI = document.createElement("p");
  currentTempI.textContent = weatherObject.imperial.temp;
  currentTempI.classList.add("imperial-element");

  let maxTempI = document.createElement("p");
  maxTempI.textContent = `${weatherObject.imperial.maxTemp}`;
  maxTempI.classList.add("imperial-element");

  let minTempI = document.createElement("p");
  minTempI.textContent = `${weatherObject.imperial.minTemp}`;
  minTempI.classList.add("imperial-element");

  temperatureDiv.append(
    minTempM,
    minTempI,
    currentTempM,
    currentTempI,
    maxTempM,
    maxTempI
  );

  // wind
  let windDiv = document.createElement("div");
  windDiv.id = "wa-wind";
  windDiv.innerHTML = `<i class="fas fa-wind"></i>`;

  // metric
  let windSpeedM = document.createElement("p");
  windSpeedM.textContent = `${weatherObject.metric.windSpeed} ${weatherObject.windDirection}`;
  windSpeedM.classList.add("metric-element");

  // imperial
  let windSpeedI = document.createElement("p");
  windSpeedI.textContent = `${weatherObject.imperial.windSpeed} ${weatherObject.windDirection}`;
  windSpeedI.classList.add("imperial-element");

  windDiv.append(windSpeedM, windSpeedI);

  // humidity
  let humidityDiv = document.createElement("div");
  humidityDiv.id = "wa-humidity";
  humidityDiv.innerHTML = `<i class="fas fa-tint"></i>`;
  let humidity = document.createElement("p");
  humidity.textContent = `${weatherObject.humidity}`;
  humidityDiv.appendChild(humidity);

  // feel temp div
  let feelDiv = document.createElement("div");
  feelDiv.id = "wa-feeltemp";
  feelDiv.innerHTML = `<i class="fas fa-thermometer-three-quarters"></i>`;

  // metric
  let feelTempM = document.createElement("p");
  feelTempM.textContent = weatherObject.metric.feelTemp;
  feelTempM.classList.add("metric-element");

  // imperial
  let feelTempI = document.createElement("p");
  feelTempI.textContent = weatherObject.imperial.feelTemp;
  feelTempI.classList.add("imperial-element");

  feelDiv.append(feelTempM, feelTempI);

  // "curent time" from data
  let timeDiv = document.createElement("div");
  timeDiv.id = "wa-time";
  let currentTime = document.createElement("p");
  currentTime.textContent = `last updated at ${formatTime(
    weatherObject.currentDateTime
  )}`;
  timeDiv.appendChild(currentTime);

  // append all component divs to weatherDiv
  weatherDiv.append(
    locationDiv,
    descriptionDiv,
    temperatureDiv,
    humidityDiv,
    windDiv,
    feelDiv,
    timeDiv
  );

  // append to main div
  mainDiv.appendChild(weatherDiv);

  // select elements based on unit specified and hide/show
  let selectedElements = Array.from(
    document.getElementsByClassName(`${units}-element`)
  );
  selectedElements.forEach((element) => {
    element.classList.add("show-element");
  });

  // set background theme
  let sunriseHour = weatherObject.sunrise.getUTCHours();
  let sunsetHour = weatherObject.sunset.getUTCHours();
  let currentHour = weatherObject.currentDateTime.getUTCHours();
  let backdrop = document.getElementById("backdrop");
  backdrop.className = "";
  if (currentHour < sunriseHour) {
    backdrop.classList.add("night");
  } else if (currentHour < 12) {
    backdrop.classList.add("morning");
  } else if (currentHour < sunsetHour) {
    backdrop.classList.add("afternoon");
  } else {
    backdrop.classList.add("night");
  }
}

// Get formatted time in format: HH:MM
function formatTime(datetime) {
  let formattedTime = `${("0" + datetime.getUTCHours()).slice(-2)}:${(
    "0" + datetime.getMinutes()
  ).slice(-2)}`;
  return formattedTime;
}

// Get date in format Wed 23 JAN
function formatDate(datetime) {
  // Wed Jan 23 2019
  let array = datetime.toDateString().split(" ");
  let formattedDate = `${array[0].toUpperCase()} ${
    array[2]
  } ${array[1].toUpperCase()}`;
  return formattedDate;
}

function setWindowTitle(cityName) {
  window.document.title = cityName
    ? `Current Weather in ${cityName.toUpperCase()}`
    : `Current Weather`;
}

function displayError() {
  if (document.getElementById("weather-app")) {
    document.getElementById("weather-app").remove();
  } else if (document.getElementById("error-div")) {
    document.getElementById("error-div").remove();
  }

  let errorDiv = document.createElement("div");
  errorDiv.id = "error-div";
  errorDiv.innerHTML = `<span><i class="fas fa-globe-americas"></i> <i class="fas fa-question"></i></span>`;

  let errorP = document.createElement("p");
  errorP.textContent =
    "Sorry, we couldn't find a city by that name on planet earth.";
  errorDiv.appendChild(errorP);

  mainDiv.appendChild(errorDiv);
}

function toggleUnits(currentUnits) {
  let changeToUnits = currentUnits === "metric" ? "imperial" : "metric";
  unitsDiv.classList.toggle(currentUnits);
  unitsDiv.classList.toggle(changeToUnits);

  let elementsToHide = Array.from(
    document.getElementsByClassName(`${currentUnits}-element`)
  );
  elementsToHide.forEach((element) => {
    element.classList.remove("show-element");
  });

  let elementsToShow = Array.from(
    document.getElementsByClassName(`${changeToUnits}-element`)
  );
  elementsToShow.forEach((element) => {
    element.classList.add("show-element");
  });
}
