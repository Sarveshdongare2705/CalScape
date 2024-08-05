import React, {useCallback, useContext, useEffect, useState} from 'react';
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
  TextInput,
} from 'react-native';
import BottomNavigation from '../components/BottomNavigation';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {LineChart, BarChart} from 'react-native-chart-kit';
import axios from 'axios';
import {ActivityIndicator} from 'react-native-paper';
import Leaderboard from './LeaderBoard';
import {calculateReduction} from '../utils/reductionUtils';
import {ThemeContext} from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Analytics = () => {
  const {theme, isDarkMode} = useContext(ThemeContext);
  const navigation = useNavigation();
  const route = useRoute();
  const {userId} = route.params;
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [val, setVal] = useState(null);
  const [prevFootprint, setPrevFootprint] = useState(null);
  const [footprintData, setFootprintData] = useState(null);
  const [others, setOthers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [lineChartData, setLineChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0, 0],
      },
    ],
  });
  const [barData, setBarData] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [reducedValue, setReducedValue] = useState({});
  const [barChartFootrpint, setBarChartFootrpint] = useState(0);
  const monthName = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const fetchFootprint = async uid => {
    setUploading(false);
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
      setFootprintData(data);
      const val =
        (data.basicDetails ? data.basicDetails : 0) +
        (data.recycleDetails ? data.recycleDetails : 0) +
        (data.travelDetails ? data.travelDetails : 0) +
        (data.electricityDetails ? data.electricityDetails : 0) +
        (data.energyDetails ? data.energyDetails : 0) +
        (data.foodDetails ? data.foodDetails : 0) +
        (data.clothingDetails ? data.clothingDetails : 0) +
        (data.extraDetails ? data.extraDetails : 0);
      setVal(val.toFixed(3));
      setBarChartFootrpint(val.toFixed(3));
      let val2 = 0;
      val2 += data.basicDetails ? data.basicDetails : 0;
      val2 += data.recycleDetails ? data.recycleDetails : 0;
      val2 += data.extraDetails ? data.extraDetails : 0;
      setOthers(val2);
    } else {
      setVal(0);
    }
    setUploading(false);
  };

  const fetchFootprintLineChart = async uid => {
    setUploading(true);
    const currentTime = new Date();
    const currentMonth = currentTime.getMonth() + 1;
    const currentYear = currentTime.getFullYear();

    const months = [];
    const data = [];

    for (let i = 0; i < 8; i++) {
      let month = currentMonth - i;
      let year = currentYear;

      if (month <= 0) {
        month += 12;
        year -= 1;
      }

      const docId = `${month}-${year}`;
      const monthNum = `${month}`;
      const footprintRef = firestore()
        .collection('Users')
        .doc(uid)
        .collection('Footprint')
        .doc(docId);

      const doc = await footprintRef.get();
      if (doc.exists) {
        const footprintData = doc.data();
        const total =
          (footprintData.basicDetails || 0) +
          (footprintData.recycleDetails || 0) +
          (footprintData.travelDetails || 0) +
          (footprintData.electricityDetails || 0) +
          (footprintData.energyDetails || 0) +
          (footprintData.foodDetails || 0) +
          (footprintData.clothingDetails || 0) +
          (footprintData.extraDetails || 0);

        months.unshift(monthName[monthNum - 1]);
        data.unshift(total.toFixed(3));
      } else {
        months.unshift(monthName[monthNum - 1]);
        data.unshift(0);
      }
    }
    return {
      labels: months,
      datasets: [
        {
          data: data,
        },
      ],
    };
  };

  const fetchBarChartData = async (uid, month, year) => {
    try {
      const docId = `${month}-${year}`;
      const footprintRef = firestore()
        .collection('Users')
        .doc(uid)
        .collection('Footprint')
        .doc(docId);

      const doc = await footprintRef.get();
      if (doc.exists) {
        const data = doc.data();
        const total =
          (data.basicDetails || 0) +
          (data.recycleDetails || 0) +
          (data.travelDetails || 0) +
          (data.electricityDetails || 0) +
          (data.energyDetails || 0) +
          (data.foodDetails || 0) +
          (data.clothingDetails || 0) +
          (data.extraDetails || 0);

        setBarChartFootrpint(total.toFixed(3));
        const barData = {
          labels: [
            'Travel',
            'Electricity',
            'Energy',
            'Food',
            'Clothes',
            'Others',
          ],
          datasets: [
            {
              data: [
                data.travelDetails || 0,
                data.electricityDetails || 0,
                data.energyDetails || 0,
                data.foodDetails || 0,
                data.clothingDetails || 0,
                (data.basicDetails || 0) +
                  (data.recycleDetails || 0) +
                  (data.extraDetails || 0),
              ],
            },
          ],
        };
        return barData;
      } else {
        setBarChartFootrpint(0);
        return null;
      }
    } catch (error) {
      console.error('Error fetching bar chart data:', error);
      return null;
    }
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = auth().onAuthStateChanged(async user => {
        if (user) {
          const currentTime = new Date();
          const currentMonth = currentTime.getMonth();
          const currentYear = currentTime.getFullYear();
          setMonth(monthName[currentMonth]);
          setYear(currentYear.toString());
          setCurrentUser(user);

          const userDetails = await AsyncStorage.getItem('userData');
          if (userDetails) {
            const parsedUserDetails = JSON.parse(userDetails);
            console.log('user details', parsedUserDetails);
            setUserData(parsedUserDetails);
            const uid = parsedUserDetails.uid;

            fetchFootprint(uid);
            // Line Chart
            const lineChartUpdated = await AsyncStorage.getItem(
              'lineChartUpdated',
            );
            if (lineChartUpdated === 'false') {
              const lineData = await AsyncStorage.getItem('lineChartData');
              setLineChartData(JSON.parse(lineData));
            } else {
              const data = await fetchFootprintLineChart(uid);
              await AsyncStorage.setItem('lineChartData', JSON.stringify(data));
              await AsyncStorage.setItem('lineChartUpdated', 'false');
              setLineChartData(data);
            }

            // Bar Chart
            const barChartUpdated = await AsyncStorage.getItem(
              'barChartUpdated',
            );
            if (barChartUpdated === 'false') {
              const barData = await AsyncStorage.getItem('barChartData');
              console.log('saved bar chart data', barData);
              setBarData(JSON.parse(barData));
            } else {
              const data = await fetchBarChartData(
                uid,
                currentMonth + 1,
                currentYear,
              );
              if (data) {
                await AsyncStorage.setItem(
                  'barChartData',
                  JSON.stringify(data),
                );
                await AsyncStorage.setItem('barChartUpdated', 'false');
                setBarData(data);
              }
            }

            const result = await calculateReduction(uid);
            setReducedValue(result);
          }
          setUploading(false);
        } else {
          await AsyncStorage.removeItem('lineChartUpdated');
          await AsyncStorage.removeItem('barChartUpdated');
        }
      });
      return unsubscribe;
    }, [userData && userData.uid]),
  );

  const handleMonthChange = async month => {
    setMonth(month);
    setShowMenu(false);
    if (month && year) {
      const data = await fetchBarChartData(
        userData.uid,
        monthName.indexOf(month) + 1,
        year,
      );
      if (data) {
        setBarData(data);
      } else {
        setBarData(null);
      }
    }
  };

  const handleYearChange = async year => {
    setYear(year);
    if (month && year) {
      const data = await fetchBarChartData(
        userData.uid,
        monthName.indexOf(month) + 1,
        year,
      );
      if (data) {
        setBarData(data);
      } else {
        setBarData(null);
      }
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.bg}]}>
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'flex-start',
          width: '100%',
        }}>
        {uploading ? (
          <ActivityIndicator color={theme.text} size={20} />
        ) : (
          <Text
            style={{
              fontSize: 20,
              color: theme.text,
              fontFamily: theme.font2,
            }}>
            Analytics
          </Text>
        )}
        <ScrollView
          style={{
            width: '100%',
            height: '90%',
          }}>
          <View style={{width: '100%'}}>
            <View
              style={{
                width: '100%',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: 20,
              }}>
              <View
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: 80,
                  overflow: 'hidden',
                  shadowColor:
                    reducedValue.status === 'increased'
                      ? theme.errorRed
                      : reducedValue.status === 'decreased'
                      ? theme.successGreen
                      : theme.text === 'white'
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(0, 0, 0, 0.2)',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 1,
                  shadowRadius: 80, // Increased for better visibility
                  elevation: 120,
                  backgroundColor: theme.bg3,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.85,
                }}>
                <Text
                  style={{
                    color:
                      reducedValue.status === 'increased'
                        ? theme.errorRed
                        : reducedValue.status === 'decreased'
                        ? theme.successGreen
                        : theme.text,
                    fontFamily: theme.font3,
                    fontSize: 40,
                  }}>
                  {(reducedValue.percentage ? reducedValue.percentage : '_') +
                    '%'}
                </Text>
              </View>

              <Text
                style={{
                  color: theme.text,
                  fontFamily: theme.font4,
                  fontSize: 14,
                  textAlign: 'center',
                  paddingHorizontal: 7,
                  borderRadius: 10,
                  paddingVertical: 12,
                }}>
                {reducedValue.status === 'decreased'
                  ? `You've reduced your footprint by ${reducedValue.percentage}% (${reducedValue.value} kgCO2e) compared to last month. Keep up the good work! Consider exploring more tips and challenges to further reduce your impact on the planet.`
                  : reducedValue.status === 'increased'
                  ? `Your footprint has increased by ${reducedValue.percentage}% (${reducedValue.value} kgCO2e) compared to last month. Let's analyze and adjust! Remember, small changes can make a big difference. Explore ways to reduce your impact and contribute to a sustainable future.`
                  : 'Your previous month data is currently unavailable. This may be due to no track of your activities in last month or a new user.'}
              </Text>
              <TouchableOpacity
                style={{
                  width: '60%',
                  height: 42,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 30,
                  backgroundColor: theme.bg3,
                  marginBottom: 10,
                  opacity: 0.85,
                }}
                onPress={() =>
                  navigation.navigate('Survey', {uid: userData.uid})
                }>
                <Text
                  style={{
                    color: theme.text,
                    fontFamily: theme.font2,
                    fontSize: 16,
                  }}>
                  Take a Survey Now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text
            style={{
              color: theme.text,
              fontFamily: theme.font4,
              fontSize: 14,
            }}>
            Footprint value of last 8 months
          </Text>
          <LineChart
            data={lineChartData}
            width={Dimensions.get('window').width - 24}
            height={200}
            yAxisSuffix=""
            yAxisInterval={1}
            chartConfig={{
              backgroundGradientFrom: theme.footprint,
              backgroundGradientTo: theme.footprint,
              decimalPlaces: 0,
              color: (opacity = 1) => `#76B041`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 5,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: 'white',
              },
              propsForLabels: {
                fontFamily: theme.font2,
                padding: 5,
              },
              propsForBackgroundLines: {
                opacity: 0.3,
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 3,
            }}
          />
          <Text
            style={{
              fontSize: 14,
              color: theme.text,
              fontFamily: theme.font4,
              marginBottom: 5,
            }}>
            Footprint value distribution
          </Text>
          <View
            style={{
              width: '100%',
              height: 38,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity
              style={{width: '65%', alignItems: 'center'}}
              onPress={() => {
                setShowMenu(!showMenu);
              }}>
              <TextInput
                style={{
                  width: '100%',
                  height: 36,
                  backgroundColor: theme.bg4,
                  color: theme.text,
                  paddingHorizontal: 12,
                  fontSize: 14,
                  fontFamily: theme.font4,
                  borderRadius: 3,
                  paddingVertical: 9,
                }}
                placeholder="Select month"
                placeholderTextColor="black"
                editable={false}
                value={month}
              />
            </TouchableOpacity>
            {showMenu && (
              <View
                style={{
                  width: '65%',
                  height: 200,
                  position: 'absolute',
                  backgroundColor: theme.bg4,
                  padding: 12,
                  top: 40,
                  left: 0,
                  flexDirection: 'column',
                  borderRadius: 3,
                  zIndex: 999,
                }}>
                <ScrollView
                  style={{width: '100%', height: 190}}
                  nestedScrollEnabled>
                  {monthName.map(month => (
                    <TouchableOpacity
                      key={month}
                      style={{width: '100%', height: 25}}
                      onPress={() => {
                        handleMonthChange(month);
                      }}>
                      <Text
                        style={{
                          color: theme.text,
                          fontSize: 15,
                          fontFamily: theme.font2,
                          marginVertical: 3,
                        }}>
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            <TextInput
              style={{
                width: '33%',
                height: 36,
                backgroundColor: theme.bg4,
                color: theme.text,
                paddingHorizontal: 12,
                fontSize: 14,
                fontFamily: theme.font4,
                borderRadius: 3,
                paddingVertical: 7,
              }}
              placeholder="Year"
              placeholderTextColor={theme.text}
              keyboardType="numeric"
              value={year}
              onChangeText={handleYearChange}
            />
          </View>
          <View
            style={{
              width: '100%',
              height: 60,
              backgroundColor: theme.footprint,
              borderRadius: 5,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              padding: 15,
              marginVertical: 7,
            }}>
            <Image
              source={require('../assets/footprint.png')}
              style={{width: 30, height: 30}}
            />
            <View
              style={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: '75%',
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.text,
                  fontFamily: theme.font2,
                }}>
                {month + ' ' + year + ' Footprint'}
              </Text>
              <Text
                style={{
                  fontSize: 21,
                  color: theme.text,
                  fontFamily: theme.font3,
                }}>
                {barChartFootrpint + ' kg CO2 e'}
              </Text>
            </View>
          </View>
          {barData ? (
            <BarChart
              data={barData}
              width={Dimensions.get('window').width - 24}
              height={225}
              yAxisLabel=""
              chartConfig={{
                backgroundGradientFrom: '#FFCE54',
                backgroundGradientTo: '#F6BB42',
                decimalPlaces: 1,
                color: (opacity = 1) => 'black', // Constant color for all bars
                labelColor: (opacity = 0.5) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForLabels: {
                  fontFamily: theme.font2,
                  fontSize: 10,
                },
                propsForBackgroundLines: {
                  opacity: 0.1,
                },
              }}
              style={{
                borderRadius: 7,
              }}
              verticalContentInset={{top: 10, bottom: 10}}
              horizontalContentInset={{left: 20, right: 50}}
            />
          ) : (
            <Text
              style={{
                color: theme.text,
                fontFamily: theme.font4,
                fontSize: 14,
                marginVertical: 10,
              }}>
              No data available
            </Text>
          )}
          <View style={{height: 200}}></View>
        </ScrollView>
      </View>
      <View style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
        <BottomNavigation />
      </View>
    </View>
  );
};

export default Analytics;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    padding: 12,
  },
  icon: {
    width: 21,
    height: 21,
    objectFit: 'contain',
  },
});
