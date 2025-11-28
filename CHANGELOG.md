# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [0.3.4] - 2025-11-27

### ✨ Added

- **Compact barcode format `XXXSY`**: A new compact barcode format to save label space and improve scan reliability. Format: 3 random digits + 1-character suffix + check digit (e.g. `345H7`).
- **Bulk update button**: Button in the product list to convert legacy barcodes to the new compact format in bulk.
- **Loading feedback**: Visual indicator (spinner) and toast notifications during the bulk operation to show progress and result.
 - **Print to 80mm**: Browser-based print flow to produce 80mm-formatted pages (or PDF) containing only barcode images, accessible via the "Imprimir" button in the product list. The print output is optimized for 80mm thermal printers.

### 🔧 Changed

- The AI barcode generator now emits codes in the compact `XXXSY` format.
- The barcode suffix dialog now uses single-character suffixes (`MIX` → `X`, `NA` → `N`, `GEN` → `G`).
- The product table auto-refreshes after the bulk barcode update completes.

### 📚 Documentation

- Updated `README.md` with details about the new compact format and the bulk update functionality.
 - Updated `README.md` with instructions for printing barcodes formatted for 80mm printers (browser print / PDF workflow).

