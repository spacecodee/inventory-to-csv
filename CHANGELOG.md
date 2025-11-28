# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [0.3.3] - 2025-11-27

### ✨ Added

- **Compact barcode format `XXXSY`**: Nuevo formato de código de barras compacto para ahorrar espacio en etiquetas y facilitar el escaneo. Formato: 3 dígitos aleatorios + sufijo de 1 carácter + dígito de control (ej. `345H7`).
- **Bulk update button**: Botón en la lista de productos para convertir en masa los códigos antiguos al nuevo formato compacto.
- **Loading feedback**: Indicador visual (spinner) y notificaciones durante la operación masiva para mostrar progreso y resultado.

### 🔧 Changed

- El generador de códigos (AI) ahora crea códigos en el formato compacto `XXXSY`.
- El diálogo de sufijos de código de barras usa sufijos de 1 carácter (`MIX` → `X`, `NA` → `N`, `GEN` → `G`).
- La tabla de productos se recarga automáticamente después de la actualización masiva de códigos.

### 📚 Documentation

- Actualizado `README.md` con detalles del nuevo formato compacto y la funcionalidad de actualización masiva.

