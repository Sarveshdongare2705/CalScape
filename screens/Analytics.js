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
} from 'react-native';
import BottomNavigation from '../components/BottomNavigation';
import {colors} from '../Colors';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {LineChart, BarChart} from 'react-native-chart-kit';
import axios from 'axios';
import {ActivityIndicator} from 'react-native-paper';
import Leaderboard from './LeaderBoard';

const Analytics = () => {
  const navigcation = useNavigation();
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [val, setVal] = useState(0);
  const [footprintData, setFootprintData] = useState(null);
  const [others, setOthers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lineChartData, setLineChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0 , 0 , 0],
      },
    ],
  });
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

  const fetchUserData = async user => {
    setLoading(true);
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

  //footprint
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
      let val2 = 0;
      val2 += data.basicDetails ? data.basicDetails : 0;
      val2 += data.recycleDetails ? data.recycleDetails : 0;
      val2 += data.extraDetails ? data.extraDetails : 0;
      setOthers(val2);
    } else {
      setVal(0);
    }
  };

  //line data
  const fetchFootprintLineChart = async uid => {
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
          (footprintData.basicDetails ? footprintData.basicDetails : 0) +
          (footprintData.recycleDetails ? footprintData.recycleDetails : 0) +
          (footprintData.travelDetails ? footprintData.travelDetails : 0) +
          (footprintData.electricityDetails
            ? footprintData.electricityDetails
            : 0) +
          (footprintData.energyDetails ? footprintData.energyDetails : 0) +
          (footprintData.foodDetails ? footprintData.foodDetails : 0) +
          (footprintData.clothingDetails ? footprintData.clothingDetails : 0) +
          (footprintData.extraDetails ? footprintData.extraDetails : 0);

        months.unshift(monthName[monthNum - 1]); // Add month-year to the beginning of the array
        data.unshift(total.toFixed(3)); // Add total footprint to the beginning of the array
      } else {
        // If data for the month doesn't exist, add 0
        months.unshift(monthName[monthNum - 1]); // Add month-year to the beginning of the array
        data.unshift(0); // Add 0 to the beginning of the array
      }
      setLoading(false);
    }

    // Set state with the formatted data for LineChart
    setLineChartData({
      labels: months,
      datasets: [
        {
          data: data,
        },
      ],
    });
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = auth().onAuthStateChanged(async user => {
        if (user) {
          setCurrentUser(user);
          const userDetails = await fetchUserData(user);
          setUserData(userDetails);
          fetchFootprint(userDetails.uid);
          fetchFootprintLineChart(userDetails.uid);
        }
      });
      return unsubscribe;
    }, []),
  );

  const barData = {
    labels: ['Travel', 'Electricity', 'Energy', 'Food', 'Clothes', 'Others'],
    datasets: [
      {
        data: [
          footprintData && footprintData.travelDetails
            ? footprintData.travelDetails
            : 0,
          footprintData && footprintData.electricityDetails
            ? footprintData.electricityDetails
            : 0,
          footprintData && footprintData.energyDetails
            ? footprintData.energyDetails
            : 0,
          footprintData && footprintData.foodDetails
            ? footprintData.foodDetails
            : 0,
          footprintData && footprintData.clothingDetails
            ? footprintData.clothingDetails
            : 0,
          others,
        ],
      },
    ],
  };

  if (loading) {
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          gap: 10,
        }}>
        <ActivityIndicator color="black" size={24} />
        <Text style={{color: 'black', fontFamily: colors.font4, fontSize: 14}}>
          Fetching Analytics
        </Text>
        <View style={{position: 'absolute', bottom: 0, left: 5, right: 5}}>
          <BottomNavigation />
        </View>
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'flex-start',
            width: '100%',
          }}>
          <Text
            style={{
              fontSize: 20,
              color: 'black',
              fontFamily: colors.font2,
            }}>
            Analytics
          </Text>
          <ScrollView
            style={{
              width: '100%',
              height: '90%',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                marginVertical: 10,
              }}>
              <TouchableOpacity
                style={{
                  width: '49%',
                  height: 40,
                  backgroundColor: colors.bg2,
                  borderRadius: 7,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: 7,
                }}
                onPress={() =>
                  navigcation.navigate('Survey', {
                    uid: currentUser.uid,
                    Route: 'Home',
                  })
                }>
                <Image
                  source={require('../assets/survey.png')}
                  style={styles.icon}
                />
                <Text
                  style={{
                    color: 'black',
                    fontSize: 18,
                    fontFamily: colors.font2,
                  }}>
                  Take a Survey!
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: '49%',
                  height: 40,
                  backgroundColor: colors.bg2,
                  borderRadius: 7,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: 7,
                }}
                onPress={() =>
                  navigcation.navigate('LeaderBoard' , {uid : userData.uid})
                }>
                <Image
                  source={require('../assets/leaderboard.png')}
                  style={styles.icon}
                />
                <Text
                  style={{
                    color: 'black',
                    fontSize: 18,
                    fontFamily: colors.font2,
                  }}>
                  LeaderBoard
                </Text>
              </TouchableOpacity>
            </View>
            <Text
              style={{
                fontSize: 14,
                color: 'black',
                fontFamily: colors.font4,
              }}>
              Last 8 months footprint values (kg CO2 e)
            </Text>
            <LineChart
              data={lineChartData}
              width={Dimensions.get('window').width - 24}
              height={180}
              yAxisSuffix=""
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: '#e26a00',
                backgroundGradientFrom: '#fb8c00',
                backgroundGradientTo: '#ffa726',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: colors.p,
                },
                propsForLabels: {
                  fontFamily: colors.font2,
                  padding: 5,
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 7,
              }}
            />
            <Text
              style={{
                fontSize: 14,
                color: 'black',
                fontFamily: colors.font4,
                marginVertical : 7,
              }}>
              Current footprint value distribution
            </Text>
            <BarChart
              data={barData}
              width={Dimensions.get('window').width - 24}
              height={420}
              yAxisLabel=""
              chartConfig={{
                backgroundColor: '#e26a00',
                backgroundGradientFrom: colors.p,
                backgroundGradientTo: colors.p,
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForLabels: {
                  fontFamily: colors.font2,
                },
              }}
              verticalLabelRotation={90}
              style={{
                borderRadius: 7,
              }}
              verticalContentInset={{top: 10, bottom: 10}} // Adjust top and bottom padding
              horizontalContentInset={{left: 20, right: 50}} // Adjust left and right padding
            />
            <View style={{height: 200}}></View>
          </ScrollView>
        </View>
        <View style={{position: 'absolute', bottom: 0, left: 5, right: 5}}>
          <BottomNavigation />
        </View>
      </View>
    );
  }
};
export default Analytics;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.bg,
    flexDirection: 'column',
    padding: 12,
  },
  icon: {
    width: 24,
    height: 24,
    objectFit: 'contain',
  },
});
