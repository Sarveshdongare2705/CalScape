import React from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {colors} from '../Colors';
import { useNavigation } from '@react-navigation/native';

const Welcome = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.section1}>
        <Image
          source={require('../assets/logo.png')}
          style={{width: '55%', height: '70%', objectFit: 'cover'}}
        />
        <View style={{width: '100%'}}>
          <Text
            style={{
              color: colors.successGreen,
              fontSize: 30,
              textAlign: 'center',
              fontFamily : colors.font2
            }}>
            EcoTrack
          </Text>  
        </View>
      </View>
      <View
        style={{
          width: '100%',
          height: '60%',
          padding: 7,
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}>
        <Text
          style={{
            color: 'black',
            fontSize: 13,
            textAlign: 'center',
            marginBottom : 10,
            fontFamily : colors.font4,
          }}>
          Empower yourself to make environmentally-conscious choices with our
          Carbon Footprint Calculator app. Easily track your carbon emissions
          across various aspects of your life.
        </Text>
        <TouchableOpacity
          style={{
            width: '50%',
            backgroundColor: colors.successGreen,
            padding: 7,
            borderRadius: 18,
            height : 36,
          }}
          onPress={()=>navigation.navigate('Login')}
          >
          <Text
            style={{
              color: 'white',
              fontSize: 16,
              textAlign: 'center',
              fontFamily : colors.font2
            }}>
            Log In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: '50%',
            backgroundColor: colors.successGreen,
            padding: 7,
            borderRadius: 18,
            height : 36,
          }}
          onPress={()=>navigation.navigate('SignUp')}
          >
          <Text
            style={{
              color: 'white',
              fontSize: 16,
              textAlign: 'center',
              fontFamily : colors.font2
            }}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default Welcome;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.bg,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  section1: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    height: '40%',
    marginTop : 90,
  },
});
