# Inventory To CSV - AI-Powered Inventory Management System

A modern inventory processing and management system that uses **Google Gemini AI** to extract product information from images. Built with Angular 21, Supabase for backend services, and styled with TailwindCSS 4.

## 🚀 Key Features

### 🔐 Authentication & Security

- **Supabase Authentication** with email/password
- User session persistence across browser sessions
- Row Level Security (RLS) policies for data protection
- Automatic token refresh and session restoration
- Protected routes with authentication guards

### 📸 Intelligent AI Processing

- **Automatic extraction** of product information using Google Gemini AI
- Analysis of up to **2 images per product**
- Brand, category, description, and technical specifications detection
- Automatic barcode generation in format `750000[RANDOM]-[SUFFIX]`
- Assignment of "Generic" brand when no brand is detected

### 💾 Data Persistence with Supabase

- **PostgreSQL database** with Supabase backend
- **Tables**: `categories`, `products`, `product_images`
- **Supabase Storage** for image files (optimized WebP format)
- Row Level Security policies for authenticated users
- Automatic updated_at timestamps with triggers
- Foreign key relationships for data integrity

### 🖼️ Image Optimization

- **Automatic WebP conversion** for all uploads
- **Smart compression** with quality 0.8
- **Auto-resizing** to max 1920x1440 while maintaining aspect ratio
- **Significant storage savings** (25-35% reduction vs JPG)
- Metadata tracking (file size, MIME type, display order)

### 📊 Product Management

- **Table visualization** with configurable columns
- **Real-time search** by name, internal code, barcode, or brand
- **Configurable pagination** (10, 20, or 50 products per page)
- **Product editing** (except images)
- Instant data updates with Angular Signals
- Detailed product view in modal
- Direct integration with Supabase database

### 🏷️ Category Management

- Categories loaded directly from Supabase database
- Dynamic creation of new categories
- System of predefined categories
- Real-time synchronization with database

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
- **Dark/Light mode** toggle with theme persistence
- Responsive layout optimized for mobile and desktop
- **Toast notifications** with Sonner for user feedback
- Smooth animations and transitions
- Mobile-first responsive design

### 🔔 User Feedback

- **Toast notifications** using Sonner
- Real-time feedback on:
  - AI image analysis progress
  - Product upload success/failure
  - Error messages with descriptions
  - Loading states during operations
- Position: top-right with auto-dismiss
- Rich colors matching theme (light/dark mode)

## 🛠️ Technologies Used

- **Angular 21** - Main framework
- **TypeScript 5.9** - Programming language
- **TailwindCSS 4** - Styling framework
- **Supabase** - Backend, authentication, and storage
- **PostgreSQL** - Database via Supabase
- **Google Gemini AI** - AI image processing
- **WebP Optimization** - Image compression
- **JsBarcode** - Barcode generation
- **JSZip** - ZIP file creation
- **XLSX** - Excel file generation
- **Spartan NG** - Primitive UI components
- **ng-icons** - Iconography (Lucide Icons)
- **Sonner** - Toast notifications

## 📋 Prerequisites

- **Node.js** (version 18 or higher)
- **pnpm** 10.22.0 (package manager)
- **Google Gemini API Key** (configure in `src/environments/environment.ts`)
- **Supabase Project** with:
  - Authentication enabled (Email provider)
  - PostgreSQL database
  - Storage bucket for images

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

3. Configure Supabase:

  - Create a project at [supabase.com](https://supabase.com)
  - Execute `supabase-schema.sql` in SQL Editor to create database schema
  - Create a `product-images` storage bucket (public)
  - Configure environment variables:

   ```typescript
   export const environment = {
     production: false,
     googleGeminiApiKey: 'YOUR_GEMINI_API_KEY',
     supabase: {
       url: 'https://your-project.supabase.co',
       anonKey: 'your-anon-key',
     },
   };
   ```

4. Enable Email Authentication in Supabase:

  - Go to Authentication → Providers
  - Enable "Email"
  - (Optional) Disable "Email Confirmations" for development

5. Start the development server:

```bash
pnpm start
```

6. Open your browser at `http://localhost:4200`

## 📖 Usage Guide

### 1. Authentication

- **Sign up**: Create a new account with email and password
- **Sign in**: Use your credentials to access the app
- Session persists across browser sessions
- Click "Cerrar Sesión" to logout

### 2. Upload Images

- Drag and drop or select up to **2 images** of a product
- Supported formats: JPG, PNG, WEBP
- Images are automatically optimized to WebP format
- Toast notifications show progress and results
- The system processes images with AI

### 3. Manage Categories

- Click on "Manage Categories" to expand the panel
- Add new custom categories as needed
- Categories sync with Supabase database in real-time

### 4. View Products

- The table displays all processed products from database
- Use the **search bar** to filter products
- Configure **visible columns** with the "Columns" button
- Adjust **pagination** according to your needs

### 5. Edit Products

- Click the "eye" icon to view details
- Click "Edit" to modify fields
- **Images are not editable** by design
- Changes are saved to database instantly

### 6. Dark/Light Mode

- Click the sun/moon icon in the header to toggle theme
- Theme preference is saved locally

### 7. Download Barcodes

- **Individual**: From the product detail, click "Download barcode"
- **Bulk**: In the list, click "Download Codes" to get a ZIP with all barcodes from the current page

### 8. Export to Excel

- Click "Download Excel" to export all products
- The file includes all columns and data from database

## 🏗️ Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── category-manager/     # Category management
│   │   ├── dashboard/            # Main dashboard (protected)
│   │   ├── login/                # Authentication UI
│   │   ├── product-list/         # Product list and detail
│   │   └── upload/               # Image upload and processing
│   ├── guards/
│   │   └── auth.guard.ts         # Route protection
│   ├── models/
│   │   └── inventory.model.ts    # Data models and entities
│   ├── services/
│   │   ├── ai.service.ts         # Gemini AI integration
│   │   ├── auth.service.ts       # Authentication
│   │   ├── category.service.ts   # Category management
│   │   ├── excel.service.ts      # Excel export
│   │   ├── image-optimization.service.ts  # WebP optimization
│   │   ├── inventory.service.ts  # Product management
│   │   ├── notification.service.ts # Toast notifications
│   │   ├── supabase.service.ts   # Supabase client
│   │   ├── theme.service.ts      # Dark/light mode
│   │   └── toon.service.ts       # File utilities
│   ├── app.routes.ts             # Route configuration
│   ├── app.config.ts             # App configuration
│   └── environments/             # Environment configuration
├── libs/ui/                      # Reusable UI components
└── public/                       # Static files
```

## 🗄️ Database Schema

### Categories Table

- `id` (UUID) - Primary key
- `name` (VARCHAR) - Category name (unique)
- `description` (TEXT) - Optional description
- `created_at`, `updated_at` - Timestamps

### Products Table

- `id` (UUID) - Primary key
- Complete product fields (nombre, precio, stock, etc.)
- `categoria_id` (UUID) - Foreign key to categories
- `created_at`, `updated_at` - Timestamps

### Product Images Table

- `id` (UUID) - Primary key
- `product_id` (UUID) - Foreign key to products
- `image_url` (TEXT) - Path in Supabase Storage
- `filename`, `file_size`, `mime_type` - Image metadata
- `display_order` - Image order

## 🔒 Security and Best Practices

- ✅ Supabase Authentication for user management
- ✅ Row Level Security policies for data protection
- ✅ Environment variables for sensitive API keys
- ✅ Form validation with Angular Reactive Forms
- ✅ User input sanitization
- ✅ SonarQube compliance with code quality standards
- ✅ Web accessibility (a11y) with ARIA roles and keyboard navigation
- ✅ Semantic HTML and native `<dialog>` elements
- ✅ Session persistence with token refresh
- ✅ Immutable search_path for database functions

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
- **Async Operations**: Outside constructors following S7059 rule

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
- Supabase for backend infrastructure
- Angular Team for the excellent framework
- Spartan NG for primitive UI components
- Lucide Icons for iconography
- Sonner for toast notifications
