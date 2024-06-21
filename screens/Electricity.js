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

const Electricity = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {uid, from} = route.params;

  //variables
  const [electricityUnits, setelectricityUnits] = useState(0);
  const [electricitySupplier, setElectricitySupplier] = useState('');
  const [showOpt, setShowOpt] = useState(false);
  const options = [
    {
      name: 'Andhra Pradesh Power Generation Corporation',
      type: 'public',
      city: 'Andhra Pradesh',
    },
    {
      name: 'Andhra Pradesh Eastern Power Distribution Company Limited',
      type: 'public',
      city: 'Andhra Pradesh',
    },
    {
      name: 'Andhra Pradesh Central Power Distribution Company Limited',
      type: 'public',
      city: 'Andhra Pradesh',
    },
    {
      name: 'Andhra Pradesh Southern Power Distribution Company Limited',
      type: 'public',
      city: 'Andhra Pradesh',
    },
    {
      name: 'Transmission Corporation of Andhra Pradesh',
      type: 'public',
      city: 'Andhra Pradesh',
    },
    {name: 'Assam State Electricity Board', type: 'public', city: 'Assam'},
    {
      name: 'Bihar State Power Holding Company Limited',
      type: 'public',
      city: 'Bihar',
    },
    {
      name: 'North Bihar Power Distribution Company Limited',
      type: 'public',
      city: 'Bihar',
    },
    {
      name: 'South Bihar Power Distribution Company Limited',
      type: 'public',
      city: 'Bihar',
    },
    {
      name: 'Chhattisgarh State Power Generation Company Limited',
      type: 'public',
      city: 'Chhattisgarh',
    },
    {name: 'Dakshin Gujarat Vij Company Ltd.', type: 'public', city: 'Gujarat'},
    {name: 'Gujarat Urja Vikas Nigam Ltd.', type: 'public', city: 'Gujarat'},
    {name: 'Madhya Gujarat Vij Company Ltd.', type: 'public', city: 'Gujarat'},
    {name: 'Paschim Gujarat Vij Company Ltd.', type: 'public', city: 'Gujarat'},
    {
      name: 'Gujarat State Electricity Corporation Ltd.',
      type: 'public',
      city: 'Gujarat',
    },
    {
      name: 'Gujarat Electricity Corporation Ltd.',
      type: 'public',
      city: 'Gujarat',
    },
    {name: 'Uttar Gujarat Vij Company Ltd.', type: 'public', city: 'Gujarat'},
    {
      name: 'Dakshin Haryana Bijli Vitran Nigam',
      type: 'public',
      city: 'Haryana',
    },
    {name: 'Uttar Haryana Bijli Vitran Nigam', type: 'public', city: 'Haryana'},
    {
      name: 'Haryana Vidyut Prasaran Nigam Limited',
      type: 'public',
      city: 'Haryana',
    },
    {
      name: 'Haryana Power Generation Corporation',
      type: 'public',
      city: 'Haryana',
    },
    {
      name: 'Delhi Electricity Regulatory Commission',
      type: 'public',
      city: 'Delhi',
    },
    {name: 'Delhi Transco Limited', type: 'public', city: 'Delhi'},
    {name: 'BRPL', type: 'private', city: 'Delhi'},
    {name: 'BYPL', type: 'private', city: 'Delhi'},
    {name: 'TPDDL', type: 'private', city: 'Delhi'},
    {name: 'IPGCL', type: 'public', city: 'Delhi'},
    {name: 'PPCL', type: 'public', city: 'Delhi'},
    {
      name: 'Jharkhand State Electricity Board',
      type: 'public',
      city: 'Jharkhand',
    },
    {
      name: 'Jharkhand Bijli Vitran Nigam Limited',
      type: 'public',
      city: 'Jharkhand',
    },
    {
      name: 'Karnataka Power Corporation Limited (KPCL)',
      type: 'public',
      city: 'Karnataka',
    },
    {
      name: 'Karnataka Power Transmission Corporation Limited (KPTCL)',
      type: 'public',
      city: 'Karnataka',
    },
    {name: 'MESCOM, Mangaluru', type: 'public', city: 'Mangaluru'},
    {name: 'CESC, Mysuru', type: 'public', city: 'Mysuru'},
    {name: 'BESCOM, Bengaluru', type: 'public', city: 'Bengaluru'},
    {name: 'HESCOM, Hubballi', type: 'public', city: 'Hubballi'},
    {name: 'GESCOM, Kalaburagi', type: 'public', city: 'Kalaburagi'},
    {name: 'Kerala State Electricity Board', type: 'public', city: 'Kerala'},
    {
      name: 'Madhya Pradesh Power Generation Company Limited',
      type: 'public',
      city: 'Madhya Pradesh',
    },
    {
      name: 'Madhya Pradesh Power Transmission Company Limited',
      type: 'public',
      city: 'Madhya Pradesh',
    },
    {
      name: 'Madhya Pradesh Poorv Kshetra Vidyut Company Limited',
      type: 'public',
      city: 'Madhya Pradesh',
    },
    {
      name: 'Madhya Pradesh Madhya Kshetra Vidyut Vitaran Company Limited',
      type: 'public',
      city: 'Madhya Pradesh',
    },
    {
      name: 'Madhya Pradesh Paschim Kshetra Vidyut Vitaran Company Limited',
      type: 'public',
      city: 'Madhya Pradesh',
    },
    {
      name: 'Madhya Pradesh Power Management Company Limited',
      type: 'public',
      city: 'Madhya Pradesh',
    },
    {
      name: 'Madhya Pradesh Electricity Regulatory Commission',
      type: 'public',
      city: 'Madhya Pradesh',
    },
    {
      name: 'Maharashtra State Electricity Board',
      type: 'public',
      city: 'Maharashtra',
    },
    {
      name: 'Maharashtra State Electricity Distribution Company Limited',
      type: 'public',
      city: 'Maharashtra',
    },
    {
      name: 'Maharashtra State Electricity Transmission Company Limited',
      type: 'public',
      city: 'Maharashtra',
    },
    {
      name: 'Maharashtra State Power Generation Company Limited',
      type: 'public',
      city: 'Maharashtra',
    },
    {
      name: 'Rajasthan Rajya Vidyut Utpadan Nigam',
      type: 'public',
      city: 'Rajasthan',
    },
    {
      name: 'Rajasthan Rajya Vidyut Prasaran Nigam Limited',
      type: 'public',
      city: 'Rajasthan',
    },
    {
      name: 'Uttar Pradesh Rajya Vidyut Utpadan Nigam (UPRVUN)',
      type: 'public',
      city: 'Uttar Pradesh',
    },
    {
      name: 'Uttar Pradesh Rajya Vidyut Utpadan Nigam Limited (UPRVUNL)',
      type: 'public',
      city: 'Uttar Pradesh',
    },
    {
      name: 'Uttar Pradesh Power Corporation Limited (UPPCL)',
      type: 'public',
      city: 'Uttar Pradesh',
    },
    {
      name: 'UP Power Transmission Corporation Limited (UPPTCL)',
      type: 'public',
      city: 'Uttar Pradesh',
    },
    {
      name: 'UP Jal Vidyut Nigam Limited (UPJVNL)',
      type: 'public',
      city: 'Uttar Pradesh',
    },
    {
      name: 'West Bengal Power Development Corporation Limited',
      type: 'public',
      city: 'West Bengal',
    },
    {
      name: 'West Bengal State Electricity Board',
      type: 'public',
      city: 'West Bengal',
    },
    {name: 'CESC Limited', type: 'private', city: 'West Bengal'},
    {name: 'Odisha Hydro Power Corporation', type: 'public', city: 'Odisha'},
    {
      name: 'Odisha Power Generation Corporation',
      type: 'public',
      city: 'Odisha',
    },
    {
      name: 'Odisha Electricity Regulatory Commission',
      type: 'public',
      city: 'Odisha',
    },
    {
      name: 'Central Electricity Supply Utility of Odisha',
      type: 'public',
      city: 'Odisha',
    },
    {
      name: 'Western Electricity Supply Company of Odisha',
      type: 'public',
      city: 'Odisha',
    },
    {
      name: 'Odisha Power Transmission Corporation Limited',
      type: 'public',
      city: 'Odisha',
    },
    {
      name: 'TP Northern Odisha Distribution Limited (TPNODL)',
      type: 'private',
      city: 'Odisha',
    },
    {name: 'TNEB Limited', type: 'public', city: 'Tamil Nadu'},
    {
      name: 'Tamil Nadu Generation and Distribution Corporation Limited',
      type: 'public',
      city: 'Tamil Nadu',
    },
    {
      name: 'Tamil Nadu Transmission Corporation Limited',
      type: 'public',
      city: 'Tamil Nadu',
    },
    {
      name: 'Tamil Nadu Energy Development Agency',
      type: 'public',
      city: 'Tamil Nadu',
    },
    {
      name: 'Tamil Nadu Electrical Licensing Board',
      type: 'public',
      city: 'Tamil Nadu',
    },
    {
      name: 'Tamil Nadu Electricity Regulatory Commission',
      type: 'public',
      city: 'Tamil Nadu',
    },
    {
      name: 'Tamil Nadu Electrical Inspectorate',
      type: 'public',
      city: 'Tamil Nadu',
    },
    {
      name: 'Telangana Power Generation Corporation-TGGENCO',
      type: 'public',
      city: 'Telangana',
    },
    {
      name: 'Transmission Corporation of Telangana',
      type: 'public',
      city: 'Telangana',
    },
    {
      name: 'Telangana State Northern Power Distribution Company Limited',
      type: 'public',
      city: 'Telangana',
    },
    {
      name: 'Telangana State Southern Power Distribution Company Limited',
      type: 'public',
      city: 'Telangana',
    },
    {
      name: 'Punjab State Power Corporation Limited',
      type: 'public',
      city: 'Punjab',
    },
    {
      name: 'Punjab State Power Transmission Corporation Limited',
      type: 'public',
      city: 'Punjab',
    },
    {
      name: 'Adani Electricity Mumbai Limited (AEML)',
      type: 'private',
      city: 'Maharashtra',
    },
    {name: 'Tata Power', type: 'private', city: 'Maharashtra'},
    {
      name: 'Reliance Energy (Reliance Infrastructure)',
      type: 'private',
      city: 'Maharashtra',
    },
  ];

  const [applianceCount, setApplianceCount] = useState({
    airConditioner: 0,
    telivision: 0,
    refrigerator: 0,
    washingMachine: 0,
    geyser: 0,
    microwave: 0,
    electricHeater: 0,
    electricGas: 0,
    motor: 0,
    toaster: 0,
    vaccumCleaner: 0,
    computer: 0,
    laptop: 0,
    smartPhone: 0,
    router: 0,
    speaker: 0,
    fan: 0,
    light: 0,
    fishTankPump: 0,
    grindingMachine: 0,
  });
  const [applianceTime, setApplianceTime] = useState({
    airConditionerTime: 0,
    telivisionTime: 0,
    refrigeratorTime: 0,
    washingMachineTime: 0,
    geyserTime: 0,
    microwaveTime: 0,
    electricHeaterTime: 0,
    electricGasTime: 0,
    motorTime: 0,
    toasterTime: 0,
    vaccumCleanerTime: 0,
    computerTime: 0,
    laptopTime: 0,
    smartPhoneTime: 0,
    routerTime: 0,
    speakerTime: 0,
    fanTime: 0,
    lightTime: 0,
    fishTankPumpTime: 0,
    grindingMachineTime: 0,
  });
  const [evData, setEvData] = useState({
    evPods: 0,
    evTime: 0,
  });
  const [electricityType, setElectricityType] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleElectricityTypeChange = value => {
    setElectricityType(value);
  };

  React.useCallback(() => {
    setShowOpt(true);
    setelectricityUnits(0);
    setElectricitySupplier('');
    setElectricityType('');
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
        .collection('ElectricityDetails')
        .doc(`electricity_details:${uid}`);
      const doc = await clothingDetailsRef.get();
      if (doc.exists) {
        const data = doc.data();
        setelectricityUnits(data.electricityUnits);
        setElectricitySupplier(data.electricitySupplier);
        setElectricityType(data.electricityType);
        setApplianceCount(data.applianceCount);
        setApplianceTime(data.applianceTime);
        setEvData(data.evData);
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
        .collection('ElectricityDetails')
        .doc(`electricity_details:${uid}`);
      let data = {
        electricityUnits: electricityUnits,
        electricitySupplier: electricitySupplier,
        electricityType: electricityType,
        applianceCount: applianceCount,
        applianceTime: {
          airConditionerTime:
            applianceCount.airConditioner > 0
              ? applianceTime.airConditionerTime
              : 0,
          telivisionTime:
            applianceCount.telivision > 0 ? applianceTime.telivisionTime : 0,
          refrigeratorTime:
            applianceCount.refrigerator > 0
              ? applianceTime.refrigeratorTime
              : 0,
          washingMachineTime:
            applianceCount.washingMachine > 0
              ? applianceTime.washingMachineTime
              : 0,
          geyserTime: applianceCount.geyser > 0 ? applianceTime.geyserTime : 0,
          microwaveTime:
            applianceCount.microwave > 0 ? applianceTime.microwaveTime : 0,
          electricHeaterTime:
            applianceCount.electricHeater > 0
              ? applianceTime.electricHeaterTime
              : 0,
          electricGasTime:
            applianceCount.electricGas > 0 ? applianceTime.electricGasTime : 0,
          motorTime: applianceCount.motor > 0 ? applianceTime.motorTime : 0,
          toasterTime: applianceCount.toaster > 0 ? applianceTime.toasterTime : 0,
          vaccumCleanerTime: applianceCount.vaccumCleaner > 0 ? applianceTime.vaccumCleanerTime : 0,
          computerTime: applianceCount.computer > 0 ? applianceTime.computerTime : 0,
          laptopTime: applianceCount.laptop > 0 ? applianceTime.laptopTime : 0,
          smartPhoneTime: applianceCount.smartPhone > 0 ? applianceTime.smartPhoneTime : 0,
          routerTime: applianceCount.router > 0 ? applianceTime.routerTime : 0,
          speakerTime: applianceCount.speaker > 0 ? applianceTime.speakerTime : 0,
          fanTime: applianceCount.fan > 0 ? applianceTime.fanTime : 0,
          lightTime: applianceCount.light > 0 ? applianceTime.lightTime : 0,
          fishTankPumpTime: applianceCount.fishTankPump > 0 ? applianceTime.fishTankPumpTime : 0,
          grindingMachineTime: applianceCount.grindingMachine > 0 ? applianceTime.grindingMachineTime : 0,
        },
        evData: {
          evPods: evData.evPods,
          evTime: evData.evPods > 0 ? evData.evTime : 0,
        },
      };
      await recycleDetailsRef.set(data);
      from.trim() === 'signup'
        ? navigation.navigate('Home')
        : navigation.navigate('Survey', {uid: uid});
    } catch (err) {
      console.error(err);
    }
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
            Electricity Details
          </Text>
          <Text
            style={{
              color: 'gray',
              fontSize: 14,
              textAlign: 'center',
              fontFamily: colors.font1,
              width: '90%',
            }}>
            Provide your Electricity details to help us accurately calculate
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
            source={require('../assets/electric1.png')}
            style={{width: '100%', height: 140, objectFit: 'cover'}}
          />
          <Text style={styles.questionText}>
            {'Specify your electricity details'}
          </Text>
          <ScrollView style={{width: '100%'}}>
            <Text style={styles.subTxt}>Units of electricity per month</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/units.png')}
                  style={{width: 33, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(electricityUnits)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setelectricityUnits(numericValue);
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Electricity Supplier</Text>
            <TouchableOpacity
              style={{
                width: '100%',
                height: 45,
                borderWidth: 0.4,
                borderColor: 'gray',
                marginVertical: 10,
                paddingHorizontal: 10,
                borderRadius: 7,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onPress={() => setShowOpt(!showOpt)}>
              <TextInput
                editable={false}
                placeholderTextColor={'gray'}
                placeholder="Select your supplier"
                value={electricitySupplier}
                style={{color: 'gray', width: '90%', fontFamily: colors.font4}}
              />
              <Image
                source={
                  !showOpt
                    ? require('../assets/arrowDown.png')
                    : require('../assets/arrowUp.png')
                }
                style={{width: 25, height: 25}}
              />
            </TouchableOpacity>
            {showOpt && (
              <View
                style={{
                  width: '100%',
                  height: 180,
                  borderWidth: 0.4,
                  borderColor: 'gray',
                  borderRadius: 7,
                }}>
                <ScrollView style={{width: '100%', paddingTop: 5}}>
                  {options.map(opt => (
                    <TouchableOpacity
                      onPress={() => handleChoice(opt.name)}
                      style={{
                        paddingHorizontal: 15,
                        paddingVertical: 4,
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}>
                      <Text
                        style={{
                          color: 'gray',
                          fontFamily: colors.font2,
                          fontSize: 14,
                        }}>
                        {opt.name}
                      </Text>
                      <Text
                        style={{
                          color: 'gray',
                          borderBottomColor: 'lightgray',
                          borderBottomWidth: 0.4,
                          paddingBottom: 4,
                          width: '90%',
                          fontFamily: colors.font1,
                        }}>
                        {opt.city + '(' + opt.type + ')'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>
        </View>
        <View key={1} style={styles.questionContainer}>
          <Image
            source={require('../assets/electric2.png')}
            style={{width: '100%', height: 120, objectFit: 'contain'}}
          />
          <Text style={styles.questionText}>
            {'State the number of appliances'}
          </Text>
          <ScrollView style={{width: '100%'}}>
            <Text style={styles.subTxt}>Air Conditioner</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/ac.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(applianceCount.airConditioner)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setApplianceCount({
                      ...applianceCount,
                      airConditioner: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Telivison</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/tv.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(applianceCount.telivision)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setApplianceCount({
                      ...applianceCount,
                      telivision: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Refrigerator</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/fridge.png')}
                  style={{width: 33, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(applianceCount.refrigerator)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setApplianceCount({
                      ...applianceCount,
                      refrigerator: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Washing Machine</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/wm.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(applianceCount.washingMachine)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setApplianceCount({
                      ...applianceCount,
                      washingMachine: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Microwave</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/mw.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(applianceCount.microwave)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setApplianceCount({
                      ...applianceCount,
                      microwave: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Geyser</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/geyser.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(applianceCount.geyser)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setApplianceCount({
                      ...applianceCount,
                      geyser: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Electric Heater</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/eh.png')}
                  style={{width: 33, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(applianceCount.electricHeater)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setApplianceCount({
                      ...applianceCount,
                      electricHeater: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Electric Gas</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/eg.png')}
                  style={{width: 33, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(applianceCount.electricGas)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setApplianceCount({
                      ...applianceCount,
                      electricGas: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Motor</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/motor.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(applianceCount.motor)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setApplianceCount({
                      ...applianceCount,
                      motor: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Toaster</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/toaster.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(applianceCount.toaster)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setApplianceCount({
                      ...applianceCount,
                      toaster: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Vaccum Cleaner</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/vc.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(applianceCount.vaccumCleaner)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setApplianceCount({
                      ...applianceCount,
                      vaccumCleaner: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Computer</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/computer.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(applianceCount.computer)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setApplianceCount({
                      ...applianceCount,
                      computer: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Laptop</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/laptop.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(applianceCount.laptop)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setApplianceCount({
                      ...applianceCount,
                      laptop: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Smart Phone</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/sp.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(applianceCount.smartPhone)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setApplianceCount({
                      ...applianceCount,
                      smartPhone: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Router</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/router.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(applianceCount.router)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setApplianceCount({
                      ...applianceCount,
                      router: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Speakers</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/speaker.png')}
                  style={{width: 36, height: 36}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(applianceCount.speaker)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setApplianceCount({
                      ...applianceCount,
                      speaker: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Fans</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/fan.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(applianceCount.fan)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setApplianceCount({
                      ...applianceCount,
                      fan: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Lights</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/light.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(applianceCount.light)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setApplianceCount({
                      ...applianceCount,
                      light: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Fish Tank Pump</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/ft.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(applianceCount.fishTankPump)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setApplianceCount({
                      ...applianceCount,
                      fishTankPump: numericValue,
                    });
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>Grinder</Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/grinder.png')}
                  style={{width: 36, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(applianceCount.grindingMachine)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setApplianceCount({
                      ...applianceCount,
                      grindingMachine: numericValue,
                    });
                  }
                }}
              />
            </View>
            <View style={{width: '100%', height: 180}}></View>
          </ScrollView>
        </View>
        <View key={2} style={styles.questionContainer}>
          <Image
            source={require('../assets/electric2.png')}
            style={{width: '100%', height: 120, objectFit: 'contain'}}
          />
          <Text style={styles.questionText}>
            {'State the amount of time you use each appliance per day'}
          </Text>
          <ScrollView style={{width: '100%'}}>
            {applianceCount.airConditioner !== 0 && (
              <View style={{flexDirection: 'column', width: '100%'}}>
                <Text style={styles.subTxt}>Air Conditioner</Text>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '14%'}}>
                    <Image
                      source={require('../assets/ac.png')}
                      style={{width: 36, height: 33}}
                    />
                  </View>
                  <Slider
                    style={{width: '72%', height: 60}}
                    minimumValue={0}
                    maximumValue={24*applianceCount.airConditioner}
                    step={1}
                    value={applianceTime.airConditionerTime}
                    onValueChange={val =>
                      setApplianceTime({
                        ...applianceTime,
                        airConditionerTime: val,
                      })
                    }
                    minimumTrackTintColor="black"
                    maximumTrackTintColor="black"
                    thumbTintColor="black"
                  />
                  <TextInput
                    style={styles.texInput}
                    keyboardType="numeric"
                    value={String(applianceTime.airConditionerTime)}
                    onChangeText={text => {
                      const numericValue = parseInt(text, 10);
                      if (!isNaN(numericValue)) {
                        setApplianceTime({
                          ...applianceTime,
                          airConditionerTime: numericValue,
                        });
                      }
                    }}
                  />
                </View>
              </View>
            )}
            {applianceCount.telivision !== 0 && (
              <View style={{flexDirection: 'column', width: '100%'}}>
                <Text style={styles.subTxt}>Telivison</Text>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '14%'}}>
                    <Image
                      source={require('../assets/tv.png')}
                      style={{width: 36, height: 33}}
                    />
                  </View>
                  <Slider
                    style={{width: '72%', height: 60}}
                    minimumValue={0}
                    maximumValue={24*applianceCount.telivision}
                    step={1}
                    value={applianceTime.telivisionTime}
                    onValueChange={val =>
                      setApplianceTime({
                        ...applianceTime,
                        telivisionTime: val,
                      })
                    }
                    minimumTrackTintColor="black"
                    maximumTrackTintColor="black"
                    thumbTintColor="black"
                  />
                  <TextInput
                    style={styles.texInput}
                    keyboardType="numeric"
                    value={String(applianceTime.telivisionTime)}
                    onChangeText={text => {
                      const numericValue = parseInt(text, 10);
                      if (!isNaN(numericValue)) {
                        setApplianceTime({
                          ...applianceTime,
                          telivisionTime: numericValue,
                        });
                      }
                    }}
                  />
                </View>
              </View>
            )}
            {applianceCount.refrigerator !== 0 && (
              <View style={{flexDirection: 'column', width: '100%'}}>
                <Text style={styles.subTxt}>Refrigerators</Text>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '14%'}}>
                    <Image
                      source={require('../assets/fridge.png')}
                      style={{width: 33, height: 33}}
                    />
                  </View>
                  <Slider
                    style={{width: '72%', height: 60}}
                    minimumValue={0}
                    maximumValue={24*applianceCount.refrigerator}
                    step={1}
                    value={applianceTime.refrigeratorTime}
                    onValueChange={val =>
                      setApplianceTime({
                        ...applianceTime,
                        refrigeratorTime: val,
                      })
                    }
                    minimumTrackTintColor="black"
                    maximumTrackTintColor="black"
                    thumbTintColor="black"
                  />
                  <TextInput
                    style={styles.texInput}
                    keyboardType="numeric"
                    value={String(applianceTime.refrigeratorTime)}
                    onChangeText={text => {
                      const numericValue = parseInt(text, 10);
                      if (!isNaN(numericValue)) {
                        setApplianceTime({
                          ...applianceTime,
                          refrigeratorTime: numericValue,
                        });
                      }
                    }}
                  />
                </View>
              </View>
            )}
            {applianceCount.washingMachine !== 0 && (
              <View style={{flexDirection: 'column', width: '100%'}}>
                <Text style={styles.subTxt}>Washing Machine</Text>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '14%'}}>
                    <Image
                      source={require('../assets/wm.png')}
                      style={{width: 36, height: 33}}
                    />
                  </View>
                  <Slider
                    style={{width: '72%', height: 60}}
                    minimumValue={0}
                    maximumValue={24/applianceCount.washingMachine}
                    step={1}
                    value={applianceTime.washingMachineTime}
                    onValueChange={val =>
                      setApplianceTime({
                        ...applianceTime,
                        washingMachineTime: val,
                      })
                    }
                    minimumTrackTintColor="black"
                    maximumTrackTintColor="black"
                    thumbTintColor="black"
                  />
                  <TextInput
                    style={styles.texInput}
                    keyboardType="numeric"
                    value={String(applianceTime.washingMachineTime)}
                    onChangeText={text => {
                      const numericValue = parseInt(text, 10);
                      if (!isNaN(numericValue)) {
                        setApplianceTime({
                          ...applianceTime,
                          washingMachineTime: numericValue,
                        });
                      }
                    }}
                  />
                </View>
              </View>
            )}
            {applianceCount.microwave !== 0 && (
              <View style={{flexDirection: 'column', width: '100%'}}>
                <Text style={styles.subTxt}>Microwave</Text>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '14%'}}>
                    <Image
                      source={require('../assets/mw.png')}
                      style={{width: 36, height: 33}}
                    />
                  </View>
                  <Slider
                    style={{width: '72%', height: 60}}
                    minimumValue={0}
                    maximumValue={24*applianceCount.microwave}
                    step={1}
                    value={applianceTime.microwaveTime}
                    onValueChange={val =>
                      setApplianceTime({
                        ...applianceTime,
                        microwaveTime: val,
                      })
                    }
                    minimumTrackTintColor="black"
                    maximumTrackTintColor="black"
                    thumbTintColor="black"
                  />
                  <TextInput
                    style={styles.texInput}
                    keyboardType="numeric"
                    value={String(applianceTime.microwaveTime)}
                    onChangeText={text => {
                      const numericValue = parseInt(text, 10);
                      if (!isNaN(numericValue)) {
                        setApplianceTime({
                          ...applianceTime,
                          microwaveTime: numericValue,
                        });
                      }
                    }}
                  />
                </View>
              </View>
            )}
            {applianceCount.geyser !== 0 && (
              <View style={{flexDirection: 'column', width: '100%'}}>
                <Text style={styles.subTxt}>Geyser</Text>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '14%'}}>
                    <Image
                      source={require('../assets/geyser.png')}
                      style={{width: 36, height: 33}}
                    />
                  </View>
                  <Slider
                    style={{width: '72%', height: 60}}
                    minimumValue={0}
                    maximumValue={24*applianceCount.geyser}
                    step={1}
                    value={applianceTime.geyserTime}
                    onValueChange={val =>
                      setApplianceTime({
                        ...applianceTime,
                        geyserTime: val,
                      })
                    }
                    minimumTrackTintColor="black"
                    maximumTrackTintColor="black"
                    thumbTintColor="black"
                  />
                  <TextInput
                    style={styles.texInput}
                    keyboardType="numeric"
                    value={String(applianceTime.geyserTime)}
                    onChangeText={text => {
                      const numericValue = parseInt(text, 10);
                      if (!isNaN(numericValue)) {
                        setApplianceTime({
                          ...applianceTime,
                          geyserTime: numericValue,
                        });
                      }
                    }}
                  />
                </View>
              </View>
            )}
            {applianceCount.electricHeater !== 0 && (
              <View style={{flexDirection: 'column', width: '100%'}}>
                <Text style={styles.subTxt}>Electric Heater</Text>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '14%'}}>
                    <Image
                      source={require('../assets/eh.png')}
                      style={{width: 33, height: 33}}
                    />
                  </View>
                  <Slider
                    style={{width: '72%', height: 60}}
                    minimumValue={0}
                    maximumValue={24*applianceCount.electricHeater}
                    step={1}
                    value={applianceTime.electricHeaterTime}
                    onValueChange={val =>
                      setApplianceTime({
                        ...applianceTime,
                        electricHeaterTime: val,
                      })
                    }
                    minimumTrackTintColor="black"
                    maximumTrackTintColor="black"
                    thumbTintColor="black"
                  />
                  <TextInput
                    style={styles.texInput}
                    keyboardType="numeric"
                    value={String(applianceTime.electricHeaterTime)}
                    onChangeText={text => {
                      const numericValue = parseInt(text, 10);
                      if (!isNaN(numericValue)) {
                        setApplianceTime({
                          ...applianceTime,
                          electricHeaterTime: numericValue,
                        });
                      }
                    }}
                  />
                </View>
              </View>
            )}
            {applianceCount.electricGas !== 0 && (
              <View style={{flexDirection: 'column', width: '100%'}}>
                <Text style={styles.subTxt}>Electric Gas</Text>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '14%'}}>
                    <Image
                      source={require('../assets/eg.png')}
                      style={{width: 33, height: 33}}
                    />
                  </View>
                  <Slider
                    style={{width: '72%', height: 60}}
                    minimumValue={0}
                    maximumValue={24*applianceCount.electricGas}
                    step={1}
                    value={applianceTime.electricGasTime}
                    onValueChange={val =>
                      setApplianceTime({
                        ...applianceTime,
                        electricGasTime: val,
                      })
                    }
                    minimumTrackTintColor="black"
                    maximumTrackTintColor="black"
                    thumbTintColor="black"
                  />
                  <TextInput
                    style={styles.texInput}
                    keyboardType="numeric"
                    value={String(applianceTime.electricGasTime)}
                    onChangeText={text => {
                      const numericValue = parseInt(text, 10);
                      if (!isNaN(numericValue)) {
                        setApplianceTime({
                          ...applianceTime,
                          electricGasTime: numericValue,
                        });
                      }
                    }}
                  />
                </View>
              </View>
            )}
            {applianceCount.motor !== 0 && (
              <View style={{flexDirection: 'column', width: '100%'}}>
                <Text style={styles.subTxt}>Motor</Text>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '14%'}}>
                    <Image
                      source={require('../assets/motor.png')}
                      style={{width: 36, height: 33}}
                    />
                  </View>
                  <Slider
                    style={{width: '72%', height: 60}}
                    minimumValue={0}
                    maximumValue={24*applianceCount.motor}
                    step={1}
                    value={applianceTime.motorTime}
                    onValueChange={val =>
                      setApplianceTime({
                        ...applianceTime,
                        motorTime: val,
                      })
                    }
                    minimumTrackTintColor="black"
                    maximumTrackTintColor="black"
                    thumbTintColor="black"
                  />
                  <TextInput
                    style={styles.texInput}
                    keyboardType="numeric"
                    value={String(applianceTime.motorTime)}
                    onChangeText={text => {
                      const numericValue = parseInt(text, 10);
                      if (!isNaN(numericValue)) {
                        setApplianceTime({
                          ...applianceTime,
                          motorTime: numericValue,
                        });
                      }
                    }}
                  />
                </View>
              </View>
            )}

            {applianceCount.toaster !== 0 && (
              <View style={{flexDirection: 'column', width: '100%'}}>
                <Text style={styles.subTxt}>Toaster</Text>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '14%'}}>
                    <Image
                      source={require('../assets/toaster.png')}
                      style={{width: 36, height: 33}}
                    />
                  </View>
                  <Slider
                    style={{width: '72%', height: 60}}
                    minimumValue={0}
                    maximumValue={24*applianceCount.toaster}
                    step={1}
                    value={applianceTime.toasterTime}
                    onValueChange={val =>
                      setApplianceTime({
                        ...applianceTime,
                        toasterTime: val,
                      })
                    }
                    minimumTrackTintColor="black"
                    maximumTrackTintColor="black"
                    thumbTintColor="black"
                  />
                  <TextInput
                    style={styles.texInput}
                    keyboardType="numeric"
                    value={String(applianceTime.toasterTime)}
                    onChangeText={text => {
                      const numericValue = parseInt(text, 10);
                      if (!isNaN(numericValue)) {
                        setApplianceTime({
                          ...applianceTime,
                          toasterTime: numericValue,
                        });
                      }
                    }}
                  />
                </View>
              </View>
            )}
            {applianceCount.vaccumCleaner !== 0 && (
              <View style={{flexDirection: 'column', width: '100%'}}>
                <Text style={styles.subTxt}>Vaccum Cleaner</Text>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '14%'}}>
                    <Image
                      source={require('../assets/vc.png')}
                      style={{width: 36, height: 33}}
                    />
                  </View>
                  <Slider
                    style={{width: '72%', height: 60}}
                    minimumValue={0}
                    maximumValue={24*applianceCount.vaccumCleaner}
                    step={1}
                    value={applianceTime.vaccumCleanerTime}
                    onValueChange={val =>
                      setApplianceTime({
                        ...applianceTime,
                        vaccumCleanerTime: val,
                      })
                    }
                    minimumTrackTintColor="black"
                    maximumTrackTintColor="black"
                    thumbTintColor="black"
                  />
                  <TextInput
                    style={styles.texInput}
                    keyboardType="numeric"
                    value={String(applianceTime.vaccumCleanerTime)}
                    onChangeText={text => {
                      const numericValue = parseInt(text, 10);
                      if (!isNaN(numericValue)) {
                        setApplianceTime({
                          ...applianceTime,
                          vaccumCleanerTime: numericValue,
                        });
                      }
                    }}
                  />
                </View>
              </View>
            )}
            {applianceCount.computer !== 0 && (
              <View style={{flexDirection: 'column', width: '100%'}}>
                <Text style={styles.subTxt}>Computer</Text>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '14%'}}>
                    <Image
                      source={require('../assets/computer.png')}
                      style={{width: 36, height: 33}}
                    />
                  </View>
                  <Slider
                    style={{width: '72%', height: 60}}
                    minimumValue={0}
                    maximumValue={24*applianceCount.computer}
                    step={1}
                    value={applianceTime.computerTime}
                    onValueChange={val =>
                      setApplianceTime({
                        ...applianceTime,
                        computerTime: val,
                      })
                    }
                    minimumTrackTintColor="black"
                    maximumTrackTintColor="black"
                    thumbTintColor="black"
                  />
                  <TextInput
                    style={styles.texInput}
                    keyboardType="numeric"
                    value={String(applianceTime.computerTime)}
                    onChangeText={text => {
                      const numericValue = parseInt(text, 10);
                      if (!isNaN(numericValue)) {
                        setApplianceTime({
                          ...applianceTime,
                          computerTime: numericValue,
                        });
                      }
                    }}
                  />
                </View>
              </View>
            )}
            {applianceCount.laptop !== 0 && (
              <View style={{flexDirection: 'column', width: '100%'}}>
                <Text style={styles.subTxt}>Laptop</Text>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '14%'}}>
                    <Image
                      source={require('../assets/laptop.png')}
                      style={{width: 36, height: 33}}
                    />
                  </View>
                  <Slider
                    style={{width: '72%', height: 60}}
                    minimumValue={0}
                    maximumValue={24*applianceCount.laptop}
                    step={1}
                    value={applianceTime.laptopTime}
                    onValueChange={val =>
                      setApplianceTime({
                        ...applianceTime,
                        laptopTime: val,
                      })
                    }
                    minimumTrackTintColor="black"
                    maximumTrackTintColor="black"
                    thumbTintColor="black"
                  />
                  <TextInput
                    style={styles.texInput}
                    keyboardType="numeric"
                    value={String(applianceTime.laptopTime)}
                    onChangeText={text => {
                      const numericValue = parseInt(text, 10);
                      if (!isNaN(numericValue)) {
                        setApplianceTime({
                          ...applianceTime,
                          laptopTime: numericValue,
                        });
                      }
                    }}
                  />
                </View>
              </View>
            )}
            {applianceCount.smartPhone !== 0 && (
              <View style={{flexDirection: 'column', width: '100%'}}>
                <Text style={styles.subTxt}>Smart Phone</Text>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '14%'}}>
                    <Image
                      source={require('../assets/sp.png')}
                      style={{width: 36, height: 33}}
                    />
                  </View>
                  <Slider
                    style={{width: '72%', height: 60}}
                    minimumValue={0}
                    maximumValue={24*applianceCount.smartPhone}
                    step={1}
                    value={applianceTime.smartPhoneTime}
                    onValueChange={val =>
                      setApplianceTime({
                        ...applianceTime,
                        smartPhoneTime: val,
                      })
                    }
                    minimumTrackTintColor="black"
                    maximumTrackTintColor="black"
                    thumbTintColor="black"
                  />
                  <TextInput
                    style={styles.texInput}
                    keyboardType="numeric"
                    value={String(applianceTime.smartPhoneTime)}
                    onChangeText={text => {
                      const numericValue = parseInt(text, 10);
                      if (!isNaN(numericValue)) {
                        setApplianceTime({
                          ...applianceTime,
                          smartPhoneTime: numericValue,
                        });
                      }
                    }}
                  />
                </View>
              </View>
            )}
            {applianceCount.router !== 0 && (
              <View style={{flexDirection: 'column', width: '100%'}}>
                <Text style={styles.subTxt}>Router</Text>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '14%'}}>
                    <Image
                      source={require('../assets/router.png')}
                      style={{width: 36, height: 33}}
                    />
                  </View>
                  <Slider
                    style={{width: '72%', height: 60}}
                    minimumValue={0}
                    maximumValue={24*applianceCount.router}
                    step={1}
                    value={applianceTime.routerTime}
                    onValueChange={val =>
                      setApplianceTime({
                        ...applianceTime,
                        routerTime: val,
                      })
                    }
                    minimumTrackTintColor="black"
                    maximumTrackTintColor="black"
                    thumbTintColor="black"
                  />
                  <TextInput
                    style={styles.texInput}
                    keyboardType="numeric"
                    value={String(applianceTime.routerTime)}
                    onChangeText={text => {
                      const numericValue = parseInt(text, 10);
                      if (!isNaN(numericValue)) {
                        setApplianceTime({
                          ...applianceTime,
                          routerTime: numericValue,
                        });
                      }
                    }}
                  />
                </View>
              </View>
            )}
            {applianceCount.speaker !== 0 && (
              <View style={{flexDirection: 'column', width: '100%'}}>
                <Text style={styles.subTxt}>Speaker</Text>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '14%'}}>
                    <Image
                      source={require('../assets/speaker.png')}
                      style={{width: 36, height: 36}}
                    />
                  </View>
                  <Slider
                    style={{width: '72%', height: 60}}
                    minimumValue={0}
                    maximumValue={24*applianceCount.speaker}
                    step={1}
                    value={applianceTime.speakerTime}
                    onValueChange={val =>
                      setApplianceTime({
                        ...applianceTime,
                        speakerTime: val,
                      })
                    }
                    minimumTrackTintColor="black"
                    maximumTrackTintColor="black"
                    thumbTintColor="black"
                  />
                  <TextInput
                    style={styles.texInput}
                    keyboardType="numeric"
                    value={String(applianceTime.speakerTime)}
                    onChangeText={text => {
                      const numericValue = parseInt(text, 10);
                      if (!isNaN(numericValue)) {
                        setApplianceTime({
                          ...applianceTime,
                          speakerTime: numericValue,
                        });
                      }
                    }}
                  />
                </View>
              </View>
            )}
            {applianceCount.fan !== 0 && (
              <View style={{flexDirection: 'column', width: '100%'}}>
                <Text style={styles.subTxt}>Fan</Text>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '14%'}}>
                    <Image
                      source={require('../assets/fan.png')}
                      style={{width: 36, height: 33}}
                    />
                  </View>
                  <Slider
                    style={{width: '72%', height: 60}}
                    minimumValue={0}
                    maximumValue={24*applianceCount.fan}
                    step={1}
                    value={applianceTime.fanTime}
                    onValueChange={val =>
                      setApplianceTime({
                        ...applianceTime,
                        fanTime: val,
                      })
                    }
                    minimumTrackTintColor="black"
                    maximumTrackTintColor="black"
                    thumbTintColor="black"
                  />
                  <TextInput
                    style={styles.texInput}
                    keyboardType="numeric"
                    value={String(applianceTime.fanTime)}
                    onChangeText={text => {
                      const numericValue = parseInt(text, 10);
                      if (!isNaN(numericValue)) {
                        setApplianceTime({
                          ...applianceTime,
                          fanTime: numericValue,
                        });
                      }
                    }}
                  />
                </View>
              </View>
            )}
            {applianceCount.light !== 0 && (
              <View style={{flexDirection: 'column', width: '100%'}}>
                <Text style={styles.subTxt}>Light</Text>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '14%'}}>
                    <Image
                      source={require('../assets/light.png')}
                      style={{width: 36, height: 33}}
                    />
                  </View>
                  <Slider
                    style={{width: '72%', height: 60}}
                    minimumValue={0}
                    maximumValue={24*applianceCount.light}
                    step={1}
                    value={applianceTime.lightTime}
                    onValueChange={val =>
                      setApplianceTime({
                        ...applianceTime,
                        lightTime: val,
                      })
                    }
                    minimumTrackTintColor="black"
                    maximumTrackTintColor="black"
                    thumbTintColor="black"
                  />
                  <TextInput
                    style={styles.texInput}
                    keyboardType="numeric"
                    value={String(applianceTime.lightTime)}
                    onChangeText={text => {
                      const numericValue = parseInt(text, 10);
                      if (!isNaN(numericValue)) {
                        setApplianceTime({
                          ...applianceTime,
                          lightTime: numericValue,
                        });
                      }
                    }}
                  />
                </View>
              </View>
            )}
            {applianceCount.fishTankPump !== 0 && (
              <View style={{flexDirection: 'column', width: '100%'}}>
                <Text style={styles.subTxt}>Fish Tank Pump</Text>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '14%'}}>
                    <Image
                      source={require('../assets/ft.png')}
                      style={{width: 36, height: 33}}
                    />
                  </View>
                  <Slider
                    style={{width: '72%', height: 60}}
                    minimumValue={0}
                    maximumValue={24*applianceCount.fishTankPump}
                    step={1}
                    value={applianceTime.fishTankPumpTime}
                    onValueChange={val =>
                      setApplianceTime({
                        ...applianceTime,
                        fishTankPumpTime: val,
                      })
                    }
                    minimumTrackTintColor="black"
                    maximumTrackTintColor="black"
                    thumbTintColor="black"
                  />
                  <TextInput
                    style={styles.texInput}
                    keyboardType="numeric"
                    value={String(applianceTime.fishTankPumpTime)}
                    onChangeText={text => {
                      const numericValue = parseInt(text, 10);
                      if (!isNaN(numericValue)) {
                        setApplianceTime({
                          ...applianceTime,
                          fishTankPumpTime: numericValue,
                        });
                      }
                    }}
                  />
                </View>
              </View>
            )}
            {applianceCount.grindingMachine !== 0 && (
              <View style={{flexDirection: 'column', width: '100%'}}>
                <Text style={styles.subTxt}>Grinder</Text>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '14%'}}>
                    <Image
                      source={require('../assets/grinder.png')}
                      style={{width: 36, height: 33}}
                    />
                  </View>
                  <Slider
                    style={{width: '72%', height: 60}}
                    minimumValue={0}
                    maximumValue={24*applianceCount.grindingMachine}
                    step={1}
                    value={applianceTime.grindingMachineTime}
                    onValueChange={val =>
                      setApplianceTime({
                        ...applianceTime,
                        grindingMachineTime: val,
                      })
                    }
                    minimumTrackTintColor="black"
                    maximumTrackTintColor="black"
                    thumbTintColor="black"
                  />
                  <TextInput
                    style={styles.texInput}
                    keyboardType="numeric"
                    value={String(applianceTime.grindingMachineTime)}
                    onChangeText={text => {
                      const numericValue = parseInt(text, 10);
                      if (!isNaN(numericValue)) {
                        setApplianceTime({
                          ...applianceTime,
                          grindingMachineTime: numericValue,
                        });
                      }
                    }}
                  />
                </View>
              </View>
            )}
            <View style={{width: '100%', height: 180}}></View>
          </ScrollView>
        </View>
        <View key={3} style={styles.questionContainer}>
          <Image
            source={require('../assets/ev.png')}
            style={{width: '100%', height: 140, objectFit: 'contain'}}
          />
          <Text style={styles.questionText}>
            {'Specify your EV Pods details'}
          </Text>
          <ScrollView style={{width: '100%'}}>
            <Text style={styles.subTxt}>
              How many ev ports are in your house ?
            </Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/evPod.png')}
                  style={{width: 33, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(evData.evPods)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setEvData({...evData, evPods: numericValue});
                  }
                }}
              />
            </View>
            <Text style={styles.subTxt}>
              How many hourse do you use it per day on average ?{' '}
            </Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{width: '14%'}}>
                <Image
                  source={require('../assets/evTime.png')}
                  style={{width: 33, height: 33}}
                />
              </View>
              <TextInput
                style={styles.texInput}
                keyboardType="numeric"
                value={String(evData.evTime)}
                onChangeText={text => {
                  const numericValue = parseInt(text, 10);
                  if (!isNaN(numericValue)) {
                    setEvData({...evData, evTime: numericValue});
                  }
                }}
              />
            </View>
          </ScrollView>
        </View>
        <View key={4} style={styles.questionContainer}>
          <Image
            source={require('../assets/thermal.png')}
            style={{width: '100%', height: 160, objectFit: 'contain'}}
          />
          <Text style={styles.questionText}>
            {'Specify the details of electricity type.'}
          </Text>
          <ScrollView style={{width: '100%'}}>
            <Text style={styles.questionText}>{'Electricity Type'}</Text>
            <RadioButton.Group
              onValueChange={newValue => handleElectricityTypeChange(newValue)}
              value={electricityType}>
              <View style={styles.radioButtonContainer}>
                <RadioButton value="thermal" />
                <Text style={styles.option}>Thermal</Text>
              </View>
              <View style={styles.radioButtonContainer}>
                <RadioButton value="nuclear" />
                <Text style={styles.option}>nuclear</Text>
              </View>
              <View style={styles.radioButtonContainer}>
                <RadioButton value="hydroelectric" />
                <Text style={styles.option}>HydroElectric</Text>
              </View>
              <View style={styles.radioButtonContainer}>
                <RadioButton value="wind" />
                <Text style={styles.option}>wind</Text>
              </View>
              <View style={styles.radioButtonContainer}>
                <RadioButton value="solar" />
                <Text style={styles.option}>solar</Text>
              </View>
            </RadioButton.Group>
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

export default Electricity;

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
