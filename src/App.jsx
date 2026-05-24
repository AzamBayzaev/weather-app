import { useEffect, useState } from "react";
import "./App.css";

const CITY_NAME = "Худжанд";
const COUNTRY_NAME = "Таджикистан";

// Координаты Худжанда
const LAT = 40.2833;
const LON = 69.6333;

const weatherText = {
  0: "Ясно",
  1: "Почти ясно",
  2: "Переменная облачность",
  3: "Пасмурно",
  45: "Туман",
  48: "Изморозь и туман",
  51: "Морось слабая",
  53: "Морось умеренная",
  55: "Морось сильная",
  61: "Дождь слабый",
  63: "Дождь умеренный",
  65: "Дождь сильный",
  71: "Снег слабый",
  73: "Снег умеренный",
  75: "Снег сильный",
  80: "Ливень слабый",
  81: "Ливень умеренный",
  82: "Ливень сильный",
  95: "Гроза",
  96: "Гроза с градом",
  99: "Сильная гроза с градом",
};

function getWeatherLabel(code) {
  if (code === undefined || code === null) return "Нет данных";
  return weatherText[code] || `Код погоды: ${code}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadWeather = async () => {
      try {
        setLoading(true);
        setError("");

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=5`
        );

        if (!weatherRes.ok) {
          throw new Error("Не удалось загрузить погоду");
        }

        const weatherData = await weatherRes.json();

        if (!weatherData.current || !weatherData.daily?.time) {
          throw new Error("Нет данных погоды");
        }

        setWeather({
          name: CITY_NAME,
          country: COUNTRY_NAME,
          current: weatherData.current,
        });

        const daily = weatherData.daily;
        const days = daily.time.map((date, index) => ({
          date,
          code: daily.weather_code?.[index],
          max: daily.temperature_2m_max?.[index],
          min: daily.temperature_2m_min?.[index],
          precipitation: daily.precipitation_sum?.[index] ?? 0,
        }));

        setForecast(days);
      } catch (err) {
        setWeather(null);
        setForecast([]);
        setError(err?.message || "Что-то пошло не так");
      } finally {
        setLoading(false);
      }
    };

    loadWeather();
  }, []);

  if (loading) {
    return (
      <div className="app">
        <div className="card">
          <p className="status">Загрузка погоды...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="card">
          <h1>Погода в Худжанде</h1>
          <p className="error">{error}</p>
        </div>
      </div>
    );
  }

  const current = weather?.current;

  return (
    <div className="app">
      <div className="card">
        <div className="header">
          <div>
            <p className="city-label">Погода сейчас</p>
            <h1>
              {weather?.name}, {weather?.country}
            </h1>
          </div>
          <div className="city-badge">Khujand</div>
        </div>

        <div className="current-weather">
          <div className="temp">
            {current?.temperature_2m !== undefined
              ? `${Math.round(current.temperature_2m)}°`
              : "—"}
          </div>

          <div className="details">
            <p className="condition">{getWeatherLabel(current?.weather_code)}</p>
            <p>
              Влажность:{" "}
              {current?.relative_humidity_2m !== undefined
                ? `${current.relative_humidity_2m}%`
                : "—"}
            </p>
            <p>
              Ветер:{" "}
              {current?.wind_speed_10m !== undefined
                ? `${current.wind_speed_10m} км/ч`
                : "—"}
            </p>
          </div>
        </div>

        <div className="forecast-section">
          <h2>Прогноз на несколько дней</h2>

          <div className="forecast-list">
            {forecast.map((day) => (
              <div className="forecast-item" key={day.date}>
                <p className="forecast-date">{formatDate(day.date)}</p>
                <p className="forecast-condition">
                  {getWeatherLabel(day.code)}
                </p>
                <p className="forecast-temp">
                  {day.max !== undefined && day.min !== undefined
                    ? `${Math.round(day.max)}° / ${Math.round(day.min)}°`
                    : "—"}
                </p>
                <p className="forecast-rain">
                  Осадки: {day.precipitation} мм
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;