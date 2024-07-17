import React, {useCallback, useEffect, useState} from 'react';
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
} from 'react-native';
import BottomNavigation from '../components/BottomNavigation';
import {colors} from '../Colors';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {LineChart} from 'react-native-chart-kit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Leaderboard from './LeaderBoard';
import QuizScreen from './QuizScreen';
import YoutubeIframe from 'react-native-youtube-iframe';
import WeatherInMumbai from '../components/Weather';
import determineLeague, {calculateReduction} from '../utils/reductionUtils';
import { fetchAndUpdateFootprint } from '../utils/footrpintUtils';

const Home = () => {
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

  //news section
  const fetchNews = async () => {
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: 'climate change',
          apiKey: 'fd5bd50e5c2342eb938ba2c6ca9e558c',
        },
      });
      if (response.data.articles) {
        setArticles(response.data.articles);
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
        if (user) {
          await AsyncStorage.setItem('uid', user.uid);
          fetchAllUsers();
          fetchAdmin();
          setCurrentUser(user);
          const userDetails = await fetchUserData(user);
          const result = await calculateReduction(userDetails.uid);
          const result2 = await determineLeague(userDetails.uid);
          setLeagueDetails(result2);
          setReducedValue(result);
          setUserData(userDetails);
          fetchFootprint(userDetails.uid);
          fetchNews();
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

  //update video id
  const updateVideoId = async () => {
    try {
      setIdUpdaing(true);
      const docRef = firestore().collection('Video').doc('video2');
      await docRef.update({
        id: id,
      });
    } catch (error) {
      console.error('Error updating video id: ', error);
    }
    setIdUpdaing(false);
  };

  const [showTipModule, setShowTipModule] = useState(false);

  return (
    <View style={styles.container}>
      {showTipModule && (
        <View
          style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '85%',
            height: '40%',
            backgroundColor: colors.tip,
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
                fontFamily: colors.font2,
              }}>
              Tip of the day
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              color: 'black',
              fontFamily: colors.font4,
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
              style={{color: 'black', fontFamily: colors.font2, fontSize: 16}}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <StatusBar backgroundColor={'white'} barStyle={'dark-content'} />
      <View style={[styles.section, {paddingBottom: 7}]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile', {uid: userData.uid})}>
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
                  backgroundColor: colors.bg2,
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
                  color: 'black',
                  fontSize: 14,
                  fontFamily: colors.font2,
                  opacity: 0.8,
                }}>
                {currentDate}
              </Text>
              {userData ? (
                <Text
                  style={{
                    color: 'black',
                    fontSize: 18,
                    width: '100%',
                    fontFamily: colors.font4,
                    height: 24,
                  }}>
                  {greeting + (' ' + (userData ? userData.username : 'Guest'))}
                </Text>
              ) : (
                <Text
                  style={{
                    color: 'black',
                    fontSize: 18,
                    width: '100%',
                    fontFamily: colors.font4,
                    height: 24,
                    backgroundColor: '#f0f0f9',
                    opacity: 0.5,
                    borderRadius: 3,
                  }}></Text>
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
            userData && navigation.navigate('LeaderBoard', {uid: userData.uid})
          }>
          <Image source={require('../assets/rank.png')} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: '12%',
            alignItems: 'center',
          }}>
          <Image
            source={require('../assets/bellIcon.png')}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
      <View
        style={{
          width: '100%',
          height: 32,
          backgroundColor: '#f0f0f9',
          borderRadius: 3,
          marginBottom: 5,
          alignItems: 'center',
          paddingHorizontal: 7,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
          <Text
            style={{color: 'black', fontFamily: colors.font4, fontSize: 14}}>
            You are currently in
          </Text>
          <Text
            style={{color: 'black', fontFamily: colors.font2, fontSize: 14}}>
            {leagueDetails.leagueName
              ? leagueDetails.leagueName + ' League'
              : 'No League'}
          </Text>
        </View>
        {reducedValue.percentage && (
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
            <Text
              style={{
                color:
                  reducedValue.status === 'decreased'
                    ? colors.successGreen
                    : reducedValue.status === 'increased'
                    ? colors.errorRed
                    : 'black',
                fontFamily: colors.font3,
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
        <ScrollView style={{width: '100%'}}>
          <View
            style={{
              width: '100%',
              height: 120,
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
                  height: 120,
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
                      fontFamily: colors.font3,
                    }}>
                    Deadline
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: 'white',
                      fontFamily: colors.font2,
                    }}>
                    Time Left to Limit Global Warming to 1.5°C
                  </Text>
                  <Text
                    style={{
                      fontSize: 24,
                      color: 'white',
                      fontFamily: colors.font3,
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
                backgroundColor: colors.footprint,
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
                    color: 'black',
                    fontFamily: colors.font2,
                  }}>
                  footprint
                </Text>
              </View>
              <View style={{flexDirection: 'column'}}>
                <Text
                  style={{
                    fontSize: 21,
                    color: 'black',
                    fontFamily: colors.font2,
                  }}>
                  {val}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: 'black',
                    fontFamily: colors.font2,
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
                backgroundColor: colors.tip,
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
                    color: 'black',
                    fontFamily: colors.font2,
                  }}>
                  Tip of the day
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 13,
                  color: 'black',
                  fontFamily: colors.font4,
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
                backgroundColor: '#f0f0f0',
                borderRadius: 12,
                marginVertical: 10,
                padding: 10,
              }}>
              <Text
                style={{
                  fontSize: 18,
                  marginBottom: 7,
                  color: 'black',
                  fontFamily: colors.font3,
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
                                color: 'black',
                                fontFamily: colors.font2,
                                textAlign: 'center',
                              }}>
                              {item.username}
                            </Text>
                            <Text
                              style={{
                                fontSize: 13,
                                color: 'black',
                                fontFamily: colors.font4,
                                textAlign: 'center',
                              }}>
                              {item.email}
                            </Text>
                            <Text
                              style={{
                                fontSize: 12,
                                color: 'black',
                                fontFamily: colors.font1,
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
          {userData && <WeatherInMumbai userData={userData} />}
          <View
            style={{
              width: '100%',
              padding: 10,
              height: 360,
              borderRadius: 5,
              backgroundColor: '#f0f0f9',
            }}>
            <Text
              style={{
                fontSize: 18,
                color: 'black',
                fontFamily: colors.font2,
                paddingBottom: 7,
              }}>
              Top News
            </Text>
            <ScrollView
              style={{width: '100%', height: 340}}
              nestedScrollEnabled>
              {articles.map((article, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => Linking.openURL(article.url)}>
                  <View
                    style={{
                      width: '100%',
                      backgroundColor: colors.bg,
                      marginVertical: 5,
                      borderRadius: 3,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    }}>
                    {article.urlToImage && (
                      <ImageBackground
                        source={{uri: article.urlToImage}}
                        style={{
                          width: '100%',
                          height: 150,
                          borderRadius: 3,
                          overflow: 'hidden', // ensure the borderRadius is applied
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
                              fontFamily: colors.font2,
                            }}>
                            {article.title}
                          </Text>
                          <Text
                            style={{
                              color: 'white',
                              fontSize: 10,
                              fontFamily: colors.font2,
                              marginBottom: 5,
                            }}>
                            {formatDate(article.publishedAt)}
                          </Text>
                          <Text
                            style={{
                              color: 'black',
                              fontSize: 10,
                              fontFamily: colors.font2,
                              backgroundColor: '#f0f0f0',
                              padding: 7,
                              opacity: 0.7,
                              borderTopLeftRadius: 7,
                              borderTopRightRadius: 0,
                              borderBottomLeftRadius: 7,
                              borderBottomRightRadius: 7,
                            }}>
                            {article.description}
                          </Text>
                        </View>
                      </ImageBackground>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={{height: 100}}></View>
        </ScrollView>
      </View>
      <View style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
        <BottomNavigation />
      </View>
    </View>
  );
};
export default Home;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.bg,
    flexDirection: 'column',
    padding: 10,
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
  button: {
    width: 140,
    height: 140,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 5,
    marginRight: 10,
    shadowColor: 'gray',
    shadowOffset: {width: 2, height: 20},
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
    backgroundColor: colors.bg,
    borderRadius: 12,
    marginLeft: 5,
    marginTop: 12,
    justifyContent: 'space-between',
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
});
