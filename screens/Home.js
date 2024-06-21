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
} from 'react-native';
import BottomNavigation from '../components/BottomNavigation';
import {colors} from '../Colors';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {LineChart} from 'react-native-chart-kit';
import axios from 'axios';

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
  const [show , setShow] = useState(true);

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
      }
    } catch (error) {
      console.error('Error fetching random tip:', error);
    }
  };

  useEffect(() => {
    fetchRandomTip();

    const checkMidnight = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        fetchRandomTip();
      }
    };

    const intervalId = setInterval(checkMidnight, 60000);

    return () => clearInterval(intervalId);
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
          setCurrentUser(user);
          const userDetails = await fetchUserData(user);
          setUserData(userDetails);
          fetchFootprint(userDetails.uid);
          fetchNews();
        }
      });
      return unsubscribe;
    }, []),
  );
  return (
    <View style={styles.container}>
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
            <Image
              source={
                userData && userData.profileImg
                  ? {uri: userData.profileImg}
                  : require('../assets/profileImg.png')
              }
              style={{width: 42, height: 42, borderRadius: 21}}
            />
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'center',
                width: '75%',
              }}>
              <Text
                style={{
                  color: 'black',
                  fontSize: 15,
                  fontFamily: colors.font2,
                  opacity: 0.8,
                }}>
                {currentDate}
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontSize: 21,
                  width: '100%',
                  fontFamily: colors.font4,
                  height: 30,
                }}>
                {greeting + (' ' + (userData ? userData.username : 'Guest'))}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: '10%',
            alignItems: 'center',
          }}
          onPress={() =>
            navigation.navigate('LeaderBoard', {uid: userData.uid})
          }>
          <Image source={require('../assets/rank.png')} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: '10%',
            alignItems: 'center',
          }}>
          <Image
            source={require('../assets/bellIcon.png')}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
      <View style={{width: '100%', height: '86%', alignItems: 'center'}}>
        <TouchableOpacity>
          <View style={{width: '100%', height: 150 , overflow : 'hidden' , borderRadius : 10}}>
          <ImageBackground
            source={{
              uri: 'https://www.powermag.com/wp-content/uploads/2015/12/PWR_120115_GM_Fig3.jpg',
            }}>
            <View
              style={{
                width: '100%',
                height: 150,
                borderRadius: 10,
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
                    fontSize: 24,
                    color: 'red',
                    fontFamily: colors.font3,
                  }}>
                  Deadline
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    color: 'white',
                    fontFamily: colors.font2,
                  }}>
                  Time Left to Limit Global Warming to 1.5°C
                </Text>
                <Text
                  style={{
                    fontSize: 25,
                    color: 'white',
                    fontFamily: colors.font3,
                    paddingVertical: 5,
                  }}>
                  <Text style={styles.time}>{`${timeLeft.years || '0'}yrs ${
                    timeLeft.days || '0'
                  }d ${timeLeft.hours || '00'}h ${timeLeft.minutes || '00'}m ${
                    timeLeft.seconds || '00'
                  }s`}</Text>
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>
        </TouchableOpacity>
        <ScrollView style={{width: '100%'}}>
          <View
            style={{
              width: '100%',
              height: 100,
              backgroundColor: '#228B22',
              opacity: 0.8,
              borderRadius: 7,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              padding: 15,
              marginVertical: 10,
            }}>
            <Image
              source={require('../assets/footprint.png')}
              style={{width: 60, height: 66}}
            />
            <View
              style={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: '75%',
              }}>
              <Text
                style={{
                  fontSize: 20,
                  color: 'black',
                  fontFamily: colors.font2,
                }}>
                Current footprint
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  color: 'black',
                  fontFamily: colors.font3,
                }}>
                {val} kg CO2 e
              </Text>
            </View>
          </View>
          <View
            style={{
              width: '100%',
              height: 140,
              backgroundColor: 'orange',
              opacity: 0.8,
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              padding: 15,
            }}>
            <Image
              source={require('../assets/tip.png')}
              style={{width: 66, height: 66}}
            />
            <View
              style={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: '75%',
              }}>
              <Text
                style={{
                  fontSize: 20,
                  color: 'black',
                  fontFamily: colors.font2,
                }}>
                Tip of the day!
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: 'black',
                  fontFamily: colors.font4,
                }}>
                {tip}
              </Text>
            </View>
          </View>
          <View
            style={{
              width: '100%',
              padding: 10,
              height: 360,
              marginVertical: 10,
              borderRadius: 10,
              backgroundColor: 'rgba(0,0,0,0.1)',
            }}>
            <Text
              style={{
                fontSize: 20,
                color: 'black',
                fontFamily: colors.font2,
                paddingBottom: 10,
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
                      padding: 10,
                      borderRadius: 7,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    }}>
                    {article.urlToImage && (
                      <Image
                        source={{uri: article.urlToImage}}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 7,
                          objectFit: 'contain',
                        }}
                      />
                    )}
                    <View
                      style={{
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        width: '80%',
                      }}>
                      <Text
                        style={{
                          color: 'black',
                          fontSize: 13,
                          fontFamily: colors.font2,
                        }}>
                        {article.title}
                      </Text>
                      <Text
                        style={{
                          color: 'gray',
                          fontSize: 10,
                          fontFamily: colors.font1,
                        }}>
                        {article.publishedAt}
                      </Text>
                      <Text
                        style={{
                          color: 'black',
                          fontSize: 11,
                          fontFamily: colors.font4,
                        }}>
                        {article.description}
                      </Text>
                    </View>
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
    padding: 12,
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
