import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '@radio-lingo/ui';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.grayText,
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.grayBorder,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size }) => (
            <Text style={{ fontSize: size }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: 'Study',
          tabBarIcon: ({ size }) => (
            <Text style={{ fontSize: size }}>📖</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="exam"
        options={{
          title: 'Exam',
          tabBarIcon: ({ size }) => (
            <Text style={{ fontSize: size }}>📝</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ size }) => (
            <Text style={{ fontSize: size }}>📊</Text>
          ),
        }}
      />
    </Tabs>
  );
}
