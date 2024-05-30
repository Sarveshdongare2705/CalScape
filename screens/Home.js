import React from 'react';
import {StyleSheet, View, Image, Text} from 'react-native';
import BottomNavigation from '../components/BottomNavigation';
import {colors} from '../Colors';

const Home = () => {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Image source={require('../assets/menu.png')} style={styles.icon} />
        <Image source={require('../assets/bell.png')} style={styles.icon} />
      </View>
      <View style={styles.section}>
        <Text style={{color: 'black', fontSize: 33, fontWeight: '400'}}>
          Welcome Sarvesh
        </Text>
      </View>
      <View style={styles.section}>
        <View
          style={{
            width: '100%',
            height: 130,
            backgroundColor: colors.bg2,
            borderRadius: 12,
            paddingHorizontal: 15,
            paddingVertical: 15,
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}>
          <Text style={{color: 'black', fontSize: 16}}>
            Total Carbon Footprint
          </Text>
          <Text style={{color: 'black', fontSize: 33, fontWeight: '700'}}>
            1000 MTCO2
          </Text>
        </View>
      </View>
      <View style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
        <BottomNavigation />
      </View>
    </View>
  );
};
export default Home;

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
