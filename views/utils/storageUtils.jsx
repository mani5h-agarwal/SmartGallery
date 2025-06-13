import AsyncStorage from "@react-native-async-storage/async-storage";

export function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const getOrCreateUserId = async () => {
  try {
    let userId = await AsyncStorage.getItem("user_id");
    if (!userId) {
      userId = uuidv4();
      await AsyncStorage.setItem("user_id", userId);
    }
    return userId;
  } catch (error) {
    console.error("Error handling user_id:", error);
    return uuidv4();
  }
};

export const getUploadedImages = async () => {
  try {
    const uploadedImages = await AsyncStorage.getItem("uploadedImages");
    return uploadedImages ? JSON.parse(uploadedImages) : [];
  } catch (error) {
    console.error("Error getting uploaded images:", error);
    return [];
  }
};

export const saveMultipleUploadedImages = async (imageUris) => {
  try {
    const uploadedImages = await getUploadedImages();
    const updatedImages = [...new Set([...uploadedImages, ...imageUris])];
    await AsyncStorage.setItem("uploadedImages", JSON.stringify(updatedImages));
    return updatedImages;
  } catch (error) {
    console.error("Error saving multiple uploaded images:", error);
    return [];
  }
};