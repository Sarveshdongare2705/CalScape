import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {colors} from '../Colors';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ThemeContext} from '../context/ThemeContext';
import Video from 'react-native-video';

const Leaderboard = () => {
  const {theme, isDarkMode} = useContext(ThemeContext);
  const route = useRoute();
  const {uid} = route.params;
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [adminUid, setAdminUid] = useState(null);
  const [totalFootprint, setTotalFootprint] = useState(0);
  const fetchAdmin = async () => {
    const docRef = await firestore().collection('Admin').doc('admin');
    const doc = await docRef.get();
    const data = doc.data();
    setAdminUid(data.uid);
  };

  const monthName = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const handleMonthChange = month => {
    setMonth(month);
    setShowMenu(false);
  };

  const handleYearChange = year => {
    setYear(year);
  };

  const fetchTotalFootprint = async (month, year) => {
    try {
      const currentTime = new Date();
      const getMonthNumber = () => {
        return monthName.indexOf(month) + 1;
      };

      const monthNumber = getMonthNumber();
      const docId = `${monthNumber}-${year}`;

      // Get all users
      const usersRef = firestore().collection('Users');
      const usersSnapshot = await usersRef.get();
      const usersData = usersSnapshot.docs.map(doc => doc.id);

      let totalFootprint = 0;

      for (const userId of usersData) {
        try {
          const footprintRef = firestore()
            .collection('Users')
            .doc(userId)
            .collection('Footprint')
            .doc(docId);
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
            totalFootprint += parseFloat(val);
          }
        } catch (error) {
          console.error(`Error fetching footprint for user ${userId}:`, error);
        }
      }
      setTotalFootprint(totalFootprint.toFixed(2));
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchTotalFootprint:', error);
    }
  };

  const fetchUsers = async (month, year) => {
    const usersRef = await firestore().collection('Users').get();
    const usersData = usersRef.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const getMonthNumber = () => {
      return monthName.indexOf(month) + 1;
    };

    const monthNumber = getMonthNumber();
    const docId = `${monthNumber}-${year}`;

    const promises = usersData.map(async user => {
      const reductionRef = await firestore()
        .collection('Users')
        .doc(user.id)
        .collection('Reduction')
        .doc(docId)
        .get();

      if (reductionRef.exists) {
        const reductionData = reductionRef.data();
        user.reductionStatus = reductionData.status;
        user.reductionPercentage = parseFloat(reductionData.percentage) || 0;
        user.reductionValue = reductionData.value || 0;
      } else {
        user.reductionStatus = null;
        user.reductionPercentage = 0;
        user.reductionValue = 0;
      }

      return user;
    });

    const usersWithReduction = await Promise.all(promises);
    const filteredUsers = usersWithReduction.filter(
      user =>
        user.reductionStatus === 'decreased' && user.reductionPercentage > 0,
    );

    filteredUsers.sort((a, b) => b.reductionPercentage - a.reductionPercentage);
    setUsers(filteredUsers);
  };

  useEffect(() => {
    const currentTime = new Date();
    const currentMonth = currentTime.getMonth();
    const currentYear = currentTime.getFullYear();
    setMonth(monthName[currentMonth]);
    setYear(currentYear.toString());
    fetchTotalFootprint(currentMonth, currentYear);
  }, []);

  useEffect(() => {
    if (month && year) {
      setLoading(true);
      setUsers([]);
      fetchTotalFootprint(month, year);
      fetchUsers(month, year);
    }
  }, [month, year]);

  const renderTopUser = (user, index) => {
    const colorsMap = ['orange', colors.p, colors.s];
    const positions = [
      {top: 18, left: '36%'},
      {top: 45, left: '4%'},
      {top: 65, right: '4%'},
    ];

    return (
      <View
        key={user.id}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          position: 'absolute',
          ...positions[index],
        }}>
        <TouchableOpacity>
          <Image
            source={{uri: user.profileImg}}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              borderWidth: 2,
              borderColor: colorsMap[index],
            }}
          />
        </TouchableOpacity>
        <Text style={[styles.value, {color: colorsMap[index]}]}>
          {user.reductionPercentage.toFixed(2)}%
        </Text>
        <Text style={styles.name}>{user.username}</Text>
        <View
          style={{
            height: index === 0 ? 97 : index === 1 ? 70 : 50,
            borderWidth: 2,
            width: 96,
            borderBottomColor: 'transparent',
            borderTopColor: 'lightgray',
            borderLeftColor: 'lightgray',
            borderRightColor: 'lightgray',
            alignItems: 'center',
            padding: 3,
            marginTop: 5,
          }}>
          <Text
            style={{
              fontSize: 30,
              fontFamily: colors.font3,
              color: colorsMap[index],
            }}>
            {index + 1}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          width: '100%',
          height: '100%',
          paddingVertical: 10,
          paddingHorizontal: 10,
          backgroundColor: 'white',
        }}>
        <StatusBar backgroundColor={'white'} barStyle={'dark-content'} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            marginBottom: 3,
          }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../assets/backlm.png')}
              style={{width: 27, height: 27}}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Leaderboard</Text>
        </View>
        <View
          style={{
            width: '100%',
            height: 38,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity
            style={{width: '65%', alignItems: 'center'}}
            onPress={() => {
              setShowMenu(!showMenu);
            }}>
            <TextInput
              style={{
                width: '100%',
                height: 36,
                backgroundColor: '#f0f0f0',
                color: 'black',
                paddingHorizontal: 12,
                fontSize: 14,
                fontFamily: colors.font4,
                borderRadius: 3,
                paddingVertical: 9,
              }}
              placeholder="Select month"
              placeholderTextColor="black"
              editable={false}
              value={month}
            />
          </TouchableOpacity>
          {showMenu && (
            <View
              style={{
                width: '65%',
                height: 200,
                position: 'absolute',
                backgroundColor: '#f9f9f9',
                padding: 12,
                top: 40,
                left: 0,
                flexDirection: 'column',
                borderRadius: 12,
                zIndex: 999,
              }}>
              <ScrollView
                style={{width: '100%', height: 190}}
                nestedScrollEnabled>
                {monthName.map(month => (
                  <TouchableOpacity
                    key={month}
                    style={{width: '100%', height: 25}}
                    onPress={() => {
                      handleMonthChange(month);
                    }}>
                    <Text
                      style={{
                        color: 'black',
                        fontSize: 15,
                        fontFamily: colors.font2,
                        marginVertical: 3,
                      }}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          <TextInput
            style={{
              width: '33%',
              height: 36,
              backgroundColor: '#f0f0f0',
              color: 'black',
              paddingHorizontal: 12,
              fontSize: 14,
              fontFamily: colors.font4,
              borderRadius: 3,
              paddingVertical: 7,
            }}
            placeholder="Year"
            placeholderTextColor="black"
            keyboardType="numeric"
            value={year}
            onChangeText={handleYearChange}
          />
        </View>
        <View
          style={{
            width: '100%',
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3, 
            borderRadius: 12,
            marginVertical: 10,
            paddingHorizontal: 7,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'white', 
          }}>
          <Video
            source={require('../assets/carbon_label.mp4')}
            style={styles.video}
            muted={true}
            repeat={true}
            resizeMode={'cover'}
            rate={1.0}
            ignoreSilentSwitch={'obey'}
          />
          <View>
            <Text
              style={{color: 'black', fontSize: 21, fontFamily: theme.font4}}>
              Total Footprint
            </Text>
            <Text
              style={{color: 'black', fontSize: 27, fontFamily: theme.font2}}>
              {totalFootprint}
            </Text>
            <Text
              style={{color: 'gray', fontSize: 16, fontFamily: theme.font4}}>
              kg CO2 e
            </Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator
            size={24}
            color={'black'}
            style={{position: 'absolute', top: '36%', left: 10}}
          />
        ) : (
          <>
            <View
              style={{
                width: '100%',
                height: '27%',
                marginVertical: 7,
              }}>
              <Text
                style={{
                  fontSize: 14,
                  color: 'gray',
                  fontFamily: colors.font4,
                  marginBottom: 5,
                }}>
                {`Top 3 Users with highest reduction value`}
              </Text>
              {users
                .slice(0, 3)
                .map((user, index) => renderTopUser(user, index))}
            </View>
          </>
        )}
      </View>
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  video: {
    alignItems: 'center',
    width: 150,
    height: 150,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 23,
    fontFamily: colors.font3,
    color: 'black',
  },
  name: {
    fontSize: 14,
    color: 'black',
    fontFamily: colors.font3,
    textAlign: 'center',
  },
  value: {
    fontSize: 18,
    fontFamily: colors.font3,
    marginVertical: 2,
  },
  flatlistcontainer: {
    flexDirection: 'column',
    flexGrow: 1,
    flexWrap: 'wrap',
  },
  flatlist: {
    paddingVertical: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    gap: 6,
  },
  box: {
    width: '32%',
    backgroundColor: '#f0f0f0',
    padding: 5,
    borderRadius: 3,
    alignItems: 'center',
    marginVertical: 6,
    gap: 5,
  },
  boxname: {
    fontSize: 16,
    fontFamily: colors.font4,
    color: 'black',
    textAlign: 'center',
  },
  boxvalue: {
    fontSize: 18,
    fontFamily: colors.font3,
    color: 'gray',
    textAlign: 'center',
  },
});

export default Leaderboard;
