# Repuestos Salazar - Backend

Este proyecto es una API RESTful construida con Node.js, Express y MongoDB (Mongoose) para la gestión de repuestos, ventas, compras, clientes, proveedores y usuarios.

## Estructura principal
- `models/`: Modelos de datos (Mongoose)
- `routes/`: Rutas de la API
- `controllers/`: Lógica de negocio
- `config/`: Configuración de la base de datos y variables de entorno

## Uso rápido
1. Instala dependencias:
   ```bash
   npm install
   ```
2. Configura tu base de datos en el archivo `.env`.
3. Inicia el servidor:
   ```bash
   node index.js
   ```

## Entidades principales
- Usuarios, Roles, Permisos, Productos, Categorías, Ventas, Detalles de venta, Clientes, Créditos, Compras, Detalles de compra, Proveedores, Fertilizantes, Estados.

## Notas
- Recuerda crear los modelos y rutas según el modelo relacional proporcionado.
- El puerto por defecto es 3000.
