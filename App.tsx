import React from 'react';
import { Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

// Screens

import Home from './screens/Home';
import Courses from './screens/Courses';
import ExternalLinks from './screens/ExternalLinks';
import WeeklyCheckIn from './screens/WeeklyCheckIn';
import ReportIssue from './screens/ReportIssue';
import Nutrition from './screens/Nutrition';
import OpenTrueCoachInApp from './screens/OpenTrueCoachInApp';


const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={Home} />
      <HomeStack.Screen name="ReportIssue" component={ReportIssue} />
    </HomeStack.Navigator>
  );
}

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
            } else if (route.name === 'Courses') {
              return <Ionicons name="book-outline" size={size} color={color} />;
            } else if (route.name === 'External Links') {
              return <Feather name="link" size={size} color={color} />;
            } else if (route.name === 'Check In') {
              return <MaterialCommunityIcons name="target" size={size} color={color} />;
            } else if (route.name === 'Nutrition') {
              return <MaterialCommunityIcons name="apple" size={size} color={color} />;
            } else if (route.name === 'TrueCoach') {
              return <MaterialCommunityIcons name="dumbbell" size={size} color={color} />;
            }
            return null;
          },
          tabBarActiveTintColor: '#4B3BE7',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeStackScreen} />
        <Tab.Screen name="TrueCoach" component={OpenTrueCoachInApp} />
        <Tab.Screen name="Courses" component={Courses} />
        <Tab.Screen name="Check In" component={WeeklyCheckIn} />
        <Tab.Screen name="Nutrition" component={Nutrition} />
        <Tab.Screen name="External Links" component={ExternalLinks} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}