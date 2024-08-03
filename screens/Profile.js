import React, {useCallback, useContext, useState} from 'react';
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
import {ThemeContext} from '../context/ThemeContext';

const Profile = () => {
  const {theme, isDarkMode} = useContext(ThemeContext);
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
          setCurrentUserData(currentUserDetails);
          setUserData(currentUserDetails);
          const val = await AsyncStorage.getItem('footprint');
          const reduction = await AsyncStorage.getItem('reduction');
          const league = await AsyncStorage.getItem('leagueName');
          
          setVal(val);
          setLeagueDetails(JSON.parse(league));
          setReducedValue(JSON.parse(reduction));
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
          await AsyncStorage.setItem('updated', 'true');
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
    <View style={[styles.container, {backgroundColor: theme.bg}]}>
      {updateModal && (
        <View
          style={{
            position: 'absolute',
            top: 80,
            left: '5%',
            width: '90%',
            height: '72%',
            backgroundColor: theme.bg4,
            zIndex: 999,
            borderColor: theme.text,
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
              backgroundColor: theme.bg2,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: uploading ? 0.5 : 1,
            }}
            onPress={handleEditProfile}>
            <Text
              style={{
                color: theme.text,
                fontSize: 18,
                fontFamily: theme.font2,
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
              <ActivityIndicator size={24} color={theme.text} />
            ) : (
              <TouchableOpacity onPress={() => showUpdateModal(false)}>
                <Image
                  source={
                    isDarkMode
                      ? require('../assets/removedm.png')
                      : require('../assets/removelm.png')
                  }
                  style={{width: 27, height: 27}}
                />
              </TouchableOpacity>
            )}
            <Text
              style={{
                color: theme.text,
                fontSize: 18,
                fontFamily: theme.font2,
              }}>
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
                    backgroundColor: theme.bg2,
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
                    borderColor: theme.bg2,
                  }}
                />
              </TouchableOpacity>
              <View style={[styles.input, {backgroundColor: theme.bg}]}>
                <Image
                  source={
                    isDarkMode
                      ? require('../assets/accountdm.png')
                      : require('../assets/accountdm.png')
                  }
                  style={styles.img2}
                />
                <TextInput
                  placeholder="Enter your Username"
                  placeholderTextColor="gray"
                  style={[
                    styles.inputSection,
                    {color: theme.text, fontFamily: theme.font4},
                  ]}
                  maxLength={18}
                  value={username}
                  onChangeText={text => setUsername(text)}
                />
              </View>
              {usernameErr && (
                <Text style={[styles.err, {color: theme.errorRed}]}>
                  {usernameErr}
                </Text>
              )}
              <View
                style={[
                  styles.input,
                  {backgroundColor: theme.bg, opacity: 0.5},
                ]}>
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
                    {color: theme.text, fontFamily: theme.font4},
                  ]}
                  maxLength={40}
                  value={email}
                  onChangeText={text => setEmail(text)}
                  editable={false}
                />
              </View>
              <View style={[styles.input, {backgroundColor: theme.bg}]}>
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
                    {color: theme.text, fontFamily: theme.font4},
                  ]}
                  maxLength={10}
                  value={contact}
                  onChangeText={text => setContact(text)}
                  keyboardType="numeric"
                />
              </View>
              {contactErr && (
                <Text style={[styles.err, {color: theme.errorRed}]}>
                  {contactErr}
                </Text>
              )}
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
            backgroundColor: theme.bg4,
            zIndex: 999,
            top: '35%',
            right: '3%',
            borderRadius: 3,
            paddingHorizontal: 7,
            paddingVertical: 7,
            flexDirection: 'column',
            shadowColor: theme.bg,
            shadowOpacity: 0.25,
            shadowRadius: 3,
            elevation: 7,
            justifyContent: 'space-between',
          }}>
          <View style={{width: '100%', alignItems: 'flex-start'}}>
            <Text
              style={{
                color: theme.text,
                fontSize: 14,
                fontFamily: theme.font1,
              }}>
              Are you sure you want to logout ?
            </Text>
          </View>
          <View style={{width: '100%', alignItems: 'flex-end'}}>
            <View style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
              <TouchableOpacity onPress={handleLogout}>
                <Text
                  style={{
                    color: theme.p,
                    fontSize: 18,
                    fontFamily: theme.font4,
                  }}>
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowLogoutModal(false)}>
                <Text
                  style={{
                    color: theme.errorRed,
                    fontSize: 18,
                    fontFamily: theme.font4,
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
          top: 32,
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
                source={
                  isDarkMode
                    ? require('../assets/backdm.png')
                    : require('../assets/backlm.png')
                }
                style={{width: 27, height: 27}}
              />
            </TouchableOpacity>
          )}
          {loading === true && (
            <ActivityIndicator
              color={theme.text}
              size={21}
              style={{opacity: 0.7}}
            />
          )}
        </View>
        <Text
          style={{color: theme.text, fontSize: 18, fontFamily: theme.font2}}>
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
          backgroundColor: theme.bg2,
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
              color: theme.text,
              fontSize: 15,
              fontFamily: theme.font2,
              opacity: 0.9,
              width: '90%',
            }}>
            {userData && 'Member since ' + userData.member_since}
          </Text>
          {!loading && (
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
              <TouchableOpacity onPress={() => showUpdateModal(!updateModal)}>
                <Image
                  source={
                    isDarkMode
                      ? require('../assets/accountdm.png')
                      : require('../assets/accountlm.png')
                  }
                  style={{width: 30, height: 30}}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowLogoutModal(!showLogoutModal)}>
                <Image
                  source={
                    isDarkMode
                      ? require('../assets/logoutdm.png')
                      : require('../assets/logoutlm.png')
                  }
                  style={{width: 30, height: 30}}
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
            style={{color: theme.text, fontSize: 24, fontFamily: theme.font2}}>
            {userData ? userData.username : ''}
          </Text>
          <Text
            style={{
              color: theme.text,
              fontSize: 15,
              fontFamily: theme.font4,
              opacity: 0.6,
            }}>
            {userData && userData.email}
          </Text>
          <Text
            style={{
              color: theme.text,
              fontSize: 15,
              fontFamily: theme.font4,
              opacity: 0.6,
            }}>
            {userData && userData.contact}
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
                backgroundColor: theme.bg3,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 3,
              }}>
              <Text
                style={{
                  width: '100%',
                  textAlign: 'left',
                  fontSize: 16,
                  fontFamily: theme.font2,
                  color: theme.text,
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
                        fontFamily: theme.font4,
                        color: theme.text,
                      }}>
                      {'Current League : '}
                    </Text>
                    <Text
                      style={{
                        textAlign: 'left',
                        fontSize: 15,
                        fontFamily: theme.font2,
                        color: theme.text,
                      }}>
                      {leagueDetails.leagueName}
                    </Text>
                  </View>
                  <Text
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      fontSize: 13,
                      fontFamily: theme.font4,
                      color: theme.text,
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
                          fontFamily: theme.font4,
                          color: theme.text,
                        }}>
                        {'Previous League : '}
                      </Text>
                      <Text
                        style={{
                          textAlign: 'left',
                          fontSize: 15,
                          fontFamily: theme.font2,
                          color: theme.text,
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
                  backgroundColor: theme.bg3,
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
                    fontFamily: theme.font2,
                    color: theme.text,
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
                            ? theme.bg2
                            : userData.previousLeague === league.name
                            ? theme.errorRed
                            : theme.bg,
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
                          fontFamily: theme.font2,
                          color: theme.text,
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
                    backgroundColor: theme.bg3,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 3,
                    padding: 7,
                    height: 90,
                  }}>
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 14,
                      fontFamily: theme.font4,
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
                            ? theme.errorRed
                            : reducedValue.status === 'decreased'
                            ? theme.successGreen
                            : theme.text,
                        fontFamily: theme.font3,
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
                    backgroundColor: theme.bg3,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 3,
                    padding: 7,
                    height: 90,
                  }}>
                  {reducedValue.status === 'decreased' ? (
                    <Text
                      style={{
                        color: theme.text,
                        fontSize: 14,
                        fontFamily: theme.font4,
                        height: 35,
                      }}>
                      Footprint value reduced by
                    </Text>
                  ) : reducedValue.status === 'increased' ? (
                    <Text
                      style={{
                        color: theme.text,
                        fontSize: 14,
                        fontFamily: theme.font4,
                        height: 35,
                      }}>
                      Footprint value increased by
                    </Text>
                  ) : (
                    <Text
                      style={{
                        color: theme.text,
                        fontSize: 14,
                        fontFamily: theme.font4,
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
                            ? theme.errorRed
                            : reducedValue.status === 'decreased'
                            ? theme.successGreen
                            : theme.text,
                        fontFamily: theme.font3,
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
    flexDirection: 'column',
    paddingTop: 20,
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
    width: '100%',
    color: 'black',
  },
  err: {
    fontWeight: '900',
    opacity: 0.8,
    fontSize: 10,
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
