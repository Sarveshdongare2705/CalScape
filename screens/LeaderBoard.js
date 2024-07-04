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
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {colors} from '../Colors';
import BottomNavigation from '../components/BottomNavigation';
import {useNavigation, useRoute} from '@react-navigation/native';

const Leaderboard = () => {
  const route = useRoute();
  const {uid} = route.params;
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(null);

  useEffect(() => {
    setLoading(true);
    const fetchUsers = async () => {
      const currentTime = new Date();
      const currentMonth = currentTime.getMonth() + 1;
      const currentYear = currentTime.getFullYear(); // current year
      const usersRef = await firestore().collection('Users').get();
      const usersData = usersRef.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch footprint data for the current month-year
      const promises = usersData.map(async user => {
        const docId = `${currentMonth}-${currentYear}`;
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
        return user;
      });

      // Resolve all promises and filter users with footprint values >= 100
      const usersWithFootprint = await Promise.all(promises);
      const filteredUsers = usersWithFootprint.filter(
        user => user.footprintVal >= 250,
      );

      setTotal(filteredUsers.length);

      // Sort users based on footprint value in ascending order
      filteredUsers.sort((a, b) => a.footprintVal - b.footprintVal);

      const currentUserId = uid;

      const currentUserData = filteredUsers.find(
        user => user.id === currentUserId,
      );
      setUsers(filteredUsers);
      if (currentUserData) {
        setCurrentUser(currentUserData);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const renderTopUser = (user, index) => {
    const colorsMap = ['orange', colors.p, colors.s];
    const positions = [
      {top: 160, left: '40%'},
      {top: 190, left: '5%'},
      {top: 220, right: '5%'},
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
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile', {uid: user.uid})}>
          <Image
            source={{uri: user.profileImg}}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              borderWidth: 4,
              borderColor: colorsMap[index],
            }}
          />
        </TouchableOpacity>
        <Text style={[styles.value, {color: colorsMap[index]}]}>
          {user.footprintVal.toFixed(0)}
        </Text>
        <Text style={styles.name}>{user.username}</Text>
        <View
          style={{
            height: index === 0 ? 130 : index === 1 ? 100 : 70,
            borderWidth: 1,
            width: 96,
            borderBottomColor: 'transparent',
            borderTopColor: 'black',
            borderLeftColor: 'black',
            borderRightColor: 'black',
            alignItems: 'center',
            padding: 12,
            marginTop: 5,
          }}>
          <Text
            style={{
              fontSize: 40,
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
        }}>
        <Text
          style={{
            fontSize: 18,
            color: 'white',
            fontFamily: colors.font2,
            maxWidth: '20%',
          }}>
          #{index + 4}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile', {uid: item.uid})}>
          <Image source={{uri: item.profileImg}} style={styles.profileImage} />
        </TouchableOpacity>
        <Text
          style={{
            width: '50%',
            color: 'white',
            fontSize: 16,
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
      const behind = total - rank;
      const val = (behind / (total - 1)) * 100;
      return val.toFixed(2);
    }
    return 0;
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={'#d4d4d4'} barStyle={'dark-content'} />
      <ImageBackground
        style={{
          width: '100%',
          height: '100%',
        }}
        source={require('../assets/lb3.jpg')}>
        <View
          style={{
            width: '100%',
            height: '100%',
            paddingVertical: 10,
            paddingHorizontal: 10,
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
          <Text style={{fontSize: 11, color: 'gray' , fontFamily : colors.font4}}>
            {
              '[Note : Your footprint value should be greater than 250kg CO2 e to appear on leaderboard]'
            }
          </Text>
          {!loading && currentUser ? (
            <View style={styles.currentUserContainer}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '100%',
                  height: '100%',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    fontSize: 17,
                    color: 'black',
                    fontFamily: colors.font3,
                    textAlign: 'center',
                    backgroundColor: 'lightgray',
                    padding: 10,
                    width: '25%',
                    height: 48,
                    borderRadius: 7,
                    opacity: 0.7,
                  }}>
                  #{users.findIndex(user => user.id === currentUser.id) + 1}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: 'black',
                    fontFamily: colors.font2,
                    textAlign: 'flex-start',
                    padding: 10,
                    borderRadius: 3,
                    opacity: 0.7,
                    width: '75%',
                  }}>
                  {`You are doing better than ${calculatePercentage(
                    users.findIndex(user => user.id === currentUser.id) + 1,
                  )}% of other players!`}
                </Text>
              </View>
            </View>
          ) : ( !loading && 
            <View style={styles.currentUserContainer}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '100%',
                  height: '100%',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: 'black',
                    fontFamily: colors.font2,
                    textAlign: 'flex-start',
                    padding: 10,
                    borderRadius: 3,
                    opacity: 0.7,
                    width: '80%',
                  }}>
                  {`You are currently not present in the leaderboard`}
                </Text>
              </View>
            </View>
          )}
          {loading ? (
            <ActivityIndicator
              color={'black'}
              size={27}
              style={{position: 'absolute', top: 75, left: 12}}
            />
          ) : (
            users.slice(0, 3).map((user, index) => renderTopUser(user, index))
          )}
          {!loading && (
            <ScrollView style={{marginTop: 270}}>
              {users.slice(3).map((user, index) => renderItem(user, index))}
              <View style={{height: 200}}></View>
            </ScrollView>
          )}
        </View>
      </ImageBackground>
    </View>
  );
};

export default Leaderboard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    color: 'black',
    fontFamily: colors.font2,
  },
  name: {
    fontSize: 16,
    color: 'black',
    fontFamily: colors.font4,
    width: 96,
    textAlign: 'center',
  },
  value: {
    fontSize: 16,
    color: 'white',
    fontFamily: colors.font2,
    borderRadius: 7,
    margin: 5,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 7,
    borderRadius: 7,
    borderBottomWidth: 0.3,
    borderBottomColor: 'black',
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginHorizontal: 7,
  },
  currentUserContainer: {
    width: '100%',
    height: 80,
    backgroundColor: 'orange',
    padding: 10,
    borderRadius: 7,
    marginVertical: 5,
  },
});
