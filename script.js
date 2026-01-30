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
  
  // Determine if it's night time
  const isDay = data.current.is_day === 1;
  const localTime = new Date(data.location.localtime);
  const hour = localTime.getHours();
  
  // Location
  document.getElementById("location").textContent = 
    `${data.location.name}, ${data.location.country}`;
  
  // Temperature with proper formatting
  const tempC = Math.round(data.current.temp_c);
  document.getElementById("temp").textContent = tempC + "°C";
  
  // Feels like temperature
  const feelsLikeC = Math.round(data.current.feelslike_c);
  document.getElementById("feelsLike").textContent = feelsLikeC + "°C";
  
  // Condition
  const conditionText = data.current.condition.text;
  document.getElementById("condition").textContent = conditionText;
  
  // Get realistic weather icon
  const weatherIcon = getWeatherIcon(data.current.condition.code, isDay, conditionText);
  const iconElement = document.getElementById("icon");
  iconElement.className = `weather-icon ${weatherIcon.class}`;
  iconElement.innerHTML = `<i class="${weatherIcon.icon}"></i>`;
  
  // Humidity - with percentage
  document.getElementById("humidity").textContent = 
    data.current.humidity + "%";
  
  // Wind speed - properly formatted
  const windKph = Math.round(data.current.wind_kph);
  document.getElementById("wind").textContent = windKph + " km/h";
  
  // Pressure - in millibars
  const pressureMb = Math.round(data.current.pressure_mb);
  document.getElementById("pressure").textContent = pressureMb + " mb";
  
  // Visibility - in kilometers
  const visibilityKm = data.current.vis_km;
  document.getElementById("visibility").textContent = visibilityKm + " km";
  
  // Last updated - human readable format
  const lastUpdated = new Date(data.current.last_updated);
  const timeAgo = getTimeAgo(lastUpdated);
  document.getElementById("lastUpdate").textContent = 
    `Last updated: ${timeAgo}`;
  
  // Update background and theme based on weather and time
  updateThemeForWeather(conditionText, isDay, hour);
  
  // Show weather box with animation
  box.classList.remove("hidden");
}

// Get appropriate weather icon based on condition code and time
function getWeatherIcon(code, isDay, conditionText) {
  const condition = conditionText.toLowerCase();
  
  // Night time icons
  if (!isDay) {
    if (condition.includes('clear')) {
      return { icon: 'fas fa-moon', class: 'night' };
    } else if (condition.includes('partly cloudy') || condition.includes('partly cloudy')) {
      return { icon: 'fas fa-cloud-moon', class: 'night' };
    } else if (condition.includes('cloudy') || condition.includes('overcast')) {
      return { icon: 'fas fa-cloud', class: 'cloudy' };
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
      return { icon: 'fas fa-cloud-showers-heavy', class: 'rainy' };
    } else if (condition.includes('thunder') || condition.includes('storm')) {
      return { icon: 'fas fa-bolt', class: 'thunder' };
    } else if (condition.includes('snow') || condition.includes('blizzard')) {
      return { icon: 'far fa-snowflake', class: 'snowy' };
    } else if (condition.includes('mist') || condition.includes('fog')) {
      return { icon: 'fas fa-smog', class: 'cloudy' };
    }
    return { icon: 'fas fa-cloud-moon', class: 'night' };
  }
  
  // Day time icons
  if (condition.includes('sunny') || condition.includes('clear')) {
    return { icon: 'fas fa-sun', class: 'sunny' };
  } else if (condition.includes('partly cloudy')) {
    return { icon: 'fas fa-cloud-sun', class: 'sunny' };
  } else if (condition.includes('cloudy') || condition.includes('overcast')) {
    return { icon: 'fas fa-cloud', class: 'cloudy' };
  } else if (condition.includes('rain') || condition.includes('drizzle')) {
    return { icon: 'fas fa-cloud-rain', class: 'rainy' };
  } else if (condition.includes('thunder') || condition.includes('storm')) {
    return { icon: 'fas fa-cloud-bolt', class: 'thunder' };
  } else if (condition.includes('snow') || condition.includes('blizzard')) {
    return { icon: 'fas fa-snowflake', class: 'snowy' };
  } else if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze')) {
    return { icon: 'fas fa-smog', class: 'cloudy' };
  } else if (condition.includes('wind')) {
    return { icon: 'fas fa-wind', class: 'cloudy' };
  }
  
  // Default
  return { icon: 'fas fa-cloud-sun', class: 'sunny' };
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

// Update background and theme based on weather condition and time
function updateThemeForWeather(condition, isDay, hour) {
  const body = document.body;
  const lowerCondition = condition.toLowerCase();
  
  // Remove all existing weather/time classes
  body.classList.remove('night-mode', 'clear-day', 'cloudy-day', 'rainy-day', 'snowy-day');
  
  // Night mode (based on API is_day flag or hour)
  if (!isDay || hour < 6 || hour >= 20) {
    body.classList.add('night-mode');
    return;
  }
  
  // Day time weather-based themes
  if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
    body.classList.add('clear-day');
  } else if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) {
    body.classList.add('cloudy-day');
  } else if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle') || 
             lowerCondition.includes('thunder') || lowerCondition.includes('storm')) {
    body.classList.add('rainy-day');
  } else if (lowerCondition.includes('snow') || lowerCondition.includes('blizzard') || 
             lowerCondition.includes('sleet')) {
    body.classList.add('snowy-day');
  } else if (lowerCondition.includes('mist') || lowerCondition.includes('fog')) {
    body.classList.add('cloudy-day');
  } else {
    // Default to clear day
    body.classList.add('clear-day');
  }
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', () => {
  // Only add parallax effect on desktop devices
  if (window.innerWidth > 768 && !('ontouchstart' in window)) {
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
  }
  
  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Reset any transforms on resize
      const card = document.querySelector('.app-card');
      if (card) {
        card.style.transform = '';
      }
    }, 250);
  });
  
  // Prevent iOS zoom on input focus
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
    }
  }
});

// Optimize scroll performance on mobile
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      // Scroll optimizations can be added here
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });
