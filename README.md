# Inventory To CSV - AI-Powered Inventory Management System

A modern inventory processing and management system that uses **Google Gemini AI** to extract product information from images. Built with Angular 21 and styled with TailwindCSS 4.

## 🚀 Key Features

### 📸 Intelligent AI Processing

- **Automatic extraction** of product information using Google Gemini AI
- Analysis of up to **2 images per product**
- Brand, category, description, and technical specifications detection
- Automatic barcode generation in format `750000[RANDOM]-[SUFFIX]`
- Assignment of "Generic" brand when no brand is detected

### 💾 Data Persistence

- **IndexedDB** for persistent local storage
- Automatic saving of images and processed products
- Data persists across browser sessions
- Automatic image retrieval from local storage

### 📊 Product Management

- **Table visualization** with configurable columns
- **Real-time search** by name, internal code, barcode, or brand
- **Configurable pagination** (10, 20, or 50 products per page)
- **Product editing** (except images)
- Instant data updates with Angular Signals
- Detailed product view in modal

### 🏷️ Category Management

- System of predefined and custom categories
- Dynamic creation of new categories
- Visual distinction between default and AI-generated categories
- Collapsible panel for efficient space management

### 📦 Barcode Management

- **CODE128 format** barcode visualization
- **Individual download** of barcodes as PNG images from product detail
- **Bulk download by page**: generates a ZIP with all barcodes from the current page
  - Format: `barcodes-page-{N}.zip`
  - Each image named with its corresponding barcode code

### 📤 Export Functionality

- **Excel export** of all products
- Includes all columns: name, internal code, model, SUNAT code, prices, stock, etc.
- Format compatible with ERP systems

### 🎨 User Interface

- Modern design with **TailwindCSS 4**
- UI components based on **Spartan Helm**
- Responsive layout with grid design
- Dark/light mode according to system configuration
- Smooth animations and transitions

## 🛠️ Technologies Used

- **Angular 21** - Main framework
- **TypeScript 5.9** - Programming language
- **TailwindCSS 4** - Styling framework
- **Google Gemini AI** - AI image processing
- **IndexedDB (idb)** - Local data persistence
- **JsBarcode** - Barcode generation
- **JSZip** - ZIP file creation
- **XLSX** - Excel file generation
- **Spartan NG** - Primitive UI components
- **ng-icons** - Iconography (Lucide Icons)

## 📋 Prerequisites

- **Node.js** (version 18 or higher)
- **pnpm** 10.22.0 (package manager)
- **Google Gemini API Key** (configure in `src/environments/environment.ts`)

## 🔧 Installation

1. Clone the repository:

```bash
git clone https://github.com/spacecodee/inventory-to-csv.git
cd inventory-to-csv
```

2. Install dependencies:

```bash
pnpm install
```

3. Configure environment variables:

  - Copy `src/environments/environment.ts`
  - Add your Google Gemini API Key:

   ```typescript
   export const environment = {
     production: false,
     geminiApiKey: 'YOUR_API_KEY_HERE',
   };
   ```

4. Start the development server:

```bash
pnpm start
```

5. Open your browser at `http://localhost:4200`

## 📖 Usage Guide

### 1. Upload Images

- Drag and drop or select up to **2 images** of a product
- Supported formats: JPG, PNG, WEBP
- The system will automatically process the images with AI

### 2. Manage Categories

- Click on "Manage Categories" to expand the panel
- Add new custom categories as needed
- Categories are automatically saved

### 3. View Products

- The table displays all processed products
- Use the **search bar** to filter products
- Configure **visible columns** with the "Columns" button
- Adjust **pagination** according to your needs

### 4. Edit Products

- Click the "eye" icon to view details
- Click "Edit" to modify fields
- **Images are not editable** by design
- Changes are saved instantly

### 5. Download Barcodes

- **Individual**: From the product detail, click "Download barcode"
- **Bulk**: In the list, click "Download Codes" to get a ZIP with all barcodes from the current page

### 6. Export to Excel

- Click "Download Excel" to export all products
- The file includes all columns and processed data

## 🏗️ Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── category-manager/     # Category management
│   │   ├── product-list/         # Product list and detail
│   │   └── upload/               # Image upload and processing
│   ├── models/
│   │   └── inventory.model.ts    # Data models
│   ├── services/
│   │   ├── ai.service.ts         # Gemini AI integration
│   │   ├── category.service.ts   # Category management
│   │   ├── excel.service.ts      # Excel export
│   │   ├── image-persistence.service.ts  # Image persistence
│   │   ├── inventory.service.ts  # Product management
│   │   └── toon.service.ts       # File utilities
│   └── environments/             # Environment configuration
├── libs/ui/                      # Reusable UI components
└── public/                       # Static files
```

## 🔒 Security and Best Practices

- ✅ Environment variables for sensitive API Keys
- ✅ Form validation with Angular Reactive Forms
- ✅ User input sanitization
- ✅ SonarQube compliance
- ✅ Web accessibility (a11y) with ARIA roles and keyboard navigation
- ✅ Semantic HTML and native `<dialog>` elements

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run tests with coverage
pnpm test -- --coverage
```

## 🏗️ Production Build

```bash
# Generate optimized build
pnpm build

# Build artifacts will be generated in dist/
```

## 📝 Code Conventions

- **Language**: Code in English, UI in Spanish
- **State Management**: Angular Signals (no RxJS for state)
- **Control Flow**: `@if`, `@for`, `@switch` (no legacy structural directives)
- **Styling**: TailwindCSS only (no custom CSS)
- **Components**: Standalone (no NgModules)
- **Change Detection**: `OnPush` in all components

## 🤝 Contributing

Contributions are welcome. Please:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is under private license.

## 👤 Author

**spacecodee**

- GitHub: [@spacecodee](https://github.com/spacecodee)

## 🙏 Acknowledgments

- Google Gemini AI for intelligent image processing
- Angular Team for the excellent framework
- Spartan NG for primitive UI components
- Lucide Icons for iconography
