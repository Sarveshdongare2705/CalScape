import {
  Image,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  ToastAndroid,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {useContext, useEffect, useState} from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import {ActivityIndicator} from 'react-native-paper';
import {formatDistanceToNow} from 'date-fns';
import {useNavigation} from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';

const Query = ({query, index, userData, fetchQueries}) => {
  const {theme , isDarkMode} = useContext(ThemeContext);
  const navigation = useNavigation();
  const [answerModal, showAnswerModal] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [answerImg, setAnswerImg] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleteQueryModal, showDeleteQueryModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingAns, setDeletingAns] = useState(false);
  const [imageModal, showImageModal] = useState(false);

  useEffect(() => {
    setAnswerImg(null);
    setAnswerText('');
    setUploading(false);
    showDeleteQueryModal(false);
  }, [query]);

  //image upload of answer
  const handleImagePick = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
      });
      setAnswerImg(image.path);
    } catch (error) {
      console.log('Image pick cancelled or error: ', error);
    }
  };

  //delete query
  const handleDelete = async id => {
    try {
      setDeleting(true);
      await firestore().collection('queries').doc(id).delete();
      showDeleteQueryModal(false);
      fetchQueries();
      setTimeout(() => {
        setDeleting(false);
        ToastAndroid.show(`Your query is deleted.`, ToastAndroid.SHORT);
      }, 2000);
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  };

  const handleAnswerSubmit = async id => {
    setUploading(true);
    try {
      let imageUrl = null;
      const answerData = {
        uid: userData.uid,
        answer: answerText,
        answerImg: imageUrl,
        answerPostTime: firestore.FieldValue.serverTimestamp(),
      };
      const answersRef = await firestore()
        .collection('queries')
        .doc(id)
        .collection('answers')
        .add(answerData);

      const answerId = answersRef.id;
      console.log(answerId);
      await answersRef.update({id: answerId});
      if (answerImg) {
        const imageRef = storage().ref(`answerImages/${userData.uid}/${id}`);
        await imageRef.putFile(answerImg);
        imageUrl = await imageRef.getDownloadURL();
        await answersRef.update({answerImg: imageUrl});
      }
      setAnswerText('');
      setAnswerImg(null);
      showAnswerModal(false);
      fetchQueries();
      ToastAndroid.show(`Your answer is submitted.`, ToastAndroid.SHORT);
    } catch (err) {
      console.log('Error submitting answer : ', err);
    } finally {
      setUploading(false);
    }
  };

  //delete answer
  const handleAnswerDelete = async (queryId, answerId) => {
    setDeletingAns(true);
    await firestore()
      .collection('queries')
      .doc(queryId)
      .collection('answers')
      .doc(answerId)
      .delete();
    fetchQueries();
    setTimeout(() => {
      setDeletingAns(false);
      ToastAndroid.show(`Your query is deleted.`, ToastAndroid.SHORT);
    }, 2000);
  };

  return (
    <View
      key={index}
      style={{
        width: '100%',
        paddingVertical: 5,
        paddingHorizontal: 5,
        alignItems: 'center',
        borderTopWidth: 0.4,
        borderTopColor: theme.bg3,
        borderBottomColor: theme.bg3,
        borderBottomWidth: 0.4,
        backgroundColor : theme.bg
      }}>
      {deleteQueryModal && (
        <View
          style={{
            position: 'absolute',
            width: 200,
            height: 100,
            backgroundColor: theme.bg4,
            zIndex: 999,
            shadowcolor : theme.text,
            shadowRadius: 5,
            elevation: 7,
            borderRadius: 12,
            padding: 10,
            right: 10,
            top: 50,
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            opacity: 0.95,
          }}>
          <Text style={{color: theme.text, fontSize: 14, fontFamily: theme.font4}}>
            Do you want to delete this query?
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: 10,
              width: '100%',
              justifyContent: 'flex-end',
              paddingRight: 7,
            }}>
            <TouchableOpacity onPress={() => handleDelete(query.id)}>
              <Text
                style={{
                  fontFamily: theme.font2,
                  color: theme.p,
                  fontSize: 16,
                }}>
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => showDeleteQueryModal(false)}>
              <Text
                style={{fontFamily: theme.font2, color: theme.errorRed, fontSize: 16}}>
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {answerModal && (
        <View
          style={{
            position: 'absolute',
            width: '96%',
            maxHeight: '96%',
            backgroundColor: theme.bg4,
            zIndex: 999,
            shadowcolor : theme.text,
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
                borderBottomColor: theme.bg3,
                paddingBottom: 7,
              },
            ]}>
            <TouchableOpacity onPress={() => showAnswerModal(false)}>
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
              {answerText.trim() !== '' ? (
                <TouchableOpacity
                  style={{
                    backgroundColor: theme.bg2,
                    padding: 5,
                    width: 66,
                    alignItems: 'center',
                    borderRadius: 5,
                  }}
                  onPress={() => handleAnswerSubmit(query.id)}>
                  {uploading ? (
                    <ActivityIndicator
                      size={15}
                      color={theme.text}
                      style={{height: 20}}
                    />
                  ) : (
                    <Text
                      style={{
                        color: theme.text,
                        fontSize: 16,
                        fontFamily: theme.font2,
                      }}>
                      Reply
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
                    borderRadius: 5,
                    opacity: 0.5,
                  }}>
                  <Text
                    style={{
                      color : theme.text,
                      fontSize: 16,
                      fontFamily: theme.font2,
                    }}>
                    Reply
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={{width: '100%', height: '82%', marginTop: 10}}>
            <ScrollView style={{width: '100%', height: '100%'}}>
              {answerImg && (
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}>
                  <Image
                    source={{uri: answerImg}}
                    style={{width: '70%', height: 80, objectFit: 'contain'}}
                  />
                  <TouchableOpacity onPress={() => setAnswerImg(null)}>
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
                  height: 70,
                  borderColor: theme.bg3,
                  borderWidth: 0.4,
                  borderRadius: 3,
                  padding: 10,
                  textAlignVertical: 'top',
                  fontFamily: theme.font4,
                  color : theme.text,
                  marginTop: 5,
                }}
                placeholder="Type your query here..."
                placeholderTextColor={'gray'}
                multiline={true}
                value={answerText}
                onChangeText={text => setAnswerText(text)}
              />
              <View style={{height: 60}}></View>
            </ScrollView>
          </View>
        </View>
      )}
      <View
        style={{
          width: '100%',
          height: 60,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: deleting ? 0.3 : 1,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile', {uid: query.uid})}>
            <Image
              source={
                query.profileImg
                  ? {uri: query.profileImg}
                  : require('../assets/profileImg.png')
              }
              style={{
                width: 42,
                height: 42,
                borderRadius: 20,
                bordercolor : theme.text,
                borderWidth: 1,
              }}
            />
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              width: '70%',
            }}>
            <Text
              style={{
                color : theme.text,
                fontSize: 17,
                width: '100%',
                fontFamily: theme.font4,
              }}>
              {query.username}
            </Text>
            <Text
              style={{
                color: 'gray',
                fontSize: 13,
                width: '100%',
                fontFamily: theme.font1,
              }}>
              {query.postTime}
            </Text>
          </View>
          {query.uid === userData.uid ? (
            <TouchableOpacity
              onPress={() => showDeleteQueryModal(!deleteQueryModal)}>
              <Text
                style={{
                  fontFamily: theme.font2,
                  fontSize: 14,
                  color: 'red',
                }}>
                Delete
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => showAnswerModal(!answerModal)}>
              <Text
                style={{
                  fontFamily: theme.font2,
                  fontSize: 14,
                  color : theme.text,
                }}>
                Answer
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View
        style={{
          width: '96%',
          marginLeft: 5,
          flexDirection: 'column',
          alignItems: 'flex-start',
          opacity: deleting ? 0.3 : 1,
        }}>
        <Text
          style={{
            color : theme.text,
            fontSize: 15,
            fontFamily: theme.font1,
            maxHeight: 90,
          }}>
          {query.question}
        </Text>
        {query.queryImg && (
          <TouchableOpacity
            style={{width: '100%', height: 110}}
            onPress={() =>
              navigation.navigate('Image', {
                data: query,
                uid: query.uid,
                isAnswer: false,
              })
            }>
            <Image
              source={{uri: query.queryImg}}
              style={{
                width: '50%',
                height: 107,
                borderRadius: 7,
                marginTop: 3,
                objectFit: 'contain',
              }}
            />
          </TouchableOpacity>
        )}
      </View>
      <View
        style={{
          width: '94%',
          marginTop: 5,
          flexDirection: 'column',
          alignItems: 'flex-start',
          opacity: deleting ? 0.3 : 1,
        }}>
        <View
          style={{
            width: '103%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text
            style={{
              color: 'gray',
              fontFamily: theme.font2,
              opacity: 0.7,
              fontSize: 14,
            }}>
            {query.answers.length + ' '}
            {query.answers.length === 1 ? 'Answer' : 'Answers'}
          </Text>
          <TouchableOpacity>
            <Text
              style={{
                color: 'gray',
                fontFamily: theme.font4,
                opacity: 0.7,
                fontSize: 14,
                borderBottomColor: 'gray',
                borderBottomWidth: 0.5,
              }}>
              See all answers
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={{width: '7%', height: 100}}></View>
          <View
            style={{
              width: '93%',
              borderLeftWidth: 0.5,
              borderLeftColor: 'lightgray',
              minHeight: 130,
              maxHeight: 200,
              marginTop: 3,
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}>
            {query.answers.length === 0 ? (
              <ScrollView style={{width: '100%', marginHorizontal: 7}}>
                <Text
                  style={{
                    color: 'gray',
                    fontSize: 15,
                    fontFamily: theme.font2,
                  }}>
                  No answers yet.
                </Text>
              </ScrollView>
            ) : (
              <ScrollView
                nestedScrollEnabled
                style={{width: '100%', marginHorizontal: 7}}>
                {query.answers.map((answer, index) => {
                  const postTime = answer.answerPostTime.toDate();
                  const relativePostTime = formatDistanceToNow(postTime, {
                    addSuffix: true,
                  });
                  return (
                    <View
                      key={index}
                      style={{
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        marginBottom: 10,
                        opacity: deletingAns ? 0.3 : 1,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 5,
                          marginTop: 10,
                        }}>
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate('Profile', {uid: answer.uid})
                          }>
                          <Image
                            source={
                              answer.profileImg
                                ? {uri: answer.profileImg}
                                : require('../assets/profileImg.png')
                            }
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 20,
                              bordercolor : theme.text,
                              borderWidth: 1,
                            }}
                          />
                        </TouchableOpacity>
                        <View
                          style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            width: '68%',
                          }}>
                          <Text
                            style={{
                              color : theme.text,
                              fontSize: 14,
                              width: '100%',
                              fontFamily: theme.font4,
                            }}>
                            {answer.username}
                          </Text>
                          <Text
                            style={{
                              color: 'gray',
                              fontSize: 12,
                              width: '100%',
                              fontFamily: theme.font4,
                            }}>
                            {relativePostTime}
                          </Text>
                        </View>
                        {answer.uid === userData.uid && (
                          <TouchableOpacity
                            onPress={() =>
                              handleAnswerDelete(query.id, answer.id)
                            }>
                            <Text
                              style={{
                                fontFamily: theme.font2,
                                fontSize: 13,
                                color: 'orange',
                                marginLeft: 3,
                              }}>
                              Delete
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <Text
                        style={{
                          width: '100%',
                          fontFamily: theme.font1,
                          fontSize: 13,
                          color : theme.text,
                          marginVertical: 5,
                        }}>
                        {answer.answer}
                      </Text>
                      {answer.answerImg && (
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate('Image', {
                              data: answer,
                              uid: answer.uid,
                              isAnswer: true,
                              postTime: relativePostTime,
                            })
                          }
                          style={{width: '100%', height: 90}}>
                          <Image
                            source={{uri: answer.answerImg}}
                            style={{
                              width: '70%',
                              height: 90,
                              marginTop: 7,
                              objectFit: 'contain',
                            }}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default Query;

const styles = StyleSheet.create({
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
