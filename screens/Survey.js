import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import BottomNavigation from '../components/BottomNavigation';
import {ActivityIndicator} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import {fetchAndUpdateFootprint} from '../utils/footrpintUtils';
import { ThemeContext } from '../context/ThemeContext';

const Survey = () => {
  const {theme , isDarkMode} = useContext(ThemeContext);
  const route = useRoute();
  const {uid, Route} = route.params;
  console.log('welcome to survey page : ', uid, Route);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSucess] = useState(false);
  const [showMsg, setShowMsg] = useState(true);
  useFocusEffect(
    React.useCallback(() => {
      setShowMsg(true);
      const timer = setTimeout(() => {
        setShowMsg(false);
      }, 5000);
      return () => clearTimeout(timer);
    }, []),
  );

  const [reducedValue, setReducedValue] = useState({value: null, status: null});
  const [val, setVal] = useState(null);
  const [prevFootprint, setPrevFootprint] = useState(null);
  const calculateReduction = (val, prevFootprint) => {
    console.log('values', val, prevFootprint);
    if (parseInt(val) <= parseInt(prevFootprint)) {
      const reductionPercentage =
        100 - (parseInt(val) / parseInt(prevFootprint)) * 100;
      setReducedValue({
        value: reductionPercentage.toFixed(2),
        status: 'decreased',
      });
    } else {
      // Calculate increase percentage when val is greater than prevFootprint
      const increasePercentage =
        ((parseInt(val) - parseInt(prevFootprint)) / parseInt(prevFootprint)) *
        100;
      setReducedValue({
        value: increasePercentage.toFixed(2),
        status: 'increased',
      });
    }

    const currentTime = new Date();
    const timestamp = {
      month: currentTime.getMonth() + 1,
      year: currentTime.getFullYear(),
    };
    //store in firebase
    const docId = `${timestamp.month}-${timestamp.year}`;
    const reductionRef = firestore()
      .collection('Users')
      .doc(uid)
      .collection('reductions')
      .doc(docId);

    reductionRef
      .set(reducedValue)
      .then(() => {
        console.log('Reduction data stored successfully.');
      })
      .catch(error => {
        console.error('Error storing reduction data: ', error);
      });
  };

  const updateFootprint = async () => {
    await fetchAndUpdateFootprint(uid);
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
  }, []);

  return (
    <View style={styles.container}>
      {showMsg && Route && (
        <View style={[styles.msg, {backgroundColor: theme.bg2, zIndex: 999}]}>
          <Text style={styles.msgtxt}>{Route + ' updated !'}</Text>
        </View>
      )}
      <View style={{position: 'absolute', zIndex: 999, top: 12, left: 12}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../assets/backButton.png')}
            style={{width: 27, height: 27}}
          />
        </TouchableOpacity>
      </View>
      <View style={{width: '100%', height: 250}}>
        <Image
          source={require('../assets/update2.png')}
          style={{
            width: '100%',
            height: 200,
            objectFit: 'contain',
            marginBottom: 0,
          }}
        />
        <View style={styles.section1}>
          <View style={{width: '100%', alignItems: 'center'}}>
            <Text
              style={{
                color: 'black',
                fontSize: 22,
                textAlign: 'center',
                fontFamily: theme.font2,
              }}>
              Update Your Data
            </Text>
            <Text
              style={{
                color: 'gray',
                fontSize: 14,
                textAlign: 'center',
                fontFamily: theme.font4,
                width: '90%',
              }}>
              Update your details to calculate your latest carbon footprint
              accurately.
            </Text>
          </View>
        </View>
      </View>
      <View style={[{width: '100%', padding: 12, marginTop: 20}]}>
        <ScrollView style={{width: '100%', height: '56%'}}>
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('Questionnaire', {
                uid: uid,
                from: 'survey',
              })
            }>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 15,
                width: '96%',
              }}>
              <Image
                source={require('../assets/homeDetails.png')}
                style={{width: 36, height: 36}}
              />
              <Text
                style={{
                  color: 'black',
                  fontSize: 17,
                  fontFamily: theme.font4,
                }}>
                Basic Details
              </Text>
            </View>
            <Image
              source={require('../assets/forward.png')}
              style={{width: 20, height: 20, marginTop: 3}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('Travel', {
                uid: uid,
                from: 'survey',
              })
            }>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 15,
                width: '96%',
              }}>
              <Image
                source={require('../assets/bicycle.png')}
                style={{width: 36, height: 36}}
              />
              <Text
                style={{
                  color: 'black',
                  fontSize: 17,
                  fontFamily: theme.font4,
                }}>
                Travel Details
              </Text>
            </View>
            <Image
              source={require('../assets/forward.png')}
              style={{width: 20, height: 20, marginTop: 3}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('Electricity', {
                uid: uid,
                from: 'survey',
              })
            }>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 15,
                width: '96%',
              }}>
              <Image
                source={require('../assets/ev.png')}
                style={{width: 36, height: 36}}
              />
              <Text
                style={{
                  color: 'black',
                  fontSize: 17,
                  fontFamily: theme.font4,
                }}>
                Electricity Details
              </Text>
            </View>
            <Image
              source={require('../assets/forward.png')}
              style={{width: 20, height: 20, marginTop: 3}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('Energy', {
                uid: uid,
                from: 'survey',
              })
            }>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 15,
                width: '96%',
              }}>
              <Image
                source={require('../assets/lpg.png')}
                style={{width: 36, height: 36}}
              />
              <Text
                style={{
                  color: 'black',
                  fontSize: 17,
                  fontFamily: theme.font4,
                }}>
                Fuel Energy Details
              </Text>
            </View>
            <Image
              source={require('../assets/forward.png')}
              style={{width: 20, height: 20, marginTop: 3}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('Food', {
                uid: uid,
                from: 'survey',
              })
            }>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 15,
                width: '96%',
              }}>
              <Image
                source={require('../assets/foodIcon.png')}
                style={{width: 36, height: 36}}
              />
              <Text
                style={{
                  color: 'black',
                  fontSize: 17,
                  fontFamily: theme.font4,
                }}>
                Diet Details
              </Text>
            </View>
            <Image
              source={require('../assets/forward.png')}
              style={{width: 20, height: 20, marginTop: 3}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('Clothes', {
                uid: uid,
                from: 'survey',
              })
            }>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 15,
                width: '96%',
              }}>
              <Image
                source={require('../assets/clothes.png')}
                style={{width: 36, height: 36}}
              />
              <Text
                style={{
                  color: 'black',
                  fontSize: 17,
                  fontFamily: theme.font4,
                }}>
                Clothing and Shopping
              </Text>
            </View>
            <Image
              source={require('../assets/forward.png')}
              style={{width: 20, height: 20, marginTop: 3}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('Recycle', {
                uid: uid,
                from: 'survey',
              })
            }>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 15,
                width: '96%',
              }}>
              <Image
                source={require('../assets/waste.png')}
                style={{width: 36, height: 36}}
              />
              <Text
                style={{
                  color: 'black',
                  fontSize: 17,
                  fontFamily: theme.font4,
                }}>
                Waste Management
              </Text>
            </View>
            <Image
              source={require('../assets/forward.png')}
              style={{width: 20, height: 20, marginTop: 3}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('ExtraActivities', {
                uid: uid,
                from: 'survey',
              })
            }>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 15,
                width: '96%',
              }}>
              <Image
                source={require('../assets/extra5.png')}
                style={{width: 36, height: 36}}
              />
              <Text
                style={{
                  color: 'black',
                  fontSize: 17,
                  fontFamily: theme.font4,
                }}>
                Extra Activities
              </Text>
            </View>
            <Image
              source={require('../assets/forward.png')}
              style={{width: 20, height: 20, marginTop: 3}}
            />
          </TouchableOpacity>
          <View style={{width: '100%', height: 150}}></View>
        </ScrollView>
      </View>
      <View
        style={{
          alignItems: 'center',
          position: 'absolute',
          bottom: 60,
          zIndex: 999,
          width: '100%',
        }}></View>
      <View style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
        <BottomNavigation />
      </View>
    </View>
  );
};
export default Survey;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
  },
  section: {
    width: '100%',
    displat: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 15,
  },
  icon: {
    width: 30,
    height: 30,
    objectFit: 'contain',
  },
  button: {
    width: 140,
    height: 140,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 5,
    marginRight: 10,
    borderRadius: 12,
    marginLeft: 5,
    marginTop: 12,
    justifyContent: 'space-between',
  },
  text: {
    height: 30,
    width: '100%',
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.3,
  },
  image: {
    width: 110,
    height: 90,
  },
  section1: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  btn: {
    width: '70%',
    height: 40,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  msg: {
    width: '30%',
    height: 75,
    position: 'absolute',
    top: 36,
    left: '44%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    zIndex: 999,
    paddingHorizontal: 18,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  msgtxt: {
    color: 'black',
    fontSize: 12,
    width: '100%',
  },
  item: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 3,
    justifyContent: 'space-between',
    marginVertical: 5,
  },
});
