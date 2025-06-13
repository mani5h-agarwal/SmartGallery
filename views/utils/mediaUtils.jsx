import * as MediaLibrary from "expo-media-library";

export const fetchPhotos = async (after = null, limit = 100) => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === "granted") {
      const options = {
        mediaType: "photo",
        first: limit,
        sortBy: [MediaLibrary.SortBy.creationTime],
      };

      if (after) {
        options.after = after;
      }

      const { assets, endCursor, hasNextPage } =
        await MediaLibrary.getAssetsAsync(options);
      return { assets, endCursor, hasNextPage };
    }
    return { assets: [], endCursor: null, hasNextPage: false };
  } catch (error) {
    console.error("Error fetching photos:", error);
    return { assets: [], endCursor: null, hasNextPage: false };
  }
};