import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Linking,
} from 'react-native';
import {colors} from '../Colors';
import firestore from '@react-native-firebase/firestore';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {ActivityIndicator} from 'react-native-paper';
import BottomNavigation from '../components/BottomNavigation';

const Suggestions = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {userData} = route.params;
  const [carbonFootprint, setCarbonFootprint] = useState('');
  const [appliances, setAppliances] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [val, setVal] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [extraDetails, setExtraDetails] = useState(null);
  const [showProducts, setShowProducts] = useState(false);

  const [selectedAppliance, setSelectedAppliance] = useState('');
  const [additionalInput, setAdditionalInput] = useState('0');
  const [applianceSuggestions, setApplianceSuggestions] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [products, setProducts] = useState([]);

  const [url, setUrl] = useState(null);
  const [urlLoading, setUrlLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const getSuggestions = async () => {
    try {
      setUrlLoading(false);
      const docRef = await firestore().collection('apiUrl').doc('url1');
      const doc = await docRef.get();
      const urlData = doc.data();
      console.log('url', urlData.url);
      setUrl(urlData.url);
      const response = await fetch(`${urlData.url}/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carbon_footprint: parseFloat(val),
        }),
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        setSuggestions(data.suggestions);
        setExtraDetails(data.extra_data);
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Unable to fetch suggestions');
    }
    setUrlLoading(false);
  };

  const fetchFootprint = async () => {
    const currentTime = new Date();
    const timestamp = {
      month: currentTime.getMonth() + 1,
      year: currentTime.getFullYear(),
    };
    const footprintRef = firestore()
      .collection('Users')
      .doc(userData.uid)
      .collection('Footprint')
      .doc(`${timestamp.month}-${timestamp.year}`);

    const doc = await footprintRef.get();
    if (doc.exists) {
      const data = doc.data();
      const value =
        (data.basicDetails ? data.basicDetails : 0) +
        (data.recycleDetails ? data.recycleDetails : 0) +
        (data.travelDetails ? data.travelDetails : 0) +
        (data.electricityDetails ? data.electricityDetails : 0) +
        (data.energyDetails ? data.energyDetails : 0) +
        (data.foodDetails ? data.foodDetails : 0) +
        (data.clothingDetails ? data.clothingDetails : 0) +
        (data.extraDetails ? data.extraDetails : 0);
      setVal(value.toFixed(2));
      console.log(value);
    } else {
      setVal(0);
    }
    setUrlLoading(false);
  };

  const menu = [
    'fridge',
    'washing_machine',
    'oven',
    'air_conditioner',
    'geyser',
    'dishwasher',
    'electric_heater',
  ];

  const getApplianceSuggestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${url}/appliance-suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appliance: selectedAppliance,
          additional_input: parseFloat(additionalInput),
        }),
      });
      const data = await response.json();
      console.log('appliance', data);
      if (response.ok) {
        setApplianceSuggestions(data.suggestions);
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Unable to fetch appliance suggestions');
    }
    setLoading(false);
  };

  //fetchAllProducts
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

  useFocusEffect(
    useCallback(() => {
      fetchFootprint();
      if (val) {
        getSuggestions();
      }
      fetchAllProducts();
    }, [val]),
  );

  const renderAdditionalInput = () => {
    switch (selectedAppliance) {
      case 'fridge':
        return (
          <View>
            <Text style={styles.heading2}>Fridge Age (in years):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={additionalInput || ''}
              onChangeText={setAdditionalInput}
            />
          </View>
        );
      case 'air_conditioner':
        return (
          <View>
            <Text style={styles.heading2}>Area (in square feet):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={additionalInput || ''}
              onChangeText={setAdditionalInput}
            />
          </View>
        );
      case 'washing_machine':
        return (
          <View>
            <Text style={styles.heading2}>Usage (loads per week):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={additionalInput || ''}
              onChangeText={setAdditionalInput}
            />
          </View>
        );
      case 'oven':
        return (
          <View>
            <Text style={styles.heading2}>Usage (times per week):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={additionalInput || ''}
              onChangeText={setAdditionalInput}
            />
          </View>
        );
      case 'geyser':
        return (
          <View>
            <Text style={styles.heading2}>Temperature (in °C):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={additionalInput || ''}
              onChangeText={setAdditionalInput}
            />
          </View>
        );
      case 'dishwasher':
        return (
          <View>
            <Text style={styles.heading2}>Usage (times per week):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={additionalInput || ''}
              onChangeText={setAdditionalInput}
            />
          </View>
        );
      case 'electric_heater':
        return (
          <View>
            <Text style={styles.heading2}>Area (in square feet):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={additionalInput || ''}
              onChangeText={setAdditionalInput}
            />
          </View>
        );
      default:
        return null;
    }
  };

  const handleMenuChoice = val => {
    setShowMenu(false);
    setApplianceSuggestions(null);
    setSelectedAppliance(val);
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
          marginBottom: 12,
          paddingBottom: 7,
          height: 34,
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../assets/backButton.png')}
            style={{width: 24, height: 24}}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Suggestions</Text>
      </View>
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'white',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}>
        <TouchableOpacity
          style={{
            width: '49.75%',
            borderBottomWidth: 2,
            borderBottomColor: showSuggestions ? colors.p : 'lightgray',
            paddingBottom: 7,
          }}
          onPress={() => {
            setShowSuggestions(true);
            setShowProducts(false);
          }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: colors.font2,
              textAlign: 'center',
              color: showSuggestions ? colors.p : 'black',
            }}>
            Top Suggestions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: '49.75%',
            borderBottomWidth: 2,
            borderBottomColor: showProducts ? colors.p : 'lightgray',
            paddingBottom: 7,
          }}
          onPress={() => {
            setShowSuggestions(false);
            setShowProducts(true);
          }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: colors.font2,
              textAlign: 'center',
              color: showProducts ? colors.p : 'black',
            }}>
            Go Eco-Freindly
          </Text>
        </TouchableOpacity>
      </View>
      {showSuggestions && !showProducts && (
        <View style={{width: '100%', height: '80%'}}>
          <ScrollView style={{width: '100%', height: '96%'}}>
            {urlLoading ? (
              <ActivityIndicator
                size={21}
                color="black"
                style={{marginVertical: 12}}
              />
            ) : (
              <View
                style={{
                  width: '100%',
                  backgroundColor: '#f0f0f0',
                  padding: 10,
                  borderRadius: 7,
                  marginBottom: 7,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={styles.heading}>
                  Suggestions based on your carbon footprint value
                </Text>
                <ScrollView
                  style={{width: '100%', maxHeight: 200, marginVertical: 1}}
                  nestedScrollEnabled>
                  {suggestions &&
                    suggestions.map((suggestion, index) => (
                      <View
                        style={[
                          styles.suggestion,
                          {
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: '100%',
                            justifyContent: 'space-between',
                          },
                        ]}>
                        <Image
                          source={require('../assets/suggestions.png')}
                          style={{width: 20, height: 20}}
                        />
                        <Text
                          key={index}
                          style={{
                            color: 'black',
                            fontSize: 14,
                            fontFamily: colors.font4,
                            width: '92%',
                          }}>
                          {suggestion}
                        </Text>
                      </View>
                    ))}
                </ScrollView>
              </View>
            )}
            <View
              style={{
                width: '100%',
                marginTop: 1,
                backgroundColor: '#f0f0f0',
                padding: 13,
                borderRadius: 7,
              }}>
              <Text style={styles.heading}>
                Get Suggestions for a Specific Appliance
              </Text>
              <View style={{width: '100%'}}>
                <View style={styles.input}>
                  <TouchableOpacity
                    onPress={() => setShowMenu(!showMenu)}
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <TextInput
                      placeholder="Select appliance"
                      placeholderTextColor="gray"
                      value={selectedAppliance}
                      editable={false}
                      style={{
                        color: 'black',
                        fontFamily: colors.font4,
                        width: '90%',
                      }}
                    />
                    <Image
                      source={
                        !showMenu
                          ? require('../assets/arrowDown.png')
                          : require('../assets/arrowUp.png')
                      }
                      style={styles.img2}
                    />
                  </TouchableOpacity>
                </View>
                {showMenu && (
                  <ScrollView
                    style={{
                      width: '100%',
                      borderWidth: 0.4,
                      borderColor: 'gray',
                      borderRadius: 7,
                      height: 200,
                      paddingTop : 7
                    }}
                    nestedScrollEnabled>
                    {menu.map(opt => (
                      <TouchableOpacity
                        style={{
                          paddingHorizontal: 15,
                          paddingVertical: 4,
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                        }}
                        onPress={() => handleMenuChoice(opt)}>
                        <Text
                          style={{
                            color: 'black',
                            fontFamily: colors.font2,
                            fontSize: 14,
                            marginLeft : 5,
                          }}>
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
              {renderAdditionalInput()}
              <TouchableOpacity
                style={{
                  width: '100%',
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'black',
                  borderRadius: 7,
                }}
                onPress={!loading && getApplianceSuggestions}>
                {loading ? (
                  <Text
                    style={{
                      color: 'white',
                      fontFamily: colors.font2,
                      fontSize: 14,
                    }}>
                    Generating ...
                  </Text>
                ) : (
                  <Text
                    style={{
                      color: 'white',
                      fontFamily: colors.font2,
                      fontSize: 14,
                    }}>
                    Get suggestions
                  </Text>
                )}
              </TouchableOpacity>
              <ScrollView
                style={{width: '100%', marginTop: 20, maxHeight: 240}}
                nestedScrollEnabled>
                {applianceSuggestions &&
                  applianceSuggestions.map((suggestion, index) => (
                    <View
                      style={[
                        styles.suggestion,
                        {
                          flexDirection: 'row',
                          alignItems: 'center',
                          width: '100%',
                          justifyContent: 'space-between',
                        },
                      ]}>
                      <Image
                        source={require('../assets/suggestions.png')}
                        style={{width: 20, height: 20}}
                      />
                      <Text
                        key={index}
                        style={{
                          color: 'black',
                          fontSize: 14,
                          fontFamily: colors.font4,
                          width: '92%',
                        }}>
                        {suggestion}
                      </Text>
                    </View>
                  ))}
              </ScrollView>
            </View>
            <View
              style={{
                width: '100%',
                backgroundColor: '#f0f0f0',
                padding: 10,
                borderRadius: 7,
                marginBottom: 7,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 7,
              }}>
              <Text style={styles.heading}>Extra Suggestions</Text>
              <ScrollView
                style={{width: '100%', marginVertical: 12}}
                nestedScrollEnabled>
                {extraDetails &&
                  extraDetails.map((suggestion, index) => (
                    <View
                      style={[styles.suggestion, {flexDirection: 'column'}]}>
                      <Text
                        style={{
                          color: 'black',
                          fontFamily: colors.font2,
                          fontSize: 14,
                        }}>
                        {suggestion.category}
                      </Text>
                      <Text
                        style={{
                          color: 'black',
                          fontFamily: colors.font4,
                          fontSize: 13,
                        }}>
                        {suggestion.tip}
                      </Text>
                    </View>
                  ))}
              </ScrollView>
            </View>
            <View style={{height: 500}}></View>
          </ScrollView>
        </View>
      )}
      {!showSuggestions && showProducts && (
        <View style={{width: '100%', height: '80%'}}>
          <Text
            style={{
              width: '100%',
              fontSize: 10,
              color: 'gray',
              fontFamily: colors.font4,
              marginBottom: 7,
            }}>
            All products listed here are reviewed by us to ensure they are
            environmentally friendly, making it easier for you to make
            sustainable choices.
          </Text>
          <ScrollView contentContainerStyle={styles.container2}>
            <View style={styles.row}>
              {products.map((product, index) => (
                <View key={product.id} style={styles.productItem}>
                  <Image
                    source={{uri: product.img}}
                    style={{width: '100%', height: 100, objectFit: 'contain'}}
                  />
                  <Text
                    style={{
                      color: 'black',
                      fontFamily: colors.font2,
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
                          ? colors.bg2
                          : product.from === 'vijay sales'
                          ? colors.errorRed
                          : colors.p,
                      fontFamily: colors.font2,
                      fontSize: 13,
                      height: 15,
                    }}>
                    {product.from}
                  </Text>
                  <Text
                    style={{
                      color: 'black',
                      fontFamily: colors.font4,
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
                        color: 'black',
                        fontFamily: colors.font3,
                        fontSize: 13,
                        height: 40,
                        marginBottom: 4,
                      }}>
                      {product.price}
                    </Text>
                    <Text
                      style={{
                        color: colors.successGreen,
                        fontFamily: colors.font3,
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
                        fontFamily: colors.font2,
                        fontSize: 12,
                        height: 15,
                      }}>
                      {'Check product'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={{height: 400}}></View>
          </ScrollView>
        </View>
      )}
      <View style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
          <BottomNavigation />
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 20,
    color: 'black',
    fontFamily: colors.font2,
  },
  img2: {
    width: 22,
    height: 22,
    objectFit: 'contain',
  },
  heading: {
    fontSize: 14,
    color: 'black',
    fontFamily: colors.font2,
    marginVertical: 10,
  },
  heading2: {
    fontSize: 13,
    color: 'black',
    fontFamily: colors.font2,
    marginVertical: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 0.5,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 7,
    backgroundColor: '#f0f0f0',
    color: 'black',
    fontFamily: colors.font4,
  },
  suggestion: {
    fontSize: 14,
    marginBottom: 6,
    color: 'black',
    fontFamily: colors.font4,
    width: '100%',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 3,
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
});

export default Suggestions;
