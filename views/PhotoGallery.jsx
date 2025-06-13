import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Modal,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as SystemUI from 'expo-system-ui';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import SearchBar from "./SearchBar";
import PhotoItem from "./PhotoItem";
import Header from "./Header.jsx";
import SelectionHeader from "./SelectionHeader";
import UploadProgress from "./UploadProgress";

// Import utility functions
import { fetchPhotos } from "./utils/mediaUtils";
import { getUploadedImages, saveMultipleUploadedImages } from "./utils/storageUtils";
import { uploadImage, searchPhotos } from "./utils/apiUtils";

const PhotoGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [colorTheme, setColorTheme] = useState("light");
  const [isUploading, setIsUploading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectAll, setselectAll] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalToUpload, setTotalToUpload] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);

  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const backgroundColor = colorTheme === 'light' ? '#ffffff' : '#000000';
    SystemUI.setBackgroundColorAsync(backgroundColor);
  }, [colorTheme]);

  // Update the initial photo loading useEffect
  useEffect(() => {
    const loadPhotos = async () => {
      setIsLoading(true);
      const {
        assets,
        endCursor: newEndCursor,
        hasNextPage: newHasNextPage,
      } = await fetchPhotos();
      setPhotos(assets);
      setEndCursor(newEndCursor);
      setHasNextPage(newHasNextPage);
      setIsLoading(false);
    };
    loadPhotos();
  }, []);

  // Add loadMorePhotos function
  const loadMorePhotos = async () => {
    if (!hasNextPage || isLoadingMore || isLoading || searchResults.length > 0) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const {
        assets,
        endCursor: newEndCursor,
        hasNextPage: newHasNextPage,
      } = await fetchPhotos(endCursor, 50);
      setPhotos((prevPhotos) => [...prevPhotos, ...assets]);
      setEndCursor(newEndCursor);
      setHasNextPage(newHasNextPage);
    } catch (error) {
      console.error("Error loading more photos:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Add renderFooter function
  const renderFooter = () => {
    if (!isLoadingMore || searchResults.length > 0) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#536AF5" />
      </View>
    );
  };

  useEffect(() => {
    const loadUploadedImages = async () => {
      const images = await getUploadedImages();
      setUploadedImages(images);
    };
    loadUploadedImages();
  }, []);

  useEffect(() => {
    const checkPermissions = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        setPermissionDenied(true);
      }
    };
    checkPermissions();
  }, []);

  useEffect(() => {
    if (selectedPhotos.length === 0) {
      setIsSelectionMode(false);
    } else if (!isSelectionMode && selectedPhotos.length > 0) {
      setIsSelectionMode(true);
    }
  }, [selectedPhotos, isSelectionMode]);

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem("theme");
      if (storedTheme) {
        setColorTheme(storedTheme);
      }
    };
    loadTheme();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const filenames = await searchPhotos(searchQuery);
      const localUris = photos
        .filter((photo) =>
          filenames.some((name) => photo.uri.endsWith(name.split("/").pop()))
        )
        .map((photo) => photo.uri);

      setSearchResults(localUris);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoSelect = useCallback((photo) => {
    setSelectedPhotos((prevSelected) => {
      const isAlreadySelected = prevSelected.some((p) => p.id === photo.id);

      if (isAlreadySelected) {
        return prevSelected.filter((p) => p.id !== photo.id);
      } else {
        return [...prevSelected, photo];
      }
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    const selectablePhotos = displayedPhotos.filter(
      (photo) => !uploadedImages.includes(photo.uri)
    );

    if (selectedPhotos.length === selectablePhotos.length) {
      setSelectedPhotos([]);
    } else {
      setSelectedPhotos([...selectablePhotos]);
    }

    setselectAll((prev) => !prev);
  }, [selectedPhotos, displayedPhotos, uploadedImages]);

  const cancelSelection = useCallback(() => {
    setSelectedPhotos([]);
    setselectAll(false);
    setIsSelectionMode(false);
  }, []);

  const uploadSelectedPhotos = useCallback(async () => {
    const photosToUpload = selectedPhotos.filter(
      (photo) => !uploadedImages.includes(photo.uri)
    );

    if (photosToUpload.length === 0) {
      Alert.alert("Info", "All selected photos are already uploaded.");
      return;
    }

    cancelSelection();

    setIsUploading(true);
    setTotalToUpload(photosToUpload.length);
    setUploadedCount(0);
    setUploadProgress(0);

    const uploadedUris = [];
    let successCount = 0;

    for (let i = 0; i < photosToUpload.length; i++) {
      try {
        const photo = photosToUpload[i];
        await uploadImage(photo.uri);

        uploadedUris.push(photo.uri);
        successCount++;

        setUploadedCount((prev) => prev + 1);
        setUploadProgress((i + 1) / photosToUpload.length);
      } catch (error) {
        console.error(`Failed to upload photo ${i + 1}:`, error);
      }
    }

    if (uploadedUris.length > 0) {
      const allUploaded = await saveMultipleUploadedImages(uploadedUris);
      setUploadedImages(allUploaded);
    }

    setIsUploading(false);

    if (successCount === photosToUpload.length) {
      if (photosToUpload.length === 1) {
        Alert.alert("Success", "Photo uploaded successfully!");
      } else {
        Alert.alert(
          "Success",
          `All ${photosToUpload.length} photos uploaded successfully!`
        );
      }
    } else if (successCount > 0) {
      Alert.alert(
        "Partial Success",
        `Uploaded ${successCount} of ${photosToUpload.length} photos. Some uploads failed.`
      );
    } else {
      Alert.alert("Failed", "Could not upload any photos. Please try again.");
    }
  }, [selectedPhotos, uploadedImages]);

  const handlePhotoPress = useCallback(
    (photo) => {
      if (isSelectionMode) {
        return;
      }
      setSelectedPhoto(photo);
    },
    [isSelectionMode]
  );

  const closeModal = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  const toggleTheme = useCallback(async () => {
    const newTheme = colorTheme === "light" ? "dark" : "light";
    setColorTheme(newTheme);
    await AsyncStorage.setItem("theme", newTheme);
  }, [colorTheme]);

  const displayedPhotos =
    searchResults.length > 0
      ? photos.filter((photo) => searchResults.includes(photo.uri))
      : photos;

  if (permissionDenied) {
    return (
      <View style={styles.container}>
        <Text>Permission denied. Enable in settings.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colorTheme === "light" ? "#fff" : "#000" },
      ]}
    >
      <StatusBar
        backgroundColor={colorTheme === "light" ? "#fff" : "#000"}
        barStyle={colorTheme === "light" ? "dark-content" : "light-content"}
      />

      <View style={styles.headerContainer}>
        {isSelectionMode ? (
          <SelectionHeader
            colorTheme={colorTheme}
            selectedCount={selectedPhotos.length}
            selectAll={selectAll}
            onCancel={cancelSelection}
            onToggleSelectAll={toggleSelectAll}
            onUpload={uploadSelectedPhotos}
          />
        ) : (
          <Header colorTheme={colorTheme} onToggleTheme={toggleTheme} />
        )}

        <SearchBar
          placeholder="Search photos..."
          colorTheme={colorTheme === "light" ? "light" : "dark"}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
      </View>

      <UploadProgress
        isUploading={isUploading}
        uploadedCount={uploadedCount}
        totalToUpload={totalToUpload}
        uploadProgress={uploadProgress}
        colorTheme={colorTheme}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#536AF5" />
        </View>
      ) : (
        <View style={styles.galleryContainer}>
          <FlatList
            data={displayedPhotos}
            renderItem={({ item }) => (
              <PhotoItem
                item={item}
                onPress={handlePhotoPress}
                isUploaded={uploadedImages.includes(item.uri)}
                isSelectionMode={isSelectionMode}
                isSelected={selectedPhotos.some((p) => p.id === item.id)}
                onSelect={handlePhotoSelect}
              />
            )}
            keyExtractor={(item) => item.id}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            onEndReached={loadMorePhotos}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
          />
        </View>
      )}

      <Modal
        visible={!!selectedPhoto}
        transparent={true}
        onRequestClose={closeModal}
        animationType="fade"
      >
        <SafeAreaView style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeModal}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>

          {selectedPhoto && (
            <View style={styles.modalContent}>
              <Image
                source={{ uri: selectedPhoto.uri }}
                style={styles.modalImage}
              />

              {!uploadedImages.includes(selectedPhoto.uri) ? (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => {
                    closeModal();
                    setTimeout(() => {
                      setSelectedPhotos([selectedPhoto]);
                    }, 300);
                  }}
                  activeOpacity={0.8}
                >
                  <Feather name="upload" size={16} color="#fff" />
                  <Text style={styles.uploadButtonText}>Upload</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.uploadedBadge}>
                  <Feather name="check-circle" size={16} color="#fff" />
                  <Text style={styles.uploadedText}>Uploaded</Text>
                </View>
              )}
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryContainer: {
    flex: 1,
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  modalContent: {
    width: "100%",
    height: "100%",
  },
  modalImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  uploadButton: {
    position: "absolute",
    bottom: 40,
    right: 30,
    backgroundColor: "#536AF5",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 8,
  },
  uploadedBadge: {
    position: "absolute",
    bottom: 40,
    right: 30,
    backgroundColor: "rgba(76, 175, 80, 0.8)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  uploadedText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 5,
  },
  footerLoader: {
    paddingVertical: 10,
    alignItems: "center",
  },
});

export default PhotoGallery;