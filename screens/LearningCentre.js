import React, {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';
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
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import QuizScreen from './QuizScreen';
import firestore from '@react-native-firebase/firestore';
import Courses from './Courses';
import {ThemeContext} from '../context/ThemeContext';

const LearningCentre = () => {
  const {theme, isDarkMode} = useContext(ThemeContext);
  const route = useRoute();
  const {userData} = route.params;
  const navigation = useNavigation();
  const [id, setId] = useState(null);
  const [chapters, setChapters] = useState(null);
  const [showModules, setShowModules] = useState(true);
  const [showCourses, setShowCourses] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  //fetchAllChapters
  const fetchAllChapters = async () => {
    try {
      const chaptersRef = firestore()
        .collection('Modules')
        .orderBy('id', 'asc');
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
    <View style={[styles.container, {backgroundColor: theme.bg}]}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
          marginBottom: 12,
          paddingBottom: 7,
          height: 34,
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          {isDarkMode ? (
            <Image
              source={require('../assets/backdm.png')}
              style={{width: 24, height: 24}}
            />
          ) : (
            <Image
              source={require('../assets/backlm.png')}
              style={{width: 24, height: 24}}
            />
          )}
        </TouchableOpacity>
        <Text style={[styles.title , {color : theme.text , fontFamily : theme.font2}]}>Learning Centre</Text>
      </View>
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.bg,
          justifyContent: 'space-between',
          marginBottom: 12,
        }}>
        <TouchableOpacity
          style={{
            width: '33%',
            borderBottomWidth: 2,
            borderBottomColor: showModules ? theme.footprint : 'gray',
            paddingBottom: 7,
          }}
          onPress={() => {
            setShowModules(true);
            setShowCourses(false);
            setShowQuiz(false);
          }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: theme.font2,
              textAlign: 'center',
              color: showModules ? theme.footprint : 'gray',
            }}>
            Modules
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: '33%',
            borderBottomWidth: 2,
            borderBottomColor: showCourses ? theme.footprint : 'gray',
            paddingBottom: 7,
          }}
          onPress={() => {
            setShowModules(false);
            setShowCourses(true);
            setShowQuiz(false);
          }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: theme.font2,
              textAlign: 'center',
              color: showCourses ? theme.footprint : 'gray',
            }}>
            Courses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: '33%',
            borderBottomWidth: 2,
            borderBottomColor: showQuiz ? theme.footprint : 'gray',
            paddingBottom: 7,
          }}
          onPress={() => {
            setShowModules(false);
            setShowCourses(false);
            setShowQuiz(true);
          }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: theme.font2,
              textAlign: 'center',
              color: showQuiz ? theme.footprint : 'gray',
            }}>
            Today's Quiz
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={{width: '100%'}}>
        {showModules &&
          !showCourses &&
          !showQuiz &&
          chapters &&
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
              style={{borderRadius: 12, overflow: 'hidden', marginBottom: 10}}>
              <ImageBackground
                source={{uri: module.img1}}
                style={{width: '100%', height: 120, objectFit: 'contain'}}>
                <Text style={[styles.heading , {fontFamily : theme.font2 , color :'white'}]}>{module.title}</Text>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        {!showModules && showCourses && !showQuiz && (
          <Courses userData={userData} />
        )}
        {!showModules && !showCourses && showQuiz && (
          <QuizScreen userData={userData} />
        )}
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
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 20,
  },
  heading: {
    fontSize: 15,
    marginBottom: 7,
    position: 'absolute',
    bottom: 7,
    left: 0,
    width: '84%',
    marginHorizontal: 10,
  },
});

export default LearningCentre;
