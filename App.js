import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ActivityIndicator, View} from 'react-native';
import Welcome from './screens/Welcome';
import SignUp from './screens/SignUp';
import Login from './screens/Login';
import Home from './screens/Home';
import Questionnaire from './screens/Questionnaire';
import Profile from './screens/Profile';
import ForgotPassword from './screens/ForgotPassword';
const Stack = createNativeStackNavigator();
const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {}, []);

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  const initialRouteName = currentUser ? 'Home' : 'Welcome';
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName={initialRouteName}>
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Questionnaire" component={Questionnaire} />
        <Stack.Screen name="Profile" component={Profile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default App;
