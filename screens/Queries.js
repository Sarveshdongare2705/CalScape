import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
  Image,
  ToastAndroid,
  RefreshControl,
} from 'react-native';
import BottomNavigation from '../components/BottomNavigation';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import Query from './Query';
import ImagePicker from 'react-native-image-crop-picker';
import {ActivityIndicator} from 'react-native-paper';
import {formatDistanceToNow} from 'date-fns';
import { ThemeContext } from '../context/ThemeContext';

const Queries = () => {
  const { theme , isDarkMode } = useContext(ThemeContext);
  const route = useRoute();
  const {currentUser, userData} = route.params;
  const navigation = useNavigation();
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [queries, setQueries] = useState([]);
  const [queryModal, showQueryModal] = useState(false);
  const [search, setSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  //ask query variables
  const [question, setQuestion] = useState('');
  const [queryImg, setQueryImg] = useState(null);

  const fetchQueries = async () => {
    setLoading(false);
    const queriesSnapshot = await firestore()
      .collection('queries')
      .orderBy('postTime', 'desc')
      .get();
    const queriesData = await Promise.all(
      queriesSnapshot.docs.map(async doc => {
        const queryData = doc.data();
        const userDoc = await firestore()
          .collection('Users')
          .doc(queryData.uid)
          .get();

        const user = userDoc.data();
        queryData.username = user && user.username;
        queryData.profileImg = user && user.profileImg;

        const answersSnapshot = await firestore()
          .collection('queries')
          .doc(doc.id)
          .collection('answers')
          .orderBy('answerPostTime', 'desc')
          .get();
        const answersData = await Promise.all(
          answersSnapshot.docs.map(async answerDoc => {
            const answerData = answerDoc.data();
            const userDoc = await firestore()
              .collection('Users')
              .doc(answerData.uid)
              .get();
            const user = userDoc.data();
            answerData.username = user ? user.username : null;
            answerData.profileImg = user ? user.profileImg : null;
            return answerData;
          }),
        );
        const postTime = queryData.postTime.toDate();
        const relativePostTime = formatDistanceToNow(postTime, {
          addSuffix: true,
        });
        return {
          ...queryData,
          answers: answersData,
          postTime: relativePostTime,
        };
      }),
    );
    setQueries(queriesData);
    setLoading(false);
    setRefreshing(false);
  };
  useEffect(
    React.useCallback(() => {
      setSearch('');
      fetchQueries();
    }, []),
  );

  //image upload of query
  const handleImagePick = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
      });
      setQueryImg(image.path);
    } catch (error) {
      console.log('Image pick cancelled or error: ', error);
    }
  };

  //upload query
  const handlePostQuery = async () => {
    setUploading(true);
    let imageUrl = null;

    let newQuery = {
      uid: userData.uid,
      question: question,
      postTime: firestore.FieldValue.serverTimestamp(),
      queryImg: imageUrl,
    };
    try {
      const queriesRef = await firestore().collection('queries').add(newQuery);
      await queriesRef.update({id: queriesRef.id});
      if (queryImg) {
        const imageRef = storage().ref(
          `queryImages/${currentUser.uid}/${queriesRef.id}`,
        );
        await imageRef.putFile(queryImg);
        imageUrl = await imageRef.getDownloadURL();
        await queriesRef.update({queryImg: imageUrl});
      }
      ToastAndroid.show(
        `New query uploaded by ${userData.username}!`,
        ToastAndroid.SHORT,
      );
      setQuestion('');
      setQueryImg(null);
      fetchQueries();
      showQueryModal(false);
    } catch (error) {
      console.log('Error posting query: ', error);
      alert('Error posting query. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (search.trim === '') {
      fetchQueries();
    }
    handleSearch(search);
  }, [search]);

  const handleSearch = text => {
    setSearchLoading(true);
    setSearch(text);
    if (text.trim() !== '') {
      const filteredQueries = queries.filter(query =>
        query.question.toLowerCase().includes(text.toLowerCase()),
      );
      setQueries(filteredQueries);
    } else {
      fetchQueries();
    }
    setSearchLoading(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchQueries();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.section]}>
        <View style={[styles.searchContainer , {backgroundColor : theme.bg3 }]}>
          <TextInput
            placeholder="Search for a query?"
            placeholderTextColor={'gray'}
            style={[styles.textInput, { fontFamily: theme.font4, color: theme.text}]}
            onChangeText={text => setSearch(text)}
          />
        </View>
        <TouchableOpacity
          style={[styles.queryButton, { backgroundColor: theme.bg2 }]}
          onPress={() => showQueryModal(!queryModal)}>
          <Text style={[styles.queryButtonText, { fontFamily: theme.font2, color: theme.text }]}>Query?</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.main}>
        {queryModal && (
          <View
            style={{
              position: 'absolute',
              width: '92%',
              height: '62%',
              backgroundColor: theme.bg4,
              zIndex: 999,
              shadowColor: 'black',
              shadowRadius: 5,
              elevation: 7,
              marginTop: 10,
              borderRadius: 12,
              padding: 10,
            }}>
            <View
              style={[
                styles.section,
                {
                  borderBottomWidth: 0.3,
                  borderBottomColor: theme.bg4,
                  paddingBottom: 7,
                  opacity: uploading ? 0.4 : 1,
                  
                },
              ]}>
              <TouchableOpacity onPress={() => showQueryModal(false)}>
                <Image
                  source={isDarkMode ? require('../assets/removedm.png') : require('../assets/removelm.png')}
                  style={{width: 27, height: 27}}
                />
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}>
                <TouchableOpacity onPress={handleImagePick}>
                  <Image
                    source={require('../assets/image.png')}
                    style={{width: 27, height: 27}}
                  />
                </TouchableOpacity>
                {question.trim() !== '' ? (
                  <TouchableOpacity
                    style={{
                      backgroundColor: theme.bg2,
                      padding: 5,
                      width: 66,
                      alignItems: 'center',
                      borderRadius: 3,
                    }}
                    onPress={handlePostQuery}>
                    {uploading ? (
                      <ActivityIndicator
                        size={15}
                        color={theme.text}
                        style={{height: 20}}
                      />
                    ) : (
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: theme.font2,
                          color: theme.text
                        }}>
                        Ask
                      </Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={{
                      backgroundColor: theme.bg2,
                      padding: 5,
                      width: 66,
                      alignItems: 'center',
                      borderRadius: 7,
                      opacity: 0.5,
                    }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: theme.font2,
                        color: theme.text
                      }}>
                      Ask
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View
              style={{
                width: '100%',
                height: '82%',
                marginTop: 10,
                opacity: uploading ? 0.4 : 1,
              }}>
              <ScrollView style={{width: '100%', height: '100%', marginTop: 7}}>
                {queryImg && (
                  <View
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}>
                    <Image
                      source={{uri: queryImg}}
                      style={{width: 90, height: 90, marginBottom: 10}}
                    />
                    <TouchableOpacity
                      onPress={() => setQueryImg(null)}
                      style={{
                        marginBottom: 10,
                      }}>
                      <Text
                        style={{
                          fontFamily: theme.font2,
                          fontSize: 14,
                          color: 'red',
                        }}>
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                <TextInput
                  style={{
                    height: 130,
                    borderColor: theme.bg3,
                    borderWidth: 0.4,
                    borderRadius: 3,
                    padding: 10,
                    textAlignVertical: 'top',
                    fontFamily: theme.font4,
                    color: theme.text,
                    marginTop: 10,
                  }}
                  placeholder="Type your query here..."
                  placeholderTextColor={'gray'}
                  multiline={true}
                  value={question}
                  onChangeText={text => setQuestion(text)}
                />
                <View style={{height: 60}}></View>
              </ScrollView>
            </View>
          </View>
        )}
        {searchLoading ? (
          <ActivityIndicator
            size={16}
            color={theme.text}
            style={{position: 'absolute', top: 5, left: 5}}
          />
        ) : (
          <ScrollView
            style={{width: '100%', height: '100%', marginTop: 7}}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                theme={[theme.p, theme.s]}
              />
            }>
            {loading ? (
              <ActivityIndicator
                color={theme.text}
                size={18}
                style={{position: 'absolute', top: 3, left: 3}}
              />
            ) : (
              queries.map((query, index) => (
                <Query
                  query={query}
                  index={index}
                  userData={userData}
                  fetchQueries={fetchQueries}
                />
              ))
            )}
            <View style={{height: 100}}></View>
          </ScrollView>
        )}
      </View>
      <View style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
        <BottomNavigation />
      </View>
    </View>
  );
};

export default Queries;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
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
  },
  queryButton: {
    width: '28%',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queryButtonText: {
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
