import { Text, TouchableOpacity, View } from "react-native";

import { GlassView } from "expo-glass-effect";

export default function HomeScreen() {
  return (
    <View
      style={{
        flex: 2,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ff0000",
      }}
    >
      <GlassView
        style={{
          marginTop: 20,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 10,
        }}
      >
        <Text>Which one?</Text>

        <TouchableOpacity onPress={() => alert("Correct!")}>
          <Text style={{ color: "blue", marginTop: 20 }}>yes</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => alert("nope!")}>
          <Text style={{ color: "blue", marginTop: 20 }}>maybe</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => alert("nope!")}>
          <Text style={{ color: "blue", marginTop: 20 }}>possibly</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => alert("nada!")}>
          <Text style={{ color: "blue", marginTop: 20 }}>absolutely not</Text>
        </TouchableOpacity>
      </GlassView>
    </View>
  );
}
