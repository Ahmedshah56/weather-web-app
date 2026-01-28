const apiKey = "414bfed570924542aff45116262701";

function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const error = document.getElementById("error");
  const box = document.getElementById("weatherBox");

  error.classList.add("hidden");
  box.classList.add("hidden");

  if (!city) {
    error.textContent = "Please enter a city name";
    error.classList.remove("hidden");
    return;
  }

  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;

  fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error("City not found");
      }
      return res.json();
    })
    .then(data => {
      document.getElementById("location").textContent =
        data.location.name + ", " + data.location.country;

      document.getElementById("temp").textContent =
        Math.round(data.current.temp_c) + "°C";

      document.getElementById("condition").textContent =
        data.current.condition.text;

      document.getElementById("icon").src =
        data.current.condition.icon;

      document.getElementById("humidity").textContent =
        data.current.humidity + "%";

      document.getElementById("wind").textContent =
        data.current.wind_kph + " km/h";

      box.classList.remove("hidden");
    })
    .catch(err => {
      error.textContent = err.message;
      error.classList.remove("hidden");
    });
}
