import React, {useState, useEffect} from 'react';
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
import BottomNavigation from '../components/BottomNavigation';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

const Leaderboard = () => {
  const route = useRoute();
  const {uid} = route.params;
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(null);
  const [topReducedUser, setTopReducedUser] = useState(null);
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [adminUid, setAdminUid] = useState(null);
  const fetchAdmin = async () => {
    const docRef = await firestore().collection('Admin').doc('admin');
    const doc = await docRef.get();
    const data = doc.data();
    setAdminUid(data.uid);
  };

  const [seedlingCount, setSeedlingCount] = useState(0);
  const [saplingCount, setSaplingCount] = useState(0);
  const [treeCount, setTreeCount] = useState(0);
  const [forestCount, setForestCount] = useState(0);
  const [rainForestCount, setRainForestCount] = useState(0);
  const leagues = [
    {
      name: 'Rainforest',
      img: 'https://cdn-icons-png.flaticon.com/128/7922/7922738.png',
      count: rainForestCount,
    },
    {
      name: 'Forest',
      img: 'https://cdn-icons-png.flaticon.com/128/685/685022.png',
      count: forestCount,
    },
    {
      name: 'Tree',
      img: 'https://cdn-icons-png.flaticon.com/128/2713/2713505.png',
      count: treeCount,
    },
    {
      name: 'Sapling',
      img: 'https://cdn-icons-png.flaticon.com/128/11639/11639345.png',
      count: saplingCount,
    },
    {
      name: 'Seedling',
      img: 'https://cdn-icons-png.flaticon.com/128/2227/2227504.png',
      count: seedlingCount,
    },
  ];

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
    console.log('id', docId);

    // Fetch footprint data for the current month-year
    const promises = usersData.map(async user => {
      const footprintRef = await firestore()
        .collection('Users')
        .doc(user.id)
        .collection('Footprint')
        .doc(docId)
        .get();

      if (footprintRef.exists) {
        const footprintData = footprintRef.data();
        user.footprintVal =
          (footprintData.basicDetails || 0) +
          (footprintData.clothingDetails || 0) +
          (footprintData.electricityDetails || 0) +
          (footprintData.energyDetails || 0) +
          (footprintData.extraDetails || 0) +
          (footprintData.foodDetails || 0) +
          (footprintData.recycleDetails || 0) +
          (footprintData.travelDetails || 0);
      } else {
        user.footprintVal = 0;
      }

      // Fetch reduction data for the current month-year
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

    const usersWithFootprint = await Promise.all(promises);
    const filteredUsers = usersWithFootprint.filter(
      user => user.footprintVal >= 250,
    );

    filteredUsers.sort((a, b) => a.footprintVal - b.footprintVal);
    setTotal(filteredUsers.length);
    const currentUserId = uid;
    const currentUserData = filteredUsers.find(
      user => user.id === currentUserId,
    );

    setUsers(filteredUsers);

    if (currentUserData) {
      setCurrentUser(currentUserData);
    }

    // Find the top reduced user
    const topUser = usersWithFootprint
      .filter(user => user.reductionStatus === 'decreased')
      .reduce(
        (prev, current) =>
          prev.reductionPercentage > current.reductionPercentage
            ? prev
            : current,
        {},
      );

    setTopReducedUser(topUser);
    setLoading(false);
  };

  const fetchCount = async () => {
    try {
      const usersRef = firestore().collection('Users');
      const usersSnapshot = await usersRef.get();

      let seedlingCount = 0;
      let saplingCount = 0;
      let treeCount = 0;
      let forestCount = 0;
      let rainForestCount = 0;

      usersSnapshot.forEach(userDoc => {
        const userData = userDoc.data();
        console.log(userData); // Log user data to debug

        if (userData.currentLeague) {
          if (userData.currentLeague === 'Seedling') {
            seedlingCount += 1;
          } else if (userData.currentLeague === 'Sapling') {
            saplingCount += 1;
          } else if (userData.currentLeague === 'Tree') {
            treeCount += 1;
          } else if (userData.currentLeague === 'Forest') {
            forestCount += 1;
          } else if (userData.currentLeague === 'Rainforest') {
            rainForestCount += 1;
          }
        } else {
          console.warn(`User ${userDoc.id} does not have currentLeague field`);
        }
      });

      setSeedlingCount(seedlingCount);
      setSaplingCount(saplingCount);
      setTreeCount(treeCount);
      setForestCount(forestCount);
      setRainForestCount(rainForestCount);
    } catch (error) {
      console.error('Error fetching users: ', error);
    }
  };

  useEffect(() => {
    fetchCount();
    const currentTime = new Date();
    const currentMonth = currentTime.getMonth();
    const currentYear = currentTime.getFullYear();
    setMonth(monthName[currentMonth]);
    setYear(currentYear.toString());
  }, []);

  useEffect(() => {
    if (month && year) {
      setLoading(true);
      setUsers([]);
      setTopReducedUser(null);
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
              width: 50,
              height: 50,
              borderRadius: 25,
              borderWidth: 2,
              borderColor: colorsMap[index],
            }}
          />
        </TouchableOpacity>
        <Text style={[styles.value, {color: colorsMap[index]}]}>
          {user.footprintVal.toFixed(2)}
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

  const renderItem = (item, index) => (
    <View style={styles.rowItem}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '78%',
          gap: 5,
        }}>
        <Text
          style={{
            fontSize: 14,
            color: 'black',
            fontFamily: colors.font4,
            maxWidth: '20%',
          }}>
          #{index + 4}
        </Text>
        <TouchableOpacity>
          <Image source={{uri: item.profileImg}} style={styles.profileImage} />
        </TouchableOpacity>
        <Text
          style={{
            width: '50%',
            color: 'black',
            fontSize: 14,
            fontFamily: colors.font4,
          }}>
          {item.username}
        </Text>
      </View>
      <Text style={styles.value}>{item.footprintVal.toFixed(0)}</Text>
    </View>
  );

  const [percentage, setPercentage] = useState(0);
  const calculatePercentage = rank => {
    if (total) {
      console.log('total', total);
      const behind = total - rank;
      const val = (behind / (total - 1)) * 100;
      return val.toFixed(2);
    }
    return 0;
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
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            marginBottom: 3,
          }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../assets/backButton.png')}
              style={{width: 27, height: 27}}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Leaderboard</Text>
        </View>
        <Text style={{fontSize: 11, color: 'gray', fontFamily: colors.font4}}>
          {
            '[Note : Your footprint value should be greater than 250kg CO2 e to appear on leaderboard]'
          }
        </Text>
        <View
          style={{
            width: '100%',
            flexDirection: 'column',
            alignItems: 'flex-start',
            marginVertical: 7,
          }}>
          <Text style={[styles.title, {fontSize: 14}]}>All Leagues Count </Text>
          <View style={{width: '100%'}}>
            <ScrollView
              style={{
                width: '100%',
              }}
              nestedScrollEnabled
              horizontal>
              {leagues.map((league, key) => (
                <View
                  key={key}
                  style={{
                    width: 90,
                    height: 90,
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 12,
                    backgroundColor: '#f0f0f0',
                    marginRight: 5,
                    borderRadius: 5,
                    marginVertical: 5,
                  }}>
                  <Image
                    source={{uri: league.img}}
                    style={{width: 30, height: 30}}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: colors.font4,
                      color: 'black',
                    }}>
                    {league.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: colors.font2,
                      color: 'black',
                    }}>
                    {league.count}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
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
        {loading ? (
          <ActivityIndicator
            size={20}
            color={'black'}
            style={{position: 'absolute', top: 240, left: 10}}
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
                  fontSize: 12,
                  color: 'gray',
                  fontFamily: colors.font4,
                  marginTop: -3,
                }}>
                {`Top 3 Users with lowest reduction value`}
              </Text>
              {users
                .slice(0, 3)
                .map((user, index) => renderTopUser(user, index))}
            </View>
            <ScrollView
              style={{
                width: '100%',
                borderRadius: 3,
                marginTop: 18,
              }}
              nestedScrollEnabled>
              {topReducedUser && topReducedUser.reductionPercentage && (
                <View style={{width: '100%'}}>
                  <View
                    style={{
                      width: '100%',
                      paddingVertical: 7,
                      paddingHorizontal: 20,
                      backgroundColor: colors.successGreen,
                      borderRadius: 7,
                    }}>
                    <View style={styles.userStatsHeader}>
                      <Text style={styles.statsTitle}>Top Performer</Text>
                      <TouchableOpacity>
                        {topReducedUser.profileImg && (
                          <Image
                            source={{uri: topReducedUser?.profileImg}}
                            style={styles.currentUserImage}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                    <View style={styles.currentUserContainer}>
                      <Text style={styles.currentUserText}>Name</Text>
                      <Text style={styles.currentUserValue}>
                        {topReducedUser.username}
                      </Text>
                    </View>
                    <View style={styles.currentUserContainer}>
                      <Text style={styles.currentUserText}>Reduction</Text>
                      <Text style={styles.currentUserValue}>
                        {topReducedUser.reductionPercentage + '%'}
                      </Text>
                    </View>
                    <View style={styles.currentUserContainer}>
                      <Text style={styles.currentUserText}>
                        Footprint Value Reduced by
                      </Text>
                      <Text style={styles.currentUserValue}>
                        {topReducedUser.reductionValue} kg CO2 e
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              {uid !== adminUid && (
                <View style={styles.userStatsContainer}>
                  <View style={styles.userStatsHeader}>
                    <Text style={styles.statsTitle}>My Stats</Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Profile', {uid})}>
                      {currentUser && (
                        <Image
                          source={{uri: currentUser?.profileImg}}
                          style={styles.currentUserImage}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                  <View style={styles.currentUserContainer}>
                    <Text style={styles.currentUserText}>Rank</Text>
                    <Text style={styles.currentUserValue}>
                      {users.findIndex(user => user.id === uid) + 1}
                    </Text>
                  </View>
                  <View style={styles.currentUserContainer}>
                    <Text style={styles.currentUserText}>Footprint Value</Text>
                    <Text style={styles.currentUserValue}>
                      {currentUser?.footprintVal.toFixed(2)} kg CO2 e
                    </Text>
                  </View>
                  <View style={styles.currentUserContainer}>
                    <Text style={styles.currentUserText}>% Better Than</Text>
                    <Text style={styles.currentUserValue}>
                      {calculatePercentage(
                        users.findIndex(user => user.id === uid) + 1,
                      )}
                      %
                    </Text>
                  </View>
                </View>
              )}
              <View style={{height: 100}}></View>
            </ScrollView>
            {uid === adminUid && (
              <ScrollView
                style={{
                  width: '100%',
                  height: 10,
                }}>
                {users.slice(3).map((item, index) => renderItem(item, index))}
              </ScrollView>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  leaderboardImage: {
    width: '100%',
    height: 370,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: 'black',
    borderWidth: 2,
    marginRight: 10,
  },
  value: {
    color: 'black',
    fontSize: 15,
    fontFamily: colors.font2,
  },
  name: {
    color: 'black',
    fontSize: 14,
    fontFamily: colors.font4,
    height: 20,
  },
  rowItem: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bg,
    paddingVertical: 7,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 21,
    color: 'black',
    fontFamily: colors.font2,
  },
  userStatsContainer: {
    width: '100%',
    paddingVertical: 7,
    paddingHorizontal: 20,
    backgroundColor: colors.bg2,
    borderRadius: 7,
    marginTop: 7,
  },
  userStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statsTitle: {
    fontSize: 16,
    fontFamily: colors.font2,
    color: 'black',
  },
  currentUserImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'white',
  },
  currentUserContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  currentUserText: {
    fontSize: 14,
    fontFamily: colors.font4,
    color: 'black',
  },
  currentUserValue: {
    fontSize: 14,
    fontFamily: colors.font2,
    color: 'black',
  },
});

export default Leaderboard;
