import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";

const Header = ({ colorTheme, onToggleTheme }) => {
  const rotation = useRef(new Animated.Value(0)).current;

  const rotateIcon = () => {
    Animated.timing(rotation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      rotation.setValue(0); // Reset for next press
    });
  };

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handlePress = () => {
    rotateIcon();
    onToggleTheme(); // Call parent toggle function
  };

  return (
    <View style={styles.header}>
      <Text
        style={[
          styles.heading,
          { color: colorTheme === "light" ? "#000" : "#fff" },
        ]}
      >
        SmartGallery
      </Text>
      <TouchableOpacity onPress={handlePress}>
        <Animated.View
          style={[
            styles.iconBorder,
            {
              backgroundColor:
                colorTheme === "light" ? "#f0f0f0" : "#333",
              transform: [{ rotate: spin }],
            },
          ]}
        >
          {colorTheme === "light" ? (
            <Feather name="sun" size={18} color="#000" />
          ) : (
            <Feather name="moon" size={18} color="#fff" />
          )}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
  },
  iconBorder: {
    padding: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Header;