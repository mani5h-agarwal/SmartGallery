import * as FileSystem from "expo-file-system";
import { getOrCreateUserId } from "./storageUtils";

const url = "https://shark-welcomed-leech.ngrok-free.app";

export const uploadImage = async (uri) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const filename = uri.split("/").pop();
    const user_id = await getOrCreateUserId();

    const response = await fetch(`${url}/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: base64,
        filename,
        user_id,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server response error:", errorText);
      throw new Error(`Upload failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export const searchPhotos = async (query) => {
  try {
    const user_id = await getOrCreateUserId();

    const response = await fetch(`${url}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        user_id,
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