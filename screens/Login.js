import React, {useState} from 'react';
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
import {colors} from '../Colors';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailErr, setEmailErr] = useState(null);
  const [passwordErr, setPasswordErr] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState(false);
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      setEmail('');
      setPassword('');
      setEmailErr(null);
      setPasswordErr(null);
      setSuccess(false);
      setErr(false);
      setShowPassword(false);
      setUploading(false);
    }, []),
  );
  const handleSignIn = () => {
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
      navigation.navigate('Home')
    }
  };
  return (
    <View style={styles.container}>
      {err && (
        <View style={[styles.msg, {backgroundColor: colors.errorRed}]}>
          <Text style={styles.msgtxt}>{'Invalid Credentials'}</Text>
          <TouchableOpacity onPress={() => setErr(false)}>
            <Image
              source={require('../assets/cross.png')}
              style={{width: 22, height: 22}}
            />
          </TouchableOpacity>
        </View>
      )}
      {success && (
        <View style={[styles.msg, {backgroundColor: colors.successGreen}]}>
          <Text style={styles.msgtxt}>Sign In successful !</Text>
        </View>
      )}
      <View style={styles.section1}>
        <Image
          source={require('../assets/login.png')}
          style={{width: '100%', height: '80%', objectFit: 'contain'}}
        />
        <View style={{width: '100%', height: '20%'}}>
          <Text
            style={{
              color: 'black',
              fontSize: 22,
              textAlign: 'center',
              fontWeight: '700',
            }}>
            Login
          </Text>
        </View>
      </View>
      <ScrollView>
        <View style={styles.section2}>
          <View style={{width: '90%'}}>
            <View style={styles.input}>
              <Image
                source={require('../assets/email.png')}
                style={styles.img2}
              />
              <TextInput
                placeholder="Your email/id"
                placeholderTextColor="gray"
                style={styles.inputSection}
                maxLength={50}
                value={email}
                onChangeText={text => setEmail(text)}
              />
            </View>
            {emailErr && <Text style={styles.err}>{emailErr}</Text>}
          </View>
          <View style={{width: '90%'}}>
            <View style={styles.input}>
              <Image
                source={require('../assets/password.png')}
                style={styles.img2}
              />
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="gray"
                style={styles.inputSection}
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
                      ? require('../assets/showPassword.png')
                      : require('../assets/hidePassword.png')
                  }
                  style={styles.img2}
                />
              </TouchableOpacity>
            </View>
            {passwordErr && <Text style={styles.err}>{passwordErr}</Text>}
          </View>
          <TouchableOpacity style={styles.btn} onPress={handleSignIn}>
            {uploading ? (
              <ActivityIndicator color={'white'} size={'small'} />
            ) : (
              <Text style={{fontSize: 18, fontWeight: '700', color: 'white'}}>
                SignIn
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.input,
              {
                justifyContent: 'center',
                backgroundColor: colors.bg2,
                borderColor: colors.bg2,
                width: '90%',
                gap: 10,
              },
            ]}>
            <Image
              source={require('../assets/google.png')}
              style={styles.img2}
            />
            <Text style={{color: 'black', fontSize: 14}}>
              Continue with Google
            </Text>
          </TouchableOpacity>
          <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
            <Text style={styles.txt}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={[styles.txt, {color: colors.s, fontWeight: '900'}]}>
                SignUp
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
            <Text style={styles.txt}>Forgot Password</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={[styles.txt, {color: colors.s, fontWeight: '900'}]}>
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
    backgroundColor: colors.bg,
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
    borderRadius: 18,
    flexDirection: 'row',
    paddingVertical: 5,
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 5,
    borderWidth: 0.3,
    borderColor: 'gray',
    marginVertical: 5,
  },
  inputSection: {
    width: '80%',
    color: 'black',
  },
  btn: {
    width: '90%',
    backgroundColor: colors.s,
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
  },
  txt: {
    color: 'black',
    fontSize: 13,
  },
  err: {
    fontWeight: '900',
    opacity: 0.8,
    fontSize: 10,
    color: colors.errorRed,
    textAlign: 'right',
    paddingRight: 10,
  },
  msg: {
    color: 'white',
    width: '98%',
    height: 40,
    position: 'absolute',
    top: '1%',
    left: '1%',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    zIndex: 999,
    paddingHorizontal : 18
  },
  msgtxt: {
    color: 'white',
    fontSize: 16,
  },
});
