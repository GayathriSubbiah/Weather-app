document.addEventListener("DOMContentLoaded", function () {
  const API_KEY = "5592f2a3723381a687c4a42f1b889bdf"; // OpenWeather API key

  const searchBtn = document.getElementById("search-btn");
  const locationBtn = document.getElementById("location-btn");
  const cityInput = document.getElementById("city-input");
  const weatherDisplay = document.getElementById("weather-display");
  const forecastDisplay = document.getElementById("forecast-display");
  const cityNameEl = document.getElementById("city-name");
  const temperatureEl = document.getElementById("temperature");
  const humidityEl = document.getElementById("humidity");
  const windSpeedEl = document.getElementById("wind-speed");
  const weatherIconEl = document.getElementById("weather-icon");
  const recentCitiesDropdown = document.getElementById("recent-cities");

  let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];

  // Update Recent Cities Dropdown
  function updateRecentCitiesDropdown() {
    if (recentCities.length > 0) {
      recentCitiesDropdown.classList.remove("hidden");
      recentCitiesDropdown.innerHTML = `<option value="">Select a recent city</option>` +
        recentCities.map(city => `<option value="${city}">${city}</option>`).join("");
    } else {
      recentCitiesDropdown.classList.add("hidden");
    }
  }

  // Save Recent City
  function saveRecentCity(city) {
    if (!recentCities.includes(city)) {
      recentCities.push(city);
      if (recentCities.length > 5) recentCities.shift(); // Keep max 5 recent cities
      localStorage.setItem("recentCities", JSON.stringify(recentCities));
      updateRecentCitiesDropdown();
    }
  }

  // Fetch Weather by City Name
  function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error("City not found");
        return response.json();
      })
      .then(data => {
        displayWeather(data);
        saveRecentCity(city);
        fetchForecast(data.coord.lat, data.coord.lon);
      })
      .catch(err => alert(err.message));
  }

  // Fetch Weather by Location
  function fetchWeatherByLocation(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        displayWeather(data);
        saveRecentCity(data.name);
        fetchForecast(lat, lon);
      })
      .catch(err => alert("Failed to fetch weather data"));
  }

  // Fetch 5-Day Forecast
  function fetchForecast(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    fetch(url)
      .then(response => response.json())
      .then(data => displayForecast(data.list))
      .catch(err => console.error(err));
  }

  // Display Weather Data
  function displayWeather(data) {
    weatherDisplay.classList.remove("hidden");
    cityNameEl.textContent = data.name;
    temperatureEl.textContent = `Temperature: ${data.main.temp} °C`;
    humidityEl.textContent = `Humidity: ${data.main.humidity}%`;
    windSpeedEl.textContent = `Wind Speed: ${data.wind.speed} m/s`;
    weatherIconEl.innerHTML = getWeatherIcon(data.weather[0].icon);
    updateWeatherUI(data.weather[0].main);
  }

  // Display Forecast
  function displayForecast(forecast) {
    forecastDisplay.classList.remove("hidden");
    forecastDisplay.innerHTML = "";
    forecast.filter((_, index) => index % 8 === 0).forEach(day => {
      forecastDisplay.innerHTML += `
        <div class="bg-white p-4 rounded shadow text-center">
          <p>${new Date(day.dt * 1000).toLocaleDateString()}</p>
          <div class="text-4xl">${getWeatherIcon(day.weather[0].icon)}</div>
          <p>${day.main.temp} °C</p>
          <p>Wind: ${day.wind.speed} m/s</p>
          <p>Humidity: ${day.main.humidity}%</p>
        </div>
      `;
    });
  }

  // Get Weather Icon
  function getWeatherIcon(iconCode) {
    return `<img src="http://openweathermap.org/img/wn/${iconCode}@2x.png" alt="weather icon">`;
  }

  // Update Background Based on Weather Condition
  function updateWeatherUI(weatherCondition) {
    const body = document.body;

    // Remove existing weather classes
    body.classList.remove("sunny", "rainy", "cloudy", "night");

    if (weatherCondition.includes("Rain") || weatherCondition.includes("Drizzle")) {
      body.classList.add("rainy");
    } else if (weatherCondition.includes("Clear")) {
      body.classList.add("sunny");
    } else if (weatherCondition.includes("Clouds")) {
      body.classList.add("cloudy");
    } else if (weatherCondition.includes("Night")) {
      body.classList.add("night");
    }
  }

  // Event Listeners
  searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (!city) return alert("Please enter a city name.");
    fetchWeather(city);
  });

  locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByLocation(latitude, longitude);
      }, () => alert("Unable to access location"));
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  });

  recentCitiesDropdown.addEventListener("change", (e) => {
    if (e.target.value) {
      fetchWeather(e.target.value);
    }
  });

  // Initialize Dropdown
  updateRecentCitiesDropdown();
});