import React, {useState} from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {colors} from '../Colors';
import {useNavigation, useRoute} from '@react-navigation/native';

const NewQuiz = () => {
    const route = useRoute();
    const {userData} = route.params;
  const navigation = useNavigation();
  const [quizTitle, setQuizTitle] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [optionsInput, setOptionsInput] = useState('');
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);

  const handleAddQuestion = () => {
    if (
      !currentQuestion.trim() === '' &&
      !optionsInput.trim() === '' &&
      !correctOptionIndex
    ) {
      alert('Please enter a question text.');
      return;
    }

    // Split the optionsInput string into an array of options
    const optionsArray = optionsInput.split(',').map(option => option.trim());

    const newQuestion = {
      questionText: currentQuestion.trim(),
      options: optionsArray,
      correctOptionIndex: correctOptionIndex,
    };

    setQuizQuestions([...quizQuestions, newQuestion]);
    setCurrentQuestion('');
    setOptionsInput('');
    setCorrectOptionIndex(0);
  };

  const handleSaveQuiz = async () => {
    const userId = auth().currentUser.uid;
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const todayString = `${day}/${month}/${year}`;

    try {
      const quizRef = await firestore().collection('Quizzes').add({
        quizTitle: quizTitle,
        date: todayString,
        quizQuestions: quizQuestions,
      });

      console.log('Quiz added successfully with ID: ', quizRef.id);
      navigation.navigate('LearningCentre' , {userData : userData})
      // Clear form state after submission
      setQuizTitle('');
      setQuizQuestions([]);
    } catch (error) {
      console.error('Error adding quiz: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
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
        <Text style={styles.title}>Create New Quiz</Text>
      </View>
      <ScrollView style={{width : '100%' , height : '90%'}}>
      <TextInput
        placeholder="Quiz Title"
        placeholderTextColor={'gray'}
        style={styles.textinput}
        value={quizTitle}
        onChangeText={text => setQuizTitle(text)}
      />

      {quizQuestions.map((question, index) => (
        <View key={index} style={{marginBottom: 20}}>
          <Text
            style={{
              marginBottom: 10,
              color: 'black',
              fontFamily: colors.font2,
              fontSize: 16,
            }}>
            Question {index + 1}: {question.questionText}
          </Text>
          {question.options.map((option, optionIndex) => (
            <Text
              key={optionIndex}
              style={{color: 'black', fontFamily: colors.font4, fontSize: 14}}>
              {optionIndex + 1}. {option}
            </Text>
          ))}
        </View>
      ))}

      <TextInput
        placeholder="Enter Question"
        placeholderTextColor={'gray'}
        style={styles.textinput}
        value={currentQuestion}
        onChangeText={text => setCurrentQuestion(text)}
      />

      <TextInput
        placeholder="Enter Options (separated by spaces)"
        placeholderTextColor={'gray'}
        style={styles.textinput}
        value={optionsInput}
        onChangeText={text => setOptionsInput(text)}
      />

      <TextInput
        placeholder="Correct Option Index"
        placeholderTextColor={'gray'}
        keyboardType="numeric"
        style={styles.textinput}
        value={correctOptionIndex.toString()}
        onChangeText={text => setCorrectOptionIndex(parseInt(text))}
      />

      <TouchableOpacity
        onPress={handleAddQuestion}
        style={{
          width: '100%',
          height: 36,
          borderRadius: 15,
          backgroundColor: 'black',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
        }}>
        <Text
          style={{
            color: 'white',
            fontSize: 16,
            fontFamily: colors.font2,
            textAlign: 'center',
          }}>
          Add Question
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSaveQuiz}
        style={{
          width: '100%',
          height: 36,
          borderRadius: 15,
          backgroundColor: 'black',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            color: 'white',
            fontSize: 16,
            fontFamily: colors.font2,
            textAlign: 'center',
          }}>
          Save Quiz
        </Text>
      </TouchableOpacity>
      <View style={{height : 400}}></View>
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
    marginLeft: 7,
  },
  textinput: {
    borderWidth: 0.4,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 10,
    borderRadius: 12,
    color: 'black',
    fontFamily: colors.font4,
  },
});

export default NewQuiz;
