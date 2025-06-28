# Smart Gallery 🖼️

A semantic image search mobile app that allows users to find photos from their gallery collections using natural language queries.

## 🚀 Features

- **Semantic Image Search**: Find photos using natural language descriptions like "sunset at the beach" or "dog playing in park"
- **Multimodal AI**: Powered by Vision Transformer (ViT) and BERT with contrastive learning for accurate cross-modal retrieval
- **Real-time Search**: Instant results with optimized performance for mobile devices
- **Intuitive Interface**: Clean React Native UI with image preview and smooth navigation
- **Efficient Backend**: Vector similarity search with PyTorch model serving and optimized embedding storage

## 🛠️ Tech Stack

- **Frontend**: React Native
- **AI/ML**: Vision Transformer (ViT), BERT, PyTorch
- **Backend**: Vector similarity search
- **Training**: Contrastive learning for image-text alignment

## 📊 Related Kaggle Notebooks

- 📊 [Model Training Notebook](https://www.kaggle.com/code/mani5hagarwal/smart-gallery-train) - Complete model training pipeline using image-text alignment
- 🧠 [Inference Notebook](https://www.kaggle.com/code/mani5hagarwal/inference-smart-gallery) - Inference logic for querying image embeddings with text inputs
- 🛠️ [Backend Logic Notebook](https://www.kaggle.com/code/mani5hagarwal/smartgallery-backend) - Backend and API logic for image embedding and search functionality

## 🏗️ Architecture

The app uses a multimodal embedding system that:
1. Encodes images using Vision Transformer (ViT)
2. Processes text queries using BERT
3. Aligns image and text embeddings through contrastive learning
4. Performs efficient vector similarity search for real-time results

## 🎯 How It Works

1. **Image Processing**: Photos are processed and converted to high-dimensional embeddings using ViT
2. **Query Understanding**: Natural language queries are encoded using BERT
3. **Similarity Matching**: Vector similarity search finds the most relevant images
4. **Real-time Results**: Optimized mobile interface displays results instantly

## 🚀 Getting Started

### Prerequisites
- React Native development environment
- Python (for backend model serving)
- PyTorch

### Installation

1. Clone the repository
```bash
git clone https://github.com/mani5h-agarwal/Swift-Share.git
cd Swift-Share
```

2. Install dependencies
```bash
npm install
```

3. Set up the backend (refer to the Backend Logic Notebook for detailed setup)

4. Run the app
```bash
npx react-native run-android
# or
npx react-native run-ios
```
## 📱 Usage

1. Open the SmartGallery app
2. Upload or select photos from your device to index them
3. Type your search query in natural language (e.g., "photos of food", "sunset pictures")
4. Browse through semantically matched results powered by AI
5. Tap any image to view the full-size preview

## 🔬 Technical Details

The semantic search is powered by:
- **Vision Transformer**: State-of-the-art image encoding
- **BERT**: Robust natural language understanding
- **Contrastive Learning**: Ensures proper alignment between image and text representations
- **Vector Database**: Efficient similarity search and retrieval


## 📧 Contact

Manish Agarwal - [GitHub](https://github.com/mani5h-agarwal)

---

⭐ Star this repo if you found it helpful!