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

const Energy = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {uid, from} = route.params;

  //variables
  const [lpgUnits, setlpgUnits] = useState(0);
  const [pngUnits, setpngUnits] = useState(0);
  const [keroseneUnits, setkeroseneUnits] = useState(0);
  const [coalQuantity, setCoalQuantity] = useState(0);
  const [woodQuantity, setWoodQuantity] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  React.useCallback(() => {
    setlpgUnits(0);
    setpngUnits(0);
    setkeroseneUnits(0);
    setCoalQuantity(0);
    setWoodQuantity(0);
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
        .collection('EnergyDetails')
        .doc(`energy_details:${uid}`);
      const doc = await clothingDetailsRef.get();
      if (doc.exists) {
        const data = doc.data();
        setlpgUnits(data.lpgUnits);
        setpngUnits(data.pngUnits);
        setkeroseneUnits(data.keroseneUnits);
        setCoalQuantity(data.coalQuantity);
        setWoodQuantity(data.woodQuantity);
      }
    } catch (err) {
      console.error(err);
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
        .collection('EnergyDetails')
        .doc(`energy_details:${uid}`);
      let data = {
        lpgUnits: lpgUnits,
        pngUnits: pngUnits,
        keroseneUnits: keroseneUnits,
        coalQuantity: coalQuantity,
        woodQuantity: woodQuantity,
      };
      await recycleDetailsRef.set(data);
      from.trim() === 'signup'
        ? navigation.navigate('Home')
        : navigation.navigate('Survey', {uid: uid , Route : 'Fuel and Energy Details'});
    } catch (err) {
      console.error(err);
    }
    fetchAndUpdateFootprint(uid);
    setLoading(false);
  };

  const handleChoice = opt => {
    setElectricitySupplier(opt);
    setShowOpt(false);
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
        <View style={{width: '100%', alignItems: 'center'}}>
          <Text
            style={{
              color: 'black',
              fontSize: 22,
              textAlign: 'center',
              fontFamily: colors.font2,
              opacity: 0.6,
            }}>
            Energy Details
          </Text>
          <Text
            style={{
              color: 'gray',
              fontSize: 14,
              textAlign: 'center',
              fontFamily: colors.font1,
              width: '90%',
            }}>
            Provide your Energy and Fuel details to help us accurately calculate
            your environmental footprint.
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
            source={require('../assets/fuel.png')}
            style={{width: '100%', height: 110, objectFit: 'contain'}}
          />
          <Text style={styles.questionText}>
            {'Specify your electricity details'}
          </Text>
          <ScrollView style={{width: '100%'}}>
            <Text style={styles.subTxt}>Number of LPG cylinders per month</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/lpg.png')}
                  style={{width: 33, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(lpgUnits)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setlpgUnits(numericValue);
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Units of PNG(Piped Gas) per month</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/png.png')}
                  style={{width: 33, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(pngUnits)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setpngUnits(numericValue);
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Kerosene litres per month</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/kerosene.png')}
                  style={{width: 33, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(keroseneUnits)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setkeroseneUnits(numericValue);
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>
              Amount of Coal used per month if any (kg)
            </Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/coal.png')}
                  style={{width: 33, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(coalQuantity)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setCoalQuantity(numericValue);
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>
              Amount of wood used as fuel per month if any (kg)
            </Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/wood.png')}
                  style={{width: 33, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(woodQuantity)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setWoodQuantity(numericValue);
                  }
                }}
              />
            </View>
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
                <Text style={styles.btnTxt}>Save & Continue</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleSubmit} style={styles.btn}>
                <Text style={styles.btnTxt}>Update</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
      <View style={styles.dotsContainer}>
        <Dots
          length={1}
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

export default Energy;

const styles = StyleSheet.create({
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
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
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 3,
    color: 'black',
    textAlign: 'flex-start',
    padding: 5,
    fontFamily: colors.font4,
    marginTop: 10,
    paddingHorizontal: 10,
    fontSize: 16,
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
