import React from 'react';
import {StyleSheet, View, Image, Text} from 'react-native';
import BottomNavigation from '../components/BottomNavigation';
import {colors} from '../Colors';

const Profile = () => {
  return (
    <View style={styles.container}>
      <View style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
        <BottomNavigation />
      </View>
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
    padding: 12,
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
    width: 27,
    height: 27,
    objectFit: 'contain',
  },
});
