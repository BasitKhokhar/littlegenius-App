import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useThemeColors } from '../Context/ThemeContext';
import { Radius } from '../Theme';

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

// ── Tab Icon component ────────────────────────────────────────
const TabIcon = ({ emoji, focused }) => (
  <View style={{
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: focused ? 'rgba(252,211,77,0.18)' : 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.7 }}>{emoji}</Text>
  </View>
);

// ── Root App Navigator (Bottom Tabs) ──────────────────────────
const AppNavigator = () => {
  const colors = useThemeColors();
  return (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: true,
      tabBarStyle: {
        backgroundColor: colors.brandSurface,
        borderTopWidth: 0,
        height: 72,
        paddingBottom: 10,
        paddingTop: 6,
        elevation: 20,
        shadowColor: colors.brandSurface,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      tabBarLabelStyle: {
        fontFamily: 'Baloo2_800ExtraBold',
        fontSize: 10,
        marginTop: 2,
        letterSpacing: 0.3,
      },
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.onBrandMuted,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeStackNavigator}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        tabBarLabel: 'Home',
      }}
    />
    <Tab.Screen
      name="Stories"
      component={StoriesStackNavigator}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon emoji="📚" focused={focused} />,
        tabBarLabel: 'Stories',
      }}
    />
    <Tab.Screen
      name="Games"
      component={GamesStackNavigator}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon emoji="🧠" focused={focused} />,
        tabBarLabel: 'Games',
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        tabBarLabel: 'Settings',
      }}
    />
  </Tab.Navigator>
  );
};

export default AppNavigator;
