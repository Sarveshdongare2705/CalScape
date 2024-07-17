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

const Travel = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {uid, from} = route.params;

  //variables
  const [bicycleCount, setBicycleCount] = useState(0);
  const [bikeCount, setBikeCount] = useState(0);
  const [carCount, setCarCount] = useState(0);
  const [largeVehicleCount, setLargeVehicleCount] = useState(0);
  const [bicycleDetails, setBicycleDetails] = useState({
    bicycleDistance: 0,
  });
  const [bikeDetails, setBikeDetails] = useState({
    petrolBikeCount: 0,
    petrolBikeDistance: 0,
    petrolBikeMileage: 0,
    electricBikeCount: 0,
    electricBikeDistance: 0,
    electricBikeMileage: 0,
    hybridBikeCount: 0,
    hybridBikeDistance: 0,
    hybridBikeMileage: 0,
  });
  const [carDetails, setCarDetails] = useState({
    petrolCarCount: 0,
    petrolCarDistance: 0,
    petrolCarMileage: 0,
    deiselCarCount: 0,
    deiselCarDistance: 0,
    deiselCarMileage: 0,
    naturalGasCarCount: 0,
    naturalGasCarDistance: 0,
    naturalGasCarMileage: 0,
    electricCarCount: 0,
    electricCarDistance: 0,
    electricCarMileage: 0,
  });
  const [largeVehicleDetails, setLargeVehicleDetails] = useState({
    petrolLvCount: 0,
    petrolLvDistance: 0,
    petrolLvMileage: 0,
    deiselLvCount: 0,
    deiselLvDistance: 0,
    deiselLvMileage: 0,
    naturalGasLvCount: 0,
    naturalGasLvDistance: 0,
    naturalGasLvMileage: 0,
    electricLvCount: 0,
    electricLvDistance: 0,
    electricLvMileage: 0,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const [publicTransport, setPublicTransport] = useState({
    taxiDistance: 0,
    busDistance: 0,
    trainDistance: 0,
    waterwaysDistance: 0,
    flightDistance: 0,
    flightType: null,
  });
  const handleFlightTypeChange = value => {
    setPublicTransport({...publicTransport, flightType: value});
  };

  React.useCallback(() => {
    setBicycleCount(0);
    setBikeCount(0);
    setCarCount(0);
    setLargeVehicleCount(0);
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
        .collection('TravelDetails')
        .doc(`travel_details:${uid}`);
      const doc = await clothingDetailsRef.get();
      if (doc.exists) {
        const data = doc.data();
        setBicycleCount(data.bicycleCount || 0);
        setBikeCount(data.bikeCount || 0);
        setCarCount(data.carCount || 0);
        setLargeVehicleCount(data.largeVehicleCount || 0);
        if (data.bicycleDetails) {
          setBicycleDetails(data.bicycleDetails);
        }
        if (data.bikeDetails) {
          setBikeDetails(data.bikeDetails);
        }
        if (data.carDetails) {
          setCarDetails(data.carDetails);
        }
        if (data.largeVehicleDetails) {
          setLargeVehicleDetails(data.largeVehicleDetails);
        }
        setPublicTransport(data.publicTransport);
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
        .collection('TravelDetails')
        .doc(`travel_details:${uid}`);
      let data = {
        bicycleCount: bicycleCount,
        bikeCount: bikeCount,
        carCount: carCount,
        largeVehicleCount: largeVehicleCount,
      };
      if (bicycleCount !== 0) {
        data.bicycleDetails = bicycleDetails;
      }
      if (bikeCount !== 0) {
        data.bikeDetails = bikeDetails;
      }
      if (carCount !== 0) {
        data.carDetails = carDetails;
      }
      if (largeVehicleCount !== 0) {
        data.largeVehicleDetails = largeVehicleDetails;
      }
      data.publicTransport = publicTransport;
      await recycleDetailsRef.set(data);
      from.trim() === 'signup'
        ? navigation.navigate('Home')
        : navigation.navigate('Survey', {uid: uid , Route : 'Travel Details'});
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
            onPress={() =>
              navigation.navigate('Survey', {uid: uid, Route: 'Travel'})
            }>
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
            Travel Details
          </Text>
          <Text
            style={{
              color: 'gray',
              fontSize: 14,
              textAlign: 'center',
              fontFamily: colors.font1,
              width: '90%',
            }}>
            Provide your travel details to help us accurately calculate your
            environmental footprint.
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
            source={require('../assets/vehicle.png')}
            style={{width: '100%', height: 160, objectFit: 'cover'}}
          />
          <Text style={styles.questionText}>
            {'Specify the count of your vehicles.'}
          </Text>
          <ScrollView style={{width: '100%'}}>
            <Text style={styles.subTxt}>Bicycle</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/bicycle.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(bicycleCount)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setBicycleCount(numericValue);
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Bike</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/bike.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(bikeCount)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setBikeCount(numericValue);
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Car</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/car.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(carCount)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setCarCount(numericValue);
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Larger Vehicles</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/largeVehicle.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(largeVehicleCount)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setLargeVehicleCount(numericValue);
                  }
                }}
              />
            </View>
            <View style={{width: '100%', height: 180}}></View>
          </ScrollView>
        </View>
        {bicycleCount !== 0 && (
          <View key={1} style={styles.questionContainer}>
            <Image
              source={require('../assets/bicycle.png')}
              style={{width: '100%', height: 160, objectFit: 'contain'}}
            />
            <Text style={styles.questionText}>
              {'Specify the details of bicycle.'}
            </Text>
            <ScrollView style={{width: '100%'}}>
              <Text style={styles.subTxt}>
                {'Average distance travelled per month(km).'}
              </Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(bicycleDetails.bicycleDistance)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setBicycleDetails({
                        ...bicycleDetails,
                        bicycleDistance: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <View style={{width: '100%', height: 180}}></View>
            </ScrollView>
          </View>
        )}
        {bikeCount !== 0 && (
          <View key={2} style={styles.questionContainer}>
            <Image
              source={require('../assets/bike.png')}
              style={{width: '100%', height: 160, objectFit: 'contain'}}
            />
            <Text style={styles.questionText}>
              {'Specify the details of bike.'}
            </Text>
            <ScrollView style={{width: '100%'}}>
              <Text style={styles.questionText}>{'Petrol Bike Details.'}</Text>
              <Text style={styles.subTxt}>{'Number of bikes'}</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(bikeDetails.petrolBikeCount)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setBikeDetails({
                        ...bikeDetails,
                        petrolBikeCount: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.subTxt}>
                {'Average distance travelled per month(km).'}
              </Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(bikeDetails.petrolBikeDistance)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setBikeDetails({
                        ...bikeDetails,
                        petrolBikeDistance: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.subTxt}>{'Mileage'}</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(bikeDetails.petrolBikeMileage)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setBikeDetails({
                        ...bikeDetails,
                        petrolBikeMileage: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.questionText}>
                {'Electric Bike Details.'}
              </Text>
              <Text style={styles.subTxt}>{'Number of bikes'}</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(bikeDetails.electricBikeCount)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setBikeDetails({
                        ...bikeDetails,
                        electricBikeCount: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.subTxt}>
                {'Average distance travelled per month(km).'}
              </Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(bikeDetails.electricBikeDistance)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setBikeDetails({
                        ...bikeDetails,
                        electricBikeDistance: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.subTxt}>{'Mileage'}</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(bikeDetails.electricBikeMileage)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setBikeDetails({
                        ...bikeDetails,
                        electricBikeMileage: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.questionText}>
                {'Hybrid(Petrol + Electric) Bike Details.'}
              </Text>
              <Text style={styles.subTxt}>{'Number of bikes'}</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(bikeDetails.hybridBikeCount)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setBikeDetails({
                        ...bikeDetails,
                        hybridBikeCount: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.subTxt}>
                {'Average distance travelled per month(km).'}
              </Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(bikeDetails.hybridBikeDistance)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setBikeDetails({
                        ...bikeDetails,
                        hybridBikeDistance: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.subTxt}>{'Mileage'}</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(bikeDetails.hybridBikeMileage)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setBikeDetails({
                        ...bikeDetails,
                        hybridBikeMileage: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <View style={{width: '100%', height: 180}}></View>
            </ScrollView>
          </View>
        )}
        {carCount !== 0 && (
          <View key={3} style={styles.questionContainer}>
            <Image
              source={require('../assets/car.png')}
              style={{width: '100%', height: 160, objectFit: 'contain'}}
            />
            <Text style={styles.questionText}>
              {'Specify the details of car.'}
            </Text>
            <ScrollView style={{width: '100%'}}>
            <Text style={styles.questionText}>{'Petrol Car Details.'}</Text>
              <Text style={styles.subTxt}>{'Number of cars'}</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(carDetails.petrolCarCount)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setCarDetails({
                        ...carDetails,
                        petrolCarCount: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.subTxt}>
                {'Average distance travelled per month(km).'}
              </Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(carDetails.petrolCarDistance)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setCarDetails({
                        ...carDetails,
                        petrolCarDistance: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.subTxt}>{'Mileage'}</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(carDetails.petrolCarMileage)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setCarDetails({
                        ...carDetails,
                        petrolCarMileage: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.questionText}>{'Deisel Car Details.'}</Text>
              <Text style={styles.subTxt}>{'Number of cars'}</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(carDetails.deiselCarCount)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setCarDetails({
                        ...carDetails,
                        deiselCarCount: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.subTxt}>
                {'Average distance travelled per month(km).'}
              </Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(carDetails.deiselCarDistance)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setCarDetails({
                        ...carDetails,
                        deiselCarDistance: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.subTxt}>{'Mileage'}</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(carDetails.deiselCarMileage)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setCarDetails({
                        ...carDetails,
                        deiselCarMileage: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.questionText}>{'CNG/LNG Car Details.'}</Text>
              <Text style={styles.subTxt}>{'Number of cars'}</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(carDetails.naturalGasCarCount)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setCarDetails({
                        ...carDetails,
                        naturalGasCarCount: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.subTxt}>
                {'Average distance travelled per month(km).'}
              </Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(carDetails.naturalGasCarDistance)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setCarDetails({
                        ...carDetails,
                        naturalGasCarDistance: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.subTxt}>{'Mileage'}</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(carDetails.naturalGasCarMileage)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setCarDetails({
                        ...carDetails,
                        naturalGasCarMileage: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.questionText}>{'Electric Car Details.'}</Text>
              <Text style={styles.subTxt}>{'Number of cars'}</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(carDetails.electricCarCount)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setCarDetails({
                        ...carDetails,
                        electricCarCount: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.subTxt}>
                {'Average distance travelled per month(km).'}
              </Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(carDetails.electricCarDistance)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setCarDetails({
                        ...carDetails,
                        electricCarDistance: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.subTxt}>{'Mileage'}</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(carDetails.electricCarMileage)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setCarDetails({
                        ...carDetails,
                        electricCarMileage: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <View style={{width: '100%', height: 180}}></View>
            </ScrollView>
          </View>
        )}
        {largeVehicleCount !== 0 && (
          <View key={4} style={styles.questionContainer}>
            <Image
              source={require('../assets/largeVehicle.png')}
              style={{width: '100%', height: 160, objectFit: 'contain'}}
            />
            <Text style={styles.questionText}>
              {'Specify the details of large vehicle.'}
            </Text>
            <ScrollView style={{width: '100%'}}>
            <Text style={styles.questionText}>{'Petrol LV Details.'}</Text>
              <Text style={styles.subTxt}>{'Number of vehicles'}</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(largeVehicleDetails.petrolLvCount)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setLargeVehicleDetails({
                        ...largeVehicleDetails,
                        petrolLvCount: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.subTxt}>
                {'Average distance travelled per month(km).'}
              </Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(largeVehicleDetails.petrolLvDistance)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setLargeVehicleDetails({
                        ...largeVehicleDetails,
                        petrolLvDistance: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.subTxt}>{'Mileage'}</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(largeVehicleDetails.petrolLvMileage)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setLargeVehicleDetails({
                        ...largeVehicleDetails,
                        petrolLvMileage: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.questionText}>{'Deisel LV Details.'}</Text>
              <Text style={styles.subTxt}>{'Number of vehicles'}</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(largeVehicleDetails.deiselLvCount)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setLargeVehicleDetails({
                        ...largeVehicleDetails,
                        deiselLvCount: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.subTxt}>
                {'Average distance travelled per month(km).'}
              </Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(largeVehicleDetails.deiselLvDistance)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setLargeVehicleDetails({
                        ...largeVehicleDetails,
                        deiselLvDistance: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.subTxt}>{'Mileage'}</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(largeVehicleDetails.deiselLvMileage)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setLargeVehicleDetails({
                        ...largeVehicleDetails,
                        deiselLvMileage: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.questionText}>{'CNG/LNG LV Details.'}</Text>
              <Text style={styles.subTxt}>{'Number of vehicles'}</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(largeVehicleDetails.naturalGasLvCount)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setLargeVehicleDetails({
                        ...largeVehicleDetails,
                        naturalGasLvCount: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.subTxt}>
                {'Average distance travelled per month(km).'}
              </Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(largeVehicleDetails.naturalGasLvDistance)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setLargeVehicleDetails({
                        ...largeVehicleDetails,
                        naturalGasLvDistance: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.subTxt}>{'Mileage'}</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(largeVehicleDetails.naturalGasLvMileage)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setLargeVehicleDetails({
                        ...largeVehicleDetails,
                        naturalGasLvMileage: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.questionText}>{'Electric LV Details.'}</Text>
              <Text style={styles.subTxt}>{'Number of vehicles'}</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(largeVehicleDetails.electricLvCount)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setLargeVehicleDetails({
                        ...largeVehicleDetails,
                        electricLvCount: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.subTxt}>
                {'Average distance travelled per month(km).'}
              </Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(largeVehicleDetails.electricLvDistance)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setLargeVehicleDetails({
                        ...largeVehicleDetails,
                        electricLvDistance: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <Text style={styles.subTxt}>{'Mileage'}</Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={styles.texInput}
                  keyboardType="numeric"
                  value={String(largeVehicleDetails.electricLvMileage)}
                  onChangeText={text => {
                    const numericValue = parseInt(text, 10);
                    if (!isNaN(numericValue)) {
                      setLargeVehicleDetails({
                        ...largeVehicleDetails,
                        electricLvMileage: numericValue,
                      });
                    }
                  }}
                />
              </View>
              <View style={{width: '100%', height: 180}}></View>
            </ScrollView>
          </View>
        )}
        <View key={5} style={styles.questionContainer}>
          <Image
            source={require('../assets/pt.png')}
            style={{width: '100%', height: 130, objectFit: 'contain'}}
          />
          <Text style={styles.questionText}>
            {'Specify your travel details via public transport'}
          </Text>
          <ScrollView style={{width: '100%'}}>
            <Text style={styles.subTxt}>
              Distance travelled by taxi/rickshaw per month
            </Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/taxi.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(publicTransport.taxiDistance)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setPublicTransport({
                      ...publicTransport,
                      taxiDistance: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>
              Distance travelled by bus per month
            </Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/bus.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(publicTransport.busDistance)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setPublicTransport({
                      ...publicTransport,
                      busDistance: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>
              Distance travelled by train per month
            </Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/train.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(publicTransport.trainDistance)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setPublicTransport({
                      ...publicTransport,
                      trainDistance: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>
              Distance travelled by plane/flights per month
            </Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/plane.png')}
                  style={{width: 33, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(publicTransport.flightDistance)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setPublicTransport({
                      ...publicTransport,
                      flightDistance: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.questionText}>{'Flight Type'}</Text>
            <RadioButton.Group
              onValueChange={newValue => handleFlightTypeChange(newValue)}
              value={publicTransport.flightType}>
              <View style={styles.radioButtonContainer}>
                <RadioButton value="economic" />
                <Text style={styles.option}>Economic</Text>
              </View>
              <View style={styles.radioButtonContainer}>
                <RadioButton value="business" />
                <Text style={styles.option}>Business</Text>
              </View>
            </RadioButton.Group>
            <Text style={styles.subTxt}>
              Distance travelled by waterways per month
            </Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/boat.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(publicTransport.waterwaysDistance)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setPublicTransport({
                      ...publicTransport,
                      waterwaysDistance: numericValue,
                    });
                  }
                }}
              />
            </View>
            <View style={{width: '100%', height: 180}}></View>
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
          length={6}
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

export default Travel;

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
