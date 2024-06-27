import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import YoutubeIframe from 'react-native-youtube-iframe';
import BottomNavigation from '../components/BottomNavigation';
import {useNavigation, useRoute} from '@react-navigation/native';
import {colors} from '../Colors';

const Module = () => {
  const route = useRoute();
  const {
    img1,
    img2,
    text1,
    text2,
    videoId1,
    videoId2,
    title,
    text3,
    text4,
    modules,
    currentIndex,
  } = route.params;
  let prevModule = modules[currentIndex - 1]; //prev module
  let nextModule = modules[currentIndex + 1]; //next module
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
          marginBottom: 12,
          borderBottomWidth: 0.4,
          borderBottomColor: 'black',
          paddingBottom: 7,
          justifyContent: 'space-between',
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../assets/backButton.png')}
            style={{width: 24, height: 24}}
          />
        </TouchableOpacity>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 7}}>
          {currentIndex !== 0 && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Module', {
                  title: prevModule.title,
                  img1: prevModule.img1,
                  img2: prevModule.img2,
                  text1: prevModule.text1,
                  text2: prevModule.text2,
                  text3: prevModule.text3,
                  text4: prevModule.text4,
                  videoId1: prevModule.videoId1,
                  videoId2: prevModule.videoId2,
                  currentIndex: currentIndex - 1,
                  modules: modules,
                })
              }>
              <Text style={[styles.content, {marginBottom: -3, fontSize: 16}]}>
                Prev
              </Text>
            </TouchableOpacity>
          )}
          {currentIndex !== modules.length-1 && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Module', {
                  title: nextModule.title,
                  img1: nextModule.img1,
                  img2: nextModule.img2,
                  text1: nextModule.text1,
                  text2: nextModule.text2,
                  text3: nextModule.text3,
                  text4: nextModule.text4,
                  videoId1: nextModule.videoId1,
                  videoId2: nextModule.videoId2,
                  currentIndex: currentIndex + 1,
                  modules: modules,
                })
              }>
              <Text style={[styles.content, {marginBottom: -3, fontSize: 16}]}>
                Next
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <ScrollView style={{width: '100%', height: '100%'}}>
        <Text style={styles.heading}>{title}</Text>
        <Image
          source={{
            uri: img1,
          }}
          style={{width: '100%', height: 150, objectFit: 'cover'}}
        />
        <Text style={styles.content}>{text1 && text1}</Text>
        <View style={styles.videoContainer}>
          <YoutubeIframe height={200} play={false} videoId={videoId1} />
        </View>
        <Text style={styles.content}>{text2 && text2}</Text>
        {videoId2 && (
          <View style={styles.videoContainer}>
            <YoutubeIframe height={200} play={false} videoId={videoId2} />
          </View>
        )}
        <Text style={styles.content}>{text3 && text3}</Text>
        <Text style={styles.content}>{text3 && text4}</Text>
        <View style={{height: 250}}></View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 20,
    color: 'black',
    fontFamily: colors.font2,
  },
  heading: {
    fontSize: 17,
    color: 'black',
    fontFamily: colors.font2,
    marginBottom: 7,
  },
  content: {
    fontSize: 14,
    color: 'black',
    fontFamily: colors.font4,
    marginBottom: 5,
    textAlign: 'justify',
    paddingHorizontal: 3,
  },
  videoContainer: {
    marginVertical: 5,
  },
});

export default Module;
