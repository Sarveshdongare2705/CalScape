import React, {useCallback, useState} from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ToastAndroid,
  StatusBar,
} from 'react-native';
import BottomNavigation from '../components/BottomNavigation';
import {colors} from '../Colors';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {ActivityIndicator} from 'react-native-paper';
import ImagePicker from 'react-native-image-crop-picker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import determineLeague, {calculateReduction} from '../utils/reductionUtils';

const Profile = () => {
  const route = useRoute();
  const {uid} = route.params;
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [contact, setContact] = useState('');
  const [emailErr, setEmailErr] = useState(null);
  const [usernameErr, setUsernameErr] = useState(null);
  const [contactErr, setContactErr] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [img, setImg] = useState(null);
  const [updateModal, showUpdateModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [val, setVal] = useState(0);

  const [adminUid, setAdminUid] = useState(null);
  const fetchAdmin = async () => {
    const docRef = await firestore().collection('Admin').doc('admin');
    const doc = await docRef.get();
    const data = doc.data();
    setAdminUid(data.uid);
  };

  //current user
  const fetchCurrentuserData = async user => {
    setLoading(true);
    const userSnapShot = await firestore()
      .collection('Users')
      .where('uid', '==', user.uid)
      .get();
    if (!userSnapShot.empty) {
      const userData = userSnapShot.docs[0].data();
      setLoading(false);
      return userData;
    }
    setLoading(false);
    return null;
  };

  //profile user
  const fetchUserData = async () => {
    setLoading(true);
    const userSnapShot = await firestore()
      .collection('Users')
      .where('uid', '==', uid)
      .get();
    if (!userSnapShot.empty) {
      const userData = userSnapShot.docs[0].data();
      setLoading(false);
      return userData;
    }
    setLoading(false);
    return null;
  };

  const fetchFootprint = async uid => {
    const currentTime = new Date();
    const timestamp = {
      month: currentTime.getMonth() + 1,
      year: currentTime.getFullYear(),
    };
    const footprintRef = firestore()
      .collection('Users')
      .doc(uid)
      .collection('Footprint')
      .doc(`${timestamp.month}-${timestamp.year}`);

    const doc = await footprintRef.get();
    if (doc.exists) {
      const data = doc.data();
      const val =
        (data.basicDetails ? data.basicDetails : 0) +
        (data.recycleDetails ? data.recycleDetails : 0) +
        (data.travelDetails ? data.travelDetails : 0) +
        (data.electricityDetails ? data.electricityDetails : 0) +
        (data.energyDetails ? data.energyDetails : 0) +
        (data.foodDetails ? data.foodDetails : 0) +
        (data.clothingDetails ? data.clothingDetails : 0) +
        (data.extraDetails ? data.extraDetails : 0);
      setVal(val.toFixed(2));
    } else {
      setVal(0);
    }
  };

  //league
  const [leagueDetails, setLeagueDetails] = useState({
    leagueName: null,
    imageUrl: null,
    text: null,
  });

  //reduction
  const [reducedValue, setReducedValue] = useState({
    value: null,
    status: null,
    percentage: null,
  });

  useFocusEffect(
    useCallback(() => {
      setUserData(null);
      const unsubscribe = auth().onAuthStateChanged(async user => {
        if (user) {
          fetchAdmin();
          setCurrentUser(user);
          const currentUserDetails = await fetchCurrentuserData(user);
          fetchFootprint(currentUserDetails.uid);
          setCurrentUserData(currentUserDetails);
          setUserData(currentUserDetails);
          const league = await determineLeague(uid);
          console.log('league', league);
          setLeagueDetails(league);
          const reduced = await calculateReduction(uid);
          setReducedValue(reduced);
          if (currentUserDetails) {
            setEmail(currentUserDetails.email);
            setUsername(currentUserDetails.username);
            setContact(currentUserDetails.contact);
          }
        }
      });

      return unsubscribe;
    }, [uid]),
  );

  useFocusEffect(
    React.useCallback(() => {
      setUsernameErr(null);
      setEmailErr(null);
      setContactErr(null);
      setUploading(false);
      setShowLogoutModal(false);
    }, []),
  );

  const handleEditProfile = async () => {
    if (username === '') {
      setUsernameErr('Username cannot be empty');
    } else {
      setUsernameErr(null);
    }
    if (contact === '') {
      setContactErr('Mobile Number cannot be empty');
    } else {
      setContactErr(null);
    }

    if (username !== '' && contact !== '') {
      setUploading(true);
      try {
        const userSnapShot = await firestore()
          .collection('Users')
          .where('uid', '==', currentUserData.uid)
          .get();
        if (!userSnapShot.empty) {
          const userRef = userSnapShot.docs[0].ref;
          await userRef.update({
            username: username,
            contact: contact,
          });
          if (img) {
            const reference = storage().ref(currentUser.uid);
            let pathToFile = img;
            await reference.putFile(pathToFile);
            url = await storage().ref(currentUser.uid).getDownloadURL();
            await firestore().collection('Users').doc(currentUser.uid).update({
              profileImg: url,
            });
          }
          userData.profileImg = img ? img : currentUserData.profileImg;
          userData.username = username;
          userData.contact = contact;
          setUploading(false);
          showUpdateModal(false);
          ToastAndroid.show(`Your profile is updated.`, ToastAndroid.SHORT);
        } else {
          console.log('User not found in Firestore');
        }
      } catch (err) {
        console.error(err);
        setUploading(false);
      }
    }
    const userDetails = await fetchUserData();
    await AsyncStorage.setItem('data', JSON.stringify(userDetails));
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      firestore().collection('Users').doc(currentUser.uid).update({
        status: firestore.FieldValue.serverTimestamp(),
      });
      navigation.navigate('Login');
    } catch (err) {
      console.error(err);
    }
  };

  const handleImagePick = async () => {
    setLoading(true);
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
      });
      setImg(image.path);
    } catch (error) {
      console.log('Image pick cancelled or error: ', error);
      setUploading(false);
    }
    setLoading(false);
  };

  const leagues = [
    {
      name: 'Rainforest',
      img: 'https://cdn-icons-png.flaticon.com/128/7922/7922738.png',
    },
    {
      name: 'Forest',
      img: 'https://cdn-icons-png.flaticon.com/128/685/685022.png',
    },
    {
      name: 'Tree',
      img: 'https://cdn-icons-png.flaticon.com/128/2713/2713505.png',
    },
    {
      name: 'Sapling',
      img: 'https://cdn-icons-png.flaticon.com/128/11639/11639345.png',
    },
    {
      name: 'Seedling',
      img: 'https://cdn-icons-png.flaticon.com/128/2227/2227504.png',
    },
  ];

  return (
    <View style={styles.container}>
      {updateModal && (
        <View
          style={{
            position: 'absolute',
            top: 60,
            left: '5%',
            width: '90%',
            height: '72%',
            backgroundColor: 'white',
            zIndex: 999,
            borderColor: 'black',
            borderRadius: 3,
            elevation: 4,
            borderRadius: 20,
            padding: 10,
          }}>
          <TouchableOpacity
            style={{
              position: 'absolute',
              zIndex: 999,
              bottom: 10,
              right: 10,
              width: 150,
              height: 40,
              backgroundColor: colors.bg2,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: uploading ? 0.5 : 1,
            }}
            onPress={handleEditProfile}>
            <Text
              style={{
                color: 'black',
                fontSize: 18,
                fontFamily: colors.font2,
              }}>
              Update
            </Text>
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '10%',
            }}>
            {uploading ? (
              <ActivityIndicator size={24} color="black" />
            ) : (
              <TouchableOpacity onPress={() => showUpdateModal(false)}>
                <Image
                  source={require('../assets/remove.png')}
                  style={{width: 27, height: 27}}
                />
              </TouchableOpacity>
            )}
            <Text
              style={{color: 'black', fontSize: 18, fontFamily: colors.font2}}>
              Update Profile
            </Text>
          </View>
          <View
            style={{
              width: '100%',
              height: '90%',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ScrollView style={{width: '100%', height: 360}}>
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                }}
                onPress={handleImagePick}>
                <View
                  style={{
                    position: 'absolute',
                    width: 30,
                    height: 30,
                    zIndex: 999,
                    padding: 5,
                    backgroundColor: colors.bg2,
                    borderRadius: 15,
                    bottom: 12,
                    right: '36%',
                  }}>
                  <Image
                    style={{
                      width: 20,
                      height: 20,
                    }}
                    source={require('../assets/edit.png')}
                  />
                </View>
                <Image
                  source={
                    img
                      ? {uri: img}
                      : userData
                      ? {uri: userData.profileImg}
                      : require('../assets/profileImg.png')
                  }
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    marginVertical: 20,
                    marginTop: 40,
                    borderWidth: 4,
                    borderColor: colors.bg2,
                  }}
                />
              </TouchableOpacity>
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
              <View style={[styles.input, {opacity: 0.6}]}>
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
                  editable={false}
                />
              </View>
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
              <View style={{height: 120}}></View>
            </ScrollView>
          </View>
        </View>
      )}
      {showLogoutModal && (
        <View
          style={{
            position: 'absolute',
            width: '50%',
            height: 90,
            backgroundColor: '#FAFAFA',
            zIndex: 999,
            top: '31%',
            right: '3%',
            borderRadius: 3,
            paddingHorizontal: 7,
            paddingVertical: 7,
            flexDirection: 'column',
            shadowColor: 'black',
            shadowOpacity: 0.25,
            shadowRadius: 3,
            elevation: 7,
            justifyContent: 'space-between',
          }}>
          <View style={{width: '100%', alignItems: 'flex-start'}}>
            <Text
              style={{color: 'black', fontSize: 14, fontFamily: colors.font1}}>
              Are you sure you want to logout ?
            </Text>
          </View>
          <View style={{width: '100%', alignItems: 'flex-end'}}>
            <View style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
              <TouchableOpacity onPress={handleLogout}>
                <Text
                  style={{
                    color: colors.p,
                    fontSize: 18,
                    fontFamily: colors.font4,
                  }}>
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowLogoutModal(false)}>
                <Text
                  style={{
                    color: colors.errorRed,
                    fontSize: 18,
                    fontFamily: colors.font4,
                  }}>
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      <View
        style={{
          width: '89%',
          position: 'absolute',
          zIndex: 999,
          top: 12,
          left: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginLeft: '2%',
        }}>
        <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
          {!updateModal && (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require('../assets/backButton.png')}
                style={{width: 27, height: 27}}
              />
            </TouchableOpacity>
          )}
          {loading === true && (
            <ActivityIndicator color="black" size={21} style={{opacity: 0.7}} />
          )}
        </View>
        <Text style={{color: 'black', fontSize: 18, fontFamily: colors.font2}}>
          {currentUserData && userData && currentUserData.uid === userData.uid
            ? 'My Profile'
            : 'User Profile'}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '96%',
          backgroundColor: colors.bg2,
          paddingVertical: 30,
          paddingHorizontal: 16,
          gap: 10,
          marginLeft: '2%',
          borderRadius: 7,
        }}>
        <View
          style={{
            position: 'absolute',
            bottom: 10,
            left: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text
            style={{
              color: 'black',
              fontSize: 15,
              fontFamily: colors.font2,
              opacity: 0.9,
              width: '93%',
            }}>
            {userData && 'Member since ' + userData.member_since}
          </Text>
          {!loading && (
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 7}}>
              <TouchableOpacity onPress={() => showUpdateModal(!updateModal)}>
                <Image
                  source={require('../assets/editProfile.png')}
                  style={{width: 36, height: 36}}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowLogoutModal(!showLogoutModal)}>
                <Image
                  source={require('../assets/logoutIcon.png')}
                  style={{width: 24, height: 24}}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Image
          source={
            userData
              ? {uri: userData.profileImg}
              : require('../assets/profileImg.png')
          }
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            marginVertical: 20,
            marginTop: 40,
            borderWidth: 3,
            borderColor: 'white',
            objectFit: 'cover',
          }}
        />
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            marginTop: 13,
          }}>
          <Text
            style={{color: 'black', fontSize: 24, fontFamily: colors.font2}}>
            {userData ? userData.username : ''}
          </Text>
          <Text
            style={{
              color: 'black',
              fontSize: 15,
              fontFamily: colors.font4,
              opacity: 0.6,
            }}>
            {userData && userData.email}
          </Text>
          <Text
            style={{
              color: 'black',
              fontSize: 15,
              fontFamily: colors.font4,
              opacity: 0.6,
            }}>
            {userData && '+91 ' + userData.contact}
          </Text>
        </View>
      </View>
      {currentUserData && userData && currentUserData.uid === userData.uid && (
        <ScrollView style={{width: '100%', paddingHorizontal: 10}}>
          <View
            style={{
              width: '100%',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 18,
              marginTop: 7,
              justifyContent: 'space-around',
              gap: 10,
            }}>
            <View
              style={{
                width: '96%',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 5,
                padding: 7,
                overflow: 'hidden',
                shadowColor: 'black',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 1,
                shadowRadius: 4,
                elevation: 5,
                backgroundColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 3,
              }}>
              <Text
                style={{
                  width: '100%',
                  textAlign: 'left',
                  fontSize: 16,
                  fontFamily: colors.font2,
                  color: 'black',
                }}>
                {'League Stage'}
              </Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 7,
                  paddingVertical: 7,
                  gap: 10,
                }}>
                {leagueDetails.imageUrl && (
                  <Image
                    source={{uri: leagueDetails.imageUrl}}
                    style={{width: 72, height: 72}}
                  />
                )}
                <View
                  style={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    width: '72%',
                  }}>
                  <View
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 3,
                    }}>
                    <Text
                      style={{
                        textAlign: 'left',
                        fontSize: 15,
                        fontFamily: colors.font4,
                        color: 'black',
                      }}>
                      {'Current League : '}
                    </Text>
                    <Text
                      style={{
                        textAlign: 'left',
                        fontSize: 15,
                        fontFamily: colors.font2,
                        color: 'black',
                      }}>
                      {leagueDetails.leagueName}
                    </Text>
                  </View>
                  <Text
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      fontSize: 13,
                      fontFamily: colors.font4,
                      color: 'black',
                    }}>
                    {leagueDetails.text}
                  </Text>
                  {userData.previousLeague && (
                    <View
                      style={{
                        width: '100%',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 3,
                      }}>
                      <Text
                        style={{
                          textAlign: 'left',
                          fontSize: 15,
                          fontFamily: colors.font4,
                          color: 'black',
                        }}>
                        {'Previous League : '}
                      </Text>
                      <Text
                        style={{
                          textAlign: 'left',
                          fontSize: 15,
                          fontFamily: colors.font2,
                          color: 'black',
                        }}>
                        {userData.previousLeague}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <View
              style={{
                width: '96%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View
                style={{
                  width: '48%',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 5,
                  overflow: 'hidden',
                  shadowColor: 'black',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 1,
                  shadowRadius: 4,
                  elevation: 5,
                  backgroundColor: 'white',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 3,
                  padding: 7,
                  height: 187,
                }}>
                <Text
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    fontSize: 16,
                    fontFamily: colors.font2,
                    color: 'black',
                    height: 25,
                  }}>
                  {'All Leagues'}
                </Text>
                <ScrollView
                  style={{
                    width: '100%',
                    height: '100%',
                    padding: 3,
                    height: 160,
                  }}
                  nestedScrollEnabled>
                  {leagues.map(league => (
                    <View
                      style={{
                        width: '100%',
                        height: 40,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor:
                          leagueDetails.leagueName === league.name
                            ? colors.bg2
                            : userData.previousLeague === league.name
                            ? colors.errorRed
                            : '#f0f0f0',
                        marginBottom: 5,
                        gap: 7,
                        paddingHorizontal: 7,
                        borderRadius: 3,
                      }}>
                      <Image
                        source={{uri: league.img}}
                        style={{width: 30, height: 30}}
                      />
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: colors.font2,
                          color: 'black',
                        }}>
                        {league.name}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
              <View
                style={{
                  width: '48%',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 7,
                }}>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 5,
                    overflow: 'hidden',
                    shadowColor: 'black',
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 1,
                    shadowRadius: 4,
                    elevation: 5,
                    backgroundColor: 'white',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 3,
                    padding: 7,
                    height: 90,
                  }}>
                  <Text
                    style={{
                      color: 'black',
                      fontSize: 14,
                      fontFamily: colors.font4,
                      height: 35,
                    }}>
                    Current footprint value in kgCO2 e
                  </Text>
                  <View
                    style={{
                      width: '100%',
                      height: 36,
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={{
                        color:
                          reducedValue.status === 'increased'
                            ? colors.errorRed
                            : reducedValue.status === 'decreased'
                            ? colors.successGreen
                            : 'black',
                        fontFamily: colors.font3,
                        fontSize: 30,
                      }}>
                      {val}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 5,
                    overflow: 'hidden',
                    shadowColor: 'black',
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 1,
                    shadowRadius: 4,
                    elevation: 5,
                    backgroundColor: 'white',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 3,
                    padding: 7,
                    height: 90,
                  }}>
                  {reducedValue.status === 'decreased' ? (
                    <Text
                      style={{
                        color: 'black',
                        fontSize: 14,
                        fontFamily: colors.font4,
                        height: 35,
                      }}>
                      Footprint value reduced by
                    </Text>
                  ) : reducedValue.status === 'increased' ? (
                    <Text
                      style={{
                        color: 'black',
                        fontSize: 14,
                        fontFamily: colors.font4,
                        height: 35,
                      }}>
                      Footprint value increased by
                    </Text>
                  ) : (
                    <Text
                      style={{
                        color: 'black',
                        fontSize: 14,
                        fontFamily: colors.font4,
                        height: 35,
                      }}>
                      No data available
                    </Text>
                  )}
                  <View
                    style={{
                      width: '100%',
                      height: 36,
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={{
                        color:
                          reducedValue.status === 'increased'
                            ? colors.errorRed
                            : reducedValue.status === 'decreased'
                            ? colors.successGreen
                            : 'black',
                        fontFamily: colors.font3,
                        fontSize: 30,
                      }}>
                      {(reducedValue.percentage
                        ? reducedValue.percentage
                        : '_') + '%'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View style={{height: 100}}></View>
        </ScrollView>
      )}
    </View>
  );
};
export default Profile;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.bg,
    flexDirection: 'column',
  },
  section: {
    width: '100%',
    displat: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  icon: {
    width: 25,
    height: 25,
    objectFit: 'contain',
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
    borderWidth: 0.4,
    borderColor: 'lightgray',
    marginVertical: 5,
  },
  inputSection: {
    width: '100%',
    color: 'black',
    fontFamily: colors.font4,
  },
  btn: {
    width: '100%',
    backgroundColor: colors.p,
    height: 50,
    borderRadius: 7,
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
  },
});
