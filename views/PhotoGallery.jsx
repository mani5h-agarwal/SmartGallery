import React, { useState, useEffect, useCallback, memo } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from "@expo/vector-icons";
import SearchBar from "./SearchBar";
import Feather from "@expo/vector-icons/Feather";

const PhotoItem = memo(({ item, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(item)}>
      <Image source={{ uri: item.uri }} style={styles.image} />
    </TouchableOpacity>
  );
});

const PhotoGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [permission, setPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [colorTheme, setColorTheme] = useState("light");
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setPermission(status === "granted");
      if (status === "granted") {
        fetchPhotos();
      }
    })();
  }, []);

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem("theme");
      if (storedTheme) {
        setColorTheme(storedTheme);
      }
    };
    loadTheme(); 
  }, []);

  const fetchPhotos = async () => {
    if (!hasNextPage || isLoading) return;

    setIsLoading(true);

    try {
      const { assets, endCursor: newEndCursor, hasNextPage: newHasNextPage } =
        await MediaLibrary.getAssetsAsync({
          mediaType: "photo",
          first: 100,
          after: endCursor,
        });

      setPhotos((prevPhotos) => [...prevPhotos, ...assets]);
      setEndCursor(newEndCursor);
      setHasNextPage(newHasNextPage);
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isLoading) {
      fetchPhotos();
    }
  }, [hasNextPage, isLoading]);

  const handlePhotoPress = useCallback((photo) => {
    setSelectedPhoto(photo);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  const toggleTheme = async () => {
    const newTheme = colorTheme === "light" ? "dark" : "light";
    setColorTheme(newTheme);
    await AsyncStorage.setItem("theme", newTheme);
  };

  if (permission === null) {
    return <Text>Requesting permission...</Text>;
  }
  if (!permission) {
    return <Text>Permission denied. Enable in settings.</Text>;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorTheme === "light" ? "#fff" : "#000" },
      ]}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.heading,
            { color: colorTheme === "light" ? "#000" : "#fff" },
          ]}
        >
          SmartGallery
        </Text>
        <TouchableOpacity onPress={toggleTheme}>
          <View
            style={[
              styles.iconBorder,
              { backgroundColor: colorTheme === "light" ? "#f0f0f0" : "#333" },
            ]}
          >
            {colorTheme === "light" ? (
              <Feather name="sun" size={18} color="#000" />
            ) : (
              <Feather name="moon" size={18} color="#fff" />
            )}
          </View>
        </TouchableOpacity>
      </View>
      <SearchBar
        placeholder="Search photos..."
        colorTheme={colorTheme === "light" ? "light" : "dark"}
      />
      <FlatList
        data={photos}
        numColumns={3}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PhotoItem item={item} onPress={handlePhotoPress} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isLoading ? <ActivityIndicator size="large" color="#536AF5" /> : null}
        initialNumToRender={10}
        windowSize={21}
      />

      <Modal visible={!!selectedPhoto} transparent={true} onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          {selectedPhoto && (
            <Image
              source={{ uri: selectedPhoto.uri }}
              style={{ width: "100%", height: "100%", resizeMode: "contain" }}
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: Dimensions.get('window').width / 3.2,
    height: Dimensions.get('window').width / 3.2,
    margin: 2,
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  iconBorder: {
    padding: 10,
    borderRadius: 100,
  },
});

export default PhotoGallery;