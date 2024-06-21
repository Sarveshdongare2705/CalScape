import {StyleSheet, View} from 'react-native';
import BottomNavigation from '../components/BottomNavigation';
import { colors } from '../Colors';
const Community = () => {
  return (
    <View style={styles.container}>
      <View style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
        <BottomNavigation />
      </View>
    </View>
  );
};
export default Community;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.bg,
    flexDirection: 'column',
    padding: 12,
  },
});
