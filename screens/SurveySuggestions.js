import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import {ThemeContext} from '../context/ThemeContext';

const SurveySuggestions = () => {
  const {theme, isDarkMode} = useContext(ThemeContext);
  const route = useRoute();
  const navigation = useNavigation();
  const {appliance, url} = route.params;

  const [showingSuggestions, setShowingSuggestions] = useState(false);
  const [show5Star, setShow5Star] = useState(false);
  const [products, setProducts] = useState(null);
  const fetchProductsByName = async () => {
    try {
      const productsRef = firestore()
        .collection('Products')
        .where('name', '==', appliance);
      const productsSnapshot = await productsRef.get();

      let productsData = [];
      productsSnapshot.forEach(productDoc => {
        productsData.push({
          ...productDoc.data(),
        });
      });

      console.log('products', productsData);

      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products: ', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchProductsByName();
    }, []),
  );

  const surveys = {
    'Washing Machine': [
      'What is the capacity of your washing machine?',
      'How old is your current washing machine?',
      'What is the energy efficiency rating (like BEE star rating) of your washing machine?',
    ],
    Refrigerator: [
      'What is the capacity of your refrigerator?',
      'How old is your current refrigerator?',
      'What is the energy efficiency rating (like BEE star rating) of your refrigerator?',
    ],
    'Air Conditioner': [
      'What is the capacity of your air conditioner?',
      'How old is your current air conditioner?',
      'What is the energy efficiency rating (like BEE star rating) of your air conditioner?',
    ],
  };

  const options = {
    'What is the capacity of your washing machine?': [
      'Less than 5 kg',
      '5-7 kg',
      'More than 7 kg',
      'I do not own a washing machine',
    ],
    'How old is your current washing machine?': [
      'Less than 5 years',
      '5-10 years',
      'More than 10 years',
      'I do not own a washing machine',
    ],
    'What is the energy efficiency rating (like BEE star rating) of your washing machine?':
      ['5 Star', '4 Star', '3 Star', 'I do not know'],
    'What is the capacity of your refrigerator?': [
      'Less than 200 liters',
      '200-300 liters',
      'More than 300 liters',
      'I do not own a refrigerator',
    ],
    'How old is your current refrigerator?': [
      'Less than 5 years',
      '5-10 years',
      'More than 10 years',
      'I do not own a refrigerator',
    ],
    'What is the energy efficiency rating (like BEE star rating) of your refrigerator?':
      ['5 Star', '4 Star', '3 Star', 'I do not know'],
    'What is the capacity of your air conditioner?': [
      'Less than 1 ton',
      '1-2 tons',
      'More than 2 tons',
      'I do not own an air conditioner',
    ],
    'How old is your current air conditioner?': [
      'Less than 5 years',
      '5-10 years',
      'More than 10 years',
      'I do not own an air conditioner',
    ],
    'What is the energy efficiency rating (like BEE star rating) of your air conditioner?':
      ['5 Star', '4 Star', '3 Star', 'I do not know'],
  };

  const [selectedOptions, setSelectedOptions] = useState({});

  const handleOptionSelect = (question, option) => {
    setSelectedOptions(prevState => ({
      ...prevState,
      [question]: option,
    }));
  };

  const [suggestions, setSuggestions] = useState(null);
  const [laoding, setLoading] = useState(false);

  const handleGetSuggestions = async () => {
    fetchProductsByName();
    setLoading(true);
    setSuggestions(null);
    const selectedData = {
      appliance,
      age: selectedOptions[surveys[appliance][1]], // Assuming the second question is age
      capacity: selectedOptions[surveys[appliance][0]], // Assuming the first question is capacity
      rating: selectedOptions[surveys[appliance][2]], // Assuming the third question is rating
    };

    if (selectedOptions[surveys[appliance][2]] === '5 Star') {
      setShow5Star(false);
    } else {
      setShow5Star(true);
    }

    try {
      const response = await fetch(`${url}/appliance_suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedData),
      });

      const result = await response.json();
      console.log('Suggestions:', result.suggestions);
      setSuggestions(result.suggestions);

      // Handle the result (e.g., navigate to another screen with suggestions)
      // navigation.navigate('SuggestionsScreen', { suggestions: result.suggestions });
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
    setLoading(false);
    setShowingSuggestions(true);
  };

  return (
    <ScrollView style={[styles.container, {backgroundColor: theme.bg}]}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{position: 'absolute', top: 0, left: 0}}>
        {isDarkMode ? (
          <Image
            source={require('../assets/backdm.png')}
            style={{width: 24, height: 24}}
          />
        ) : (
          <Image
            source={require('../assets/backlm.png')}
            style={{width: 24, height: 24}}
          />
        )}
      </TouchableOpacity>
      <View
        style={{
          width: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image
          style={{width: 60, height: 60}}
          source={
            appliance === 'Refrigerator'
              ? require('../assets/fridge.png')
              : appliance === 'Washing Machine'
              ? require('../assets/wm.png')
              : require('../assets/ac.png')
          }
        />
        <Text
          style={[styles.title, {fontFamily: theme.font2, color: theme.text}]}>
          {showingSuggestions
            ? appliance + ' Suggestions'
            : appliance + ' Survey'}
        </Text>
      </View>
      {!showingSuggestions &&
        surveys[appliance]?.map((question, index) => (
          <View key={index} style={styles.questionContainer}>
            <Text
              style={[
                styles.question,
                {fontFamily: theme.font2, color: theme.text},
              ]}>
              {question}
            </Text>
            {options[question]?.map((option, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.optionContainer,
                  selectedOptions[question] === option && {
                    backgroundColor: theme.bg,
                  },
                  {backgroundColor: theme.bg3},
                ]}
                onPress={() => handleOptionSelect(question, option)}>
                <Text
                  style={[
                    styles.option,
                    selectedOptions[question] === option
                      ? {fontFamily: theme.font2, color: theme.p}
                      : {fontFamily: theme.font2, color: theme.text},
                  ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      {!showingSuggestions ? (
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            marginBottom: 12,
            height: 200,
          }}>
          <TouchableOpacity
            style={{
              width: '60%',
              height: 40,
              borderRadius: 3,
              backgroundColor: '#d0d0f9',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={!laoding && handleGetSuggestions}>
            <Text
              style={{
                color: theme.text,
                fontFamily: theme.font2,
                fontSize: 15,
              }}>
              {laoding ? 'Generating...' : 'Get Suggestions'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{width: '100%', alignItems: 'center', marginBottom: 12}}>
          <TouchableOpacity
            style={{
              width: '60%',
              height: 40,
              borderRadius: 3,
              backgroundColor: '#d0d0f9',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => setShowingSuggestions(false)}>
            <Text
              style={{
                color: theme.text,
                fontFamily: theme.font2,
                fontSize: 15,
              }}>
              {'Back to Survey'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {show5Star && (
        <Text
          style={{
            color: theme.text,
            fontFamily: theme.font2,
            fontSize: 14,
            marginVertical: 5,
          }}>
          {'Switch to 5 Star rating ' + appliance + 's'}
        </Text>
      )}
      {show5Star && (
        <ScrollView style={{width: '100%'}} nestedScrollEnabled horizontal>
          {products.map((product, index) => (
            <View
              key={product.id}
              style={[styles.productItem, {backgroundColor: theme.bg4}]}>
              <Image
                source={{uri: product.img}}
                style={{width: '100%', height: 96, objectFit: 'contain'}}
              />
              <Text
                style={{
                  color: theme.text,
                  fontFamily: theme.font2,
                  fontSize: 13,
                  height: 15,
                }}>
                {product.name}
              </Text>
              <Text
                style={{
                  color:
                    product.from === 'amazon'
                      ? 'orange'
                      : product.from === 'flipkart'
                      ? theme.bg2
                      : product.from === 'vijay sales'
                      ? theme.errorRed
                      : theme.p,
                  fontFamily: theme.font2,
                  fontSize: 13,
                  height: 15,
                }}>
                {product.from}
              </Text>
              <Text
                style={{
                  color: theme.text,
                  fontFamily: theme.font4,
                  fontSize: 11,
                  height: 40,
                  width: '100%',
                  marginBottom: 4,
                }}>
                {product.desc}
              </Text>
              <View
                style={{
                  width: '100%',
                  height: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 13,
                }}>
                <Text
                  style={{
                    color: theme.text,
                    fontFamily: theme.font3,
                    fontSize: 13,
                    height: 40,
                    marginBottom: 4,
                  }}>
                  {product.price}
                </Text>
                <Text
                  style={{
                    color: theme.successGreen,
                    fontFamily: theme.font3,
                    fontSize: 13,
                    height: 40,
                    marginBottom: 4,
                  }}>
                  {product.rating}
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  width: '100%',
                  height: 36,
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  borderRadius: 5,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: -7,
                }}
                onPress={() => Linking.openURL(product.link)}>
                <Text
                  style={{
                    color: 'white',
                    fontFamily: theme.font2,
                    fontSize: 12,
                    height: 15,
                  }}>
                  {'Check product'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
      {showingSuggestions && !laoding && (
        <Text
          style={{
            color: theme.text,
            fontFamily: theme.font2,
            fontSize: 14,
            marginBottom: 7,
          }}>
          Here are your suggestions.
        </Text>
      )}
      {showingSuggestions && (
        <ScrollView style={styles.suggestionContainer}>
          {suggestions &&
            suggestions.map((suggestion, index) => (
              <View
                style={[
                  styles.suggestionItem,
                  {backgroundColor: theme.bg3, fontFamily: theme.font4},
                ]}
                key={index}>
                <Image
                  source={require('../assets/suggestions.png')}
                  style={{width: 24, height: 24}}
                />
                <Text
                  key={index}
                  style={[styles.suggestionItem, {width: '90%' , color : theme.text , fontFamily : theme.font4}]}>
                  {suggestion}
                </Text>
              </View>
            ))}
          <View style={{height: 200}}></View>
        </ScrollView>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
  questionContainer: {
    marginBottom: 30,
  },
  question: {
    fontSize: 14,
    marginBottom: 10,
  },
  optionContainer: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  option: {
    fontSize: 14,
  },
  selectedOption: {
    color: 'blue',
  },
  productItem: {
    width: 180,
    marginBottom: 10,
    padding: 10,
    borderRadius: 3,
    height: 255,
    flexDirection: 'column',
    marginRight: 7,
  },
  suggestionContainer: {
    marginBottom: 20,
  },
  suggestionItem: {
    fontSize: 14,
    marginVertical: 3,
    padding: 7,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default SurveySuggestions;
