import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import React, {useCallback, useContext, useState} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {colors} from '../Colors';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { ThemeContext } from '../context/ThemeContext';

const BottomNavigation = () => {
  const { theme }  = useContext(ThemeContext);
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [adminUid, setAdminUid] = useState(null);

  const fetchAdmin = async () => {
    const docRef = await firestore().collection('Admin').doc('admin');
    const doc = await docRef.get();
    const data = doc.data();
    setAdminUid(data.uid);
  };

  //fetch api url
  const [apiUrl, setApiUrl] = useState(null);

  const fetchUrl = async () => {
    const docRef = await firestore().collection('apiUrl').doc('url1');
    const doc = await docRef.get();
    const data = doc.data();
    setApiUrl(data.url);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUrl();
      fetchAdmin();
    }, []),
  );

  const fetchUserData = async user => {
    const userSnapShot = await firestore()
      .collection('Users')
      .where('email', '==', user.email)
      .get();
    if (!userSnapShot.empty) {
      const userData = userSnapShot.docs[0].data();
      return userData;
    }
    return null;
  };
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = auth().onAuthStateChanged(async user => {
        if (user) {
          setCurrentUser(user);
          const userDetails = await fetchUserData(user);
          setUserData(userDetails);
        }
      });
      return unsubscribe;
    }, []),
  );

  if (userData && userData.uid === adminUid) {
    return (
      <View style={[styles.container , {    backgroundColor: theme.bg2}]}>
        <TouchableOpacity
          style={[styles.button, {marginRight: -5}]}
          onPress={() => navigation.navigate('Home')}>
          <Image source={require('../assets/home.png')} style={styles.img} />
          <Text style={styles.txt}>Home</Text>
        </TouchableOpacity>
        {apiUrl && (
          <TouchableOpacity
            style={[styles.button]}
            onPress={() =>
              navigation.navigate('Suggestions', {
                userData: userData,
                url: apiUrl,
              })
            }>
            <Image
              source={require('../assets/suggestions.png')}
              style={styles.img}
            />
            <Text style={styles.txt}>Suggestions</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button]}
          onPress={() =>
            navigation.navigate('Queries', {
              currentUser: currentUser,
              userData: userData,
            })
          }>
          <Image source={require('../assets/query.png')} style={styles.img} />
          <Text style={styles.txt}>Queries</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button]}
          onPress={() =>
            navigation.navigate('LearningCentre', {userData: userData})
          }>
          <Image source={require('../assets/learn.png')} style={styles.img} />
          <Text style={styles.txt}>Learn</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    return (
      <View style={[styles.container , {    backgroundColor: theme.bg2,}]}>
        <TouchableOpacity
          style={[styles.button, {marginRight: -5}]}
          onPress={() => navigation.navigate('Home')}>
          <Image source={require('../assets/home.png')} style={styles.img} />
          <Text style={styles.txt}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button]}
          onPress={() => navigation.navigate('Analytics', {uid: userData.uid})}>
          <Image
            source={require('../assets/analytics.png')}
            style={styles.img}
          />
          <Text style={styles.txt}>Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button]}
          onPress={() =>
            navigation.navigate('Suggestions', {
              userData: userData,
              url: apiUrl,
            })
          }>
          <Image
            source={require('../assets/suggestions.png')}
            style={styles.img}
          />
          <Text style={styles.txt}>Suggestions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button]}
          onPress={() =>
            navigation.navigate('Queries', {
              currentUser: currentUser,
              userData: userData,
            })
          }>
          <Image source={require('../assets/query.png')} style={styles.img} />
          <Text style={styles.txt}>Queries</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button]}
          onPress={() =>
            navigation.navigate('LearningCentre', {userData: userData})
          }>
          <Image source={require('../assets/learn.png')} style={styles.img} />
          <Text style={styles.txt}>Learn</Text>
        </TouchableOpacity>
      </View>
    );
  }
};

export default BottomNavigation;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    paddingVertical: 7,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 36,
    width: '20%',
  },
  txt: {
    color: 'black',
    fontSize: 11,
    fontFamily: colors.font2,
  },
  img: {
    width: '100%',
    height: 24,
    objectFit: 'contain',
  },
});
