import React, {useCallback, useEffect, useState} from 'react';
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
import {colors} from '../Colors';
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

const Queries = () => {
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
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search for a query?"
            placeholderTextColor={'gray'}
            style={styles.textInput}
            onChangeText={text => setSearch(text)}
          />
        </View>
        <TouchableOpacity
          style={styles.queryButton}
          onPress={() => showQueryModal(!queryModal)}>
          <Text style={styles.queryButtonText}>Query?</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.main}>
        {queryModal && (
          <View
            style={{
              position: 'absolute',
              width: '92%',
              height: '62%',
              backgroundColor: 'white',
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
                  borderBottomWidth: 0.4,
                  borderBottomColor: 'lightgray',
                  paddingBottom: 7,
                  opacity: uploading ? 0.4 : 1,
                },
              ]}>
              <TouchableOpacity onPress={() => showQueryModal(false)}>
                <Image
                  source={require('../assets/remove.png')}
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
                      backgroundColor: colors.bg2,
                      padding: 5,
                      width: 66,
                      alignItems: 'center',
                      borderRadius: 3,
                    }}
                    onPress={handlePostQuery}>
                    {uploading ? (
                      <ActivityIndicator
                        size={15}
                        color="black"
                        style={{height: 20}}
                      />
                    ) : (
                      <Text
                        style={{
                          color: 'black',
                          fontSize: 16,
                          fontFamily: colors.font2,
                        }}>
                        Ask
                      </Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.bg2,
                      padding: 5,
                      width: 66,
                      alignItems: 'center',
                      borderRadius: 7,
                      opacity: 0.5,
                    }}>
                    <Text
                      style={{
                        color: 'black',
                        fontSize: 16,
                        fontFamily: colors.font2,
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
                      style={{width: '72%', height: 130, objectFit: 'contain'}}
                    />
                    <TouchableOpacity onPress={() => setQueryImg(null)}>
                      <Text
                        style={{
                          fontFamily: colors.font2,
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
                    borderColor: 'lightgray',
                    borderWidth: 0.4,
                    borderRadius: 3,
                    padding: 10,
                    textAlignVertical: 'top',
                    fontFamily: colors.font4,
                    color: 'black',
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
            color={'black'}
            style={{position: 'absolute', top: 5, left: 5}}
          />
        ) : (
          <ScrollView
            style={{width: '100%', height: '100%', marginTop: 7}}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.p, colors.s]}
              />
            }>
            {loading ? (
              <ActivityIndicator
                color={'black'}
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
      <View style={styles.bottomNavigation}>
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
  queryButton: {
    width: '28%',
    backgroundColor: colors.bg2,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queryButtonText: {
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
