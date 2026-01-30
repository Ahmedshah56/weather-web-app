const apiKey = "414bfed570924542aff45116262701";

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  updateTime();
  setInterval(updateTime, 1000);
  
  // Try to get user's location on load
  getUserLocation();
});

// Update current time display
function updateTime() {
  const now = new Date();
  const options = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  const timeString = now.toLocaleDateString('en-US', options);
  document.getElementById('currentTime').textContent = timeString;
}

// Handle Enter key press in search input
function handleKeyPress(event) {
  if (event.key === 'Enter') {
    getWeather();
  }
}

// Get user's location and fetch weather
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getWeatherByCoords(lat, lon);
      },
      error => {
        // If user denies location, do nothing (they can search manually)
        console.log('Location access denied');
      }
    );
  }
}

// Fetch weather by coordinates
function getWeatherByCoords(lat, lon) {
  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`;
  
  fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error("Unable to fetch weather data");
      }
      return res.json();
    })
    .then(data => {
      displayWeather(data);
    })
    .catch(err => {
      console.log('Error fetching weather by location:', err);
    });
}

// Main weather fetch function
function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const error = document.getElementById("error");
  const box = document.getElementById("weatherBox");
  
  error.classList.add("hidden");
  box.classList.add("hidden");
  
  if (!city) {
    showError("Please enter a city name");
    return;
  }
  
  // Show loading state
  const searchBtn = document.querySelector('.search-btn span');
  const originalText = searchBtn.textContent;
  searchBtn.innerHTML = '<div class="loading"></div>';
  
  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;
  
  fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error("City not found. Please check the spelling and try again.");
      }
      return res.json();
    })
    .then(data => {
      displayWeather(data);
      document.getElementById("cityInput").value = '';
      searchBtn.textContent = originalText;
    })
    .catch(err => {
      showError(err.message);
      searchBtn.textContent = originalText;
    });
}

// Display weather data
function displayWeather(data) {
  const box = document.getElementById("weatherBox");
  
  // Location
  document.getElementById("location").textContent = 
    `${data.location.name}, ${data.location.country}`;
  
  // Temperature
  document.getElementById("temp").textContent = 
    Math.round(data.current.temp_c) + "°C";
  
  // Feels like temperature
  document.getElementById("feelsLike").textContent = 
    Math.round(data.current.feelslike_c) + "°C";
  
  // Condition
  document.getElementById("condition").textContent = 
    data.current.condition.text;
  
  // Weather icon - ensure it uses HTTPS
  const iconUrl = data.current.condition.icon.startsWith('//') 
    ? 'https:' + data.current.condition.icon 
    : data.current.condition.icon;
  document.getElementById("icon").src = iconUrl;
  
  // Humidity
  document.getElementById("humidity").textContent = 
    data.current.humidity + "%";
  
  // Wind speed
  document.getElementById("wind").textContent = 
    data.current.wind_kph + " km/h";
  
  // Pressure
  document.getElementById("pressure").textContent = 
    data.current.pressure_mb + " mb";
  
  // Visibility
  document.getElementById("visibility").textContent = 
    data.current.vis_km + " km";
  
  // Last updated
  const lastUpdated = new Date(data.current.last_updated);
  const timeAgo = getTimeAgo(lastUpdated);
  document.getElementById("lastUpdate").textContent = 
    `Last updated: ${timeAgo}`;
  
  // Change background based on weather condition
  updateBackgroundForWeather(data.current.condition.text);
  
  // Show weather box with animation
  box.classList.remove("hidden");
}

// Show error message
function showError(message) {
  const error = document.getElementById("error");
  error.textContent = message;
  error.classList.remove("hidden");
  
  // Auto-hide error after 5 seconds
  setTimeout(() => {
    error.classList.add("hidden");
  }, 5000);
}

// Calculate time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
  return Math.floor(seconds / 86400) + ' days ago';
}

// Update background based on weather condition
function updateBackgroundForWeather(condition) {
  const body = document.body;
  const lowerCondition = condition.toLowerCase();
  
  // Remove any existing weather classes
  body.classList.remove('sunny', 'cloudy', 'rainy', 'snowy', 'night');
  
  if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
    body.style.backgroundImage = 
      "url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80'), linear-gradient(135deg, rgba(255, 183, 77, 0.9) 0%, rgba(255, 138, 101, 0.9) 100%)";
  } else if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) {
    body.style.backgroundImage = 
      "url('https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=1920&q=80'), linear-gradient(135deg, rgba(108, 117, 125, 0.9) 0%, rgba(73, 80, 87, 0.9) 100%)";
  } else if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
    body.style.backgroundImage = 
      "url('https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=1920&q=80'), linear-gradient(135deg, rgba(52, 73, 94, 0.9) 0%, rgba(44, 62, 80, 0.9) 100%)";
  } else if (lowerCondition.includes('snow') || lowerCondition.includes('blizzard')) {
    body.style.backgroundImage = 
      "url('https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1920&q=80'), linear-gradient(135deg, rgba(189, 195, 199, 0.9) 0%, rgba(149, 165, 166, 0.9) 100%)";
  } else if (lowerCondition.includes('thunder') || lowerCondition.includes('storm')) {
    body.style.backgroundImage = 
      "url('https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=1920&q=80'), linear-gradient(135deg, rgba(52, 58, 64, 0.9) 0%, rgba(33, 37, 41, 0.9) 100%)";
  } else if (lowerCondition.includes('mist') || lowerCondition.includes('fog')) {
    body.style.backgroundImage = 
      "url('https://images.unsplash.com/photo-1487621167305-5d248087c724?w=1920&q=80'), linear-gradient(135deg, rgba(149, 165, 166, 0.9) 0%, rgba(127, 140, 141, 0.9) 100%)";
  }
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', () => {
  // Add parallax effect to the app card
  document.addEventListener('mousemove', (e) => {
    const card = document.querySelector('.app-card');
    if (!card) return;
    
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 50;
    const rotateY = (centerX - x) / 50;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
  
  // Reset transform when mouse leaves
  document.addEventListener('mouseleave', () => {
    const card = document.querySelector('.app-card');
    if (card) {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    }
  });
});
