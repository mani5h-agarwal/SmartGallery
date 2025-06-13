import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Modal,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Animated,
  Easing,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from "@expo/vector-icons";
import SearchBar from "./SearchBar";
import Feather from "@expo/vector-icons/Feather";
import * as NavigationBar from "expo-navigation-bar";
import * as FileSystem from "expo-file-system";

const url = "https://shark-welcomed-leech.ngrok-free.app";

const fetchPhotos = async () => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === "granted") {
      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: "photo",
        first: 100,
        sortBy: [MediaLibrary.SortBy.creationTime],
      });
      return assets;
    }
    return [];
  } catch (error) {
    console.error("Error fetching photos:", error);
    return [];
  }
};

const getOrCreateUserId = async () => {
  try {
    let userId = await AsyncStorage.getItem('user_id');
    if (!userId) {
      userId = uuidv4();
      await AsyncStorage.setItem('user_id', userId);
    }
    return userId;
  } catch (error) {
    console.error('Error handling user_id:', error);
    return uuidv4();
  }
};

const uploadImage = async (uri) => {
  try {
    console.log("Reading image as base64...");
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const filename = uri.split("/").pop();
    const user_id = await getOrCreateUserId();

    console.log("Sending upload request for user:", user_id);
    const response = await fetch(`${url}/upload`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
          image: base64, 
          filename,
          user_id
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server response error:", errorText);
      throw new Error(`Upload failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("Upload successful:", data);
    return data;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

const searchPhotos = async (query) => {
  try {
    const user_id = await getOrCreateUserId();

    console.log("Sending search request for user:", user_id);
    const response = await fetch(`${url}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        query,
        user_id
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server response error:", errorText);
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    return data.image_filenames || [];
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const getUploadedImages = async () => {
  try {
    const uploadedImages = await AsyncStorage.getItem('uploadedImages');
    return uploadedImages ? JSON.parse(uploadedImages) : [];
  } catch (error) {
    console.error("Error getting uploaded images:", error);
    return [];
  }
};

const saveMultipleUploadedImages = async (imageUris) => {
  try {
    const uploadedImages = await getUploadedImages();
    const updatedImages = [...new Set([...uploadedImages, ...imageUris])];
    await AsyncStorage.setItem('uploadedImages', JSON.stringify(updatedImages));
    return updatedImages;
  } catch (error) {
    console.error("Error saving multiple uploaded images:", error);
    return [];
  }
};

const PhotoItem = memo(({ 
  item, 
  onPress, 
  isUploaded, 
  isSelectionMode, 
  isSelected,
  onSelect,
  index 
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const selectAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current; 
  
  useEffect(() => {

    const delay = index * 40;
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),

      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.spring(selectAnim, { 
      toValue: isSelected ? 1 : 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [isSelected]);

  const handlePress = () => {
    if (isSelectionMode && isUploaded) {
      return;
    }
    
    if (isSelectionMode) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
      
      onSelect(item);
      return;
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start(() => onPress(item));
  };

  const handleLongPress = () => {

    if (isUploaded) {
      return;
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    onSelect(item);
  };

  const initialRotation = index % 2 === 0 ? '-3deg' : '3deg';
  const finalRotation = '0deg';
  
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [initialRotation, finalRotation]
  });

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={200}
    >
      <Animated.View
        style={{
          transform: [
            { scale: scaleAnim },
            { rotate: rotation }
          ],
          opacity: opacityAnim,
          position: 'relative',
        }}
      >
        <Image source={{ uri: item.uri }} style={styles.image} />
        
        {isUploaded && (
          <View style={styles.selectionContainer}>
            <View style={styles.selectionCircle}>
              <View style={styles.uploadedCircle}>
                <Feather name="check" size={12} color="#fff" />
              </View>
            </View>
          </View>
        )}
        
        {(isSelectionMode || isSelected) && !isUploaded && (
          <View style={styles.selectionContainer}>
            <Animated.View 
              style={[
                styles.selectionCircle,
                {
                  transform: [
                    { scale: selectAnim.interpolate({
                      inputRange: [0, 0.8, 1],
                      outputRange: [0.8, 1.2, 1]
                    }) },
                    { rotate: selectAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg']
                    }) }
                  ],
                  opacity: selectAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1]
                  })
                }
              ]}
            >
              {isSelected ? (
                <View style={styles.selectedCircle}>
                  <Feather name="check" size={12} color="#fff" />
                </View>
              ) : (
                <View style={styles.emptyCircle} />
              )}
            </Animated.View>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
});

const OldPhotoGallery = () => {

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
  const [showUploadDone, setShowUploadDone] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(-50)).current;
  const searchBarAnim = useRef(new Animated.Value(-20)).current;
  const themeToggleAnim = useRef(new Animated.Value(0)).current;
  const loadingSpinAnim = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const instructionAnim = useRef(new Animated.Value(0)).current; 

  const flatListRef = useRef(null);

  const scrollPosition = useRef(0);

  const uploadDoneAnim = useRef(new Animated.Value(1)).current;

  const selectionModeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading || isUploading) {
      Animated.loop(
        Animated.timing(loadingSpinAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      loadingSpinAnim.setValue(0);
    }
  }, [isLoading, isUploading]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: uploadProgress,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease)
    }).start();
  }, [uploadProgress]);

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

    Animated.timing(instructionAnim, {
      toValue: 1,
      duration: 800,
      delay: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const loadPhotos = async () => {
      setIsLoading(true);
      const assets = await fetchPhotos();
      setPhotos(assets);
      setIsLoading(false);
    };

    loadPhotos();

    Animated.parallel([

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),

      Animated.timing(headerAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5))
      }),

      Animated.timing(searchBarAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5))
      })
    ]).start();
  }, []);

  // Handle selection mode changes with animation
  useEffect(() => {
    Animated.timing(selectionModeAnim, {
      toValue: isSelectionMode ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease)
    }).start();
    
    if (selectedPhotos.length === 0) {

      setIsSelectionMode(false);
    } else if (!isSelectionMode && selectedPhotos.length > 0) {

      setIsSelectionMode(true);
    }
  }, [selectedPhotos, isSelectionMode]);


  useEffect(() => {
    if (showUploadDone) {

      Animated.sequence([
        Animated.timing(uploadDoneAnim, {
          toValue: 1.1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.spring(uploadDoneAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true
        })
      ]).start();
      
      const timer = setTimeout(() => {
        Animated.timing(uploadDoneAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }).start(() => {
          setShowUploadDone(false);
        });
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [showUploadDone]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    Animated.sequence([
      Animated.timing(searchBarAnim, {
        toValue: 5,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.spring(searchBarAnim, {
        toValue: 0,
        friction: 4,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();

    setIsLoading(true);
    try {
      const filenames = await searchPhotos(searchQuery);
      const localUris = photos
        .filter((photo) => filenames.some((name) => photo.uri.endsWith(name.split("/").pop()))) 
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
    setSelectedPhotos(prevSelected => {
      const isAlreadySelected = prevSelected.some(p => p.id === photo.id);
      
      if (isAlreadySelected) {
        return prevSelected.filter(p => p.id !== photo.id);
      } else {
        return [...prevSelected, photo];
      }
    });
  }, []);

  const toggleSelectAll = useCallback(() => {

    Animated.sequence([
      Animated.timing(themeToggleAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(themeToggleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      })
    ]).start();
    

    const selectablePhotos = displayedPhotos.filter(photo => 
      !uploadedImages.includes(photo.uri)
    );
    
    if (selectedPhotos.length === selectablePhotos.length) {
      // Deselect all
      setSelectedPhotos([]);
    } else {
      // Select all non-uploaded photos
      setSelectedPhotos([...selectablePhotos]);
    }

    setselectAll(prev => !prev);
  }, [selectedPhotos, displayedPhotos, uploadedImages]);

  const cancelSelection = useCallback(() => {
    // Animate exit from selection mode
    Animated.timing(selectionModeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      setSelectedPhotos([]);
      setselectAll(false);
      setIsSelectionMode(false);
    });
  }, []);

  const uploadSelectedPhotos = useCallback(async () => {
    // Filter out already uploaded photos
    const photosToUpload = selectedPhotos.filter(
      photo => !uploadedImages.includes(photo.uri)
    );
    
    if (photosToUpload.length === 0) {
      Alert.alert("Info", "All selected photos are already uploaded.");
      return;
    }
    
    // Cancel selection mode first to avoid UI jumps
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
        
        // Track successful uploads
        uploadedUris.push(photo.uri);
        successCount++;
        
        // Update progress
        setUploadedCount(prev => prev + 1);
        setUploadProgress((i + 1) / photosToUpload.length);
      } catch (error) {
        console.error(`Failed to upload photo ${i + 1}:`, error);
      }
    }
    
    // Update uploaded images list
    if (uploadedUris.length > 0) {
      const allUploaded = await saveMultipleUploadedImages(uploadedUris);
      setUploadedImages(allUploaded);
    }
    
    setIsUploading(false);
    
    // Reset upload done animation and show message
    uploadDoneAnim.setValue(1);
    setShowUploadDone(true);
    
    // Show result
    if (successCount === photosToUpload.length) {
      if (photosToUpload.length === 1) {
        Alert.alert("Success", "Photo uploaded successfully!");
      } else {
        Alert.alert("Success", `All ${photosToUpload.length} photos uploaded successfully!`);
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

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem("theme");
      if (storedTheme) {
        setColorTheme(storedTheme);
      }
    };
    loadTheme();
  }, []);

  const handlePhotoPress = useCallback((photo) => {
    if (isSelectionMode) {
      return;
    }
    setSelectedPhoto(photo);

    Animated.parallel([
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        friction: 5, // Lower friction for faster animation
        tension: 100, // Higher tension for more responsiveness
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 1,
        duration: 150, // Reduced duration for faster appearance
        useNativeDriver: true,
        easing: Easing.out(Easing.quad), // Better easing for quicker start
      }),
    ]).start();
  }, [isSelectionMode]);

  const closeModal = useCallback(() => {
    // Optimize the closing animation to be quicker
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 0.9,
        duration: 120, // Even faster closing
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 0,
        duration: 120, // Match the scale animation timing
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSelectedPhoto(null);
    });
  }, []);

  const toggleTheme = useCallback(async () => {
    // Animate theme toggle with full rotation
    Animated.timing(themeToggleAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      themeToggleAnim.setValue(0);
    });
    
    const newTheme = colorTheme === "light" ? "dark" : "light";
    setColorTheme(newTheme);
    await AsyncStorage.setItem("theme", newTheme);
  }, [colorTheme]);

  const handleScroll = useCallback((event) => {
    scrollPosition.current = event.nativeEvent.contentOffset.y;
  }, []);

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

  const spinInterpolation = loadingSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  
  // Calculate animations for selection mode header
  const selectionHeaderTranslate = selectionModeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0]
  });
  
  const normalHeaderTranslate = selectionModeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 50]
  });

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
      
      <View style={{ height: 100 }}> 
        <Animated.View 
          style={[
            styles.header,
            styles.selectionHeader,
            { 
              transform: [{ translateY: selectionHeaderTranslate }],
              position: 'absolute',
              width: '100%',
              zIndex: 1,
              opacity: selectionModeAnim
            }
          ]}
        >
          <TouchableOpacity
            onPress={cancelSelection}
            style={styles.selectionHeaderButton}
          >
            <Feather
              name="x"  
              size={22}
              color={colorTheme === "light" ? "#000" : "#fff"}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={toggleSelectAll}
            style={styles.selectionHeaderButton}
          >
            <View>
              <Feather 
                name={selectAll ? "check-square" : "square"} 
                size={22} 
                color={colorTheme === "light" ? "#000" : "#fff"} 
              />
            </View>
          </TouchableOpacity>
          
          <Text
            style={[
              styles.selectionCount,
              { color: colorTheme === "light" ? "#000" : "#fff" },
            ]}
          >
            {selectedPhotos.length} selected
          </Text>
          
          <TouchableOpacity 
            onPress={uploadSelectedPhotos}
            style={styles.selectionHeaderButton}
            disabled={selectedPhotos.length === 0}
          >
            <Feather 
              name="upload" 
              size={22} 
              color={selectedPhotos.length > 0 ? (colorTheme === "light" ? "#000" : "#fff") : "#888"} 
            />
          </TouchableOpacity>
        </Animated.View>
        
        {/* Normal Header */}
        <Animated.View 
          style={[
            styles.header,
            { 
              opacity: fadeAnim,
              transform: [
                { translateY: headerAnim },
                { translateY: normalHeaderTranslate }
              ]
            }
          ]}
        >
          <Text
            style={[
              styles.heading,
              { color: colorTheme === "light" ? "#000" : "#fff" },
            ]}
          >
            SmartGallery
          </Text>
          <Animated.View
            style={{
              transform: [{ rotate: themeToggleAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: ['0deg', '180deg', '360deg']
              }) }]
            }}
          >
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
          </Animated.View>
        </Animated.View>
        
        <Animated.View style={{ 
            width: "100%", 
            opacity: fadeAnim,

            transform: [
              { translateY: searchBarAnim },
            ]
          }}>
            <SearchBar
              placeholder="Search photos..."
              colorTheme={colorTheme === "light" ? "light" : "dark"}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </Animated.View>
      </View>

      <View style={{ height: 50, justifyContent: 'center' }}>
        {isUploading ? (
          <View style={styles.uploadProgressContainer}>
            <View style={styles.progressTextRow}>
              <Text style={{ 
                color: colorTheme === "light" ? "#444" : "#ccc",
                fontWeight: "500"
              }}>
                Uploading {uploadedCount} of {totalToUpload}
              </Text>
              <Animated.View style={{ transform: [{ rotate: spinInterpolation }] }}>
                <ActivityIndicator size="small" color="#536AF5" />
              </Animated.View>
            </View>
            
            <View style={[
              styles.progressBarContainer,
              { backgroundColor: colorTheme === "light" ? "#e0e0e0" : "#333" }
            ]}>
              <Animated.View 
                style={[
                  styles.progressBar,
                  { width: progressWidth }
                ]}
              />
            </View>
          </View>
        ) : showUploadDone ? (
          <View style={styles.uploadCompleteContainer}>
            <Feather name="check-circle" size={16} color="#4CAF50" />
            <Text style={{ 
              color: colorTheme === "light" ? "#444" : "#ccc",
              marginLeft: 8
            }}>
              Upload complete! 
            </Text>
          </View>
        ) :  (
          <View style={styles.instructionContainer}>
            <Text style={{ 
              color: colorTheme === "light" ? "#666" : "#999",
              fontSize: 12,
              textAlign: "center",
            }}>
              Long press on any photo to select it for upload
            </Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <Animated.View style={{ 
          flex: 1, 
          justifyContent: 'center',
          transform: [
            { rotate: spinInterpolation },
            { scale: loadingSpinAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.95, 1.05, 0.95]
              })
            }
          ]
        }}>
          <ActivityIndicator size="large" color="#536AF5" />
        </Animated.View>
      ) : (
        <Animated.View style={{ 
          flex: 1, 
          width: '100%',
          opacity: fadeAnim, 
          alignItems: 'center',
          transform: [{ 
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0]
            })
          }]
        }}>
          <FlatList
            ref={flatListRef}
            data={displayedPhotos}
            renderItem={({ item, index }) => (
              <PhotoItem 
                item={item} 
                onPress={handlePhotoPress} 
                isUploaded={uploadedImages.includes(item.uri)}
                isSelectionMode={isSelectionMode}
                isSelected={selectedPhotos.some(p => p.id === item.id)}
                onSelect={handlePhotoSelect}
                index={index} 
              />
            )}
            keyExtractor={(item) => item.id}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            disableVirtualization={false}
          />
        </Animated.View>
      )}

      <Modal
        visible={!!selectedPhoto}
        transparent={true}
        onRequestClose={closeModal}
        animationType="none"
      >
        <SafeAreaView style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={closeModal}
            activeOpacity={0.7}
          >
            <Animated.View 
              style={{
                transform: [{ scale: modalOpacityAnim }],
                opacity: modalOpacityAnim
              }}
            >
              <Ionicons name="close" size={30} color="#fff" />
            </Animated.View>
          </TouchableOpacity>
          
          {selectedPhoto && (
            <Animated.View style={{
              width: "100%", 
              height: "100%",
              transform: [{ scale: modalScaleAnim }],
              opacity: modalOpacityAnim
            }}>
              <Image
                source={{ uri: selectedPhoto.uri }}
                style={{ width: "100%", height: "100%", resizeMode: "contain" }}
              />
              
              {!uploadedImages.includes(selectedPhoto.uri) && (
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
              )}
              
              {uploadedImages.includes(selectedPhoto.uri) && (
                <View style={styles.uploadedBadge}>
                  <Feather name="check-circle" size={16} color="#fff" />
                  <Text style={styles.uploadedText}>Uploaded</Text>
                </View>
              )}
            </Animated.View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 10,
    // paddingVertical: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
  },
  image: {
    width: Dimensions.get("window").width / 3 - 10,
    height: Dimensions.get("window").width / 3 - 10,
    margin: 2,
    borderRadius: 8,
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
  iconBorder: {
    padding: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  selectionContainer: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 5,
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
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  selectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  selectionHeaderButton: {
    padding: 8,
    borderRadius: 20,
  },
  selectionCount: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    marginHorizontal: 10,
  },
  uploadProgressContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,

    // marginBottom: 10, 
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
  uploadCompleteContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
  },
  instructionContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 5,
    opacity: 0.7,
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
    // fontSize: 16,
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
  }
});

export default OldPhotoGallery;

