import { useEffect, useState } from "react";
import axios from "axios";
import "./Weather.css";

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

// Map OpenWeatherMap's "main" value to a theme name used in CSS
function getTheme(main = "") {
  switch (main.toLowerCase()) {
    case "clear":
      return "clear";
    case "clouds":
      return "clouds";
    case "rain":
    case "drizzle":
      return "rain";
    case "thunderstorm":
      return "storm";
    case "snow":
      return "snow";
    default:
      return "mist"; // mist, haze, fog, smoke, dust...
  }
}

// Convert a unix timestamp to the city's local time using its UTC offset
function formatLocalTime(unixSeconds, offsetSeconds) {
  return new Date((unixSeconds + offsetSeconds) * 1000).toLocaleTimeString(
    "en-US",
    { hour: "numeric", minute: "2-digit", timeZone: "UTC" }
  );
}

function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Theme the whole page based on the current weather
  useEffect(() => {
    if (weather) {
      document.body.dataset.condition = getTheme(weather.weather[0].main);
    }
    return () => {
      delete document.body.dataset.condition;
    };
  }, [weather]);

  const fetchWeather = async (event) => {
    event.preventDefault();
    const query = city.trim();

    if (!query) {
      setError("Enter a city name to search.");
      return;
    }
    if (!API_KEY) {
      setError(
        "No API key found. Add REACT_APP_WEATHER_API_KEY to your .env file and restart the dev server."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      // The user's input is added to the URL with a template literal
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        query
      )}&appid=${API_KEY}&units=metric`;

      const response = await axios.get(url);
      setWeather(response.data);
    } catch (err) {
      setWeather(null);

      if (err.response) {
        const { status } = err.response;
        if (status === 404) {
          setError(
            `We couldn't find "${query}". Check the spelling, or add a country code like "Paris,FR".`
          );
        } else if (status === 401) {
          setError(
            "The API key was rejected. New OpenWeatherMap keys can take up to a couple of hours to activate."
          );
        } else if (status === 429) {
          setError("Too many requests. Wait a minute and try again.");
        } else {
          setError("The weather service had a problem. Try again shortly.");
        }
      } else if (err.request) {
        setError("Can't reach the weather service. Check your internet connection.");
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="weather" aria-label="Weather search">
      <form className="weather-form" onSubmit={fetchWeather} noValidate>
        <label htmlFor="city-input" className="visually-hidden">
          City name
        </label>
        <input
          id="city-input"
          type="text"
          placeholder="Search a city, e.g. Chennai"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          autoComplete="off"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {error && (
        <p className="weather-error" role="alert">
          {error}
        </p>
      )}

      {!weather && !error && !loading && (
        <p className="weather-empty">
          Type a city above to see its temperature, wind, humidity and more.
        </p>
      )}

      {weather && (
        <article className="weather-card">
          <header className="weather-card-head">
            <h2>
              {weather.name}, {weather.sys.country}
            </h2>
            <p className="weather-desc">{weather.weather[0].description}</p>
          </header>

          <div className="weather-now">
            <p className="weather-temp">
              {Math.round(weather.main.temp)}
              <span>°C</span>
            </p>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
              alt={weather.weather[0].description}
              width="120"
              height="120"
            />
          </div>

          <dl className="weather-details">
            <div>
              <dt>Feels like</dt>
              <dd>{Math.round(weather.main.feels_like)}°C</dd>
            </div>
            <div>
              <dt>Humidity</dt>
              <dd>{weather.main.humidity}%</dd>
            </div>
            <div>
              <dt>Wind</dt>
              <dd>{(weather.wind.speed * 3.6).toFixed(1)} km/h</dd>
            </div>
            <div>
              <dt>Pressure</dt>
              <dd>{weather.main.pressure} hPa</dd>
            </div>
            <div>
              <dt>Sunrise</dt>
              <dd>{formatLocalTime(weather.sys.sunrise, weather.timezone)}</dd>
            </div>
            <div>
              <dt>Sunset</dt>
              <dd>{formatLocalTime(weather.sys.sunset, weather.timezone)}</dd>
            </div>
          </dl>
        </article>
      )}
    </section>
  );
}

export default Weather;
