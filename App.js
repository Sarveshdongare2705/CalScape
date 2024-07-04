import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ActivityIndicator, StatusBar, StyleSheet, View} from 'react-native';
import Welcome from './screens/Welcome';
import SignUp from './screens/SignUp';
import Login from './screens/Login';
import Home from './screens/Home';
import Questionnaire from './screens/Questionnaire';
import Profile from './screens/Profile';
import ForgotPassword from './screens/ForgotPassword';
import auth from '@react-native-firebase/auth';
import Survey from './screens/Survey';
import {colors} from './Colors';
import Recycle from './screens/Recycle';
import Clothes from './screens/Clothes';
import Food from './screens/Food';
import ExtraActivities from './screens/ExtraActivities';
import Travel from './screens/Travel';
import Electricity from './screens/Electricity';
import Energy from './screens/Energy';
import Queries from './screens/Queries';
import ImageView from './screens/Image';
import Analytics from './screens/Analytics';
import LeaderBoard from './screens/LeaderBoard';
import LearningCentre from './screens/LearningCentre';
import Module from './screens/Module';
import NewQuiz from './screens/NewQuiz';
import BottomNavigation from './components/BottomNavigation';
import Suggestions from './screens/Suggestions';

const Stack = createNativeStackNavigator();
const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const initialRouteName = currentUser ? 'Home' : 'SignUp';
  return (
    <NavigationContainer>
      <StatusBar backgroundColor={'white'} barStyle={'dark-content'} />
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName={initialRouteName}>
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Analytics" component={Analytics} />
        <Stack.Screen name="Questionnaire" component={Questionnaire} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Survey" component={Survey} />
        <Stack.Screen name="Recycle" component={Recycle} />
        <Stack.Screen name="Clothes" component={Clothes} />
        <Stack.Screen name="Food" component={Food} />
        <Stack.Screen name="ExtraActivities" component={ExtraActivities} />
        <Stack.Screen name="Travel" component={Travel} />
        <Stack.Screen name="Electricity" component={Electricity} />
        <Stack.Screen name="Energy" component={Energy} />
        <Stack.Screen name="Queries" component={Queries} />
        <Stack.Screen name="Image" component={ImageView} />
        <Stack.Screen name="LeaderBoard" component={LeaderBoard} />
        <Stack.Screen name="LearningCentre" component={LearningCentre} />
        <Stack.Screen name="Module" component={Module} />
        <Stack.Screen name="NewQuiz" component={NewQuiz} />
        <Stack.Screen name="Suggestions" component={Suggestions} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default App;
