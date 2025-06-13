import React, { memo, useRef, useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
const PhotoItem = memo(
  ({ item, onPress, isUploaded, isSelectionMode, isSelected, onSelect }) => {
    const scaleAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
      if (isUploaded || isSelected) {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 4,
          tension: 100,
        }).start();
      } else {
        scaleAnim.setValue(0.8);
      }
    }, [isSelected, isUploaded]);
    
    const handlePress = () => {
      if (isSelectionMode && isUploaded) {
        return;
      }

      if (isSelectionMode) {
        onSelect(item);
        return;
      }

      onPress(item);
    };

    const handleLongPress = () => {
      if (isUploaded) {
        return;
      }
      onSelect(item);
    };

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={200}
      >
        <View style={styles.container}>
          <Image source={{ uri: item.uri }} style={styles.image} />

          {isUploaded && (
            <View style={styles.selectionContainer}>
              <View style={styles.uploadedCircle}>
                <Feather name="check" size={12} color="#fff" />
              </View>
            </View>
          )}

          {(isSelectionMode || isSelected) && !isUploaded && (
            <View style={styles.selectionContainer}>
              <View style={styles.selectionCircle}>
                {isSelected ? (
                  <Animated.View
                    style={[
                      styles.selectedCircle,
                      { transform: [{ scale: scaleAnim }] },
                    ]}
                  >
                    <Feather name="check" size={12} color="#fff" />
                  </Animated.View>
                ) : (
                  <View style={styles.emptyCircle} />
                )}
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  image: {
    width: Dimensions.get("window").width / 3 - 10,
    height: Dimensions.get("window").width / 3 - 10,
    margin: 2,
    borderRadius: 8,
  },
  selectionContainer: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  selectionCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#536AF5",
  },
  selectedCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#536AF5",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PhotoItem;
