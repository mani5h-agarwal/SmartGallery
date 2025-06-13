// UploadProgress.js
import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Feather from "@expo/vector-icons/Feather";

const UploadProgress = ({ 
  isUploading, 
  uploadedCount,
  totalToUpload, 
  uploadProgress, 
  colorTheme 
}) => {
  if (isUploading) {
    return (
      <View style={styles.uploadProgressContainer}>
        <View style={styles.progressTextRow}>
          <Text style={{ 
            color: colorTheme === "light" ? "#444" : "#ccc",
            fontWeight: "500"
          }}>
            Uploading {uploadedCount} of {totalToUpload}
          </Text>
          <ActivityIndicator size="small" color="#536AF5" />
        </View>
        
        <View style={[
          styles.progressBarContainer,
          { backgroundColor: colorTheme === "light" ? "#e0e0e0" : "#333" }
        ]}>
          <View 
            style={[
              styles.progressBar,
              { width: `${uploadProgress * 100}%` }
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.instructionContainer}>
      <Text style={{ 
        color: colorTheme === "light" ? "#666" : "#999",
        fontSize: 12,
        textAlign: "center",
      }}>
        Long press on any photo to select it for upload
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  uploadProgressContainer: {
    paddingHorizontal: 15,
    paddingBottom: 12, 
    height: 32,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  progressBarContainer: {
    height: 4,
    borderRadius: 2,
    width: "100%",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#536AF5",
  },
  instructionContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 12, 
    height: 32,
    opacity: 0.7,
  },
});

export default UploadProgress;