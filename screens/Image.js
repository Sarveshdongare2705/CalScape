import {useNavigation, useRoute} from '@react-navigation/native';
import {View, Image, TouchableOpacity, StyleSheet, Text} from 'react-native';
import {colors} from '../Colors';
import {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';

const ImageView = () => {
  const route = useRoute();
  const {data, uid , isAnswer ,postTime} = route.params;
  const [userData, setUserData] = useState(null);
  const fetchUserData = async () => {
    const userDoc = await firestore().collection('Users').doc(uid).get();
    const user = userDoc.data();
    setUserData(user);
  };
  useEffect(() => {
    fetchUserData();
  }, [data]);
  const naviation = useNavigation();
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        zIndex: 999,
        padding: 10,
      }}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
        <Image
          source={
            userData
              ? {uri: userData.profileImg}
              : require('../assets/profileImg.png')
          }
          style={{
            width: 42,
            height: 42,
            borderRadius: 20,
            borderColor: 'black',
            borderWidth: 1,
          }}
        />
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            width: '77%',
          }}>
          <Text
            style={{
              color: 'black',
              fontSize: 17,
              width: '100%',
              fontFamily: colors.font4,
            }}>
            {userData && userData.username}
          </Text>
          <Text
            style={{
              color: 'gray',
              fontSize: 13,
              width: '100%',
              fontFamily: colors.font1,
            }}>
            {!isAnswer ? data.postTime : postTime}
          </Text>
        </View>
        <TouchableOpacity onPress={() => naviation.goBack()}>
          <Image
            source={require('../assets/remove.png')}
            style={{width: 27, height: 27}}
          />
        </TouchableOpacity>
      </View>
      <View style={{width: '100%', height: '82%', marginTop: 10}}>
        <Image
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
          source={{uri: !isAnswer ? data.queryImg : data.answerImg}}
        />
      </View>
    </View>
  );
};

export default ImageView;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.bg,
    flexDirection: 'column',
    padding: 12,
  },
  section: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchContainer: {
    width: '70%',
    height: 36,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 7,
    justifyContent: 'center',
  },
  textInput: {
    width: '90%',
    height: 36,
    color: 'black',
    fontFamily: colors.font4,
  },
  dataButton: {
    width: '28%',
    backgroundColor: colors.bg2,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataButtonText: {
    fontFamily: colors.font2,
    color: 'black',
    fontSize: 15,
  },
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  main: {
    width: '100%',
    marginTop: 10,
    borderTopWidth: 0.4,
    borderTopColor: 'lightgray',
    height: '87%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
