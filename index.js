const mainDiv = document.querySelector("main");
const userInput = document.getElementById("country");
const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  weatherApp(userInput.value, "metric");
  userInput.textContent = "";
});

//test
weatherApp("budapest", "metric");

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
    console.log(weatherObj);
  } catch (e) {
    console.log(e);
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
  const temp = `${weatherData.main.temp} ${units == "metric" ? "°C" : "°F"}`;
  const feelTemp = `${weatherData.main.feels_like} ${
    units == "metric" ? "°C" : "°F"
  }`;
  const maxTemp = `${weatherData.main.temp_max} ${
    units == "metric" ? "°C" : "°F"
  }`;
  const minTemp = `${weatherData.main.temp_min} ${
    units == "metric" ? "°C" : "°F"
  }`;
  // % humidity
  const humidity = `${weatherData.main.humidity}%`;
  // m/s
  const windSpeed = `${weatherData.wind.speed}${
    units == "metric" ? "m/s" : "miles/hr"
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
  try {
    const response = await fetch(
      `https://restcountries.eu/rest/v2/alpha/${countryCode}`
    );
    const data = await response.json();
    return data;
  } catch (e) {
    return e;
  }
}

// gets the weather data in metric units by city name
async function getWeatherData(cityName, units) {
  let response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=8bc34d5ff8628186b68c3c4af2106ea0&units=${units}`
  );
  let result = await response.json();
  return result;
}
