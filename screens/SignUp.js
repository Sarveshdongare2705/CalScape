import React, {useEffect, useState} from 'react';
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
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

const SignUp = () => {
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

  //google part
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '1068692630715-ljqk4421kuak2aoeebltf34tihd0m4g7.apps.googleusercontent.com',
    });
  }, []);

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

  const handleGoogleSignUp = async () => {
    try {
      setUploading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(
        userInfo.idToken,
      );

      const userRef = firestore()
        .collection('Users')
        .where('email', '==', userInfo.user.email);
      const userSnapshot = await userRef.get();

      if (!userSnapshot.empty) {
        setSuccess(false);
        setErr(true);
        setErrMsg('Account already exists with selected email');
        setUploading(false);
        await GoogleSignin.signOut();
        await auth().signOut();
        return;
      }

      const res = await auth().signInWithCredential(googleCredential);

      if (res) {
        const currentDate = new Date().toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        const newUserRef = firestore().collection('Users').doc(res.user.uid);
        await newUserRef.set({
          uid: res.user.uid,
          email: userInfo.user.email,
          contact: contact,
          member_since: currentDate,
        });
        setErr(false);
        setSuccess(true);
        setTimeout(() => {
          navigation.navigate('Questionnaire');
        }, 500);
        await GoogleSignin.signOut();
        await auth().signOut();
      }
      setUploading(false);
    } catch (error) {
      console.log('Google Sign-In error:', error);
      let errMessage = 'Failed to sign in with Google. Please try again.';
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errMessage = 'User cancelled the login process.';
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errMessage = 'Sign in in progress.';
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errMessage = 'Google Play Services not available or outdated.';
      }
      setErrMsg(errMessage);
      setSuccess(false);
      setErr(true);
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {err && (
        <View style={[styles.msg, {backgroundColor: colors.errorRed}]}>
          <Text style={styles.msgtxt}>{errMsg}</Text>
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
          <Text style={styles.msgtxt}>Sign Up successful !</Text>
        </View>
      )}
      <View style={styles.section1}>
        <View style={{width: '100%'}}>
          <Text
            style={{
              color: 'black',
              fontSize: 22,
              textAlign: 'center',
              fontWeight: '700',
            }}>
            Create an account
          </Text>
          <Text
            style={{
              color: 'black',
              fontSize: 14,
              textAlign: 'center',
            }}>
            Join us to track and reduce your carbon footprint!
          </Text>
        </View>
      </View>
      <ScrollView>
        <View style={styles.section2}>
          <View style={{width: '90%'}}>
            <View style={styles.input}>
              <Image
                source={require('../assets/profile.png')}
                style={styles.img2}
              />
              <TextInput
                placeholder="Enter your Username"
                placeholderTextColor="gray"
                style={styles.inputSection}
                maxLength={18}
                value={username}
                onChangeText={text => setUsername(text)}
              />
            </View>
            {usernameErr && <Text style={styles.err}>{usernameErr}</Text>}
          </View>
          <View style={{width: '90%'}}>
            <View style={styles.input}>
              <Image
                source={require('../assets/email.png')}
                style={styles.img2}
              />
              <TextInput
                placeholder="Enter your Email"
                placeholderTextColor="gray"
                style={styles.inputSection}
                maxLength={40}
                value={email}
                onChangeText={text => setEmail(text)}
              />
            </View>
            {emailErr && <Text style={styles.err}>{emailErr}</Text>}
          </View>
          <View style={{width: '90%'}}>
            <View style={styles.input}>
              <Image
                source={require('../assets/contact.png')}
                style={styles.img2}
              />
              <TextInput
                placeholder="Enter your Mobile Number"
                placeholderTextColor="gray"
                style={styles.inputSection}
                maxLength={10}
                value={contact}
                onChangeText={text => setContact(text)}
                keyboardType="numeric"
              />
            </View>
            {contactErr && <Text style={styles.err}>{contactErr}</Text>}
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
                      ? require('../assets/showPassword.png')
                      : require('../assets/hidePassword.png')
                  }
                  style={styles.img2}
                />
              </TouchableOpacity>
            </View>
            {passwordErr && <Text style={styles.err}>{passwordErr}</Text>}
          </View>
          <TouchableOpacity style={styles.btn} onPress={handleSignUp}>
            {uploading ? (
              <ActivityIndicator color={'white'} size={'small'} />
            ) : (
              <Text style={{fontSize: 18, fontWeight: '700', color: 'white'}}>
                SignUp
              </Text>
            )}
          </TouchableOpacity>
          <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
            <Text style={styles.txt}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.txt, {color: colors.p, fontWeight: '900'}]}>
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
    backgroundColor: colors.bg,
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
    backgroundColor: colors.p,
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
    paddingHorizontal: 18,
  },
  msgtxt: {
    color: 'white',
    fontSize: 16,
    width: '84%',
    height: 23,
  },
});
