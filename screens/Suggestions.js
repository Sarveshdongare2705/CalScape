import React, {useEffect, useState, useCallback, useContext} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Linking,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import BottomNavigation from '../components/BottomNavigation';
import {ThemeContext} from '../context/ThemeContext';

const Suggestions = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {userData, url} = route.params;
  const [products, setProducts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showProducts, setShowProducts] = useState(false);
  const [highestCategories, setHighestCategories] = useState([]);
  const [suggestionsCategory1, setSuggestionsCategory1] = useState([]);
  const [suggestionsCategory2, setSuggestionsCategory2] = useState([]);

  const {theme, isDarkMode} = useContext(ThemeContext);

  // Fetch all products
  const fetchAllProducts = async () => {
    try {
      const productsRef = firestore()
        .collection('Products')
        .orderBy('id', 'asc');
      const productsSnapshot = await productsRef.get();

      let productsData = [];
      productsSnapshot.forEach(productDoc => {
        productsData.push({
          ...productDoc.data(),
        });
      });

      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products: ', error);
    }
  };

  const fetchHighestFootprintCategories = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const docId = `${currentMonth}-${currentYear}`;
      const userId = userData.uid;

      const footprintDoc = await firestore()
        .collection('Users')
        .doc(userId)
        .collection('Footprint')
        .doc(docId)
        .get();

      if (footprintDoc.exists) {
        const footprintData = footprintDoc.data();
        const categories = {
          travel: footprintData.travelDetails || 0,
          electricity: footprintData.electricityDetails || 0,
          energy: footprintData.energyDetails || 0,
          food: footprintData.foodDetails || 0,
          clothes: footprintData.clothingDetails || 0,
          other:
            (footprintData.basicDetails || 0) +
            (footprintData.extraDetails || 0) +
            (footprintData.recycleDetails || 0),
        };

        const sortedCategories = Object.entries(categories).sort(
          (a, b) => b[1] - a[1],
        );
        const topTwoCategories = sortedCategories.slice(0, 2);
        setHighestCategories(topTwoCategories);
      }
    } catch (error) {
      console.error('Error fetching footprint data: ', error);
    }
  };

  const fetchSuggestions = async category => {
    console.log('url', url);
    try {
      const response = await fetch(`${url}/suggestions/${category}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return [];
    }
  };

  useEffect(() => {
    if (highestCategories.length > 0) {
      const fetchAndSetSuggestions = async () => {
        const category1 = highestCategories[0][0];
        const category2 = highestCategories[1][0];

        const suggestions1 = await fetchSuggestions(category1);
        const suggestions2 = await fetchSuggestions(category2);

        setSuggestionsCategory1(suggestions1);
        setSuggestionsCategory2(suggestions2);
      };

      fetchAndSetSuggestions();
    }
  }, [highestCategories]);

  useFocusEffect(
    useCallback(() => {
      fetchAllProducts();
      fetchHighestFootprintCategories();
    }, [userData]),
  );

  const [suggestion1, setSuggestion1] = useState(false);
  const [suggestion2, setSuggestion2] = useState(false);

  return (
    <View style={[styles.container, {backgroundColor: theme.bg}]}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
          paddingBottom: 7,
          height: 34,
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
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
        <Text
          style={[styles.title, {fontFamily: theme.font2, color: theme.text}]}>
          Suggestions
        </Text>
      </View>
      <View style={{width: '100%', height: '90%'}}>
        {highestCategories.length > 0 && (
          <ScrollView style={{width: '100%', height: '80%'}}>
            <Text
              style={[
                styles.suggestionTitle,
                {fontFamily: theme.font4, color: theme.text},
              ]}>
              Your footprint value is high in {highestCategories[0][0]} and{' '}
              {highestCategories[1][0]} categories. Here are some top
              Suggestions for you.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSuggestion1(!suggestion1);
              }}>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                }}>
                <Text
                  style={[
                    styles.suggestionTitle,
                    {
                      fontFamily: theme.font2,
                      color: theme.text,
                      fontSize: 16,
                      width: 200,
                    },
                  ]}>
                  Suggestions for {highestCategories[0][0]}
                </Text>
                <Image
                  source={
                    suggestion1
                      ? isDarkMode
                        ? require('../assets/audm.png')
                        : require('../assets/aulm.png')
                      : isDarkMode
                      ? require('../assets/addm.png')
                      : require('../assets/adlm.png')
                  }
                  style={{width: 27, height: 27}}
                />
              </View>
            </TouchableOpacity>
            {suggestion1 && (
              <ScrollView style={styles.suggestionContainer}>
                {suggestionsCategory1.map((suggestion, index) => (
                  <View
                    style={[
                      styles.suggestionItem,
                      {backgroundColor: theme.bg4},
                    ]}>
                    <Image
                      source={require('../assets/suggestions.png')}
                      style={{width: 24, height: 24}}
                    />
                    <Text
                      style={[
                        styles.suggestionItem,
                        {
                          width: '90%',
                          backgroundColor: theme.bg4,
                          color: theme.text,
                          fontFamily: theme.font1,
                        },
                      ]}>
                      {suggestion}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity
              onPress={() => {
                setSuggestion2(!suggestion2);
              }}>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                  marginTop: 10,
                }}>
                <Text
                  style={[
                    styles.suggestionTitle,
                    ,
                    {
                      fontFamily: theme.font2,
                      color: theme.text,
                      fontSize: 16,
                      width: 200,
                    },
                  ]}>
                  Suggestions for {highestCategories[1][0]}
                </Text>
                <Image
                  source={
                    suggestion2
                      ? isDarkMode
                        ? require('../assets/audm.png')
                        : require('../assets/aulm.png')
                      : isDarkMode
                      ? require('../assets/addm.png')
                      : require('../assets/adlm.png')
                  }
                  style={{width: 27, height: 27}}
                />
              </View>
            </TouchableOpacity>
            {suggestion2 && (
              <ScrollView style={styles.suggestionContainer}>
                {suggestionsCategory2.map((suggestion, index) => (
                  <View
                    style={[
                      styles.suggestionItem,
                      {backgroundColor: theme.bg4},
                    ]}>
                    <Image
                      source={require('../assets/suggestions.png')}
                      style={{width: 24, height: 24}}
                    />
                    <Text
                      style={[
                        styles.suggestionItem,
                        {
                          width: '90%',
                          backgroundColor: theme.bg4,
                          color: theme.text,
                          fontFamily: theme.font1,
                        },
                      ]}>
                      {suggestion}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
            <Text
              style={[
                styles.suggestionTitle,
                {
                  fontSize: 16,
                  width: '100%',
                  borderTopColor: theme.bg4,
                  borderTopWidth: 1,
                  marginTop: 20,
                  paddingTop: 10,
                  fontFamily : theme.font4,
                  color : theme.text,
                },
              ]}>
              Suggestions for appliances
            </Text>
            <ScrollView style={{width: '100%'}} horizontal nestedScrollEnabled>
              <TouchableOpacity
                style={{
                  width: 150,
                  height: 150,
                  backgroundColor: theme.bg3,
                  borderRadius: 7,
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 7,
                }}
                onPress={() =>
                  navigation.navigate('SurveySuggestions', {
                    appliance: 'Refrigerator',
                    url: url,
                  })
                }>
                <Image
                  source={require('../assets/fridge.png')}
                  style={{width: 90, height: 90}}
                />
                <Text
                  style={[
                    styles.suggestionTitle,
                    {
                      fontSize: 15,
                      fontFamily : theme.font2,
                  color : theme.text,
                    },
                  ]}>
                  Refrigerator
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 150,
                  height: 150,
                  backgroundColor: theme.bg3,
                  borderRadius: 7,
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 7,
                }}
                onPress={() =>
                  navigation.navigate('SurveySuggestions', {
                    appliance: 'Washing Machine',
                    url: url,
                  })
                }>
                <Image
                  source={require('../assets/wm.png')}
                  style={{width: 90, height: 90}}
                />
                <Text
                  style={[
                    styles.suggestionTitle,
                    {
                      fontSize: 15,
                      fontFamily : theme.font2,
                  color : theme.text,
                    },
                  ]}>
                  Washing Machine
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 150,
                  height: 150,
                  backgroundColor: theme.bg3,
                  borderRadius: 7,
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() =>
                  navigation.navigate('SurveySuggestions', {
                    appliance: 'Air Conditioner',
                    url: url,
                  })
                }>
                <Image
                  source={require('../assets/ac.png')}
                  style={{width: 90, height: 90}}
                />
                <Text
                  style={[
                    styles.suggestionTitle,
                    {
                      fontSize: 15,
                      fontFamily : theme.font2,
                  color : theme.text,
                    },
                  ]}>
                  Air Conditioner
                </Text>
              </TouchableOpacity>
            </ScrollView>
            <View style={{height: 100}}></View>
          </ScrollView>
        )}
      </View>
      <View style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
        <BottomNavigation />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 20,
    color: 'black',
  },
  container2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productItem: {
    width: '49%',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 3,
    height: 255,
    flexDirection: 'column',
  },
  suggestionTitle: {
    fontSize: 14,
    color: 'black',
    marginVertical: 5,
  },
  suggestionContainer: {
    marginBottom: 20,
  },
  suggestionItem: {
    fontSize: 14,
    color: 'black',
    marginVertical: 3,
    backgroundColor: '#f0f0f9',
    padding: 7,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Suggestions;
