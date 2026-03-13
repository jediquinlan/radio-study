import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Radio" }} />
      <Tabs.Screen name="explore" options={{ title: "Study" }} />
    </Tabs>
  );
}
