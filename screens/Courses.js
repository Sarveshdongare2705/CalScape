import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useContext, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import {theme} from '../theme';
import { ThemeContext } from '../context/ThemeContext';

const Courses = ({userData}) => {
  const {theme , isDarkMode} = useContext(ThemeContext);
  const [courses, setCourses] = useState(null);
  const [loading, setLoading] = useState(false);
  //fetchAllCourses
  const fetchAllCourses = async () => {
    try {
      const coursesRef = firestore().collection('Courses').orderBy('id', 'asc');
      const coursesSnapshot = await coursesRef.get();

      let coursesData = [];
      coursesSnapshot.forEach(courseDoc => {
        coursesData.push({
          ...courseDoc.data(),
        });
      });

      setCourses(coursesData);
      console.log(coursesData);
    } catch (error) {
      console.error('Error fetching courses: ', error);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchAllCourses();
    }, []),
  );
  return (
    <View style={{width: '100%' , backgroundColor : theme.bg}}>
      {courses &&
        courses.map(course => (
          <View
            key={course.id}
            style={{
              width: '100%',
              minHeight: 235,
              backgroundColor: theme.bg3,
              borderRadius: 12,
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: 10,
              marginBottom: 10,
            }}>
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                alignItems: 'center',
                gap: 10,
              }}>
              <Image
                style={{
                  width: 72,
                  height: 100,
                  borderRadius: 12,
                  objectFit: 'cover',
                }}
                source={{uri: course.courseImg}}
              />
              <View
                style={{
                  width: '72%',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 7,
                }}>
                <Text
                  style={{
                    fontFamily: theme.font2,
                    color : theme.text,
                    width: '100%',
                    fontSize: 14,
                  }}>
                  {course.title}
                </Text>
                <Text
                  style={{
                    width: 15,
                    fontFamily: theme.font3,
                    color : theme.text,
                    width: '100%',
                    color: theme.p,
                  }}>
                  {course.from}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    width: '96%',
                    gap: 5,
                    alignItems: 'center',
                  }}>
                  <Image
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      objectFit: 'cover',
                    }}
                    source={{uri: course.instructorImg}}
                  />
                  <Text
                    style={{
                      width: 16,
                      fontFamily: theme.font4,
                      color : theme.text,
                      width: '100%',
                    }}>
                    {course.instructor}
                  </Text>
                </View>
              </View>
            </View>
            <Text
              style={{
                fontFamily: theme.font4,
                color: theme.text,
                width: '100%',
                fontSize: 13,
                marginTop: 5,
              }}>
              {course.desc}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}>
              <Text
                style={{
                  fontFamily: theme.font3,
                  color: theme.errorRed,
                  fontSize: 13,
                  marginTop: 3,
                  marginBottom: 7,
                }}>
                {'Starts : ' + course.starts}
              </Text>
              <Text
                style={{
                  fontFamily: theme.font3,
                  color: theme.successGreen,
                  fontSize: 13,
                  marginTop: 3,
                  marginBottom: 7,
                }}>
                {course.price}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                width: '100%',
                borderRadius: 12,
                backgroundColor : theme.bg,
                height: 36,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => Linking.openURL(`${course.link}`)}>
              <Text
                style={{
                  fontFamily: theme.font3,
                  color: theme.text,
                  fontSize: 14,
                }}>
                {'Go to Course'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
    </View>
  );
};

export default Courses;
