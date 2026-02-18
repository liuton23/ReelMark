import React from "react";
import { ActivityIndicator, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  HouseIcon,
  MagnifyingGlassIcon,
  BooksIcon,
  BellRingingIcon,
  UserCircleIcon,
} from "phosphor-react-native";
import { useTheme } from "react-native-paper";
import type { TabParamList, RootStackParamList } from "./types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import NeonText from "../components/NeonText";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import LibraryScreen from "../screens/LibraryScreen";
import RecommendScreen from "../screens/RecommendScreen";
import ProfileScreen from "../screens/ProfileScreen";
import DetailScreen from "../screens/DetailScreen";

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TAB_LABELS: Record<keyof TabParamList, string> = {
  Home: "HOME",
  Search: "BROWSE",
  Library: "COLLECTION",
  Recommend: "CLERK",
  Profile: "MEMBER",
};

const neonHeader = (title: string) => () => (
  <NeonText size={23} intensity="medium">
    {title}
  </NeonText>
);

function MainTabs() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const weight = focused ? "fill" : "regular";
          const props = { size, color, weight } as any;
          switch (route.name) {
            case "Home": return <HouseIcon {...props} />;
            case "Search": return <MagnifyingGlassIcon {...props} />;
            case "Library": return <BooksIcon {...props} />;
            case "Recommend": return <BellRingingIcon {...props} />;
            case "Profile": return <UserCircleIcon {...props} />;
          }
        },
        tabBarLabel: TAB_LABELS[route.name],
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: insets.bottom + 8,
          height: 60 + insets.bottom,
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
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerTitle: neonHeader("ReelMark Video") }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ headerTitle: neonHeader("Browse Store") }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{ headerTitle: neonHeader("Your Collection") }}
      />
      <Tab.Screen
        name="Recommend"
        component={RecommendScreen}
        options={{ headerTitle: neonHeader("Ask the Clerk") }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerTitle: neonHeader("Membership") }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const theme = useTheme();
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: { fontFamily: "BebasNeue_400Regular", fontSize: 24 },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Detail"
            component={DetailScreen}
            options={{
              headerTitle: neonHeader("Rental Card"),
              presentation: "card",
              headerBackTitle: "Back",
              // headerRight is set dynamically by DetailScreen via navigation.setOptions()
            }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}