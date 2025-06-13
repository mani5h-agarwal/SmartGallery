// SelectionHeader.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Feather from "@expo/vector-icons/Feather";

const SelectionHeader = ({ 
  colorTheme, 
  selectedCount, 
  selectAll, 
  onCancel, 
  onToggleSelectAll, 
  onUpload 
}) => {
  return (
    <View style={styles.selectionHeader}>
      <TouchableOpacity onPress={onCancel} style={styles.button}>
        <Feather
          name="x"  
          size={22}
          color={colorTheme === "light" ? "#000" : "#fff"}
        />
      </TouchableOpacity>
      
      <TouchableOpacity onPress={onToggleSelectAll} style={styles.button}>
        <Feather 
          name={selectAll ? "check-square" : "square"} 
          size={22} 
          color={colorTheme === "light" ? "#000" : "#fff"} 
        />
      </TouchableOpacity>
      
      <Text
        style={[
          styles.selectionCount,
          { color: colorTheme === "light" ? "#000" : "#fff" },
        ]}
      >
        {selectedCount} selected
      </Text>
      
      <TouchableOpacity 
        onPress={onUpload}
        style={styles.button}
        disabled={selectedCount === 0}
      >
        <Feather 
          name="upload" 
          size={22} 
          color={selectedCount > 0 ? (colorTheme === "light" ? "#000" : "#fff") : "#888"} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  selectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  button: {
    padding: 8,
    borderRadius: 20,
  },
  selectionCount: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    marginHorizontal: 10,
  },
});

export default SelectionHeader;

