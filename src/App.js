import Weather from "./components/Weather";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Weather Report</h1>
        <p>Search any city for current conditions.</p>
      </header>

      <main className="app-main">
        <Weather />
      </main>

      <footer className="app-footer">
        <p>
          Data from{" "}
          <a href="https://openweathermap.org" target="_blank" rel="noreferrer">
            OpenWeatherMap
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
