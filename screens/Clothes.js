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

import clothing from '../assets/clothing.png';
import cr from '../assets/cr.png';
import wm from '../assets/wm.png';
import cm from '../assets/cm.png';
import { fetchAndUpdateFootprint } from '../utils/footrpintUtils';

const Clothes = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {uid, from} = route.params;

  const [clothingFrequency, setclothingFrequency] = useState('');
  const [recycleRate, setrecycleRate] = useState('');
  const [washingMethod, setwashingMethod] = useState('');
  const [mostUsedMaterial, setmostUsedMaterial] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  React.useCallback(() => {
    setclothingFrequency('');
    setrecycleRate('');
    setwashingMethod('');
    setmostUsedMaterial('');
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
        .collection('ClothingDetails')
        .doc(`clothing_details:${uid}`);
      const doc = await clothingDetailsRef.get();
      if (doc.exists) {
        const data = doc.data();
        setclothingFrequency(data.clothingFrequency);
        setrecycleRate(data.recycleRate);
        setwashingMethod(data.washingMethod);
        setmostUsedMaterial(data.mostUsedMaterial);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const questions = [
    {
      question: 'How many clothing items do you purchase on average per month?',
      options: ['0-5', '5-10', '10-20', '20 or more'],
      img: clothing,
      showSubmit: false,
    },
    {
      question: 'How much percentage of clothes do you recycle?',
      options: ['100%', '75%', '50%', '25%', '0%'],
      img: cr,
      showSubmit: false,
    },
    {
      question:
        'Do you use energy-efficient washing machines or practices for laundry?',
      options: [
        'Washing Machine',
        'Traditional Practices',
        'Both',
        'Community Laundromat',
      ],
      img: wm,
      showSubmit: false,
    },
    {
      question: 'Which type of cloth material do you use the most',
      options: [
        'Cotton',
        'Silk',
        'Wool',
        'Nylon',
        'Polyester',
        'Linen',
        'Synthetic',
      ],
      img: cm,
      showSubmit: true,
    },
  ];

  const handleOptionChange = (questionIndex, optionIndex) => {
    const selectedOption = questions[questionIndex].options[optionIndex];
    if (questionIndex === 0) {
      setclothingFrequency(selectedOption);
    } else if (questionIndex === 1) {
      setrecycleRate(selectedOption);
    } else if (questionIndex === 2) {
      setwashingMethod(selectedOption);
    } else if (questionIndex === 3) {
      setmostUsedMaterial(selectedOption);
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
        .collection('ClothingDetails')
        .doc(`clothing_details:${uid}`);
      const data = {
        clothingFrequency: clothingFrequency,
        recycleRate: recycleRate,
        washingMethod: washingMethod,
        mostUsedMaterial: mostUsedMaterial,
      };
      await recycleDetailsRef.set(data);
      from.trim() === 'signup'
        ? navigation.navigate('Home')
        : navigation.navigate('Survey', {uid: uid , Route : 'Clothing Details'});
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
            Clothing Details
          </Text>
          <Text
            style={{
              color: 'gray',
              fontSize: 14,
              textAlign: 'center',
              fontFamily: colors.font1,
              width: '90%',
            }}>
            Explore your clothing habits and their environmental impact to help
            us calculate your carbon footprint more accurately.
          </Text>
        </View>
      </View>
      <ScrollView
        horizontal
        pagingEnabled
        contentContainerStyle={styles.scrollViewContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
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
                      (index === 0 && clothingFrequency === option) ||
                      (index === 1 && recycleRate === option) ||
                      (index === 2 && washingMethod === option) ||
                      (index === 3 && mostUsedMaterial === option)
                        ? 'checked'
                        : 'unchecked'
                    }
                    onPress={() => handleOptionChange(index, optionIndex)}
                  />
                  <Text style={styles.option}>{option}</Text>
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
                      style={styles.btnTxt}>
                      Save & Continue
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={handleSubmit} style={styles.btn}>
                    <Text
                      style={styles.btnTxt}>
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
          length={4}
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

export default Clothes;

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
  questionContainer: {
    width,
    alignItems: 'flex-start',
    padding: 20,
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
  btnTxt: {color: 'white', fontSize: 16, fontFamily: colors.font2},
  subTxt: {
    color: 'gray',
    fontFamily: colors.font4,
    fontSize: 15,
  },
  texInput: {
    width: '15%',
    backgroundColor: 'lightgray',
    opacity: 0.3,
    borderRadius: 7,
    color: 'black',
    textAlign: 'center',
    padding: 5,
    fontFamily: colors.font4,
  },
  option: {
    color: 'gray',
    fontSize: 15,
    fontFamily: colors.font1,
  },
  section1: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 36,
  },
});
