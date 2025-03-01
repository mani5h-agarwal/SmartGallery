import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SearchBar = ({ value, onChangeText, placeholder, colorTheme }) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: colorTheme == "light" ? "#f0f0f0" : "#333" }]}>
        <Ionicons name="search" size={20} color="#888" style={styles.icon} />
        <TextInput
          style={[styles.input, { color: colorTheme == "light" ? "#000" : "#fff" }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#888"
          selectionColor={colorTheme == "light" ? "#000" : "#fff"}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 10,
    margin: 10,
    marginHorizontal: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 45,
  },
});

export default SearchBar;
