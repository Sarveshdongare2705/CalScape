import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
  Dimensions,
  FlatList,
  Linking,
  ImageBackground,
  TextInput,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import BottomNavigation from '../components/BottomNavigation';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {LineChart} from 'react-native-chart-kit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WeatherInMumbai from '../components/Weather';
import determineLeague, {calculateReduction} from '../utils/reductionUtils';
import {fetchAndUpdateFootprint} from '../utils/footrpintUtils';
import {ThemeContext} from '../context/ThemeContext';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';

const Home = () => {
  const {theme, toggleTheme, isDarkMode} = useContext(ThemeContext);
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState('');
  const [greeting, setGreeting] = useState('');

  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [articles, setArticles] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});
  const [tip, setTip] = useState('');
  const [val, setVal] = useState(0);
  const [show, setShow] = useState(true);
  const [bgImage, setBgImage] = useState(null);
  const [users, setUsers] = useState(null);

  const [adminUid, setAdminUid] = useState(null);
  const fetchAdmin = async () => {
    const docRef = await firestore().collection('Admin').doc('admin');
    const doc = await docRef.get();
    const data = doc.data();
    setAdminUid(data.uid);
  };

  //fetchAllUsers
  const fetchAllUsers = async () => {
    try {
      const usersRef = firestore().collection('Users');
      const usersSnapshot = await usersRef.get();

      let usersData = [];
      usersSnapshot.forEach(userDoc => {
        usersData.push({
          id: userDoc.id,
          ...userDoc.data(),
        });
      });

      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users: ', error);
    }
  };

  const [id, setId] = useState(null);
  const [idUpdating, setIdUpdaing] = useState(false);
  const fetchVideoId = async () => {
    const docRef = await firestore().collection('Video').doc('video2');
    const doc = await docRef.get();
    const data = doc.data();
    setId(data.id);
  };
  useFocusEffect(
    React.useCallback(() => {
      fetchVideoId();
    }, []),
  );

  const fetchUserData = async user => {
    const userSnapShot = await firestore()
      .collection('Users')
      .where('email', '==', user.email)
      .get();
    if (!userSnapShot.empty) {
      const userData = userSnapShot.docs[0].data();
      return userData;
    }
    return null;
  };

  const fetchNews = async () => {
    try {
      const lastFetchDate = await AsyncStorage.getItem('lastFetchDate');
      const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

      if (lastFetchDate === today) {
        // News fetched today, load from AsyncStorage
        const storedArticles = await AsyncStorage.getItem('articles');
        if (storedArticles) {
          setArticles(JSON.parse(storedArticles));
        }
        return;
      }

      // Fetch new news
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: 'climate change',
          apiKey: 'fd5bd50e5c2342eb938ba2c6ca9e558c',
        },
      });

      if (response.data.articles) {
        setArticles(response.data.articles);
        await AsyncStorage.setItem(
          'articles',
          JSON.stringify(response.data.articles),
        );
        await AsyncStorage.setItem('lastFetchDate', today);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://api.climateclock.world/v2/clock.json',
        );
        const data = response.data.data.modules.carbon_deadline_1;

        const endDate = new Date(data.timestamp).getTime();
        calculateTimeLeft(endDate);
      } catch (error) {
        console.error('Error fetching data from API', error);
      }
    };
    fetchData();
    const timer = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  const calculateTimeLeft = endDate => {
    const now = new Date().getTime();
    const difference = endDate - now;

    let timeLeft = {};
    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const years = Math.floor(days / 365);
      const d = days - years * 365;
      timeLeft = {
        years: years,
        days: d - 1,
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    setTimeLeft(timeLeft);
  };

  //tip part
  const fetchRandomTip = async () => {
    const randomDocId = Math.floor(Math.random() * 11) + 1;
    console.log(randomDocId);
    try {
      const doc = await firestore()
        .collection('tip')
        .doc(randomDocId.toString())
        .get();

      if (doc.exists) {
        const tipData = doc.data();
        setTip(tipData.tip);
        await AsyncStorage.setItem(
          'lastFetchedDate',
          new Date().toDateString(),
        );
        await AsyncStorage.setItem('tip', tipData.tip);
      }
    } catch (error) {
      console.error('Error fetching random tip:', error);
    }
  };

  const checkAndFetchTip = async () => {
    const lastFetchedDate = await AsyncStorage.getItem('lastFetchedDate');
    const todayDate = new Date().toDateString();
    if (lastFetchedDate !== todayDate) {
      fetchRandomTip();
    } else {
      const fetchedTip = await AsyncStorage.getItem('tip');
      console.log(fetchedTip);
      setTip(fetchedTip);
    }
  };

  useEffect(() => {
    checkAndFetchTip();
  }, []);

  const fetchFootprint = async uid => {
    const currentTime = new Date();
    const timestamp = {
      month: currentTime.getMonth() + 1,
      year: currentTime.getFullYear(),
    };
    const footprintRef = firestore()
      .collection('Users')
      .doc(uid)
      .collection('Footprint')
      .doc(`${timestamp.month}-${timestamp.year}`);

    const doc = await footprintRef.get();
    if (doc.exists) {
      const data = doc.data();
      const val =
        (data.basicDetails ? data.basicDetails : 0) +
        (data.recycleDetails ? data.recycleDetails : 0) +
        (data.travelDetails ? data.travelDetails : 0) +
        (data.electricityDetails ? data.electricityDetails : 0) +
        (data.energyDetails ? data.energyDetails : 0) +
        (data.foodDetails ? data.foodDetails : 0) +
        (data.clothingDetails ? data.clothingDetails : 0) +
        (data.extraDetails ? data.extraDetails : 0);
      setVal(val.toFixed(2));
      await AsyncStorage.setItem('footprint', val.toFixed(2).toString());
    } else {
      setVal(0);
    }
  };

  const [reducedValue, setReducedValue] = useState({
    value: null,
    status: null,
    percentage: null,
  });

  const [leagueDetails, setLeagueDetails] = useState({
    leagueName: null,
    text: null,
    imageUrl: null,
  });

  //permission
  const requestNotificationPermission = async () => {
    const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
    return result;
  };

  const [showRequest, setShowRequest] = useState(false);

  const checkNotificationPermission = async () => {
    const result = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
    if (result !== RESULTS.GRANTED) {
      setShowRequest(true);
    } else {
      setShowRequest(false);
    }
    return result;
  };

  const requestPermission = async () => {
    const checkPermission = await checkNotificationPermission();
    console.log('check', checkPermission);
    if (checkPermission !== RESULTS.GRANTED) {
      const request = await requestNotificationPermission();
      if (request !== RESULTS.GRANTED) {
        setShowRequest(false);
      } else {
        setShowRequest(false);
      }
    }
  };

  const [city, setCity] = useState('');
  const API_KEY = '72a0413b3123f20c79068469a9ffd838';
  const [weatherData, setWeatherData] = useState(null);
  const getWeatherData = async uid => {
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
      setCity(city);
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`,
      );
      const {lat, lon} = weatherResponse.data.coord;
      console.log(city, lat, lon);
      const airQualityResponse = await axios.get(
        `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`,
      );

      return {
        temperature: weatherResponse.data.main.temp,
        airQuality: airQualityResponse.data.list[0].main.aqi,
      };
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const date = new Date();
      const options = {day: 'numeric', month: 'long', year: 'numeric'};
      const formattedDate = date.toLocaleDateString('en-US', options);
      setCurrentDate(formattedDate);
      const hours = date.getHours();
      if (hours < 12) {
        setGreeting('Morning');
      } else if (hours < 18) {
        setGreeting('Afternoon');
      } else {
        setGreeting('Evening');
      }
      const unsubscribe = auth().onAuthStateChanged(async user => {
        try {
          if (user) {
            const requestResult = await checkNotificationPermission();
            const prevUid = await AsyncStorage.getItem('uid');
            let userDetails;
            const data = await getWeatherData(user.uid); // Replace with dynamic city
            console.log('weather data', data);
            setWeatherData(data);
            // Check if the current user is the same as the previous user or if user data needs updating
            if (user.uid === prevUid) {
              const userUpdated = await AsyncStorage.getItem('updated');

              if (userUpdated === 'true') {
                userDetails = await fetchUserData(user);
                await AsyncStorage.setItem(
                  'userData',
                  JSON.stringify(userDetails),
                );
                await AsyncStorage.setItem('updated', 'false');
              } else {
                const storedUserData = await AsyncStorage.getItem('userData');
                userDetails = storedUserData
                  ? JSON.parse(storedUserData)
                  : null;

                if (!userDetails) {
                  userDetails = await fetchUserData(user);
                  await AsyncStorage.setItem(
                    'userData',
                    JSON.stringify(userDetails),
                  );
                }
              }
            } else {
              // New user
              userDetails = await fetchUserData(user);
              await AsyncStorage.setItem('uid', user.uid);
              await AsyncStorage.setItem(
                'userData',
                JSON.stringify(userDetails),
              );
              await AsyncStorage.setItem('updated', 'false');
            }
            setCurrentUser(user);
            setUserData(userDetails);
            let res = await AsyncStorage.getItem('reduction');
            let res2 = await AsyncStorage.getItem('leagueName');
            console.log(res + res2);
            let result = await calculateReduction(userDetails.uid);
            let result2 = await determineLeague(userDetails.uid);
            if (res !== result) {
              await AsyncStorage.setItem('reduction', JSON.stringify(result));
              setReducedValue(result);
            }
            if (res2 !== result2) {
              await AsyncStorage.setItem('leagueName', JSON.stringify(result2));
              setLeagueDetails(result2);
            }
            setLeagueDetails(JSON.parse(res2));
            setReducedValue(JSON.parse(res));
            fetchFootprint(userDetails.uid);
            fetchAdmin();
            fetchNews();
            fetchAllUsers();
          } else {
            await AsyncStorage.removeItem('uid');
            await AsyncStorage.removeItem('userData');
            await AsyncStorage.removeItem('updated');
            await AsyncStorage.removeItem('lineChartUpdated');
            await AsyncStorage.removeItem('barChartUpdated');
            await AsyncStorage.removeItem('lineChartData');
            await AsyncStorage.removeItem('barChartData');
            setCurrentUser(null);
            setUserData(null);
          }
        } catch (error) {
          console.error('Error during auth state change handling:', error);
        }
      });
      return unsubscribe;
    }, []),
  );

  const updateFootprint = async () => {
    await fetchAndUpdateFootprint(userData.uid);
  };

  useEffect(() => {
    const checkDateAndFetchFootprint = () => {
      const today = new Date();
      const dayOfMonth = today.getDate();

      // Call fetchAndUpdateFootprint only if today is the 1st of the month
      if (dayOfMonth === 1) {
        updateFootprint();
      }
    };

    // Check every day at midnight
    const intervalId = setInterval(
      checkDateAndFetchFootprint,
      24 * 60 * 60 * 1000,
    );

    // Initial check when the app starts
    checkDateAndFetchFootprint();

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [userData]);

  const images = [
    'https://www.powermag.com/wp-content/uploads/2015/12/PWR_120115_GM_Fig3.jpg',
    'https://images.pexels.com/photos/683535/pexels-photo-683535.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/378279/pexels-photo-378279.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/2309992/pexels-photo-2309992.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/117609/pexels-photo-117609.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/221012/pexels-photo-221012.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/2566845/pexels-photo-2566845.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/257775/pexels-photo-257775.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1182383/pexels-photo-1182383.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/2080964/pexels-photo-2080964.jpeg?auto=compress&cs=tinysrgb&w=600',
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
    }, 30000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const formatDate = isoString => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const [showTipModule, setShowTipModule] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [showVideo, setShowVideo] = useState(false);
  const margintop = useRef(new Animated.Value(0)).current;

  const handleScroll = event => {
    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;

    // Convert the values to integers
    const offsetY = parseInt(contentOffset.y.toFixed(0), 10);
    const layoutHeight = parseInt(layoutMeasurement.height.toFixed(0), 10);
    const contentHeight = parseInt(contentSize.height.toFixed(0), 10);

    const val = offsetY + layoutHeight;
    console.log(val);

    const isAtBottom = val >= contentHeight;
    const isAtTop = offsetY <= 0;

    console.log(isAtTop, isAtBottom);

    setShowVideo(isAtBottom);

    if (isAtTop && !isAtBottom) {
      setShowVideo(false);
    }
    if (!isAtTop && isAtBottom) {
      setShowVideo(true);
    }
  };

  useEffect(() => {
    Animated.timing(margintop, {
      toValue: showVideo ? 0 : 0,
      duration: 500, // Duration of the animation
      useNativeDriver: false,
    }).start();
  }, [showVideo]);

  if (theme) {
    return (
      <View style={[styles.container, {backgroundColor: theme.bg}]}>
        {isDarkMode ? (
          <StatusBar backgroundColor={theme.bg} barStyle={'light-content'} />
        ) : (
          <StatusBar backgroundColor={theme.bg} barStyle={'dark-content'} />
        )}

        {showTipModule && (
          <View
            style={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: '85%',
              height: '40%',
              backgroundColor: theme.tip,
              borderRadius: 5,
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: 10,
              zIndex: 999,
            }}>
            <View
              style={{
                flexDirection: 'column',
                width: '100%',
                alignItems: 'center',
                gap: 3,
              }}>
              <Image
                source={require('../assets/tip.png')}
                style={{width: 90, height: 90}}
              />
              <Text
                style={{
                  fontSize: 21,
                  color: 'black',
                  fontFamily: theme.font2,
                }}>
                Tip of the day
              </Text>
            </View>
            <Text
              style={{
                fontSize: 14,
                color: 'black',
                fontFamily: theme.font4,
                width: '100%',
                textAlign: 'center',
              }}>
              {tip}
            </Text>
            <TouchableOpacity
              style={{
                width: '60%',
                borderWidth: 1,
                borderColor: 'black',
                height: 40,
                borderRadius: 32,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                bottom: 18,
              }}
              onPress={() => {
                setShowTipModule(false);
              }}>
              <Text
                style={{color: 'black', fontFamily: theme.font2, fontSize: 16}}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <Animated.View
          style={[
            styles.section,
            {
              paddingBottom: 7,
              paddingTop: 0,
              paddingBottom: 16,
              marginTop: margintop,
            },
          ]}>
          <TouchableOpacity
            onPress={() => userData && navigation.navigate('Profile', {uid: userData.uid})}>
            <View
              style={{
                flexDirection: 'row',
                gap: 7,
                alignItems: 'center',
                width: '80%',
                overflow: 'hidden',
              }}>
              {userData && userData.profileImg ? (
                <Image
                  source={{uri: userData.profileImg}}
                  style={{width: 42, height: 42, borderRadius: 21}}
                />
              ) : (
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: theme.bg2,
                  }}></View>
              )}
              <View
                style={{
                  flexDirection: 'column',
                  justifyContent: 'center',
                  width: '76%',
                }}>
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 14,
                    fontFamily: theme.font2,
                    opacity: 0.8,
                  }}>
                  {currentDate}
                </Text>
                {userData ? (
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 18,
                      width: '100%',
                      fontFamily: theme.font4,
                      height: 24,
                    }}>
                    {greeting +
                      (' ' + (userData ? userData.username : 'Guest'))}
                  </Text>
                ) : (
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 18,
                      width: '100%',
                      fontFamily: theme.font4,
                      height: 24,
                      opacity: 0.5,
                      borderRadius: 3,
                    }}>
                    ...
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: '12%',
              alignItems: 'center',
            }}
            onPress={() =>
              userData &&
              navigation.navigate('LeaderBoard', {uid: userData.uid})
            }>
            <Image
              source={
                isDarkMode
                  ? require('../assets/white_leaderboard.png')
                  : require('../assets/rank.png')
              }
              style={styles.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: '12%',
              alignItems: 'center',
            }}
            onPress={() => toggleTheme(!isDarkMode)}>
            <Image
              source={
                isDarkMode
                  ? require('../assets/dm.png')
                  : require('../assets/lm.png')
              }
              style={styles.icon}
            />
          </TouchableOpacity>
        </Animated.View>
        {showRequest && (
          <View
            style={{
              width: '100%',
              height: 40,
              backgroundColor: theme.bg3,
              borderRadius: 3,
              marginBottom: 5,
              alignItems: 'center',
              paddingHorizontal: 7,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
              <Text
                style={{
                  color: theme.text,
                  fontFamily: theme.font4,
                  fontSize: 14,
                }}>
                Grant Notification Permission
              </Text>
            </View>
            <TouchableOpacity
              style={{
                width: 90,
                height: 26,
                backgroundColor: theme.errorRed,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
              }}
              onPress={requestPermission}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 13,
                  fontFamily: theme.font2,
                }}>
                Grant
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <View
          style={{
            width: '100%',
            height: 32,
            backgroundColor: theme.bg3,
            borderRadius: 3,
            marginBottom: 5,
            alignItems: 'center',
            paddingHorizontal: 7,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
            <Text
              style={{
                color: theme.text,
                fontFamily: theme.font4,
                fontSize: 14,
              }}>
              You are currently in
            </Text>
            <Text
              style={{
                color: theme.text,
                fontFamily: theme.font2,
                fontSize: 14,
              }}>
              {leagueDetails && leagueDetails.leagueName
                ? leagueDetails.leagueName + ' League'
                : 'No League'}
            </Text>
          </View>
          {reducedValue && reducedValue.percentage && (
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
              <Text
                style={{
                  color:
                    reducedValue.status === 'decreased'
                      ? theme.successGreen
                      : reducedValue.status === 'increased'
                      ? theme.errorRed
                      : theme.text,
                  fontFamily: theme.font3,
                  fontSize: 14,
                  gap: 5,
                }}>
                {reducedValue.percentage + '%'}
              </Text>
              {reducedValue.status === 'increased' ? (
                <Image
                  source={require('../assets/increased.png')}
                  style={{width: 16, height: 16}}
                />
              ) : (
                <Image
                  source={require('../assets/decreased.png')}
                  style={{width: 16, height: 16}}
                />
              )}
            </View>
          )}
        </View>
        <View style={{width: '100%', height: '86%', alignItems: 'center'}}>
          <Animated.ScrollView
            style={{width: '100%'}}
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {y: scrollY}}}],
              {useNativeDriver: false, listener: handleScroll},
            )}
            scrollEventThrottle={16}>
            <View
              style={{
                width: '100%',
                height: 130,
                overflow: 'hidden',
                borderRadius: 5,
              }}>
              <ImageBackground
                source={{
                  uri: images[currentImageIndex],
                }}>
                <View
                  style={{
                    width: '100%',
                    height: 130,
                    borderRadius: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    padding: 15,
                    marginBottom: 10,
                    opacity: 0.9,
                  }}>
                  <View
                    style={{
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      width: '100%',
                    }}>
                    <Text
                      style={{
                        fontSize: 23,
                        color: 'red',
                        fontFamily: theme.font3,
                      }}>
                      Deadline
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: 'white',
                        fontFamily: theme.font2,
                      }}>
                      Time Left to Limit Global Warming to 1.5°C
                    </Text>
                    <Text
                      style={{
                        fontSize: 24,
                        color: 'white',
                        fontFamily: theme.font3,
                      }}>
                      <Text style={styles.time}>{`${timeLeft.years || '0'}yrs ${
                        timeLeft.days || '0'
                      }d ${timeLeft.hours || '00'}h ${
                        timeLeft.minutes || '00'
                      }m ${timeLeft.seconds || '00'}s`}</Text>
                    </Text>
                  </View>
                </View>
              </ImageBackground>
            </View>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginVertical: 7,
              }}>
              <View
                style={{
                  width: '36%',
                  height: 100,
                  backgroundColor: theme.footprint,
                  borderRadius: 5,
                  flexDirection: 'column',
                  padding: 10,
                  gap: 3,
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                    gap: 3,
                    height: 24,
                  }}>
                  <Image
                    source={require('../assets/footprint.png')}
                    style={{width: 20, height: 20}}
                  />
                  <Text
                    style={{
                      fontSize: 17,
                      color: theme.text,
                      fontFamily: theme.font2,
                    }}>
                    footprint
                  </Text>
                </View>
                <View style={{flexDirection: 'column'}}>
                  <Text
                    style={{
                      fontSize: 21,
                      color: theme.text,
                      fontFamily: theme.font2,
                    }}>
                    {val}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.text,
                      fontFamily: theme.font2,
                      opacity: 0.6,
                    }}>
                    kg CO2 e
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={{
                  width: '63%',
                  height: 100,
                  backgroundColor: theme.tip,
                  borderRadius: 5,
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  padding: 10,
                }}
                onPress={() => {
                  setShowTipModule(!showTipModule);
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                    alignItems: 'center',
                    gap: 3,
                    height: 24,
                  }}>
                  <Image
                    source={require('../assets/tip.png')}
                    style={{width: 20, height: 20}}
                  />
                  <Text
                    style={{
                      fontSize: 17,
                      color: theme.text,
                      fontFamily: theme.font2,
                    }}>
                    Tip of the day
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    color: theme.text,
                    fontFamily: theme.font4,
                    width: '100%',
                    height: 47,
                  }}>
                  {tip}
                </Text>
              </TouchableOpacity>
            </View>
            {userData && userData.uid === adminUid && (
              <View
                style={{
                  width: '100%',
                  height: 300,
                  backgroundColor: theme.bg3,
                  borderRadius: 12,
                  marginVertical: 10,
                  padding: 10,
                }}>
                <Text
                  style={{
                    fontSize: 18,
                    marginBottom: 7,
                    color: theme.text,
                    fontFamily: theme.font3,
                    textAlign: 'center',
                  }}>
                  {`Total Users ( ${users && users.length} )`}
                </Text>
                <ScrollView
                  nestedScrollEnabled
                  style={{width: '100%', height: 280}}>
                  <View>
                    {users &&
                      users.length > 0 &&
                      users.map(item => (
                        <View
                          style={{
                            width: '100%',
                            height: 78,
                            backgroundColor: 'white',
                            borderRadius: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 12,
                            marginBottom: 7,
                          }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 5,
                            }}>
                            <Image
                              source={{uri: item.profileImg}}
                              style={{width: 48, height: 48, borderRadius: 24}}
                            />
                            <View
                              style={{
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                width: '70%',
                              }}>
                              <Text
                                style={{
                                  fontSize: 15,
                                  color: theme.text,
                                  fontFamily: theme.font2,
                                  textAlign: 'center',
                                }}>
                                {item.username}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 13,
                                  color: theme.text,
                                  fontFamily: theme.font4,
                                  textAlign: 'center',
                                }}>
                                {item.email}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: theme.text,
                                  fontFamily: theme.font1,
                                  textAlign: 'center',
                                }}>
                                {'Member since : ' + item.member_since}
                              </Text>
                            </View>
                            <TouchableOpacity
                              style={{width: '10%'}}
                              onPress={() =>
                                navigation.navigate('Profile', {uid: item.uid})
                              }>
                              <Image
                                source={require('../assets/external.png')}
                                style={{width: 25, height: 25}}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                  </View>
                </ScrollView>
              </View>
            )}
            <View
              style={{
                width: '100%',
                padding: 10,
                height: 240,
                borderRadius: 5,
                backgroundColor: theme.bg3,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: theme.text,
                    fontFamily: theme.font2,
                    paddingBottom: 7,
                  }}>
                  Top News
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: theme.text,
                    fontFamily: theme.font2,
                    paddingBottom: 7,
                  }}>
                  Scroll for more
                </Text>
              </View>
              <FlatList
                data={articles}
                horizontal
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                  <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
                    <View
                      style={{
                        width: Dimensions.get('window').width - 40,
                        backgroundColor: theme.bg,
                        marginVertical: 5,
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}>
                      {item.urlToImage && (
                        <ImageBackground
                          source={{uri: item.urlToImage}}
                          style={{
                            width: '100%',
                            height: 180,
                            borderRadius: 3,
                            overflow: 'hidden',
                          }}>
                          <View
                            style={{
                              flexDirection: 'column',
                              alignItems: 'flex-end',
                              width: '100%',
                              padding: 10,
                              justifyContent: 'flex-end',
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                            }}>
                            <Text
                              style={{
                                color: 'white',
                                fontSize: 14,
                                fontFamily: theme.font2,
                                marginBottom: 7,
                              }}>
                              {item.title}
                            </Text>
                            <Text
                              style={{
                                color: 'black',
                                fontSize: 10,
                                fontFamily: theme.font2,
                                backgroundColor: '#f0f0f0',
                                padding: 7,
                                opacity: 0.7,
                                borderTopLeftRadius: 7,
                                borderBottomLeftRadius: 7,
                                borderBottomRightRadius: 7,
                              }}>
                              {item.description}
                            </Text>
                          </View>
                        </ImageBackground>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
                pagingEnabled
              />
            </View>

            <View style={{height: 360}}></View>
          </Animated.ScrollView>
        </View>
        <View style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
          <BottomNavigation />
        </View>
      </View>
    );
  }
};
export default Home;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    padding: 10,
  },
  videoContainer: {
    width: '100%',
    height: 80,
    overflow: 'hidden',
  },
  video: {
    width: '110%',
    height: 100,
    marginLeft: -10,
    marginRight: -10,
    marginTop: -10,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  section: {
    width: '100%',
    displat: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    width: 27,
    height: 27,
    objectFit: 'contain',
  },
  text: {
    color: 'black',
    height: 30,
    width: '100%',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
  },
  image: {
    width: 110,
    height: 90,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 72,
    borderRadius: 12,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: 72,
    borderRadius: 12,
  },
  overlay: {
    flex: 1,
    marginTop: 70,
  },
});
