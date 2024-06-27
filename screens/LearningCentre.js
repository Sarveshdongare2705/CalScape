import React, {useCallback, useEffect, useReducer, useState} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import YoutubeIframe from 'react-native-youtube-iframe';
import BottomNavigation from '../components/BottomNavigation';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {colors} from '../Colors';
import QuizScreen from './QuizScreen';
import firestore from '@react-native-firebase/firestore';

const LearningCentre = () => {
  const route = useRoute();
  const { userData } = route.params;
  const navigation = useNavigation();
  const [id, setId] = useState(null);
  const [chapters, setChapters] = useState(null);
  //fetchAllChapters
  const fetchAllChapters = async () => {
    try {
      const chaptersRef = firestore().collection('Modules').orderBy('id' , 'asc');
      const chaptersSnapshot = await chaptersRef.get();

      let chaptersData = [];
      chaptersSnapshot.forEach(chapterDoc => {
        chaptersData.push({
          ...chapterDoc.data(),
        });
      });

      setChapters(chaptersData);
    } catch (error) {
      console.error('Error fetching users: ', error);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchAllChapters();
    }, []),
  );

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
          height: 34,
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../assets/backButton.png')}
            style={{width: 24, height: 24}}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Learning Centre</Text>
      </View>
      <ScrollView style={{width: '100%'}}>
        <Text style={[styles.title, {marginBottom : 7}]}>Modules</Text>
        {chapters &&
          chapters.map((module, index) => (
            <TouchableOpacity
              key={index}
              onPress={() =>
                navigation.navigate('Module', {
                  title: module.title,
                  img1: module.img1,
                  img2: module.img2,
                  text1: module.text1,
                  text2: module.text2,
                  text3: module.text3,
                  text4: module.text4,
                  videoId1: module.videoId1,
                  videoId2: module.videoId2,
                  currentIndex: index,
                  modules: chapters,
                })
              }
              style={{marginTop: 10, borderRadius: 12, overflow: 'hidden'}}>
              <ImageBackground
                source={{uri: module.img1}}
                style={{width: '100%', height: 100, objectFit: 'contain'}}>
                <Text style={styles.heading}>{module.title}</Text>
                <Image
                  style={styles.icon}
                  source={require('../assets/next.png')}
                />
              </ImageBackground>
            </TouchableOpacity>
          ))}
        <Text style={[styles.title, {marginVertical: 7}]}>Today's Quiz</Text>
        <QuizScreen userData={userData} />
        <View style={{height: 200}}></View>
      </ScrollView>
      <View style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
        <BottomNavigation />
      </View>
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
    fontSize: 15,
    color: 'white',
    fontFamily: colors.font2,
    marginBottom: 7,
    position: 'absolute',
    bottom: 7,
    left: 0,
    width: '84%',
    marginHorizontal: 10,
  },
  icon: {
    position: 'absolute',
    bottom: 5,
    right: 7,
    width: 27,
    height: 27,
    backgroundColor: 'lightgray',
    padding: 5,
    borderRadius: 100,
  },
  content: {
    fontSize: 14,
    color: 'black',
    fontFamily: colors.font4,
    marginBottom: 5,
    textAlign: 'justify',
    paddingHorizontal: 3,
  },
});

export default LearningCentre;
