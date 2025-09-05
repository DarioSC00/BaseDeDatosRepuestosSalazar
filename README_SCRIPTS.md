# 🏪 Scripts de Base de Datos - Ferretería Salazar

## 📝 Descripción
Scripts para poblar y gestionar la base de datos de productos para repuestos de motos y carros.

## 🚀 Scripts Disponibles

### 🌱 Seed de Productos
Pobla la base de datos con categorías y productos reales de repuestos:

```bash
# Ejecutar seed completo de categorías y productos
npm run seed:products
```

**Lo que hace:**
- ✅ Elimina todas las categorías existentes
- ✅ Inserta 10 categorías principales (Motor, Frenos, Suspensión, etc.)
- ✅ Elimina todos los productos existentes  
- ✅ Inserta 45+ productos reales con códigos, marcas y precios
- ✅ Calcula automáticamente precios de compra, mayorista y retail
- ✅ Asigna stock inicial a cada producto

### 📊 Gestión de Inventario

#### Actualizar Stock
```bash
# Actualizar stock aleatorio para todos los productos
npm run inventory:stock
```

#### Ajustar Precios
```bash
# Ajustar precios con inflación del 5% (default)
npm run inventory:prices

# Ajustar precios con inflación personalizada (ej: 8%)
node manageInventory.js prices 8
```

#### Ver Estadísticas
```bash
# Mostrar estadísticas completas del inventario
npm run inventory:stats
```

#### Ejecutar Todo
```bash
# Actualizar stock + precios + mostrar estadísticas
npm run inventory:all
```

## 📦 Categorías Incluidas

1. **Motor** - Aceites, bujías, filtros, empaquetaduras
2. **Frenos** - Pastillas, discos, líquidos, cables
3. **Suspensión** - Amortiguadores, resortes, aceites
4. **Transmisión** - Cadenas, piñones, embragues
5. **Eléctrico** - Baterías, faros, reguladores, luces
6. **Carrocería** - Espejos, carenajes, parabrisas
7. **Llantas y Rines** - Llantas, rines, válvulas
8. **Filtros** - Aceite, gasolina, aire
9. **Lubricantes** - Aceites, grasas especiales
10. **Accesorios** - Cascos, guantes, herramientas

## 🏷️ Productos Ejemplo

### Motor
- Aceite Motor 20W-50 Castrol (1L) - $32,500
- Bujía NGK para Moto 150cc - $16,200
- Kit de Empaquetaduras Motor 150cc - $58,500

### Frenos  
- Pastillas de Freno Brembo - $45,500
- Disco de Freno EBC 260mm - $150,000
- Líquido de Frenos Motul DOT 4 - $24,300

### Eléctrico
- Batería Yuasa 12V 7Ah - $106,250
- Faro LED Philips H4 35W - $97,500
- Kit Luces LED Direccionales - $71,500

## 💰 Sistema de Precios

Los precios se calculan automáticamente:

- **Precio Compra**: Precio base del proveedor
- **Precio Mayorista**: Precio compra + 20-30% margen
- **Precio Retail**: Precio compra + 25-35% margen
- **Precio Principal**: Igual al precio retail

## 📊 Estadísticas que Muestra

- ✅ Total de productos activos
- ⚠️ Productos con stock bajo (<10)
- 🚫 Productos sin stock
- 📈 Distribución por categorías
- 💎 Top 5 productos más caros
- 📦 Top 5 productos con mayor stock
- 💵 Precio promedio por categoría

## 🔧 Requisitos

1. **MongoDB** ejecutándose
2. **Variables de entorno** configuradas en `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/ferreteria_salazar
   ```
3. **Dependencias** instaladas:
   ```bash
   npm install
   ```

## 🎯 Uso Recomendado

### Configuración Inicial
```bash
# 1. Poblar base de datos por primera vez
npm run seed:products

# 2. Ver estadísticas iniciales
npm run inventory:stats
```

### Mantenimiento Periódico
```bash
# Actualizar stock mensualmente
npm run inventory:stock

# Ajustar precios por inflación (trimestral)
npm run inventory:prices

# Revisar estadísticas semanalmente  
npm run inventory:stats
```

## 🧪 Desarrollo y Testing

Los scripts son seguros para desarrollo:
- ⚠️ **ATENCIÓN**: Los scripts eliminan datos existentes
- ✅ Usar en ambiente de desarrollo/testing
- ✅ Hacer backup antes de usar en producción
- ✅ Verificar conexión a base de datos correcta

## 📱 Integración con App Móvil

Los productos creados son compatibles con:
- ✅ Módulo de ventas de la app móvil
- ✅ Sistema de búsqueda por categorías
- ✅ Gestión de inventario en tiempo real
- ✅ Cálculo automático de márgenes de ganancia

## 🔄 Estructura de Datos

### Categoría
```javascript
{
  name: "Motor",
  description: "Repuestos y componentes del sistema motor", 
  status: "ACTIVO"
}
```

### Producto
```javascript
{
  code: "MOT001",
  name: "Aceite Motor 20W-50 Castrol",
  description: "Aceite multigrado para motor...",
  category: ObjectId("..."),
  brand: "Castrol",
  size: "1 Litro",
  stock: 50,
  price_purchase: 25000,
  price_wholesale: 31250, 
  price_retail: 32500,
  price: 32500,
  margin_wholesale: 25,
  margin_retail: 30,
  estado: "ACTIVO"
}
```
