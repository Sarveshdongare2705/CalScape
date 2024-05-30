import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import {RadioButton} from 'react-native-paper'; // Import RadioButton from react-native-paper
import Dots from 'react-native-dots-pagination';
import {colors} from '../Colors';

const {width} = Dimensions.get('window');

// Import images statically
import vehicleImage from '../assets/vehicle.png';
import sourcesImage from '../assets/sources.png';
import electricityImage from '../assets/electricity.png';
import shoppingImage from '../assets/shopping.png';
import foodImage from '../assets/food.png';

const Questionnaire = () => {
  const [responses, setResponses] = useState({
    vehicle: '',
    sources: '',
    electricityCost: '',
    shoppingFrequency: '',
    foodOrderFrequency: '',
  });
  const [currentIndex, setCurrentIndex] = useState(0);

  const questions = [
    {
      question: 'Which vehicles do you own?',
      options: ['Car', 'Motorcycle', 'Bicycle', 'None'],
      img: vehicleImage,
      showSubmit: false,
    },
    {
      question:
        'Do you have any alternative sustainable resources at your home?',
      options: [
        'Solar Panels',
        'Wind Turbine',
        'RainWater Harvesting Setup',
        'Energy Efficient Appliances',
      ],
      img: sourcesImage,
      showSubmit: false,
    },
    {
      question:
        'What is the average cost of your electricity bill at your home?',
      options: ['Less than $20', '$20 - $50', '$50 - $100', 'More than $100'],
      img: electricityImage,
      showSubmit: false,
    },
    {
      question: 'How often do you go shopping?',
      options: ['Daily', 'Weekly', 'Monthly', 'Rarely'],
      img: shoppingImage,
      showSubmit: false,
    },
    {
      question: 'How frequently do you order food items?',
      options: ['Daily', 'Weekly', 'Monthly', 'Rarely'],
      img: foodImage,
      showSubmit: true,
    },
  ];

  const handleOptionChange = (questionIndex, optionIndex) => {
    setResponses({
      ...responses,
      [questions[questionIndex].question.toLowerCase().replace(/ /g, '')]:
        questions[questionIndex].options[optionIndex],
    });
  };

  const handleScroll = event => {
    const index = Math.floor(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        contentContainerStyle={styles.scrollViewContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        {questions.map((question, index) => (
          <View key={index} style={styles.questionContainer}>
            <Image
              source={question.img}
              style={{width: '100%', height: '35%', objectFit: 'contain'}}
            />
            <Text style={styles.questionText}>{question.question}</Text>
            {question.options.map((option, optionIndex) => (
              <View key={optionIndex} style={styles.optionContainer}>
                <RadioButton
                  value={option}
                  status={
                    responses[
                      question.question.toLowerCase().replace(/ /g, '')
                    ] === option
                      ? 'checked'
                      : 'unchecked'
                  }
                  onPress={() => handleOptionChange(index, optionIndex)}
                />
                <Text style={{color: 'black', fontSize: 14}}>{option}</Text>
              </View>
            ))}
            {question.showSubmit && (
              <View style={{width : '100%' , alignItems : 'center'}}>
                <TouchableOpacity style={styles.btn}>
                  <Text style={{color: 'white', fontWeight: '700' , fontSize : 16}}>
                    Submit
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      <View style={styles.dotsContainer}>
        <Dots
          length={questions.length}
          active={currentIndex}
          activeColor={colors.p}
          passiveColor="lightgray"
          activeDotWidth={7}
          activeDotHeight={7}
          passiveDotWidth={7}
          passiveDotHeight={7}
        />
      </View>
    </View>
  );
};

export default Questionnaire;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.bg,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  questionContainer: {
    width,
    alignItems: 'flex-start',
    padding: 20,
  },
  questionText: {
    fontSize: 16,
    marginVertical: 15,
    color: 'black',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    width: '57%',
    backgroundColor: colors.p,
    height: 40,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
});
