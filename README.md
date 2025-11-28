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
  - Automatic barcode generation in compact format `XXXSY` (3 digits + 1-letter suffix + check digit), e.g. `345H7`
- Assignment of "Generic" brand when no brand is detected

### 💾 Data Persistence with Supabase

- **PostgreSQL database** with Supabase backend
- **Tables**: `categories`, `products`, `product_images`
- **Supabase Storage** for image files (optimized WebP format)
- Row Level Security policies for authenticated users
- Automatic updated_at timestamps with triggers
- Foreign key relationships for data integrity

### 🖼️ Image Management & Viewing

- **Full-screen Image Viewer**:
  - Display product images at full resolution
  - Navigation between multiple images (Previous/Next buttons, keyboard arrows)
  - Thumbnail grid for quick selection
  - Image filename reference display
  - Dark background overlay for better visibility
  - Accessible from product list table and product detail modal
- **Image Metadata**:
  - Filename tracking for each image
  - Public URLs from Supabase Storage
  - Display order preservation
  - File size and MIME type information
- **Clickable Image Thumbnails**:
  - Click product image in table to open viewer
  - Click image tiles in product detail modal
  - Hover effects indicate interactivity

### 🖼️ Image Management & Viewing

- **Full-screen Image Viewer**:
  - Display product images at full resolution
  - Navigation between multiple images (Previous/Next buttons, keyboard arrows)
  - Thumbnail grid for quick selection
  - Image filename reference display
  - Dark background overlay for better visibility
  - Accessible from product list table and product detail modal
- **Image Metadata**:
  - Filename tracking for each image
  - Public URLs from Supabase Storage
  - Display order preservation
  - File size and MIME type information
- **Clickable Image Thumbnails**:
  - Click product image in table to open viewer
  - Click image tiles in product detail modal
  - Hover effects indicate interactivity

### 📊 Product Management

- **Table visualization** with configurable columns
- **Real-time search** by name, internal code, barcode, or brand
- **Configurable pagination** (10, 20, or 50 products per page)
- **Supplier & Invoice Display**:
  - Quick view of invoice number and supplier information in product list
  - "Factura" column shows first assigned invoice number
  - "Proveedor" column shows supplier name (razon_social) and RUC
  - Both columns toggleable via "Columnas" button
  - Click invoice manager button for full supplier/invoice management
- **Inline product editing** with action icons:
  - 🧮 **Price Calculator**: Calculate sale price based on cost + profit margin
  - 📦 **Stock Editor**: Update stock quantity and minimum stock level
  - 🏷️ **Barcode Suffix Editor**: Change barcode suffix (H, M, MIX, NA, GEN)
  - 📄 **SUNAT Code Editor**: Edit product SUNAT code
  - 📁 **Category Selector**: Select category from database categories
  - 🩵 **Product Editor**: Edit product name and description
  - 📄 **Supplier/Invoice Manager**: Manage product suppliers and invoices
  - 👁️ **View Details**: Open full product details in modal
  - ❌ **Delete**: Remove product from inventory
- Instant data updates with Angular Signals
- Detailed product view in modal
- Direct integration with Supabase database

### � Supplier & Invoice Management

- **Supplier Tracking**:
  - Store supplier information (business name, RUC, address, phone, email)
  - Create suppliers directly from invoice dialog
  - Manage supplier data from Supabase
- **Invoice Management**:
  - Assign invoices to products
  - Track invoice number and date
  - Link invoices to suppliers
  - Many-to-many relationship support (one product can have multiple invoices)
- **Invoice Dialog Features**:
  - View all invoices linked to a product
  - Assign existing invoices with dropdown
  - Create new suppliers inline
  - Create new invoices inline
  - Remove invoice assignments
  - Real-time database synchronization

### �🏷️ Category Management

- Categories loaded directly from Supabase database
- Dynamic creation of new categories
- System of predefined categories
- Real-time synchronization with database

### 📦 Barcode & Label Management

- **CODE128 format** barcode visualization
- **Compact barcode format & bulk update**: Soporta el nuevo formato compacto `XXXSY` y dispone de una acción en la lista de productos para convertir en masa códigos antiguos al nuevo formato con feedback visual.
 - **Compact barcode format & bulk update**: Soporta el nuevo formato compacto `XXXSY` y dispone de una acción en la lista de productos para convertir en masa códigos antiguos al nuevo formato con feedback visual.
 - **Print to 80mm / PDF**: The product list includes an `Imprimir` button which opens a print-ready page formatted for 80mm thermal printers. The printed output contains only the barcode images (no product name) and is optimized for 80mm width.

Printing notes and usage

- The print flow uses a browser print dialog (or PDF export). It generates barcode images (CODE128) sized for an 80mm roll and opens a print preview with `@page { size: 80mm auto }`.
- Recommended settings: set paper width to **80mm** in the printer dialog and use **scale 100%**. If you choose "Save as PDF" you get a PDF ready for printing or archiving.
- Steps to print:
  1. Open the product list and navigate to the page containing the products to print (the feature prints the current page of products).
  2. Click the **Imprimir** button in the header.
  3. A new window will open with one barcode per printable label; review the preview and press Print (or Save as PDF).

Notes on printer hardware

- Most thermal receipt printers come in 58mm or 80mm widths. Confirm your printer uses an **80mm** roll; the print view is optimized for that width.
- For automated/silent printing (no dialog) consider a local print agent that accepts images/PDFs and sends ESC/POS commands directly to the printer. This project provides a browser-first workflow; if you want the local agent, I can add a Node.js example that prints directly to USB/network printers.
- **3 Download Formats**:
  - **Código**: Only barcode
  - **Código + Info**: Barcode with product name and price
  - **Etiqueta**: Product name and price only (no barcode)
- **Download Options**:
  - **Individual** downloads from product detail modal
  - **Bulk downloads by page** as ZIP files
  - All formats support both individual and batch operations
- **Professional Design**:
  - Standard black color scheme
  - Clear, readable fonts
  - Optimized for printing and labeling
  - Automatic text truncation for long product names

### 📤 Export Functionality

- **Excel export** of all products
- Includes all relevant inventory columns: name, internal code, model, SUNAT code, prices, stock, etc.
- **Images are not exported** (view-only column in table)
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

### 5. Edit Products with Inline Actions

Each product row has **9 action buttons**:

1. **🧮 Price Calculator** (amber icon):

- Calculate sale price based on purchase price + profit margin
- Dialog to edit purchase price and desired profit
- Automatically calculates and applies the sale price

2. **📦 Stock Editor** (emerald icon):

- Update product stock quantity
- Modify minimum stock level
- Both values saved together

3. **🏷️ Barcode Suffix Editor** (violet icon):

- Edit the barcode suffix (H, M, MIX, NA, GEN)
- Full barcode format: `750000[CODE]-[SUFFIX]`
- Preview of new barcode before applying

4. **📄 SUNAT Code Editor** (cyan icon):

- Edit the product SUNAT code
- Text input dialog for SUNAT code value

5. **📁 Category Selector** (orange icon):

- Select product category from database
- Dropdown populated from Supabase categories
- Includes "Sin categoría" option

6. **🩵 Product Editor** (sky blue icon):

- Edit product name and description
- Text input for name (required)
- Textarea for description (optional)
- Changes saved directly to database

7. **📄 Supplier/Invoice Manager** (pink icon):

- View invoices assigned to product
- Assign existing invoices
- Create new suppliers inline
- Create new invoices inline
- Remove invoice assignments
- Track supplier information (business name, RUC, etc.)

8. **👁️ View Details** (primary color icon):

- Open full product details in modal
- View and edit all product information
- Click on image thumbnails to view in full-screen

9. **❌ Delete** (destructive color icon):

- Remove product from inventory
- Immediate database update

### 6. View Product Images

- **From Product List Table**:

  - Click the product image thumbnail in the "Imagen" column
  - Opens full-screen image viewer

- **From Product Detail Modal**:

  - Hover over image tiles to see "Ver" indicator
  - Click any image to open full-screen viewer
  - Shows image filename as reference

- **Image Viewer Features**:
  - Full-resolution image display
  - Navigate with Previous/Next buttons
  - Use arrow keys (← →) for keyboard navigation
  - Click thumbnail grid to jump to specific image
  - Counter shows current position (e.g., "2 / 5")
  - Press ESC or click close button to exit
  - Dark background for better visibility

### 7. Manage Suppliers & Invoices

- Click the pink **Supplier/Invoice Manager** button on any product
- **View Invoices**: See all invoices assigned to the product
- **Assign Invoice**: Select from existing invoices dropdown
- **Create Supplier**: Add new supplier information inline (business name, RUC optional)
- **Create Invoice**: Add new invoice with supplier and invoice number
- **Remove Invoice**: Delete invoice assignment from product

### 8. Dark/Light Mode

- Click the sun/moon icon in the header to toggle theme
- Theme preference is saved locally

### 9. Download Barcodes & Labels

**Individual (from Product Detail)**:

- **Descargar código** (blue): Only barcode as PNG
- **Con info** (green): Barcode + product name + price
- **Etiqueta** (violet): Product name + price only (no barcode)

**Bulk (from Product List by page)**:

- **Códigos** (gray): ZIP with only barcodes
- **Códigos + Info** (green): ZIP with barcodes + name + price
- **Etiquetas** (violet): ZIP with price labels only

All files are named with the product barcode or internal code for easy identification.

### 10. Export to Excel

- Click "Download Excel" to export all products
- The file includes all columns and data from database

### 6. Dark/Light Mode

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
