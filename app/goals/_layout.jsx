import { Tabs } from 'expo-router'
import { Ionicons } from "@expo/vector-icons"
import { GoalsContexts } from "../../contexts/GoalsContexts";
import { GoalsProvider } from "../../contexts/GoalsContexts";
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';



export default function GoalsLayout() {

  return (
    <GoalsProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#FF2D55',
          tabBarInactiveTintColor: '#FFFFFF',
          tabBarActiveBackgroundColor: 'rgba(255, 45, 85, 0.1)',
          tabBarInactiveBackgroundColor: 'transparent',
          tabBarStyle: {
            backgroundColor: 'rgba(45, 140, 255, 0.95)',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: 65,
            paddingBottom: 5,
            paddingTop: 5,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name={focused ? 'home' : 'home-outline'}
                color="black"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Create Reminders',
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name={focused ? 'create' : 'create-outline'}
                color="black"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name={focused ? 'calendar' : 'calendar-outline'}
                color="black"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name={focused ? 'bar-chart' : 'bar-chart-outline'}
                color="black"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="ai-insights"
          options={{
            title: 'AI Insights',
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name={focused ? 'bulb' : 'bulb-outline'}
                color="black"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="shared"
          options={{
            title: 'Shared',
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name={focused ? 'people' : 'people-outline'}
                color="black"
              />
            ),
          }}
        />
       </Tabs>
     </GoalsProvider>
   )
 }
