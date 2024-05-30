import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../Colors';

const BottomNavigation = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')}>
        <Image
          source={require('../assets/home.png')}
          style={{width: 24, height: 24}}
        />
        <Text style={{color: 'black', fontSize: 11}}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Image
          source={require('../assets/product.png')}
          style={{width: 24, height: 24}}
        />
        <Text style={{color: 'black', fontSize: 11}}>Product</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button]}>
        <Image
          source={require('../assets/suggestions.png')}
          style={{width: 24, height: 24}}
        />
        <Text style={{color: 'black', fontSize: 11}}>Suggestions</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Profile')}>
        <Image
          source={require('../assets/profile.png')}
          style={{width: 24, height: 24}}
        />
        <Text style={{color: 'black', fontSize: 11}}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomNavigation;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    paddingVertical: 5,
    backgroundColor: colors.bg2,
  },
  button: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
});
