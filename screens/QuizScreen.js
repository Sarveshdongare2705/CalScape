import React, {useCallback, useEffect, useState} from 'react';
import {Text, View, TouchableOpacity, FlatList, Image} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth'; // Import Firebase Auth
import {colors} from '../Colors';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {ActivityIndicator} from 'react-native-paper';

const QuizScreen = ({userData}) => {
  const navigation = useNavigation();
  const [quiz, setQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(null); // State variable for the score
  const [submissionTime, setSubmissionTime] = useState(null); // State variable for the submission time
  const [allScores, setAllScores] = useState([]); // State variable for all user scores
  const [submitted, setSubmitted] = useState(false);
  const [noQuiz, setNoQuiz] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  const [adminUid, setAdminUid] = useState(null);
  const fetchAdmin = async () => {
    const docRef = await firestore().collection('Admin').doc('admin');
    const doc = await docRef.get();
    const data = doc.data();
    setAdminUid(data.uid);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchAdmin();
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      const fetchQuiz = async () => {
        try {
          setQuizLoading(true);
          const userId = auth().currentUser.uid;
          const today = new Date();
          const day = String(today.getDate()).padStart(2, '0');
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const year = today.getFullYear();
          const todayString = `${day}/${month}/${year}`;

          const quizRef = firestore()
            .collection('Quizzes')
            .where('date', '==', todayString);

          const snapshot = await quizRef.get();

          if (!snapshot.empty) {
            const quizData = snapshot.docs[0].data();
            const quizDocId = snapshot.docs[0].id;
            setQuiz(quizData);

            // Fetch user answers if they exist
            const userAnswersRef = firestore()
              .collection('Quizzes')
              .doc(quizDocId)
              .collection('Answers')
              .doc(userId);
            const userAnswersDoc = await userAnswersRef.get();

            if (userAnswersDoc.exists) {
              const userAnswersData = userAnswersDoc.data();
              setUserAnswers(userAnswersData.answers);
              setScore(userAnswersData.score);
              setSubmissionTime(userAnswersData.submissionTime.toDate());
              setSubmitted(userAnswersData.submitted);
            } else {
              quizData.quizQuestions &&
                setUserAnswers(
                  new Array(quizData.quizQuestions.length).fill(-1),
                );
            }

            // Fetch all user scores
            const allScoresRef = firestore()
              .collection('Quizzes')
              .doc(quizDocId)
              .collection('Answers')
              .orderBy('score', 'desc')
              .orderBy('submissionTime', 'asc');
            const allScoresSnapshot = await allScoresRef.get();

            if (!allScoresSnapshot.empty) {
              const scoresWithUserDetails = await Promise.all(
                allScoresSnapshot.docs.map(async doc => {
                  const scoreData = doc.data();
                  const userDoc = await firestore()
                    .collection('Users')
                    .doc(scoreData.userId)
                    .get();
                  const userData = userDoc.data();
                  return {
                    ...scoreData,
                    username: userData.username,
                    profileImg: userData.profileImg,
                  };
                }),
              );
              setAllScores(scoresWithUserDetails);
            }
          } else {
            setNoQuiz(true);
            console.log('No quiz found for today.');
          }
        } catch (error) {
          console.error('Error fetching quiz:', error);
        }
        setQuizLoading(false);
      };

      fetchQuiz();
    }, []),
  );

  const handleOptionSelect = (questionIndex, optionIndex) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[questionIndex] = optionIndex;
    setUserAnswers(updatedAnswers);
    setIsAnswered(true);
  };

  const calculateScore = () => {
    let score = 0;
    quiz.quizQuestions.forEach((question, index) => {
      if (question.correctOptionIndex === userAnswers[index]) {
        score += 1;
      }
    });
    return score;
  };

  const handleAnswerSubmit = async () => {
    const userId = auth().currentUser.uid; // Get the current user ID
    const submissionTime = new Date();

    try {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      const todayString = `${day}/${month}/${year}`;

      const quizRef = firestore()
        .collection('Quizzes')
        .where('date', '==', todayString);

      const snapshot = await quizRef.get();

      if (!snapshot.empty) {
        const quizDocId = snapshot.docs[0].id;

        const userScore = calculateScore();
        setScore(userScore);
        setSubmissionTime(submissionTime);
        await firestore()
          .collection('Quizzes')
          .doc(quizDocId)
          .collection('Answers')
          .doc(userId)
          .set({
            userId: userId,
            submissionTime: submissionTime,
            answers: userAnswers,
            score: userScore,
            submitted: true,
          });

        console.log('Answers submitted successfully.');
        setSubmitted(true);
        // Fetch updated scores
        const allScoresRef = firestore()
          .collection('Quizzes')
          .doc(quizDocId)
          .collection('Answers')
          .orderBy('score', 'desc');
        const allScoresSnapshot = await allScoresRef.get();

        if (!allScoresSnapshot.empty) {
          const scoresWithUserDetails = await Promise.all(
            allScoresSnapshot.docs.map(async doc => {
              const scoreData = doc.data();
              const userDoc = await firestore()
                .collection('Users')
                .doc(scoreData.userId)
                .get();
              const userData = userDoc.data();
              return {
                ...scoreData,
                username: userData.username,
                profileImg: userData.profileImg,
              };
            }),
          );
          setAllScores(scoresWithUserDetails);
        }
      } else {
        console.log('No quiz found for today.');
      }
    } catch (error) {
      console.error('Error submitting answers:', error);
    }
  };

  const createOption = (option, optionIndex, questionIndex, question) => {
    return (
      <TouchableOpacity
        key={optionIndex}
        onPress={() =>
          !submitted && handleOptionSelect(questionIndex, optionIndex)
        }
        style={{
          padding: 10,
          marginVertical: 5,
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 12,
          backgroundColor:
            submitted && question.correctOptionIndex === optionIndex
              ? colors.successGreen
              : !submitted && userAnswers[questionIndex] === optionIndex
              ? colors.bg2
              : submitted && userAnswers[questionIndex] === optionIndex
              ? colors.errorRed
              : '#f0f0f0', // Change background color based on state
        }}>
        <Text style={{color: 'black', fontFamily: colors.font4, fontSize: 16}}>
          {option}
        </Text>
      </TouchableOpacity>
    );
  };

  if (quizLoading) {
    return <ActivityIndicator size={25} color="black" />;
  } else {
    if (!quiz) {
      return (
        <View>
          <Text
            style={{
              fontSize: 20,
              marginBottom: 20,
              color: 'black',
              fontFamily: colors.font2,
              backgroundColor: 'lightgray',
              padding: 15,
              borderRadius: 12,
            }}>
            No quiz for today
          </Text>
          {userData && userData.uid === adminUid && (
            <TouchableOpacity
              style={{
                width: '100%',
                height: 36,
                borderRadius: 15,
                backgroundColor: 'black',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() =>
                navigation.navigate('NewQuiz', {userData: userData})
              }>
              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontFamily: colors.font2,
                  textAlign: 'center',
                }}>
                Add a Quiz
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    } else {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'lightgray',
            padding: 15,
            borderRadius: 12,
          }}>
          {score !== null && (
            <View style={{alignItems: 'center', marginBottom: 20}}>
              <Text
                style={{
                  fontSize: 24,
                  color: 'black',
                  fontFamily: colors.font3,
                  textAlign: 'center',
                }}>
                Your Score: {score}/{quiz.quizQuestions && quiz.quizQuestions.length}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: 'black',
                  fontFamily: colors.font2,
                  textAlign: 'center',
                }}>
                Submitted At:{' '}
                {submissionTime && submissionTime.toLocaleString()}
              </Text>
            </View>
          )}
          <Text
            style={{
              fontSize: 18,
              marginBottom: 20,
              color: 'black',
              fontFamily: colors.font2,
            }}>
            {quiz.quizTitle}
          </Text>
          {quiz.quizQuestions &&
            quiz.quizQuestions.map((question, questionIndex) => (
              <View key={questionIndex} style={{marginBottom: 20}}>
                <Text
                  style={{
                    fontSize: 16,
                    marginBottom: 10,
                    color: 'black',
                    fontFamily: colors.font2,
                  }}>
                  {question.questionText}
                </Text>
                {question.options.map((option, optionIndex) =>
                  createOption(option, optionIndex, questionIndex, question),
                )}
              </View>
            ))}
          {!submitted &&
            (!userAnswers.includes(-1) ? (
              <TouchableOpacity
                style={{
                  width: '100%',
                  height: 36,
                  borderRadius: 15,
                  backgroundColor: 'black',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={handleAnswerSubmit}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 16,
                    fontFamily: colors.font2,
                    textAlign: 'center',
                  }}>
                  Submit
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{
                  width: '100%',
                  height: 36,
                  borderRadius: 15,
                  backgroundColor: 'black',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.7,
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 16,
                    fontFamily: colors.font2,
                    textAlign: 'center',
                  }}>
                  Submit
                </Text>
              </TouchableOpacity>
            ))}

          {/* Display all user scores */}
          {allScores.length > 0 ? (
            <View style={{marginTop: 20}}>
              <Text
                style={{
                  fontSize: 20,
                  marginBottom: 12,
                  color: 'black',
                  fontFamily: colors.font3,
                  textAlign: 'center',
                }}>
                {`All Scores ( ${allScores.length} )`}
              </Text>
              {allScores.length > 0 &&
                allScores.map(item => (
                  <View
                    style={{
                      width: '100%',
                      height: 66,
                      backgroundColor: 'white',
                      borderRadius: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 12,
                      marginBottom: 7,
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                      }}>
                      <Image
                        source={{uri: item.profileImg}}
                        style={{width: 42, height: 42, borderRadius: 21}}
                      />
                      <View
                        style={{
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          width: '64%',
                          height: 40,
                        }}>
                        <Text
                          style={{
                            fontSize: 17,
                            color: 'black',
                            fontFamily: colors.font2,
                            textAlign: 'center',
                            height: 25,
                          }}>
                          {item.username}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            marginBottom: 10,
                            color: 'black',
                            fontFamily: colors.font4,
                            textAlign: 'center',
                            height: 15,
                          }}>
                          Submitted At :{' '}
                          {item.submissionTime.toDate().toLocaleTimeString()}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{
                        fontSize: 18,
                        color: 'black',
                        fontFamily: colors.font3,
                        textAlign: 'center',
                        width: '22%',
                      }}>
                      {item.score +
                        ' / ' +
                        (quiz.quizQuestions && quiz.quizQuestions.length)}
                    </Text>
                  </View>
                ))}
            </View>
          ) : (
            <View style={{marginTop: 20}}>
              <Text
                style={{
                  fontSize: 20,
                  marginBottom: 12,
                  color: 'black',
                  fontFamily: colors.font3,
                  textAlign: 'center',
                }}>
                {`No respones till now`}
              </Text>
            </View>
          )}
        </View>
      );
    }
  }
};

export default QuizScreen;
