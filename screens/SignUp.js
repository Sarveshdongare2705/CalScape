import React, {useContext, useEffect, useState} from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {ThemeContext} from '../context/ThemeContext';
import Video from 'react-native-video';

const SignUp = () => {
  const {theme, isDarkMode} = useContext(ThemeContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('+91');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailErr, setEmailErr] = useState(null);
  const [usernameErr, setUsernameErr] = useState(null);
  const [contactErr, setContactErr] = useState(null);
  const [passwordErr, setPasswordErr] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      setUsernameErr(null);
      setEmailErr(null);
      setContactErr(null);
      setPasswordErr(null);
      setSuccess(false);
      setErr(false);
      setErrMsg('');
      setShowPassword(false);
      setUploading(false);
    }, []),
  );

  const handleSignUp = async () => {
    if (username == '') {
      setUsernameErr('Username cannot be empty');
    } else {
      setUsernameErr(null);
    }
    if (email == '') {
      setEmailErr('Email cannot be empty');
    } else {
      setEmailErr(null);
    }
    if (contact == '') {
      setContactErr('Mobile Number cannot be empty');
    } else {
      setContactErr(null);
    }
    if (password == '') {
      setPasswordErr('Password cannot be empty');
    } else {
      setPasswordErr(null);
    }

    if (username !== '' && email !== '' && contact !== '' && password !== '') {
      try {
        setUploading(true);
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
          }, 400);
        }
      } catch (err) {
        console.log('Sign up err:', err);
        let errMessage = 'Failed to sign up. Please try again.';
        if (err.code === 'auth/email-already-in-use') {
          errMessage = 'Email already in use.';
        }
        if (err.code === 'auth/weak-password') {
          errMessage = 'Password is weak.';
        }
        if (err.code === 'auth/invalid-email') {
          errMessage = 'Entered email is invalid';
        }
        setUploading(false);
        setErrMsg(errMessage);
        setSuccess(false);
        setErr(true);
      }
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: 'white'}]}>
      {<StatusBar backgroundColor={'white'} barStyle={'light-content'} />}
      {err && (
        <View style={[styles.msg, {backgroundColor: theme.errorRed}]}>
          <Text style={[styles.msgtxt, {fontFamily: theme.font2}]}>
            {errMsg}
          </Text>
          <TouchableOpacity onPress={() => setErr(false)}>
            <Image
              source={require('../assets/removelm.png')}
              style={{width: 27, height: 27}}
            />
          </TouchableOpacity>
        </View>
      )}
      {success && (
        <View style={[styles.msg, {backgroundColor: theme.successGreen}]}>
          <Text style={[styles.msgtxt, {fontFamily: theme.font2}]}>
            Sign Up successful !
          </Text>
        </View>
      )}
      <View style={styles.section1}>
        <View style={{width: '100%', alignItems: 'center'}}>
          <Video
            source={require('../assets/signupVideo.mp4')}
            style={styles.video}
            muted={true}
            repeat={true}
            resizeMode={'cover'}
            rate={1.0}
            ignoreSilentSwitch={'obey'}
          />
          <Text
            style={{
              color: 'theme.text',
              fontSize: 22,
              textAlign: 'center',
              fontFamily: theme.font2,
            }}>
            Create an account
          </Text>
          <Text
            style={{
              color: 'theme.text',
              fontSize: 14,
              textAlign: 'center',
              fontFamily: theme.font4,
            }}>
            Join us to track and reduce your carbon footprint!
          </Text>
        </View>
      </View>
      <ScrollView>
        <View style={styles.section2}>
          <View style={{width: '90%'}}>
            <View style={[styles.input, {backgroundColor: theme.bg4}]}>
              <Image
                source={
                  isDarkMode
                    ? require('../assets/accountdm.png')
                    : require('../assets/accountlm.png')
                }
                style={styles.img2}
              />
              <TextInput
                placeholder="Enter your Username"
                placeholderTextColor="gray"
                style={[
                  styles.inputSection,
                  {fontFamily: theme.font4, color: 'theme.text'},
                ]}
                maxLength={18}
                value={username}
                onChangeText={text => setUsername(text)}
              />
            </View>
            {usernameErr && (
              <Text
                style={[
                  styles.err,
                  {fontFamily: theme.font2, color: theme.errorRed},
                ]}>
                {usernameErr}
              </Text>
            )}
          </View>
          <View style={{width: '90%'}}>
            <View style={[styles.input, {backgroundColor: theme.bg4}]}>
              <Image
                source={
                  isDarkMode
                    ? require('../assets/emaildm.png')
                    : require('../assets/emaillm.png')
                }
                style={styles.img2}
              />
              <TextInput
                placeholder="Enter your Email"
                placeholderTextColor="gray"
                style={[
                  styles.inputSection,
                  {fontFamily: theme.font4, color: 'theme.text'},
                ]}
                maxLength={40}
                value={email}
                onChangeText={text => setEmail(text)}
              />
            </View>
            {emailErr && (
              <Text
                style={[
                  styles.err,
                  {fontFamily: theme.font2, color: theme.errorRed},
                ]}>
                {emailErr}
              </Text>
            )}
          </View>
          <View style={{width: '90%'}}>
            <View style={[styles.input, {backgroundColor: theme.bg4}]}>
              <Image
                source={
                  isDarkMode
                    ? require('../assets/contactdm.png')
                    : require('../assets/contactlm.png')
                }
                style={styles.img2}
              />
              <TextInput
                placeholder="Enter your Mobile Number"
                placeholderTextColor="gray"
                style={[
                  styles.inputSection,
                  {fontFamily: theme.font4, color: 'theme.text'},
                ]}
                maxLength={13}
                value={contact}
                onChangeText={text => setContact(text)}
                keyboardType="numeric"
              />
            </View>
            {contactErr && (
              <Text
                style={[
                  styles.err,
                  {fontFamily: theme.font2, color: theme.errorRed},
                ]}>
                {contactErr}
              </Text>
            )}
          </View>
          <View style={{width: '90%'}}>
            <View style={[styles.input, {backgroundColor: theme.bg4}]}>
              <Image
                source={
                  isDarkMode
                    ? require('../assets/passworddm.png')
                    : require('../assets/passwordlm.png')
                }
                style={styles.img2}
              />
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="gray"
                style={[
                  styles.inputSection,
                  {fontFamily: theme.font4, color: 'theme.text'},
                ]}
                maxLength={20}
                value={password}
                onChangeText={text => setPassword(text)}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{position: 'absolute', top: 14, right: 10}}>
                <Image
                  source={
                    showPassword
                      ? isDarkMode
                        ? require('../assets/pvdm.png')
                        : require('../assets/pvlm.png')
                      : isDarkMode
                      ? require('../assets/pidm.png')
                      : require('../assets/pilm.png')
                  }
                  style={styles.img2}
                />
              </TouchableOpacity>
            </View>
            {passwordErr && (
              <Text style={[styles.err, {fontFamily: theme.font2}]}>
                {passwordErr}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.btn, {backgroundColor: theme.p}]}
            onPress={handleSignUp}>
            {uploading ? (
              <ActivityIndicator color={'white'} size={'small'} />
            ) : (
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: theme.font2,
                  color: 'theme.text',
                }}>
                SignUp
              </Text>
            )}
          </TouchableOpacity>
          <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
            <Text
              style={[
                styles.txt,
                {fontFamily: theme.font4, color: 'theme.text'},
              ]}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text
                style={[styles.txt, {color: theme.p, fontFamily: theme.font2}]}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
export default SignUp;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  section1: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 40,
  },
  section2: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    height: '90%',
    alignItems: 'center',
    marginBottom: 45,
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
    marginVertical: 5,
  },
  inputSection: {
    width: '80%',
  },
  btn: {
    width: '90%',
    height: 50,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
  },
  txt: {
    fontSize: 13,
  },
  err: {
    opacity: 0.8,
    fontSize: 10,
    textAlign: 'right',
    paddingRight: 10,
  },
  msg: {
    color: 'white',
    width: '96%',
    height: 40,
    position: 'absolute',
    top: '0%',
    left: '2%',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    zIndex: 999,
    paddingHorizontal: 18,
  },
  msgtxt: {
    color: 'white',
    fontSize: 16,
    width: '90%',
    height: 23,
  },
  video: {
    alignItems: 'center',
    width: 120,
    height: 120,
    backgroundColor: 'white',
  },
});
