import React from 'react';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PremiumTabBar } from '../Components/UI';

import HomeScreen from '../Screens/Home/HomeScreen';
import AlphabetScreen from '../Screens/Alphabet/AlphabetScreen';
import QuizListScreen from '../Screens/Common/QuizListScreen';
import ModuleQuizScreen from '../Screens/Common/ModuleQuizScreen';
import UrduScreen from '../Screens/Urdu/UrduScreen';
import NumbersScreen from '../Screens/Numbers/NumbersScreen';
import IslamicScreen from '../Screens/Islamic/IslamicScreen';
import IslamicHubScreen from '../Screens/Islamic/IslamicHubScreen';
import TasbeehScreen from '../Screens/Islamic/TasbeehScreen';
import NamazGuideScreen from '../Screens/Islamic/NamazGuideScreen';
import JuzAmmaScreen from '../Screens/Islamic/JuzAmmaScreen';
import SurahScreen from '../Screens/Islamic/SurahScreen';
import PakistanScreen from '../Screens/Pakistan/PakistanScreen';
import LearnScreen from '../Screens/Learn/LearnScreen';
import StoriesScreen from '../Screens/Stories/StoriesScreen';
import StoryQuizScreen from '../Screens/Stories/StoryQuizScreen';
import GamesScreen from '../Screens/Games/GamesScreen';
import GamePlayScreen from '../Screens/Games/GamePlayScreen';
import TracingWorksheetScreen from '../Screens/Games/TracingWorksheetScreen';
import ColoringBookScreen from '../Screens/Games/ColoringBookScreen';
import DrawingBoardScreen from '../Screens/Games/DrawingBoardScreen';
import LetterPuzzleScreen from '../Screens/Games/LetterPuzzleScreen';
import SettingsScreen from '../Screens/Settings/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const STACK_OPTS = { headerShown: false };

// ── Home Tab Stack ────────────────────────────────────────────
const HomeStackNavigator = () => (
  <Stack.Navigator screenOptions={STACK_OPTS}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    <Stack.Screen name="Alphabet" component={AlphabetScreen} />
    <Stack.Screen name="QuizList" component={QuizListScreen} />
    <Stack.Screen name="ModuleQuiz" component={ModuleQuizScreen} />
    <Stack.Screen name="Urdu" component={UrduScreen} />
    <Stack.Screen name="Numbers" component={NumbersScreen} />
    <Stack.Screen name="Islamic" component={IslamicHubScreen} />
    <Stack.Screen name="IslamicSection" component={IslamicScreen} />
    <Stack.Screen name="NamazGuide" component={NamazGuideScreen} />
    <Stack.Screen name="Tasbeeh" component={TasbeehScreen} />
    <Stack.Screen name="JuzAmma" component={JuzAmmaScreen} />
    <Stack.Screen name="Surah" component={SurahScreen} />
    <Stack.Screen name="IslamicStories" component={StoriesScreen} initialParams={{ source: 'islamic' }} />
    <Stack.Screen name="Pakistan" component={PakistanScreen} />
    <Stack.Screen name="Learn" component={LearnScreen} />
    {/* Stories & Games accessible from HomeScreen quick-play buttons */}
    <Stack.Screen name="Stories" component={StoriesScreen} />
    <Stack.Screen name="StoryQuiz" component={StoryQuizScreen} />
    <Stack.Screen name="Games" component={GamesScreen} />
    <Stack.Screen name="GamePlay" component={GamePlayScreen} />
    <Stack.Screen name="TracingWorksheet" component={TracingWorksheetScreen} />
    <Stack.Screen name="ColoringBook" component={ColoringBookScreen} />
    <Stack.Screen name="DrawingBoard" component={DrawingBoardScreen} />
    <Stack.Screen name="LetterPuzzle" component={LetterPuzzleScreen} />
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
    <Stack.Screen name="TracingWorksheet" component={TracingWorksheetScreen} />
    <Stack.Screen name="ColoringBook" component={ColoringBookScreen} />
    <Stack.Screen name="DrawingBoard" component={DrawingBoardScreen} />
    <Stack.Screen name="LetterPuzzle" component={LetterPuzzleScreen} />
  </Stack.Navigator>
);

// ── Islamic Tab Stack ─────────────────────────────────────────
const IslamicStackNavigator = () => (
  <Stack.Navigator screenOptions={STACK_OPTS}>
    <Stack.Screen name="IslamicMain" component={IslamicHubScreen} />
    <Stack.Screen name="IslamicSection" component={IslamicScreen} />
    <Stack.Screen name="NamazGuide" component={NamazGuideScreen} />
    <Stack.Screen name="Tasbeeh" component={TasbeehScreen} />
    <Stack.Screen name="JuzAmma" component={JuzAmmaScreen} />
    <Stack.Screen name="Surah" component={SurahScreen} />
    <Stack.Screen name="IslamicStories" component={StoriesScreen} initialParams={{ source: 'islamic' }} />
    <Stack.Screen name="StoryQuiz" component={StoryQuizScreen} />
    <Stack.Screen name="QuizList" component={QuizListScreen} />
    <Stack.Screen name="ModuleQuiz" component={ModuleQuizScreen} />
  </Stack.Navigator>
);

// ── Tab bar visibility ────────────────────────────────────────
// The floating pill belongs ONLY on the landing screen of each tab. As soon
// as the user drills into a detail screen (a letter set, a game, a surah…)
// the bar just eats vertical space and covers content, so we hide it for
// every pushed route. `getFocusedRouteNameFromRoute` is undefined until the
// nested stack has navigated once — that means "still on the root screen".
const tabStackOptions = (label, rootRoute) => ({ route }) => {
  const focused = getFocusedRouteNameFromRoute(route) ?? rootRoute;
  return {
    tabBarLabel: label,
    // PremiumTabBar reads this and renders nothing when display is 'none'.
    tabBarStyle: focused === rootRoute ? { position: 'absolute' } : { display: 'none' },
  };
};

// ── Root App Navigator (Bottom Tabs) ──────────────────────────
// The bar itself lives in PremiumTabBar; the navigator just supplies
// routes + labels. Order puts Islamic dead-centre for prominence.
const AppNavigator = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false, tabBarStyle: { position: 'absolute' } }}
    tabBar={(props) => <PremiumTabBar {...props} />}
  >
    <Tab.Screen
      name="Home"
      component={HomeStackNavigator}
      options={tabStackOptions('Home', 'HomeScreen')}
    />
    <Tab.Screen
      name="Stories"
      component={StoriesStackNavigator}
      options={tabStackOptions('Stories', 'StoriesMain')}
    />
    <Tab.Screen
      name="Islamic"
      component={IslamicStackNavigator}
      options={tabStackOptions('Islamic', 'IslamicMain')}
    />
    <Tab.Screen
      name="Games"
      component={GamesStackNavigator}
      options={tabStackOptions('Games', 'GamesMain')}
    />
    {/* Settings is a single screen — nothing to drill into, bar always shows. */}
    <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
  </Tab.Navigator>
);

export default AppNavigator;
