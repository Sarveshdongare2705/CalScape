import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
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

  useEffect(() => {
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
        user => user.footprintVal >= 200,
      );

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
    };

    fetchUsers();
  }, []);

  const renderTopUser = (user, index) => {
    const colorsMap = ['orange', colors.p, colors.s];
    const positions = [
      {top: 50, left: '40%'},
      {top: 90, left: '5%'},
      {top: 130, right: '5%'},
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
            height: index === 0 ? 200 : index === 1 ? 160 : 100,
            borderWidth: 1,
            width: 96,
            borderBottomColor: 'white',
            borderTopColor: 'lightgray',
            borderLeftColor: 'lightgray',
            borderRightColor: 'lightgray',
            alignItems: 'center',
            padding: 12,
            marginTop: 10,
          }}>
          <Text
            style={{
              fontSize: 50,
              fontFamily: colors.font3,
              color: colorsMap[index],
            }}>
            {index + 1}
          </Text>
        </View>
      </View>
    );
  };

  const renderItem = ({item, index}) => (
    <View style={styles.rowItem}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '78%',
        }}>
        <Text style={{fontSize: 21, color: 'black', fontFamily: colors.font2}}>
          {index + 4}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile', {uid: item.uid})}>
          <Image source={{uri: item.profileImg}} style={styles.profileImage} />
        </TouchableOpacity>
        <Text
          style={{
            width: '50%',
            color: 'black',
            fontSize: 16,
            fontFamily: colors.font4,
          }}>
          {item.username}
        </Text>
      </View>
      <Text style={styles.value}>{item.footprintVal.toFixed(0)}</Text>
    </View>
    
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      {users.slice(0, 3).map((user, index) => renderTopUser(user, index))}
      <View style={{marginTop: 320}}>
        <FlatList
          data={users.slice(3)}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      </View>
      {currentUser && (
        <View style={styles.currentUserContainer}>
          <View
            style={[
              styles.rowItem,
              {backgroundColor: 'orange' , borderColor : 'orange'},
            ]}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '78%',
              }}>
              <Text
                style={{
                  fontSize: 21,
                  color: 'black',
                  fontFamily: colors.font2,
                }}>
                {users.findIndex(user => user.id === currentUser.id) + 1}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Profile', {uid: currentUser.uid})
                }>
                <Image
                  source={{uri: currentUser.profileImg}}
                  style={styles.profileImage}
                />
              </TouchableOpacity>
              <Text
                style={{
                  width: '66%',
                  color: 'black',
                  fontSize: 16,
                  fontFamily: colors.font4,
                }}>
                {currentUser.username}
              </Text>
            </View>
            <Text style={styles.value}>
              {currentUser.footprintVal.toFixed(0)}
            </Text>
          </View>
        </View>
      )}
      <View style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
        <BottomNavigation />
      </View>
    </View>
  );
};

export default Leaderboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 15,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
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
    color: 'black',
    fontFamily: colors.font2,
    borderRadius: 7,
    margin: 5,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderWidth: 0.6,
    borderColor: 'lightgray',
    borderRadius: 3,
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 7,
  },
  rank: {
    fontSize: 20,
    width: 30,
    textAlign: 'center',
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  currentUserContainer: {
    position: 'absolute',
    bottom: 42,
    left: 0,
    right: 0,
    padding: 10,
  },
});
