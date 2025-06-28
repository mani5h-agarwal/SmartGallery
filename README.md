# Smart Gallery 🖼️

A semantic image search mobile app that allows users to find photos from their gallery collections using natural language queries.

## 🚀 Features

- **Semantic Image Search**: Find photos using natural language descriptions like "sunset at the beach" or "dog playing in park"
- **Multimodal AI**: Powered by Vision Transformer (ViT) and BERT with contrastive learning for accurate cross-modal retrieval
- **Real-time Search**: Instant results with optimized performance for mobile devices
- **Intuitive Interface**: Clean React Native UI with image preview and smooth navigation
- **Efficient Backend**: Vector similarity search with PyTorch model serving and optimized embedding storage
- **Cross-platform**: Built with React Native Expo for iOS and Android compatibility

## 🛠️ Tech Stack

**Frontend**
- React Native with Expo
- JavaScript/TypeScript

**AI/ML**
- Vision Transformer (ViT) for image encoding
- BERT for text understanding
- PyTorch for model training and inference
- Contrastive learning for multimodal alignment

**Backend**
- Vector similarity search
- RESTful API for model serving
- Optimized embedding storage

## 📊 Related Kaggle Notebooks

Explore the complete development pipeline through these comprehensive notebooks:

- 📊 [Model Training Notebook](https://www.kaggle.com/code/mani5hagarwal/smart-gallery-train) - Complete model training pipeline using image-text alignment
- 🧠 [Inference Notebook](https://www.kaggle.com/code/mani5hagarwal/inference-smart-gallery) - Inference logic for querying image embeddings with text inputs
- 🛠️ [Backend Logic Notebook](https://www.kaggle.com/code/mani5hagarwal/smartgallery-backend) - Backend and API logic for image embedding and search functionality

## 🏗️ Architecture

The app uses a sophisticated multimodal embedding system:

1. **Image Encoding**: Photos are processed and converted to high-dimensional embeddings using Vision Transformer (ViT)
2. **Text Processing**: Natural language queries are encoded using BERT
3. **Multimodal Alignment**: Image and text embeddings are aligned through contrastive learning
4. **Vector Search**: Efficient similarity search enables real-time retrieval of relevant images

```
[User Query] → [BERT Encoder] → [Text Embedding]
                                      ↓
[Vector Similarity Search] ← [Stored Image Embeddings] ← [ViT Encoder] ← [Gallery Images]
                                      ↓
[Ranked Results] → [Mobile UI] → [User]
```

## 🎯 How It Works

1. **Image Indexing**: When photos are added to the gallery, they are processed by the ViT model to generate semantic embeddings
2. **Query Processing**: User's natural language queries are encoded using BERT into the same embedding space
3. **Similarity Matching**: Vector similarity search finds the most semantically relevant images
4. **Real-time Display**: Results are ranked and displayed instantly in the mobile interface

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- React Native development environment
- Expo CLI
- Python 3.8+ (for backend model serving)
- PyTorch

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mani5h-agarwal/SmartGallery.git
   cd SmartGallery
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up the backend**
   
   Refer to the [Backend Logic Notebook](https://www.kaggle.com/code/mani5hagarwal/smartgallery-backend) for detailed setup instructions including:
   - Model download and setup
   - API endpoint configuration
   - Environment variables

4. **Start the development server**
   ```bash
   expo start
   ```

5. **Run on device**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or use `expo run:android` / `expo run:ios` for development builds

## 📱 Usage

1. **Launch the App**: Open SmartGallery on your mobile device
2. **Index Photos**: Grant gallery permissions and allow the app to index your photos
3. **Search Semantically**: Type natural language queries such as:
   - "photos of food"
   - "sunset pictures"
   - "people smiling"
   - "outdoor activities"
4. **Browse Results**: View semantically matched results powered by AI
5. **Preview Images**: Tap any image for full-size preview with additional details

## 🔬 Technical Details

### Model Architecture
- **Vision Transformer (ViT)**: State-of-the-art transformer-based image encoder
- **BERT**: Bidirectional transformer for natural language understanding
- **Contrastive Learning**: CLIP-style training ensures proper alignment between visual and textual representations

### Performance Optimizations
- **Efficient Embeddings**: Compressed vector representations for mobile storage
- **Batch Processing**: Optimized inference for multiple images
- **Lazy Loading**: Progressive image loading for smooth user experience

## 📧 Contact

**Manish Agarwal**
- GitHub: [@mani5h-agarwal](https://github.com/mani5h-agarwal)
- LinkedIn: [Connect with me](https://www.linkedin.com/in/manish-agarwal-34539a28a/)

⭐ **Star this repo if you found it helpful!**

---

*Built with ❤️ using React Native Expo and cutting-edge AI*