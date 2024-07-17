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

import income from '../assets/income.png';
import sourcesImage from '../assets/sources.png';
import electricityImage from '../assets/electricity.png';
import shoppingImage from '../assets/shopping.png';
import foodImage from '../assets/food.png';
import home from '../assets/homeDetails.png';
import {useNavigation, useRoute} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { fetchAndUpdateFootprint } from '../utils/footrpintUtils';

const Questionnaire = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {uid, from} = route.params;
  const [responses, setResponses] = useState({
    vehicle: '',
    sources: '',
    electricityCost: '',
    shoppingFrequency: '',
    foodOrderFrequency: '',
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [age, setAge] = useState(0);
  const [familyMembers, setFamilyMembers] = useState(0);
  const [belowTen, setBelowTen] = useState(0);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [typeOfHouse, setTypeOfHouse] = useState('');
  const [houseSize , setHouseSize] = useState(0);
  const [incomeLevel, setIncomeLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStates, setShowStates] = useState(false);
  const [showCities, setShowCities] = useState(false);

  const states = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
  ];

  const cities = {
    'Andhra Pradesh': [
      'Vishakhapatnam',
      'Vijayawada',
      'Guntur',
      'Nellore',
      'Kurnool',
      'Tirupati',
      'Rajahmundry',
      'Kadapa',
      'Kakinada',
      'Anantapur',
      'Vizianagaram',
      'Eluru',
      'Ongole',
      'Chittoor',
      'Tenali',
    ],
    'Arunachal Pradesh': [
      'Itanagar',
      'Tawang',
      'Ziro',
      'Pasighat',
      'Bomdila',
      'Naharlagun',
      'Roing',
      'Tezu',
      'Aalo',
      'Seppa',
    ],
    Assam: [
      'Guwahati',
      'Jorhat',
      'Silchar',
      'Dibrugarh',
      'Tezpur',
      'Nagaon',
      'Tinsukia',
      'Sivasagar',
      'Goalpara',
      'Karimganj',
    ],
    Bihar: [
      'Patna',
      'Gaya',
      'Bhagalpur',
      'Muzaffarpur',
      'Purnea',
      'Darbhanga',
      'Bihar Sharif',
      'Ara',
      'Begusarai',
      'Katihar',
    ],
    Chhattisgarh: [
      'Raipur',
      'Bilaspur',
      'Durg',
      'Bhilai',
      'Korba',
      'Rajnandgaon',
      'Jagdalpur',
      'Raigarh',
      'Ambikapur',
      'Dhamtari',
    ],
    Goa: [
      'Panaji',
      'Margao',
      'Vasco da Gama',
      'Mapusa',
      'Ponda',
      'Bicholim',
      'Curchorem',
      'Canacona',
      'Valpoi',
      'Sanguem',
    ],
    Gujarat: [
      'Ahmedabad',
      'Surat',
      'Vadodara',
      'Rajkot',
      'Bhavnagar',
      'Jamnagar',
      'Junagadh',
      'Gandhinagar',
      'Gandhidham',
      'Anand',
    ],
    Haryana: [
      'Chandigarh',
      'Faridabad',
      'Gurugram',
      'Panipat',
      'Ambala',
      'Yamunanagar',
      'Rohtak',
      'Hisar',
      'Karnal',
      'Sonipat',
    ],
    'Himachal Pradesh': [
      'Shimla',
      'Manali',
      'Dharamshala',
      'Mandi',
      'Solan',
      'Kullu',
      'Bilaspur',
      'Chamba',
      'Hamirpur',
      'Nahan',
    ],
    Jharkhand: [
      'Ranchi',
      'Jamshedpur',
      'Dhanbad',
      'Bokaro',
      'Deoghar',
      'Hazaribagh',
      'Giridih',
      'Ramgarh',
      'Palamu',
      'Phusro',
    ],
    Karnataka: [
      'Bengaluru',
      'Mysore',
      'Hubli',
      'Mangalore',
      'Belgaum',
      'Gulbarga',
      'Davangere',
      'Bellary',
      'Bijapur',
      'Shimoga',
    ],
    Kerala: [
      'Thiruvananthapuram',
      'Kochi',
      'Kozhikode',
      'Kollam',
      'Thrissur',
      'Alappuzha',
      'Palakkad',
      'Malappuram',
      'Kottayam',
      'Kannur',
    ],
    'Madhya Pradesh': [
      'Bhopal',
      'Indore',
      'Gwalior',
      'Jabalpur',
      'Ujjain',
      'Sagar',
      'Ratlam',
      'Rewa',
      'Satna',
      'Dewas',
    ],
    Maharashtra: [
      'Mumbai',
      'Pune',
      'Nagpur',
      'Nashik',
      'Aurangabad',
      'Solapur',
      'Amravati',
      'Kolhapur',
      'Malegaon',
      'Akola',
    ],
    Manipur: [
      'Imphal',
      'Bishnupur',
      'Churachandpur',
      'Thoubal',
      'Kakching',
      'Ukhrul',
      'Senapati',
      'Tamenglong',
      'Jiribam',
      'Moirang',
    ],
    Meghalaya: [
      'Shillong',
      'Tura',
      'Jowai',
      'Nongpoh',
      'Baghmara',
      'Nongstoin',
      'Williamnagar',
      'Resubelpara',
      'Mairang',
      'Ampati',
    ],
    Mizoram: [
      'Aizawl',
      'Lunglei',
      'Saiha',
      'Champhai',
      'Kolasib',
      'Serchhip',
      'Mamit',
      'Lawngtlai',
      'Bairabi',
      'North Vanlaiphai',
    ],
    Nagaland: [
      'Kohima',
      'Dimapur',
      'Mokokchung',
      'Wokha',
      'Zunheboto',
      'Tuensang',
      'Mon',
      'Phek',
      'Kiphire',
      'Longleng',
    ],
    Odisha: [
      'Bhubaneswar',
      'Cuttack',
      'Rourkela',
      'Puri',
      'Sambalpur',
      'Balasore',
      'Bhadrak',
      'Baripada',
      'Berhampur',
      'Angul',
    ],
    Punjab: [
      'Chandigarh',
      'Ludhiana',
      'Amritsar',
      'Jalandhar',
      'Patiala',
      'Bathinda',
      'Hoshiarpur',
      'Mohali',
      'Pathankot',
      'Batala',
    ],
    Rajasthan: [
      'Jaipur',
      'Jodhpur',
      'Udaipur',
      'Kota',
      'Ajmer',
      'Bikaner',
      'Bhilwara',
      'Alwar',
      'Bharatpur',
      'Pali',
    ],
    Sikkim: [
      'Gangtok',
      'Namchi',
      'Geyzing',
      'Mangan',
      'Rongpo',
      'Singtam',
      'Yuksom',
      'Pelling',
      'Lachung',
      'Ravangla',
    ],
    'Tamil Nadu': [
      'Chennai',
      'Coimbatore',
      'Madurai',
      'Tiruchirappalli',
      'Salem',
      'Tirunelveli',
      'Tiruppur',
      'Vellore',
      'Erode',
      'Thoothukudi',
    ],
    Telangana: [
      'Hyderabad',
      'Warangal',
      'Nizamabad',
      'Khammam',
      'Karimnagar',
      'Ramagundam',
      'Mahbubnagar',
      'Nalgonda',
      'Adilabad',
      'Siddipet',
    ],
    Tripura: [
      'Agartala',
      'Udaipur',
      'Dharmanagar',
      'Kailashahar',
      'Belonia',
      'Ambassa',
      'Khowai',
      'Melaghar',
      'Sonamura',
      'Bishalgarh',
    ],
    'Uttar Pradesh': [
      'Lucknow',
      'Kanpur',
      'Ghaziabad',
      'Agra',
      'Varanasi',
      'Meerut',
      'Allahabad',
      'Bareilly',
      'Aligarh',
      'Moradabad',
    ],
    Uttarakhand: [
      'Dehradun',
      'Haridwar',
      'Roorkee',
      'Haldwani',
      'Rishikesh',
      'Rudrapur',
      'Kashipur',
      'Ramnagar',
      'Nainital',
      'Pithoragarh',
    ],
    'West Bengal': [
      'Kolkata',
      'Howrah',
      'Durgapur',
      'Siliguri',
      'Asansol',
      'Malda',
      'Kharagpur',
      'Bardhaman',
      'Jalpaiguri',
      'Darjeeling',
    ],
  };

  React.useCallback(() => {
    setAge(0);
    setFamilyMembers(0);
    setBelowTen(0);
    setCity('');
    setState('');
    setCountry('India');
    setTypeOfHouse('');
    setIncomeLevel('');
    setLoading(false);
    setShowStates(false);
    setShowCities(false);
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
        .collection('BasicDetails')
        .doc(`basic_details:${uid}`);
      const doc = await basicDetailsRef.get();
      if (doc.exists) {
        const data = doc.data();
        setAge(data.age);
        setFamilyMembers(data.familyMembers);
        setBelowTen(data.belowTenMembers);
        setCity(data.city);
        setState(data.state);
        setCountry(data.country);
        setTypeOfHouse(data.typeOfHouse);
        setHouseSize(data.houseSize ? data.houseSize : 0)
        setIncomeLevel(data.income);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const questions = [
    {
      question: 'Type of House',
      options: [
        'Independent',
        'Apartment(Flat)',
        'Bungalow',
        'Semi-Detached',
        'Terraced',
      ],
      img: home,
      showSubmit: false,
    },
    {
      question: 'Income Level Per Annum',
      options: [
        'Less Than 125000',
        '125,000 - 500,000',
        '500,000 - 30,00,000',
        'Above 30,00,000',
      ],
      img: income,
      showSubmit: true,
    },
  ];

  const handleOptionChange = (questionIndex, optionIndex) => {
    const selectedOption = questions[questionIndex].options[optionIndex];
    if (questionIndex === 0) {
      setTypeOfHouse(selectedOption);
    } else if (questionIndex === 1) {
      setIncomeLevel(selectedOption);
    }
  };

  const handleScroll = event => {
    const index = Math.floor(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const basicDetailsRef = firestore()
        .collection('UserData')
        .doc(uid)
        .collection('BasicDetails')
        .doc(`basic_details:${uid}`);
      const data = {
        age: age,
        familyMembers: familyMembers,
        belowTenMembers: belowTen,
        city: city,
        state: state,
        country: country,
        typeOfHouse: typeOfHouse,
        houseSize : houseSize,
        income: incomeLevel,
      };
      await basicDetailsRef.set(data);
      from.trim() === 'signup'
        ? navigation.navigate('Home')
        : navigation.navigate('Survey', {uid: uid , Route : 'Basic Details'});
    } catch (err) {
      console.error(err);
    }
    fetchAndUpdateFootprint(uid);
    setLoading(false);
  };

  const handleOpenMenu = choice => {
    choice === 'State'
      ? setShowStates(!showStates)
      : setShowCities(!showCities);
  };

  const handleChoice = (choice, opt) => {
    if (choice === 'State') {
      setState(opt);
      setCity('');
      setShowStates(false);
    } else {
      setCity(opt);
      setShowCities(false);
    }
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
            Basic Details
          </Text>
          <Text
            style={{
              color: 'gray',
              fontSize: 14,
              textAlign: 'center',
              fontFamily: colors.font1,
              width: '90%',
            }}>
            Provide your details for accurate carbon footprint value
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
            source={require('../assets/basicDetails.png')}
            style={{width: '100%', height: '36%', objectFit: 'contain'}}
          />
          <Text style={[styles.questionText, {marginBottom: 20}]}>
            {'Please provide the given details'}
          </Text>
          <ScrollView style={{width: '100%'}}>
            <View style={{width: '100%', marginBottom: 10}}>
              <Text
                style={{
                  color: 'gray',
                  fontFamily: colors.font4,
                  fontSize: 15,
                }}>
                {'Age'}
              </Text>
              <View style={styles.input}>
                <Image
                  source={require('../assets/age.png')}
                  style={styles.img2}
                />
                <TextInput
                  placeholder="Enter your Age"
                  placeholderTextColor="gray"
                  style={styles.inputSection}
                  maxLength={2}
                  value={String(age)}
                  onChangeText={text=>{
                    const numericValue = parseInt(text);
                    if(!isNaN(numericValue)){
                      setAge(numericValue);
                    }
                  }}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={{width: '100%', marginBottom: 10}}>
              <Text
                style={{
                  color: 'gray',
                  fontFamily: colors.font4,
                  fontSize: 15,
                }}>
                {'Number of Household Members'}
              </Text>
              <View style={styles.input}>
                <Image
                  source={require('../assets/members.png')}
                  style={styles.img2}
                />
                <TextInput
                  placeholder="Enter Number of members"
                  placeholderTextColor="gray"
                  style={styles.inputSection}
                  maxLength={2}
                  value={String(familyMembers)}
                  onChangeText={text=>{
                    const numericValue = parseInt(text);
                    if(!isNaN(numericValue)){
                      setFamilyMembers(numericValue);
                    }
                  }}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={{width: '100%', marginBottom: 10}}>
              <Text
                style={{
                  color: 'gray',
                  fontFamily: colors.font4,
                  fontSize: 15,
                }}>
                {'Members below age of 10'}
              </Text>
              <View style={styles.input}>
                <Image
                  source={require('../assets/child.png')}
                  style={styles.img2}
                />
                <TextInput
                  placeholder="Enter the count"
                  placeholderTextColor="gray"
                  style={styles.inputSection}
                  maxLength={2}
                  value={String(belowTen)}
                  onChangeText={text=>{
                    const numericValue = parseInt(text);
                    if(!isNaN(numericValue)){
                      setBelowTen(numericValue);
                    }
                  }}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={{width: '100%', height: 100}}></View>
          </ScrollView>
        </View>
        <View key={1} style={styles.questionContainer}>
          <Image
            source={require('../assets/city.png')}
            style={{width: '100%', height: '30%', objectFit: 'contain' , marginTop : 10}}
          />
          <Text style={[styles.questionText, {marginBottom: 20}]}>
            {'Please provide the residential details'}
          </Text>
          <ScrollView style={{width: '100%'}}>
            <View style={{width: '100%', marginBottom: 10}}>
              <Text
                style={{
                  color: 'black',
                  color: 'gray',
                  fontFamily: colors.font4,
                  fontSize: 15,
                }}>
                {'Country'}
              </Text>
              <View style={styles.input}>
                <Image
                  source={require('../assets/country.png')}
                  style={styles.img2}
                />
                <TextInput
                  placeholder="Ex. India"
                  placeholderTextColor="gray"
                  style={styles.inputSection}
                  maxLength={20}
                  value={country}
                  onChangeText={text => setCountry(text)}
                  editable={false}
                />
              </View>
            </View>
            <View style={{width: '100%', marginBottom: 10}}>
              <Text
                style={{
                  color: 'black',
                  color: 'gray',
                  fontFamily: colors.font4,
                  fontSize: 15,
                }}>
                {'Size of House(sq m)'}
              </Text>
              <View style={styles.input}>
                <Image
                  source={require('../assets/house.png')}
                  style={styles.img2}
                />
                <TextInput
                  placeholder="Ex. India"
                  placeholderTextColor="gray"
                  style={styles.inputSection}
                  maxLength={20}
                  value={String(houseSize)}
                  onChangeText={text=>{
                    const numericValue = parseInt(text);
                    if(!isNaN(numericValue)){
                      setHouseSize(numericValue);
                    }
                  }}
                  keyboardType='numeric'
                />
              </View>
            </View>
            <View style={{width: '100%', marginBottom: 10}}>
              <Text
                style={{
                  color: 'black',
                  color: 'gray',
                  fontFamily: colors.font4,
                  fontSize: 15,
                }}>
                {'State'}
              </Text>
              <View style={styles.input}>
                <Image
                  source={require('../assets/state.png')}
                  style={styles.img2}
                />
                <TextInput
                  placeholder="Ex. Maharashtra"
                  placeholderTextColor="gray"
                  style={styles.inputSection}
                  maxLength={20}
                  value={state}
                  onChangeText={text => setState(text)}
                  editable={false}
                />
                <TouchableOpacity onPress={() => handleOpenMenu('State')}>
                  <Image
                    source={
                      !showStates
                        ? require('../assets/arrowDown.png')
                        : require('../assets/arrowUp.png')
                    }
                    style={styles.img2}
                  />
                </TouchableOpacity>
              </View>
              {showStates && (
                <ScrollView
                  style={{
                    width: '100%',
                    borderWidth: 0.4,
                    borderColor: 'gray',
                    borderRadius: 7,
                    height: 150,
                  }}
                  nestedScrollEnabled>
                  {states.map(opt => (
                    <TouchableOpacity
                      style={{
                        paddingHorizontal: 15,
                        paddingVertical: 4,
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                      onPress={() => handleChoice('State', opt)}>
                      <Text
                        style={{
                          color: 'gray',
                          fontFamily: colors.font2,
                          fontSize: 14,
                        }}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
            <View style={{width: '100%', marginBottom: 10}}>
              <Text
                style={{color: 'gray', fontFamily: colors.font4, fontSize: 15}}>
                {'City'}
              </Text>
              <View style={styles.input}>
                <Image
                  source={require('../assets/city1.png')}
                  style={styles.img2}
                />
                <TextInput
                  placeholder={`Select city from ${state}`}
                  placeholderTextColor="gray"
                  style={styles.inputSection}
                  maxLength={20}
                  value={city}
                  onChangeText={text => setCity(text)}
                  editable={false}
                />
                <TouchableOpacity onPress={() => handleOpenMenu('City')}>
                  <Image
                    source={
                      !showCities
                        ? require('../assets/arrowDown.png')
                        : require('../assets/arrowUp.png')
                    }
                    style={styles.img2}
                  />
                </TouchableOpacity>
              </View>
              {showCities && (
                <ScrollView
                  style={{
                    width: '100%',
                    borderWidth: 0.4,
                    borderColor: 'gray',
                    borderRadius: 7,
                    height: 150,
                  }}
                  nestedScrollEnabled>
                  {cities[state]?.map(opt => (
                    <TouchableOpacity
                      style={{
                        paddingHorizontal: 15,
                        paddingVertical: 4,
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                      onPress={() => handleChoice('City', opt)}>
                      <Text
                        style={{
                          color: 'gray',
                          fontFamily: colors.font2,
                          fontSize: 14,
                        }}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            <View style={{width: '100%', height: 100}}></View>
          </ScrollView>
        </View>
        {questions.map((question, index) => (
          <View key={index + 2} style={styles.questionContainer}>
            <Image
              source={question.img}
              style={{width: '100%', height: '35%', objectFit: 'contain'}}
            />
            <Text style={styles.questionText}>{question.question}</Text>
            <ScrollView style={{width: '100%'}}>
              {question.options.map((option, optionIndex) => (
                <View key={optionIndex} style={styles.optionContainer}>
                  <RadioButton
                    value={option}
                    status={
                      (index === 0 && typeOfHouse === option) ||
                      (index === 1 && incomeLevel === option)
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

export default Questionnaire;

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
    width: '82%',
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
