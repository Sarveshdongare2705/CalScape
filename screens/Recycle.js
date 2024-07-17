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
import recycle1 from '../assets/recycle1.png';
import recycle2 from '../assets/recycle2.png';
import recycle3 from '../assets/recycle3.png';
import recycle4 from '../assets/recycle4.png';
import recycle5 from '../assets/recycle5.png';
import recycle6 from '../assets/recycle6.png';
import recycle7 from '../assets/recycle7.png';
import recycle8 from '../assets/recycle8.png';
import recycle9 from '../assets/recycle9.png';
import recycle10 from '../assets/recycle10.png';
import { fetchAndUpdateFootprint } from '../utils/footrpintUtils';

const Recycle = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {uid, from} = route.params;

  const [cansRecycle, setCansRecycle] = useState('');
  const [plasticRecycle, setPlasticRecycle] = useState('');
  const [glassRecycle, setGlassRecycle] = useState('');
  const [newspapersRecycle, setNewspapersRecycle] = useState('');
  const [booksRecycle, setBooksRecycle] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  React.useCallback(() => {
    setCansRecycle('');
    setPlasticRecycle('');
    setGlassRecycle('');
    setNewspapersRecycle('');
    setBooksRecycle('');
    setLoading(false);
  }, []);

  useEffect(() => {
    if (from.trim() === 'survey') {
      fetchUserData();
    }
  }, [from]);
  const fetchUserData = async () => {
    try {
      const basicDetailsRef = firestore()
        .collection('UserData')
        .doc(uid)
        .collection('RecycleDetails')
        .doc(`recycle_details:${uid}`);
      const doc = await basicDetailsRef.get();
      if (doc.exists) {
        const data = doc.data();
        setCansRecycle(data.cansRecycle);
        setPlasticRecycle(data.plasticRecycle);
        setGlassRecycle(data.glassRecycle);
        setNewspapersRecycle(data.newspapersRecycle);
        setBooksRecycle(data.booksRecycle);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const questions = [
    {
      question: 'Do you recycle aluminum and steel cans?',
      options: ['Yes', 'No'],
      img1: recycle1,
      img2: recycle2,
      showSubmit: false,
    },
    {
      question: 'Do you recycle plastic?',
      options: ['Yes', 'No'],
      img1: recycle3,
      img2: recycle4,
      showSubmit: false,
    },
    {
      question: 'Do you recycle glass?',
      options: ['Yes', 'No'],
      img1: recycle5,
      img2: recycle6,
      showSubmit: false,
    },
    {
      question: 'Do you recycle newspaper?',
      options: ['Yes', 'No'],
      img1: recycle8,
      img2: recycle7,
      showSubmit: false,
    },
    {
      question: 'Do you recycle magazines/Books?',
      options: ['Yes', 'No'],
      img1: recycle10,
      img2: recycle9,
      showSubmit: true,
    },
  ];

  const handleOptionChange = (questionIndex, optionIndex) => {
    const selectedOption = questions[questionIndex].options[optionIndex];
    if (questionIndex === 0) {
      setCansRecycle(selectedOption);
    } else if (questionIndex === 1) {
      setPlasticRecycle(selectedOption);
    } else if (questionIndex === 2) {
      setGlassRecycle(selectedOption);
    } else if (questionIndex === 3) {
      setNewspapersRecycle(selectedOption);
    } else if (questionIndex === 4) {
      setBooksRecycle(selectedOption);
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
        .collection('RecycleDetails')
        .doc(`recycle_details:${uid}`);
      const data = {
        cansRecycle: cansRecycle,
        plasticRecycle: plasticRecycle,
        glassRecycle: glassRecycle,
        newspapersRecycle: newspapersRecycle,
        booksRecycle: booksRecycle,
      };
      await recycleDetailsRef.set(data);
      from.trim() === 'signup'
        ? navigation.navigate('Home')
        : navigation.navigate('Survey', {uid: uid , Route : 'Recycle Details'});
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
            Recycle Details
          </Text>
          <Text
            style={{
              color: 'gray',
              fontSize: 14,
              textAlign: 'center',
              fontFamily: colors.font1,
              width: '90%',
            }}>
            Enter the items you recycle to help us gauge your environmental
            impact.
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
            <View
              style={{
                width: '100%',
                height: 150,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Image
                source={question.img1}
                style={{width: '50%', height: 120, objectFit: 'contain'}}
              />
              <Image
                source={question.img2}
                style={{width: '50%', height: 100, objectFit: 'contain'}}
              />
            </View>
            <Text style={styles.questionText}>{question.question}</Text>
            <ScrollView style={{width: '100%'}}>
              {question.options.map((option, optionIndex) => (
                <View key={optionIndex} style={styles.optionContainer}>
                  <RadioButton
                    value={option}
                    status={
                      (index === 0 && cansRecycle === option) ||
                      (index === 1 && plasticRecycle === option) ||
                      (index === 2 && glassRecycle === option) ||
                      (index === 3 && newspapersRecycle === option) ||
                      (index === 4 && booksRecycle === option)
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

export default Recycle;

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
