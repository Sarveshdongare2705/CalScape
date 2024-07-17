import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ImageBackground} from 'react-native';
import axios from 'axios';
import {colors} from '../Colors';
import firestore from '@react-native-firebase/firestore';
import {Image} from 'react-native-svg';

const API_KEY = '72a0413b3123f20c79068469a9ffd838';

const WeatherInMumbai = ({userData}) => {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(false);

  let uid = userData.uid;

  const fetchWeather = async () => {
    try {
      const cityRef = await firestore()
        .collection('UserData')
        .doc(uid)
        .collection('BasicDetails')
        .doc(`basic_details:${uid}`);
      const doc = await cityRef.get();
      if (!doc.exists) {
        setError(true);
        return;
      }
      const city = doc.data().city;
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`,
      );
      response.data.city = city;
      setWeatherData(response.data);
    } catch (err) {
      setError(true);
      console.error(
        'API request failed:',
        err.response ? err.response.data : err.message,
      );
    }
  };
  useEffect(() => {
    fetchWeather();
  }, [uid]);

  if (!error && weatherData) {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={{
            uri: 'https://images.pexels.com/photos/2232917/pexels-photo-2232917.jpeg?auto=compress&cs=tinysrgb&w=600',
          }}
          style={{width: '100%', height: '100%', opacity: 0.8}}>
          <View
            style={{
              width: '100%',
              height: 80,
              paddingVertical: 10,
              paddingHorizontal: '5%',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View style={{width: '64%', flexDirection: 'column', height: 60}}>
              <Text
                style={{
                  color: 'black',
                  fontSize: 21,
                  fontFamily: colors.font4,
                  height: 24,
                }}>
                {weatherData.city}
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontSize: 30,
                  fontFamily: colors.font2,
                  height: 36,
                }}>
                {weatherData.main.temp + ' °C'}
              </Text>
            </View>
            <View
              style={{
                width: '36%',
                flexDirection: 'column',
                height: 60,
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: 'black',
                  fontSize: 14,
                  fontFamily: colors.font2,
                  height : 20,
                }}>
                {'feels like : ' + weatherData.main.feels_like + ' °C'}
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontSize: 14,
                  fontFamily: colors.font2,
                  height : 20,
                }}>
                {'Clouds : ' + weatherData.clouds.all + '%'}
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontSize: 14,
                  fontFamily: colors.font2,
                  height : 20,
                }}>
                {'Weather : ' + weatherData.weather[0].main}
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 76,
    width: '100%',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom : 5,
  },
  text: {
    fontSize: 18,
    marginVertical: 10,
    color: 'black',
    fontFamily: colors.font4,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    fontFamily: colors.font4,
  },
});

export default WeatherInMumbai;
