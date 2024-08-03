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
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {ThemeContext} from '../context/ThemeContext';

const Login = () => {
  const {theme, isDarkMode} = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailErr, setEmailErr] = useState(null);
  const [passwordErr, setPasswordErr] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const navigation = useNavigation();

  //google part
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '1068692630715-ljqk4421kuak2aoeebltf34tihd0m4g7.apps.googleusercontent.com',
    });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setEmail('');
      setPassword('');
      setEmailErr(null);
      setPasswordErr(null);
      setSuccess(false);
      setErr(false);
      setShowPassword(false);
      setErrMsg('');
      setUploading(false);
    }, []),
  );
  const handleSignIn = async () => {
    if (email == '') {
      setEmailErr('Email cannot be empty');
    } else {
      setEmailErr(null);
    }
    if (password == '') {
      setPasswordErr('Password cannot be empty');
    } else {
      setPasswordErr(null);
    }

    if (email !== '' && password !== '') {
      try {
        setUploading(true);
        const userCredential = await auth().signInWithEmailAndPassword(
          email,
          password,
        );
        console.log('SignIn Res : ', userCredential);
        setErr(false);
        setSuccess(true);
        setUploading(false);
        setTimeout(() => {
          navigation.navigate('Home');
        }, 500);
      } catch (err) {
        console.log('SignIn err:', err);
        setUploading(false);
        setSuccess(false);
        setErr(true);
        setErrMsg('Invalid Credentials');
      }
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.bg}]}>
      {err && (
        <View style={[styles.msg, {backgroundColor: theme.errorRed}]}>
          <Text style={[styles.msgtxt, {fontFamily: theme.font2}]}>
            {errMsg}
          </Text>
          <TouchableOpacity onPress={() => setErr(false)}>
            <Image
              source={
                isDarkMode
                  ? require('../assets/removedm.png')
                  : require('../assets/removelm.png')
              }
              style={{width: 24, height: 24}}
            />
          </TouchableOpacity>
        </View>
      )}
      {success && (
        <View
          style={[
            styles.msg,
            {backgroundColor: theme.successGreen, fontFamily: theme.font2},
          ]}>
          <Text style={[styles.msgtxt, {fontFamily: theme.font2}]}>
            Sign In successful !
          </Text>
        </View>
      )}
      <View style={styles.section1}>
        <Image
          source={require('../assets/login.png')}
          style={{
            width: 180,
            height: '60%',
            objectFit: 'contain',
            marginLeft: 20,
            marginTop: 30,
          }}
        />
        <View style={{width: '100%', height: '20%'}}>
          <Text
            style={{
              color: theme.text,
              fontSize: 22,
              textAlign: 'center',
              fontFamily: theme.font2,
            }}>
            Login
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
                    ? require('../assets/emaildm.png')
                    : require('../assets/emaillm.png')
                }
                style={styles.img2}
              />
              <TextInput
                placeholder="Your email/id"
                placeholderTextColor="gray"
                style={[
                  styles.inputSection,
                  {fontFamily: theme.font4, color: theme.text},
                ]}
                maxLength={50}
                value={email}
                onChangeText={text => setEmail(text)}
              />
            </View>
            {emailErr && (
              <Text
                style={[
                  styles.err,
                  {
                    color: theme.errorRed,
                    fontFamily: theme.font2,
                    color: theme.text,
                  },
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
                    ? require('../assets/passworddm.png')
                    : require('../assets/passwordlm.png')
                }
                style={styles.img2}
              />
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="gray"
                style={[styles.inputSection, {fontFamily: theme.font4}]}
                maxLength={50}
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
              <Text
                style={[
                  styles.err,
                  {color: theme.errorRed, fontFamily: theme.font2},
                ]}>
                {passwordErr}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.btn, {backgroundColor: theme.s}]}
            onPress={handleSignIn}>
            {uploading ? (
              <ActivityIndicator color={'white'} size={'small'} />
            ) : (
              <Text
                style={{fontSize: 18, color: theme.text, fontFamily: theme.font2}}>
                SignIn
              </Text>
            )}
          </TouchableOpacity>
          <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
            <Text
              style={[
                styles.txt,
                {color: theme.text, fontFamily: theme.font4},
              ]}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text
                style={[styles.txt, {color: theme.s, fontFamily: theme.font2}]}>
                SignUp
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
            <Text
              style={[
                styles.txt,
                {color: theme.text, fontFamily: theme.font4},
              ]}>
              Forgot Password
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}>
              <Text
                style={[
                  styles.txt,
                  {
                    color: theme.s,
                    fontFamily: theme.font2,
                  },
                ]}>
                Click Here
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
export default Login;

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
    height: '48%',
  },
  section2: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    height: '50%',
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
    bottom: '1%',
    left: '2%',
    borderRadius: 3,
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
    width: '84%',
    height: 23,
  },
});
