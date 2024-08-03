import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  Text,
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import Video from 'react-native-video';
import { useNavigation, useRoute } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const OtpValidation = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { email, username, contact, password } = route.params;
  const { theme } = useContext(ThemeContext);
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [verificationId, setVerificationId] = useState(null);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Send OTP to phone number
    const sendOtpToPhone = async () => {
      try {
        const confirmation = await auth().signInWithPhoneNumber(contact);
        setVerificationId(confirmation.verificationId);
        Alert.alert('Success', 'OTP has been sent to your phone.');
      } catch (error) {
        console.error('Error sending OTP to phone number:', error);
        Alert.alert('Error', 'Failed to send OTP. Please try again.');
      }
    };

    sendOtpToPhone();
  }, [contact]);

  const handleChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    if (value === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const otpCode = otp.join('');
      const credential = auth.PhoneAuthProvider.credential(verificationId, otpCode);
      await auth().signInWithCredential(credential);

      const res = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      console.log('SignUp Res : ', res);
      if (res) {
        const currentDate = new Date().toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        firestore().collection('Users').doc(res.user.uid).set({
          uid: res.user.uid,
          username: username,
          email: email,
          contact: contact,
          member_since: currentDate,
          profileImg: 'https://cdn.wallpapersafari.com/32/17/MbYS8Z.jpg',
        });
        setErr(false);
        setSuccess(true);
        setUploading(false);
        setTimeout(() => {
          navigation.navigate('Questionnaire', {
            uid: res.user.uid,
            from: 'signup',
          });
        }, 400);}
    } catch (error) {
      console.error('Error verifying OTP or signing up:', error);
      Alert.alert('Error', 'Failed to verify OTP or sign up. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={'white'} barStyle={'dark-content'} />
      <View style={styles.backButton}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../assets/backlm.png')}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.innerContainer}>
          <View style={styles.videoContainer}>
            <Video
              source={require('../assets/email_verify.mp4')}
              style={styles.video}
              muted={true}
              repeat={true}
              resizeMode={'cover'}
              rate={1.0}
              ignoreSilentSwitch={'obey'}
            />
            <Text style={[styles.title, { fontFamily: theme.font2 }]}>
              Phone Verification
            </Text>
            <Text style={[styles.subtitle, { fontFamily: theme.font4 }]}>
              {'We just sent you an OTP to phone number ' + contact + '. Please enter it to proceed ahead'}
            </Text>
          </View>
          <View style={styles.otpContainer}>
            {otp.map((_, index) => (
              <TextInput
                key={index}
                style={[styles.input, { fontFamily: theme.font4 }]}
                value={otp[index]}
                onChangeText={value => handleChange(value, index)}
                keyboardType="numeric"
                maxLength={1}
                ref={ref => (inputRefs.current[index] = ref)}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyOtp}>
            <Text style={[styles.verifyButtonText, { fontFamily: theme.font2 }]}>
              Verify OTP
            </Text>
          </TouchableOpacity>
          <View style={{ height: 160 }}></View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    padding: 12,
    backgroundColor: 'white',
    paddingVertical: 30,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    zIndex: 999,
    top: 12,
    left: 12,
  },
  scrollView: {
    width: '100%',
  },
  innerContainer: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    padding: 12,
    backgroundColor: 'white',
    paddingVertical: 30,
    alignItems: 'center',
  },
  videoContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 30,
    backgroundColor: 'white',
  },
  video: {
    alignItems: 'center',
    width: 210,
    height: 210,
    backgroundColor: 'white',
  },
  title: {
    color: 'black',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    color: 'black',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 15,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    textAlign: 'center',
    fontSize: 18,
    width: '15%',
    color: 'black',
    borderRadius: 7,
    marginHorizontal: 5,
  },
  verifyButton: {
    width: '60%',
    height: 42,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 17,
    textAlign: 'center',
  },
});

export default OtpValidation;
