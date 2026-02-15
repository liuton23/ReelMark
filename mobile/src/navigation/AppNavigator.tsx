import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import type { TabParamList, RootStackParamList } from "./types";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import LibraryScreen from "../screens/LibraryScreen";
import RecommendScreen from "../screens/RecommendScreen";
import DetailScreen from "../screens/DetailScreen";

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const TAB_ICONS: Record<
  keyof TabParamList,
  { focused: IconName; unfocused: IconName }
> = {
  Home: { focused: "home", unfocused: "home-outline" },
  Search: { focused: "movie-search", unfocused: "movie-search-outline" },
  Library: { focused: "bookshelf", unfocused: "bookshelf" },
  Recommend: { focused: "lightbulb-on", unfocused: "lightbulb-on-outline" },
};

const TAB_LABELS: Record<keyof TabParamList, string> = {
  Home: "HOME",
  Search: "BROWSE",
  Library: "COLLECTION",
  Recommend: "CLERK",
};

function MainTabs() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarLabel: TAB_LABELS[route.name],
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: insets.bottom + 8, // Dynamic padding based on device
          height: 60 + insets.bottom, // Dynamic height
        },
        tabBarLabelStyle: {
          fontFamily: "SpaceMono_400Regular",
          fontSize: 10,
          marginTop: -4,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontFamily: "BebasNeue_400Regular",
          fontSize: 24,
          letterSpacing: 2,
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerTitle: "REELMARK VIDEO" }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ headerTitle: "BROWSE STORE" }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{ headerTitle: "YOUR COLLECTION" }}
      />
      <Tab.Screen
        name="Recommend"
        component={RecommendScreen}
        options={{ headerTitle: "ASK THE CLERK" }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontFamily: "BebasNeue_400Regular",
          fontSize: 24,
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="Main"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{
          headerTitle: "RENTAL CARD",
          presentation: "card",
        }}
      />
    </Stack.Navigator>
  );
}
