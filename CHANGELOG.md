# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-11-26

### ✨ Added

#### Inline Product Editing Features

- **Price Calculator Dialog**: Calculate and set sale price based on purchase price + profit margin

  - Editable purchase price field
  - Editable profit amount field
  - Real-time sale price calculation
  - Preview of calculated sale price before applying

- **Stock Editor Dialog**: Update product stock and minimum stock levels

  - Edit current stock quantity
  - Edit minimum stock threshold
  - Both values updated together in database

- **Barcode Suffix Editor Dialog**: Change barcode suffix

  - Select from predefined suffixes: H, M, MIX, NA, GEN
  - Full barcode format: `750000[CODE]-[SUFFIX]`
  - Live barcode preview
  - Visual feedback on barcode changes

- **SUNAT Code Editor Dialog**: Edit product SUNAT code

  - Text input for SUNAT code value
  - Real-time preview
  - Clean dialog interface

- **Category Selector Dialog**: Select product category from database
  - Dropdown populated from Supabase categories
  - "Sin categoría" (No category) option
  - Direct database integration
  - Real-time category synchronization

#### Component Architecture

- Refactored all dialogs into separate, reusable Angular components
- Implemented presentational component pattern for dialogs
- Used Angular Signals for state management
- Consistent dialog styling and animations
- Added proper TypeScript types for all dialog outputs

#### UI/UX Improvements

- 7 action buttons per product row in table:
  - 🧮 Price Calculator (amber)
  - 📦 Stock Editor (emerald)
  - 🏷️ Barcode Suffix Editor (violet)
  - 📄 SUNAT Code Editor (cyan)
  - 📁 Category Selector (orange)
  - 👁️ View Details (primary)
  - ❌ Delete (destructive)
- Color-coded action buttons for quick visual identification
- Smooth dialog animations and transitions
- Improved product table with more editing capabilities

### 🔧 Changed

- Restructured product list component to manage multiple dialog states
- Updated icon imports to include lucideFileCode and lucideFolderOpen
- Enhanced product list template with new action buttons
- Improved state management using Angular computed signals

### 📚 Documentation

- Updated README.md with new inline editing features documentation
- Added detailed usage guide for each new dialog feature
- Documented button colors and their meanings

### 🐛 Fixed

- Prevented dialog stacking issues with proper modal management
- Improved keyboard navigation with escape key handling
- Fixed dialog click propagation to prevent unintended closures

### ♻️ Technical Details

**Components Added:**

- `price-calculator-dialog/`
- `stock-editor-dialog/`
- `barcode-suffix-dialog/`
- `sunat-code-dialog/` (new in v0.2)
- `category-editor-dialog/` (new in v0.2)

**State Management:**

- Signal-based state for each dialog type
- Computed signals for derived dialog products
- Proper output emitters for dialog results

**Technologies:**

- Angular 21+ (standalone components)
- Angular Signals API
- Spartan/Helm UI components
- Lucide Icons (ng-icons)
- TailwindCSS 4

## [0.1.0] - 2025-11-XX

### ✨ Added

#### Core Features

- AI-powered product information extraction using Google Gemini
- Image upload with drag-and-drop support (up to 2 images per product)
- Automatic barcode generation (CODE128 format)
- Supabase authentication with email/password
- Product management table with search and pagination
- Dark/Light theme toggle
- Export products to Excel

#### Data Management

- PostgreSQL database via Supabase
- Row Level Security (RLS) policies
- Real-time data synchronization with Angular Signals
- Product image storage with WebP optimization

#### UI Components

- Modern dashboard with TailwindCSS 4
- Responsive design for mobile and desktop
- Toast notifications using Sonner
- Product detail modal view
- Category management panel

#### Image Processing

- Automatic WebP conversion
- Smart compression (quality 0.8)
- Auto-resizing (max 1920x1440)
- Metadata tracking

#### Export & Download

- Excel export of all products
- Individual barcode PNG download
- Bulk barcode download as ZIP by page

---

## Version Tags

- **v0.2.0**: Inline product editing features
- **v0.1.0**: Initial release with AI image processing and basic product management

---

For migration guides and detailed upgrade information, please refer to the main [README.md](README.md).
