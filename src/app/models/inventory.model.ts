export interface Product {
  id: string;
  nombre: string;
  codigoInterno: string;
  modelo: string;
  codigoSunat: string;
  codigoTipoUnidad: string;
  codigoTipoMoneda: string;
  precioUnitarioVenta: number;
  codigoTipoAfectacionIgvVenta: string;
  tieneIgv: boolean;
  precioUnitarioCompra: number;
  codigoTipoAfectacionIgvCompra: string;
  stock: number;
  stockMinimo: number;
  categoria: string;
  marca: string;
  descripcion: string;
  nombreSecundario: string;
  codigoLote: string;
  fechaVencimiento: string;
  codigoBarras: string;
  imagenes: string[]; // Filenames
  imageFiles?: File[]; // Actual files for preview
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Vehículos y Maquinaria',
    description: 'Autos RC, Drones, Aviones, Robots, Construcción, etc.',
  },
  { id: '2', name: 'Juegos de Rol e Imitación', description: 'Cocinas, Batidoras, Sets de Picnic' },
  {
    id: '3',
    name: 'Artículos de Fiesta',
    description: 'Árboles de Navidad, Adornos, Platos, Vasos, Bolsas de regalo',
  },
  {
    id: '4',
    name: 'Juguetes Educativos',
    description: 'Instrumentos musicales, Bloques, Juguetes para bebés',
  },
  { id: '5', name: 'Muñecas y Accesorios', description: 'Muñecas, Castillos, Autos de muñecas' },
  { id: '6', name: 'Acción y Puntería', description: 'Pistolas lanza dardos/agua' },
  { id: '7', name: 'Pistas y Garajes', description: 'Pistas de carreras, Estacionamientos' },
  { id: '8', name: 'Accesorios y Varios', description: 'Estuches, Organizadores' },
];
