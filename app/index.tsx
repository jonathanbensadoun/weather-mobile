import React, { useEffect, useState, useRef } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { parseISO, isAfter, isBefore } from "date-fns";
import LottieView from "lottie-react-native";
import * as Location from "expo-location";
import tw from "../tw-rn";
import * as NavigationBar from "expo-navigation-bar";
import * as Clipboard from "expo-clipboard";

interface Cityname {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  ISO3166_2_lvl4?: string;
  ISO3166_2_lvl6?: string;
  country?: string;
  country_code?: string;
  county?: string;

  postcode?: string;
  region?: string;
  road?: string;
  state?: string;
}

interface DataDay {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
  };
}

export default function WeatherApp() {
  const [latitude, setLatitude] = useState<Number | null>(null);
  const [longitude, setLongitude] = useState<Number | null>(null);
  const [cityName, setCityName] = useState<Cityname | null>(null);
  const [dataDay, setDataDay] = useState<DataDay | null>(null);
  const [geoError, setGeoError] = useState("");
  const [reload, setReload] = useState(false);
  const [isNigth, setIsNigth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [animationPaused, setAnimationPaused] = useState(false);
  const locationAnimationRef = useRef<LottieView>(null);
  const [copyAnimationPaused, setCopyAnimationPaused] = useState(false);
  const copyAnimationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (isNigth && !loading) {
      NavigationBar.setBackgroundColorAsync("#19164A");
    } else {
      NavigationBar.setBackgroundColorAsync("#E6D4FD");
    }

    NavigationBar.setBehaviorAsync("inset-swipe");
    setTimeout(() => setLoading(false), 2000);
  }, [isNigth, loading]);

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
      fetchDataDay();
      fetchDataCity();
      setTimeout(() => setReload(false), 4000);
    }
  }, [latitude, longitude, reload]);

  const fetchDataDay = async () => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/meteofrance?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m&daily=sunrise,sunset&timezone=Europe%2FBerlin`
      );
      const data = await response.json();
      const dateNow = new Date();
      const sunrise = parseISO(data.daily.sunrise[0]);
      const sunset = parseISO(data.daily.sunset[0]);

      if (isAfter(dateNow, sunrise) && isBefore(dateNow, sunset)) {
        setIsNigth(false);
      } else {
        setIsNigth(true);
      }

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

  // Fonction pour démarrer ou relancer l'animation
  const handleAnimationPress = () => {
    setReload(true);
    if (animationPaused) {
      locationAnimationRef.current?.resume(); // Reprendre l'animation si elle est en pause
    } else {
      locationAnimationRef.current?.play(); // Jouer l'animation
    }
    setAnimationPaused(!animationPaused); // Inverser l'état de pause
  };

  const handleCopyPress = () => {
    if (copyAnimationPaused) {
      copyAnimationRef.current?.resume();
    } else {
      copyAnimationRef.current?.play();
    }
    setCopyAnimationPaused(!copyAnimationPaused);
    Clipboard.setStringAsync(
      ` Je me trouve aux coordonnées suivantes: ${latitude}, ${longitude} dans la ville de ${
        cityName?.city || cityName?.town || cityName?.village
      }, ${cityName?.road}, ${cityName?.postcode}, ${cityName?.country}`
    );
  };
  return (
    <View
      style={tw` p-30 bg-purple-200  absolute top-0 left-0 right-0 bottom-0`}
    >
      {isNigth ? (
        <LottieView
          source={require("../assets/images/nitgh-bg.json")}
          autoPlay
          loop
          resizeMode="cover"
          style={tw`absolute top-0 left-0 right-0 bottom-0`}
          speed={1}
        />
      ) : (
        <LottieView
          source={require("../assets/images/Animation - 1727431713401.json")}
          autoPlay
          loop
          resizeMode="cover"
          style={tw`absolute top-0 left-0 right-0 bottom-0`}
          speed={0.5}
        />
      )}

      {loading ? (
        <View style={tw`flex flex-col justify-center items-center `}>
          <LottieView
            source={require("../assets/images/Animation - 1727516713625.json")}
            autoPlay
            loop
            speed={1}
            style={tw`w-50 h-50`}
          />
        </View>
      ) : (
        <View
          style={tw`flex flex-col justify-start items-center ${
            isNigth ? "mt-40 " : ""
          }`}
        >
          {geoError ? (
            <Text>{geoError}</Text>
          ) : (
            <View style={tw`w-100 flex flex-col justify-center items-center `}>
              <View
                style={tw`flex flex-row justify-center items-center  mb-10  bg-purple-300 p-4 rounded-lg bg-opacity-20 `}
              >
                <TouchableOpacity
                  onPress={handleAnimationPress}
                  accessible={true}
                  accessibilityLabel="Rafraîchir la localisation"
                >
                  <View style={{ width: 100, height: 100 }}>
                    <LottieView
                      source={require("../assets/images/location.json")}
                      autoPlay
                      loop={false} // Ne pas boucler
                      renderMode="AUTOMATIC"
                      speed={0.6}
                      ref={locationAnimationRef} // Ref pour contrôler l'animation
                    />
                  </View>
                </TouchableOpacity>
                <View>
                  {!reload && latitude && longitude && (
                    <View
                      style={tw`flex flex-col justify-between items-center ml-4`}
                    >
                      <Text
                        style={[tw`mb-4 text-white text-lg`, styles.textShadow]}
                      >
                        Latitude: {latitude.toFixed(5)}
                      </Text>
                      <Text
                        style={[tw`mb-4 text-white text-lg`, styles.textShadow]}
                      >
                        Longitude: {longitude.toFixed(5)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <View
                style={tw`bg-purple-300 p-4 rounded-lg bg-opacity-20 flex flex-col justify-center items-center ${
                  isNigth ? "mt-8" : ""
                }`}
              >
                {reload ? (
                  <LottieView
                    source={require("../assets/images/Animation - 1727516713625.json")}
                    autoPlay
                    loop
                    resizeMode="cover"
                    speed={1}
                    style={tw`w-26 h-26`}
                  />
                ) : (
                  <View style={tw`flex flex-col justify-center items-center`}>
                    <View
                      style={tw`flex flex-row justify-center items-center absolute
                            -top-9 -right-7`}
                    >
                      <TouchableOpacity
                        onPress={handleCopyPress}
                        accessible={true}
                        accessibilityLabel="Copier la localisation"
                      >
                        <View
                          style={tw`bg-purple-300 bg-opacity-50  p-1 rounded-full`}
                        >
                          <LottieView
                            source={require("../assets/images/copy.json")}
                            loop={false}
                            speed={1}
                            style={tw`w-10 h-10`}
                            ref={copyAnimationRef}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                    {cityName && (
                      <View
                        style={tw`flex flex-col justify-center items-center`}
                      >
                        <Text
                          style={[
                            tw`mb-4 text-white text-3xl`,
                            styles.textShadow,
                          ]}
                        >
                          {cityName.city || cityName.town || cityName.village}
                        </Text>
                        <Text
                          style={[
                            tw`mb-4 text-medium-purple text-xl ${
                              isNigth ? "text-white" : ""
                            }`,
                          ]}
                        >
                          {cityName.road}
                        </Text>
                        <View style={tw`flex flex-row  gap-4`}>
                          <Text
                            style={[
                              tw`mb-4 text-medium-purple  text-xl  ${
                                isNigth ? "text-white" : ""
                              }`,
                            ]}
                          >
                            {cityName.postcode}
                          </Text>
                          <Text
                            style={[
                              tw`mb-4 text-medium-purple text-xl  ${
                                isNigth ? "text-white" : ""
                              }`,
                            ]}
                          >
                            {cityName.country}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      )}
      {dataDay && dataDay.current && !loading && (
        <View
          style={tw`flex flex-row justify-center items-center absolute bottom-0 left-0 right-0 m-4`}
        >
          <Text style={[tw` text-white text-3xl`, styles.textShadow]}>
            {dataDay.current.temperature_2m}°C{" "}
          </Text>
          <Text style={[tw`text-white `, styles.textShadow]}>
            {`  ( ressentie: ${dataDay.current.apparent_temperature}°C )`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  textShadow: {
    textShadowColor: "rgba(0, 0, 0, 0.55)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});
