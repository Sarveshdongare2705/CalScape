import React, {useContext, useState} from 'react';
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
import {ThemeContext} from '../context/ThemeContext';

const ForgotPassword = () => {
  const {theme, isDarkMode} = useContext(ThemeContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
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
      setUsername('');
      setEmail('');
      setContact('');
      setPassword('');
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

  const handleForgotPassword = async () => {
    if (email === '') {
      setEmailErr('Email cannot be empty');
    } else {
      setEmailErr(null);
    }

    if (email !== '') {
      try {
        setUploading(true);
        await auth().sendPasswordResetEmail(email);
        setSuccess(true);
        setErrMsg('Password reset email sent successfully!');
      } catch (error) {
        setErrMsg('Invalid email entered');
        setSuccess(false);
      } finally {
        setUploading(false);
        setErr(true);
      }
    }
  };
  return (
    <View style={[styles.container, {backgroundColor: theme.bg}]}>
      {err && (
        <View style={[styles.msg, {backgroundColor: theme.errorRed}]}>
          <Text style={[styles.msgtxt , {fontFamily: theme.font4,}]}>{errMsg}</Text>
          <TouchableOpacity onPress={() => setErr(false)}>
            <Image
              source={isDarkMode ? require('../assets/removedm.png') : require('../assets/removelm.png')}
              style={{width: 22, height: 22}}
            />
          </TouchableOpacity>
        </View>
      )}
      {success && (
        <View style={[styles.msg, {backgroundColor: theme.successGreen}]}>
          <Text style={[styles.msgtxt , {fontFamily: theme.font4,}]}>{errMsg}</Text>
        </View>
      )}
      <View style={styles.section1}>
        <View style={{width: '100%'}}>
          <Text
            style={{
              color: theme.text,
              fontSize: 22,
              textAlign: 'center',
              fontFamily: theme.font2,
              marginBottom: 5,
            }}>
            Forgot Password ?
          </Text>
          <Text
            style={{
              color: theme.text,
              fontSize: 14,
              textAlign: 'center',
              paddingHorizontal: 15,
              fontFamily: theme.font4,
            }}>
            Enter the email address you used to Login with CalScape. You will
            receive an email to define a new password.
          </Text>
        </View>
      </View>
      <ScrollView>
        <View style={styles.section2}>
          <View style={{width: '90%'}}>
            <View style={[styles.input , {backgroundColor : theme.bg4}]}>
              <Image
                source={isDarkMode ? require('../assets/emaildm.png') : require('../assets/emaillm.png')}
                style={styles.img2}
              />
              <TextInput
                placeholder="Enter your Email"
                placeholderTextColor="gray"
                style={[styles.inputSection, ]}
                maxLength={50}
                value={email}
                onChangeText={text => setEmail(text)}
              />
            </View>
            {emailErr && (
              <Text
                style={[
                  styles.err,
                  {color: theme.errorRed, fontFamily: theme.font2},
                ]}>
                {emailErr}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.btn, {backgroundColor: theme.p}]}
            onPress={handleForgotPassword}>
            {uploading ? (
              <ActivityIndicator color={theme.text} size={'small'} />
            ) : (
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: theme.font2,
                  color: theme.text,
                }}>
                Send Email
              </Text>
            )}
          </TouchableOpacity>
          <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
            <Text
              style={[
                styles.txt,
                {fontFamily: theme.font4, color: theme.text},
              ]}>
              Remember your password ?
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
export default ForgotPassword;

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
    paddingVertical: 50,
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
    color: 'black',
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
  },
});
