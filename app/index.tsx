import React, { useEffect, useState, useRef } from "react";
import { Text, View, StyleSheet } from "react-native";
import * as Location from "expo-location";
import tw from "../tw-rn";

interface Cityname {
  city: string;
  town: string;
  village: string;
}
interface DataDay {
  current: {
    temperature_2m: number;
  };
}

export default function WeatherApp() {
  const [latitude, setLatitude] = useState(48);
  const [longitude, setLongitude] = useState(2.7);
  const [cityName, setCityName] = useState<Cityname | null>(null);
  const [dataDay, setDataDay] = useState<DataDay | null>(null);
  const [dataWeek, setDataWeek] = useState(null);
  const [geoError, setGeoError] = useState("");

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setGeoError("Permission de localisation refusée");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
    })();
  }, []);

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      fetchDataWeek();
      fetchDataDay();
      fetchDataCity();
    }
  }, [latitude, longitude]);

  const fetchDataWeek = async () => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/meteofrance?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,uv_index_clear_sky_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration&timezone=Europe%2FLondon`
      );
      const data = await response.json();
      setDataWeek(data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données hebdomadaires:",
        error
      );
    }
  };

  const fetchDataDay = async () => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/meteofrance?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m`
      );
      const data = await response.json();
      setDataDay(data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données journalières:",
        error
      );
    }
  };

  const fetchDataCity = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      setCityName(data.address);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du nom de la ville:",
        error
      );
    }
  };

  return (
    <View style={tw`flex flex-col justify-center items-center p-20`}>
      {geoError ? (
        <Text>{geoError}</Text>
      ) : (
        <>
          <Text style={tw`mb-10`}>Latitude: {latitude}</Text>
          <Text style={tw`mb-10`}>Longitude: {longitude}</Text>
          {cityName && (
            <Text style={tw`mb-10`}>
              Ville: {cityName.city || cityName.town || cityName.village}
            </Text>
          )}
          {dataDay && dataDay.current && (
            <Text style={tw`mb-10`}>
              Température actuelle: {dataDay.current.temperature_2m}°C
            </Text>
          )}
        </>
      )}
    </View>
  );
}
