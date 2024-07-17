import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {ActivityIndicator, RadioButton} from 'react-native-paper';
import Dots from 'react-native-dots-pagination';
import {colors} from '../Colors';
const {width} = Dimensions.get('window');
import {useNavigation, useRoute} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import Slider from '@react-native-community/slider';

import clothing from '../assets/extraActivities.png';
import cr from '../assets/extra2.png';
import extra3 from '../assets/extra3.png';
import extra4 from '../assets/extra4.png';
import extra5 from '../assets/extra5.png';
import { fetchAndUpdateFootprint } from '../utils/footrpintUtils';

const ExtraActivities = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {uid, from} = route.params;

  const [saplingsCount, setSaplingsCount] = useState(0);
  const [vacationsCount, setVacationsCount] = useState(0);
  const [transportationMode, settransportationMode] = useState('');
  const [distance, setdistance] = useState('');
  const [accommodationDetails, setaccommodationDetails] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  React.useCallback(() => {
    settransportationMode('');
    setdistance('');
    setaccommodationDetails('');
    setSaplingsCount(0);
    setVacationsCount(0);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (from.trim() === 'survey') {
      fetchUserData();
    }
  }, [from]);
  const fetchUserData = async () => {
    try {
      const clothingDetailsRef = firestore()
        .collection('UserData')
        .doc(uid)
        .collection('ExtraDetails')
        .doc(`extra_details:${uid}`);
      const doc = await clothingDetailsRef.get();
      if (doc.exists) {
        const data = doc.data();
        settransportationMode(data.transportationMode);
        setdistance(data.distance);
        setaccommodationDetails(data.accommodationDetails);
        setSaplingsCount(data.saplingsCount);
        setVacationsCount(data.vacationsCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const questions = [
    {
      question:
        'What mode of transportation do you typically use for your vacations?',
      options: ['Car', 'Train', 'Bus', 'Plane', 'Other'],
      img: extra3,
      showSubmit: false,
    },
    {
      question: 'On average, how far do you travel for your vacations?',
      options: ['0-100 km', '100-500 km', '500-1000 km', '1000+ km'],
      img: extra4,
      showSubmit: false,
    },
    {
      question:
        'What type of accommodation do you usually stay in during your vacations?',
      options: ['Hotel', 'Resort', 'Airbnb', 'Camping', 'Other'],
      img: extra5,
      showSubmit: true,
    },
  ];

  const handleOptionChange = (questionIndex, optionIndex) => {
    const selectedOption = questions[questionIndex].options[optionIndex];
    if (questionIndex === 0) {
      settransportationMode(selectedOption);
    } else if (questionIndex === 1) {
      setdistance(selectedOption);
    } else if (questionIndex === 2) {
      setaccommodationDetails(selectedOption);
    }
  };

  const handleScroll = event => {
    const index = Math.floor(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const recycleDetailsRef = firestore()
        .collection('UserData')
        .doc(uid)
        .collection('ExtraDetails')
        .doc(`extra_details:${uid}`);
      const data = {
        transportationMode: transportationMode,
        distance: distance,
        accommodationDetails: accommodationDetails,
        saplingsCount: saplingsCount,
        vacationsCount: vacationsCount,
      };
      await recycleDetailsRef.set(data);
      from.trim() === 'signup'
        ? navigation.navigate('Home')
        : navigation.navigate('Survey', {uid: uid , Route : 'Extra Activities Details'});
    } catch (err) {
      console.error(err);
    }
    fetchAndUpdateFootprint(uid);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {from.trim() === 'survey' && (
        <View style={{position: 'absolute', zIndex: 999, top: 12, left: 12}}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Survey', {uid: uid})}>
            <Image
              source={require('../assets/backButton.png')}
              style={{width: 27, height: 27}}
            />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.section1}>
        <View style={{width: '100%' , alignItems : 'center'}}>
          <Text
            style={{
              color: 'black',
              fontSize: 22,
              textAlign: 'center',
              fontFamily: colors.font2,
              opacity: 0.6,
            }}>
            Extra Activities
          </Text>
          <Text
            style={{
              color: 'gray',
              fontSize: 14,
              textAlign: 'center',
              fontFamily: colors.font1,
              width : '90%'
            }}>
            Engage in extra activities to help us gather user data for a more
            accurate calculation of your environmental footprint."
          </Text>
        </View>
      </View>
      <ScrollView
        horizontal
        pagingEnabled
        contentContainerStyle={styles.scrollViewContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        <View key={0} style={styles.questionContainer}>
          <Image
            source={require('../assets/extraActivities.png')}
            style={{width: '100%', height: 160, objectFit: 'contain'}}
          />
          <Text style={styles.questionText}>
            {'Specify the Number of saplings you plant per month'}
          </Text>
          <ScrollView style={{width: '100%'}}>
            <Text
              style={{color: 'gray', fontFamily: colors.font4, fontSize: 15}}>
              Number of Planted Trees{' '}
            </Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <TextInput
                style={{
                  width: '100%',
                  backgroundColor: '#F5F5F5',
                  borderRadius: 3,
                  color: 'black',
                  textAlign: 'flex-start',
                  padding: 5,
                  fontFamily: colors.font4,
                  marginTop : 10,
                  paddingHorizontal : 10,
                  fontSize : 16
                }}
                keyboardType="numeric"
                value={String(saplingsCount)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setSaplingsCount(numericValue);
                  }
                }}
              />
            </View>
            <View style={{height: 120}}></View>
          </ScrollView>
        </View>
        <View key={1} style={styles.questionContainer}>
          <Image
            source={require('../assets/extra2.png')}
            style={{width: '100%', height: 160, objectFit: 'contain'}}
          />
          <Text style={styles.questionText}>
            {'Specify the Number of vacations you typically take in a year'}
          </Text>
          <ScrollView style={{width: '100%'}}>
            <Text
              style={{color: 'gray', fontFamily: colors.font4, fontSize: 15}}>
              Number of Vacations{' '}
            </Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <TextInput
                style={{
                  width: '100%',
                  backgroundColor: '#F5F5F5',
                  borderRadius: 3,
                  color: 'black',
                  textAlign: 'flex-start',
                  padding: 5,
                  fontFamily: colors.font4,
                  marginTop : 10,
                  paddingHorizontal : 10,
                  fontSize : 16
                }}
                keyboardType="numeric"
                value={String(vacationsCount)}
                onChangeText={text => {
                  const numericValue = parseInt(text);
                  if (!isNaN(numericValue)) {
                    setVacationsCount(numericValue);
                  }
                }}
              />
            </View>
            <View style={{height: 120}}></View>
          </ScrollView>
        </View>
        {questions.map((question, index) => (
          <View key={index + 2} style={styles.questionContainer}>
            <Image
              source={question.img}
              style={{width: '100%', height: 130, objectFit: 'contain'}}
            />
            <Text style={styles.questionText}>{question.question}</Text>
            <ScrollView style={{width: '100%'}}>
              {question.options.map((option, optionIndex) => (
                <View key={optionIndex} style={styles.optionContainer}>
                  <RadioButton
                    value={option}
                    status={
                      (index === 0 && transportationMode === option) ||
                      (index === 1 && distance === option) ||
                      (index === 2 && accommodationDetails === option)
                        ? 'checked'
                        : 'unchecked'
                    }
                    onPress={() => handleOptionChange(index, optionIndex)}
                  />
                  <Text
                    style={{
                      color: 'gray',
                      fontSize: 15,
                      fontFamily: colors.font1,
                    }}>
                    {option}
                  </Text>
                </View>
              ))}
              <View style={{width: '100%', height: 200}}></View>
            </ScrollView>
            {question.showSubmit && (
              <View
                style={{width: '100%', alignItems: 'center', marginBottom: 30}}>
                {loading ? (
                  <ActivityIndicator
                    size={'small'}
                    color={'white'}
                    style={styles.btn}
                  />
                ) : from.trim() === 'signup' ? (
                  <TouchableOpacity onPress={handleSubmit} style={styles.btn}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 16,
                        fontFamily: colors.font2,
                      }}>
                      Save & Continue
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={handleSubmit} style={styles.btn}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 16,
                        fontFamily: colors.font2,
                      }}>
                      Update
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      <View style={styles.dotsContainer}>
        <Dots
          length={5}
          active={currentIndex}
          activeColor={colors.p}
          passiveColor="lightgray"
          activeDotWidth={7}
          activeDotHeight={7}
          passiveDotWidth={7}
          passiveDotHeight={7}
        />
      </View>
    </View>
  );
};

export default ExtraActivities;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.bg,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  img2: {
    width: 22,
    height: 22,
    objectFit: 'contain',
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    height: 50,
    borderRadius: 7,
    flexDirection: 'row',
    paddingVertical: 5,
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 5,
    borderWidth: 0.4,
    borderColor: 'lightgray',
    marginVertical: 5,
  },
  inputSection: {
    width: '80%',
    color: 'black',
    fontFamily: colors.font1,
    fontSize: 15,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  questionContainer: {
    width,
    alignItems: 'flex-start',
    padding: 20,
    marginTop: -30,
  },
  questionText: {
    marginVertical: 15,
    color: 'black',
    fontSize: 16,
    fontFamily: colors.font4,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    width: '72%',
    backgroundColor: colors.bg2,
    height: 40,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  section1: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 36,
  },
});
