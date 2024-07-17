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

import clothing from '../assets/food1.png';
import food2 from '../assets/food2.png';
import { fetchAndUpdateFootprint } from '../utils/footrpintUtils';

const Food = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {uid, from} = route.params;

  const [animalBasedFrequency, setanimalBasedFrequency] = useState('');
  const [foodOrderFrequency, setfoodOrderFrequency] = useState('');
  const [localOrganicPercentage, setLocalOrganicPercentage] = useState(0);
  const [packagedImportedPercentage, setPackagedImportedPercentage] =
    useState(0);
  const [fruitsVegetables, setFruitsVegetables] = useState(0);
  const [grainsCereal, setGrainsCereal] = useState(0);
  const [processedFoods, setProcessedFoods] = useState(0);
  const [dairyMilkProducts, setDairyMilkProducts] = useState(0);
  const [animalBasedFood, setAnimalBasedFood] = useState(0);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(false);

  React.useCallback(() => {
    setanimalBasedFrequency('');
    setfoodOrderFrequency('');
    setLocalOrganicPercentage(0);
    setPackagedImportedPercentage(0);
    setFruitsVegetables(0);
    setGrainsCereal(0);
    setProcessedFoods(0);
    setDairyMilkProducts(0);
    setAnimalBasedFood(0);
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
        .collection('FoodDetails')
        .doc(`food_details:${uid}`);
      const doc = await clothingDetailsRef.get();
      if (doc.exists) {
        const data = doc.data();
        setanimalBasedFrequency(data.animalBasedFrequency);
        setfoodOrderFrequency(data.foodOrderFrequency);
        setLocalOrganicPercentage(data.localOrganicPercentage);
        setPackagedImportedPercentage(data.packagedImportedPercentage);
        setFruitsVegetables(data.fruitsVegetablesPercentage);
        setGrainsCereal(data.grainsCerealPercentage);
        setProcessedFoods(data.processedFoodsPercentage);
        setDairyMilkProducts(data.dairyMilkProductsPercentage);
        setAnimalBasedFood(data.animalBasedFoodPercentage);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const questions = [
    {
      question: 'How often do you consume Animal Based Diet food?',
      options: ['Daily', 'Weekly', 'Monthly', 'Never'],
      img: clothing,
      showSubmit: false,
    },
    {
      question: 'How often you eat outside or order food from outside?',
      options: ['Daily', 'Weekly', 'Monthly', 'Quarteerly', 'Occassionally'],
      img: food2,
      showSubmit: false,
    },
  ];

  const handleOptionChange = (questionIndex, optionIndex) => {
    const selectedOption = questions[questionIndex].options[optionIndex];
    if (questionIndex === 0) {
      setanimalBasedFrequency(selectedOption);
    } else if (questionIndex === 1) {
      setfoodOrderFrequency(selectedOption);
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
        .collection('FoodDetails')
        .doc(`food_details:${uid}`);
      const data = {
        animalBasedFrequency: animalBasedFrequency,
        foodOrderFrequency: foodOrderFrequency,
        localOrganicPercentage: localOrganicPercentage,
        packagedImportedPercentage: packagedImportedPercentage,
        fruitsVegetablesPercentage: fruitsVegetables,
        grainsCerealPercentage: grainsCereal,
        processedFoodsPercentage: processedFoods,
        dairyMilkProductsPercentage: dairyMilkProducts,
        animalBasedFoodPercentage: animalBasedFood,
      };
      await recycleDetailsRef.set(data);
      from.trim() === 'signup'
        ? navigation.navigate('Home')
        : navigation.navigate('Survey', {uid: uid , Route : 'Food and Diet Details'});
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
            Diet Details
          </Text>
          <Text
            style={{
              color: 'gray',
              fontSize: 14,
              textAlign: 'center',
              fontFamily: colors.font1,
              width: '90%',
            }}>
            Discover how your dietary choices impact the environment and help us
            calculate your carbon footprint more accurately.
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
                      (index === 0 && animalBasedFrequency === option) ||
                      (index === 1 && foodOrderFrequency === option)
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
          </View>
        ))}
        <View key={2} style={styles.questionContainer}>
          <Image
            source={require('../assets/update.png')}
            style={{width: '100%', height: 130, objectFit: 'cover'}}
          />
          <Text style={styles.questionText}>
            {
              'Specify the percentage of local farmer and packaged food you buy?'
            }
          </Text>
          <ScrollView style={{width: '100%'}}>
            <Text style={styles.subTxt}>Local(Organic)</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Slider
                style={{width: '84%', height: 60}}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={localOrganicPercentage}
                onValueChange={val => setLocalOrganicPercentage(val)}
                minimumTrackTintColor="black"
                maximumTrackTintColor="black"
                thumbTintColor="black"
              />
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(localOrganicPercentage)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setLocalOrganicPercentage(numericValue);
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Packaged</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Slider
                style={{width: '84%', height: 60}}
                minimumValue={0}
                maximumValue={100 - localOrganicPercentage}
                step={1}
                value={packagedImportedPercentage}
                onValueChange={val => setPackagedImportedPercentage(val)}
                minimumTrackTintColor="black"
                maximumTrackTintColor="black"
                thumbTintColor="black"
              />
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(packagedImportedPercentage)}
                onChangeText={text => {
                  const numericValue = parseInt(text);
                  if (!isNaN(numericValue)) {
                    setPackagedImportedPercentage(numericValue);
                  }
                }}
              />
            </View>
            <View style={{height: 120}}></View>
          </ScrollView>
        </View>
        <View key={3} style={styles.questionContainer}>
          <Image
            source={require('../assets/food1.png')}
            style={{width: '100%', height: 130, objectFit: 'contain'}}
          />
          <Text style={styles.questionText}>
            {'Breakdown your Food Consumption  (Total 100%)'}
          </Text>
          <ScrollView style={{width: '100%'}}>
            <Text style={styles.subTxt}>Fruits and Vegetables</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Slider
                style={{width: '84%', height: 40}}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={fruitsVegetables}
                onValueChange={val => setFruitsVegetables(val)}
                minimumTrackTintColor="black"
                maximumTrackTintColor="black"
                thumbTintColor="black"
              />
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(fruitsVegetables)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setFruitsVegetables(numericValue);
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Grains and Cereals</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Slider
                style={{width: '84%', height: 40}}
                minimumValue={0}
                maximumValue={100 - fruitsVegetables}
                step={1}
                value={grainsCereal}
                onValueChange={val => setGrainsCereal(val)}
                minimumTrackTintColor="black"
                maximumTrackTintColor="black"
                thumbTintColor="black"
              />
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(grainsCereal)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setGrainsCereal(numericValue);
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Processed Foods</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Slider
                style={{width: '84%', height: 40}}
                minimumValue={0}
                maximumValue={100 - fruitsVegetables - grainsCereal}
                step={1}
                value={processedFoods}
                onValueChange={val => setProcessedFoods(val)}
                minimumTrackTintColor="black"
                maximumTrackTintColor="black"
                thumbTintColor="black"
              />
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(processedFoods)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setProcessedFoods(numericValue);
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Dairy and Milk Products</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Slider
                style={{width: '84%', height: 40}}
                minimumValue={0}
                maximumValue={
                  100 - fruitsVegetables - grainsCereal - processedFoods
                }
                step={1}
                value={dairyMilkProducts}
                onValueChange={val => setDairyMilkProducts(val)}
                minimumTrackTintColor="black"
                maximumTrackTintColor="black"
                thumbTintColor="black"
              />
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(dairyMilkProducts)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setDairyMilkProducts(numericValue);
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Animal Based Food</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Slider
                style={{width: '84%', height: 40}}
                minimumValue={0}
                maximumValue={
                  100 -
                  fruitsVegetables -
                  grainsCereal -
                  processedFoods -
                  dairyMilkProducts
                }
                step={1}
                value={animalBasedFood}
                onValueChange={val => setAnimalBasedFood(val)}
                minimumTrackTintColor="black"
                maximumTrackTintColor="black"
                thumbTintColor="black"
              />
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(animalBasedFood)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setAnimalBasedFood(numericValue);
                  }
                }}
              />
            </View>
            <View style={{width: '100%', height: 200}}></View>
          </ScrollView>
          <View style={{width: '100%', alignItems: 'center', marginBottom: 30}}>
            {loading ? (
              <ActivityIndicator
                size={'small'}
                color={'white'}
                style={styles.btn}
              />
            ) : from.trim() === 'signup' ? (
              <TouchableOpacity onPress={handleSubmit} style={styles.btn}>
                <Text style={styles.btnTxt}>
                  Save & Continue
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleSubmit} style={styles.btn}>
                <Text style={styles.btnTxt}>
                  Update
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
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

export default Food;

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
