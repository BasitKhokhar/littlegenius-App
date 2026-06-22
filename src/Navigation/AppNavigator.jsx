import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PremiumTabBar } from '../Components/UI';

import HomeScreen from '../Screens/Home/HomeScreen';
import AlphabetScreen from '../Screens/Alphabet/AlphabetScreen';
import AlphabetQuizScreen from '../Screens/Alphabet/AlphabetQuizScreen';
import QuizListScreen from '../Screens/Common/QuizListScreen';
import ModuleQuizScreen from '../Screens/Common/ModuleQuizScreen';
import UrduScreen from '../Screens/Urdu/UrduScreen';
import NumbersScreen from '../Screens/Numbers/NumbersScreen';
import IslamicScreen from '../Screens/Islamic/IslamicScreen';
import PakistanScreen from '../Screens/Pakistan/PakistanScreen';
import LearnScreen from '../Screens/Learn/LearnScreen';
import StoriesScreen from '../Screens/Stories/StoriesScreen';
import StoryQuizScreen from '../Screens/Stories/StoryQuizScreen';
import GamesScreen from '../Screens/Games/GamesScreen';
import GamePlayScreen from '../Screens/Games/GamePlayScreen';
import SettingsScreen from '../Screens/Settings/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const STACK_OPTS = { headerShown: false };

// ── Home Tab Stack ────────────────────────────────────────────
const HomeStackNavigator = () => (
  <Stack.Navigator screenOptions={STACK_OPTS}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    <Stack.Screen name="Alphabet" component={AlphabetScreen} />
    <Stack.Screen name="AlphabetQuiz" component={AlphabetQuizScreen} />
    <Stack.Screen name="QuizList" component={QuizListScreen} />
    <Stack.Screen name="ModuleQuiz" component={ModuleQuizScreen} />
    <Stack.Screen name="Urdu" component={UrduScreen} />
    <Stack.Screen name="Numbers" component={NumbersScreen} />
    <Stack.Screen name="Islamic" component={IslamicScreen} />
    <Stack.Screen name="Pakistan" component={PakistanScreen} />
    <Stack.Screen name="Learn" component={LearnScreen} />
    {/* Stories & Games accessible from HomeScreen quick-play buttons */}
    <Stack.Screen name="Stories" component={StoriesScreen} />
    <Stack.Screen name="StoryQuiz" component={StoryQuizScreen} />
    <Stack.Screen name="Games" component={GamesScreen} />
    <Stack.Screen name="GamePlay" component={GamePlayScreen} />
  </Stack.Navigator>
);

// ── Stories Tab Stack ─────────────────────────────────────────
const StoriesStackNavigator = () => (
  <Stack.Navigator screenOptions={STACK_OPTS}>
    <Stack.Screen name="StoriesMain" component={StoriesScreen} />
    <Stack.Screen name="StoryQuiz" component={StoryQuizScreen} />
  </Stack.Navigator>
);

// ── Games Tab Stack ───────────────────────────────────────────
const GamesStackNavigator = () => (
  <Stack.Navigator screenOptions={STACK_OPTS}>
    <Stack.Screen name="GamesMain" component={GamesScreen} />
    <Stack.Screen name="GamePlay" component={GamePlayScreen} />
  </Stack.Navigator>
);

// ── Islamic Tab Stack ─────────────────────────────────────────
const IslamicStackNavigator = () => (
  <Stack.Navigator screenOptions={STACK_OPTS}>
    <Stack.Screen name="IslamicMain" component={IslamicScreen} />
    <Stack.Screen name="QuizList" component={QuizListScreen} />
    <Stack.Screen name="ModuleQuiz" component={ModuleQuizScreen} />
  </Stack.Navigator>
);

// ── Root App Navigator (Bottom Tabs) ──────────────────────────
// The bar itself lives in PremiumTabBar; the navigator just supplies
// routes + labels. Order puts Islamic dead-centre for prominence.
const AppNavigator = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false, tabBarStyle: { position: 'absolute' } }}
    tabBar={(props) => <PremiumTabBar {...props} />}
  >
    <Tab.Screen name="Home" component={HomeStackNavigator} options={{ tabBarLabel: 'Home' }} />
    <Tab.Screen name="Stories" component={StoriesStackNavigator} options={{ tabBarLabel: 'Stories' }} />
    <Tab.Screen name="Islamic" component={IslamicStackNavigator} options={{ tabBarLabel: 'Islamic' }} />
    <Tab.Screen name="Games" component={GamesStackNavigator} options={{ tabBarLabel: 'Games' }} />
    <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
  </Tab.Navigator>
);

export default AppNavigator;
