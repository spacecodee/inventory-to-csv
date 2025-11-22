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
- **TypeScript** - Programming language
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

## 📋 Prerequisites

- **Node.js** (version 22 or higher)
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

## 🚀 Production Deployment

This project is configured for automatic deployment using **Docker** and **GitHub Actions**.

### Deploy with Dokploy

For complete configuration and deployment instructions, check out the dedicated guide:

📖 **[See Deployment Guide (DEPLOYMENT.md)](docs/DEPLOYMENT.md)**

### Quick summary

1. **Docker**: Multi-stage Dockerfile with Nginx
2. **CI/CD**: Automatic GitHub Actions on push to `main`
3. **Registry**: GitHub Container Registry (GHCR)
4. **Deploy**: Automatic webhook to Dokploy
5. **Variables**: Configured in GitHub Secrets (build-time injection)

### Local testing

We updated the Dockerfile and CI workflows to use BuildKit secret mounts (recommended). For local development you can either use the provided helper script `build-local.sh` (recommended) or run BuildKit directly.

1. Copy the example file to create a local env file and fill your keys:

```bash
cp .env.local.example .env.local
# then edit .env.local and replace placeholder values
```

Example `.env.local` variables (copied from `.env.local.example`):

```env
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

2. Use the helper script (recommended):

```bash
chmod +x build-local.sh
./build-local.sh
docker run -p 8080:80 inventory-to-csv:local
# Open http://localhost:8080
```

3. Alternative: manual BuildKit command (creates temporary secret files)

```bash
# create temporary secret files (example)
echo "your_google_gemini_api_key_here" > /tmp/google_gemini_api_key
echo "your_supabase_url_here" > /tmp/supabase_url
echo "your_supabase_anon_key_here" > /tmp/supabase_anon_key

DOCKER_BUILDKIT=1 docker build -t inventory-to-csv:local \
  --secret id=google_gemini_api_key,src=/tmp/google_gemini_api_key \
  --secret id=supabase_url,src=/tmp/supabase_url \
  --secret id=supabase_anon_key,src=/tmp/supabase_anon_key \
  .

rm /tmp/google_gemini_api_key /tmp/supabase_url /tmp/supabase_anon_key
docker run -p 8080:80 inventory-to-csv:local
```

Access at: `http://localhost:80`

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
