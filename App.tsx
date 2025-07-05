import React from 'react';
import { Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

// Screens
import Home from './screens/Home';
import TrainingPlan from './screens/TrainingPlan';
import Courses from './screens/Courses';
import Calendar from './screens/Calendar';
import ExternalLinks from './screens/ExternalLinks';
import TouchPoint from './screens/TouchPoint';
import Podcasts from './screens/Podcasts';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Home') {
              return (
                <Image
                  source={require('./assets/homeBetterLogo.png')}
                  style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'white' }}
                />
              );
            } else if (route.name === 'Training Plan') {
              return <MaterialCommunityIcons name="dumbbell" size={size} color={color} />;
            } else if (route.name === 'Courses') {
              return <Ionicons name="book-outline" size={size} color={color} />;
            } else if (route.name === 'Calendar') {
              return <Feather name="calendar" size={size} color={color} />;
            } else if (route.name === 'External Links') {
              return <Feather name="link" size={size} color={color} />;
            } else if (route.name === 'Touch Point') {
              return <MaterialCommunityIcons name="target" size={size} color={color} />;
            } else if (route.name === 'Podcasts') {
              return <Ionicons name="headset-outline" size={size} color={color} />;
            }
          },
          tabBarActiveTintColor: '#4B3BE7',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Training Plan" component={TrainingPlan} />
        <Tab.Screen name="Courses" component={Courses} />
        <Tab.Screen name="Touch Point" component={TouchPoint} />
        <Tab.Screen name="External Links" component={ExternalLinks} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}