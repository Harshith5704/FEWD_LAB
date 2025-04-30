import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudFog, Wind, Thermometer, Search } from 'lucide-react';

export default function WeatherComponent() {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState('');
  const [searchLocation, setSearchLocation] = useState('Hyderabad'); // default location
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCoordinates = async (cityName) => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${cityName}&format=json`);
    const data = await response.json();
    if (!data || data.length === 0) throw new Error('City not found');
    return { lat: data[0].lat, lon: data[0].lon, display_name: data[0].display_name };
  };

  const fetchWeather = async (loc) => {
    setLoading(true);
    setError(null);
    try {
      const { lat, lon, display_name } = await fetchCoordinates(loc);

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      const weatherData = await weatherResponse.json();

      setWeather({
        ...weatherData.current_weather,
        location: display_name,
      });
      setLocation(loc);
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(searchLocation);
  }, []);

  const handleSearch = () => {
    if (searchLocation.trim()) {
      fetchWeather(searchLocation);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getWeatherIcon = (code) => {
    if (!code) return <Cloud size={48} />;
    // Open-Meteo weather codes reference: https://open-meteo.com/en/docs
    if ([95, 96, 99].includes(code)) return <CloudLightning color="#6B7280" size={48} />;
    if ([61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain color="#60A5FA" size={48} />;
    if ([71, 73, 75, 85, 86].includes(code)) return <CloudSnow color="#E5E7EB" size={48} />;
    if ([45, 48].includes(code)) return <CloudFog color="#9CA3AF" size={48} />;
    if ([0].includes(code)) return <Sun color="#FBBF24" size={48} />;
    if ([1, 2, 3].includes(code)) return <Cloud color="#9CA3AF" size={48} />;
    return <Wind size={48} />;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
          <h2 className="text-xl font-bold text-white text-center">Weather Dashboard</h2>

          <div className="mt-4 flex">
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter city name"
              className="flex-1 px-4 py-2 rounded-l-md focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-r-md"
              disabled={loading}
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading weather data...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
              <p className="text-sm mt-1">Please check the city name and try again.</p>
            </div>
          )}

          {weather && !loading && (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{weather.location}</h3>
                </div>
                <div className="flex items-center">
                  {getWeatherIcon(weather.weathercode)}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-center">
                  <Thermometer className="text-red-500 mr-2" size={24} />
                  <span className="text-4xl font-bold text-gray-800">{Math.round(weather.temperature)}°C</span>
                </div>
                <p className="text-center text-gray-600 mt-1">
                  Wind Speed: {weather.windspeed} km/h
                </p>
              </div>

              <p className="mt-4 text-center text-xs text-gray-500">
                Last updated: {new Date(weather.time).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
    }
