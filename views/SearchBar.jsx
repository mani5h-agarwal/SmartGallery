

import { useRef, useEffect } from "react";
import {
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SearchBar = ({
  value,
  onChangeText,
  placeholder,
  colorTheme,
  onSubmitEditing,
  onClear,
}) => {
  const searchAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);

  useEffect(() => {
    Animated.spring(searchAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, []);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleClear = () => {
    onChangeText("");
    if (onClear) onClear();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Animated.View
        style={[
          styles.container,
          { 
            backgroundColor: colorTheme === "light" ? "#f0f0f0" : "#222",
            borderColor: colorTheme === "light" ? "#e0e0e0" : "#444",
            transform: [
              { scale: searchAnim },
              { translateY: searchAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0]
              })}
            ],
            opacity: searchAnim,
          },
        ]}
      >
        <Pressable onPress={focusInput} style={styles.iconContainer}>
          <Ionicons 
            name="search" 
            size={20} 
            color={colorTheme === "light" ? "#666" : "#aaa"} 
            style={styles.icon} 
          />
        </Pressable>
        
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { color: colorTheme === "light" ? "#000" : "#fff" },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colorTheme === "light" ? "#888" : "#777"}
          selectionColor={colorTheme === "light" ? "#536AF5" : "#6E85FF"}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="search"
        />
        
        {value.length > 0 && (
          <Pressable onPress={handleClear} style={styles.clearButton}>
            <Ionicons 
              name="close-circle" 
              size={18} 
              color={colorTheme === "light" ? "#888" : "#777"} 
            />
          </Pressable>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    padding: 2,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  clearButton: {
    padding: 6,
  },
});

export default SearchBar;