# API Contracts - Mr. Sandwich
## Criterio 6: Diseño de la Capa de Servicios

Especificación completa de endpoints REST, incluyendo URLs, métodos HTTP, estructura de request/response, códigos de estado y manejo de errores.

---

## Base URL
```
http://localhost:5000/api
```

---

## 1. AUTENTICACIÓN

### 1.1 Registrar Usuario

**Endpoint:** `POST /auth/register`

**Request:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "123456",
  "phone": "912345678"
}
```

**Response 201 Created:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "_id": "674abc123def456",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "912345678",
    "role": "customer",
    "createdAt": "2025-12-10T15:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 400 Bad Request:**
```json
{
  "error": "El email ya está registrado"
}
```

**Validaciones:**
- `name`: requerido, string
- `email`: requerido, formato email válido, único
- `password`: requerido, mínimo 6 caracteres
- `phone`: opcional, string

---

### 1.2 Iniciar Sesión

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "juan@example.com",
  "password": "123456"
}
```

**Response 200 OK:**
```json
{
  "message": "Login exitoso",
  "user": {
    "_id": "674abc123def456",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 401 Unauthorized:**
```json
{
  "error": "Credenciales inválidas"
}
```

---

### 1.3 Obtener Perfil (Requiere autenticación)

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response 200 OK:**
```json
{
  "user": {
    "_id": "674abc123def456",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "912345678",
    "role": "customer",
    "createdAt": "2025-12-10T15:30:00Z"
  }
}
```

**Response 401 Unauthorized:**
```json
{
  "error": "Token inválido o expirado"
}
```

---

## 2. PRODUCTOS

### 2.1 Listar Productos

**Endpoint:** `GET /products`

**Query Parameters (opcionales):**
- `category`: string (ej: "sandwiches", "bebidas", "acompañamientos")
- `search`: string (busca en nombre y descripción)
- `minPrice`: number
- `maxPrice`: number

**Ejemplo:** `GET /products?category=sandwiches&search=pollo`

**Response 200 OK:**
```json
[
  {
    "_id": "674prod001",
    "name": "Sándwich Italiano",
    "description": "Tomate, palta, mayo casera",
    "price": 4500,
    "category": "sandwiches",
    "image": "/assets/images/italiano.jpg",
    "available": true,
    "createdAt": "2025-12-01T10:00:00Z"
  },
  {
    "_id": "674prod002",
    "name": "Completo Italiano",
    "description": "Vienesa, tomate, palta, mayo",
    "price": 3500,
    "category": "sandwiches",
    "image": "/assets/images/completo.jpg",
    "available": true,
    "createdAt": "2025-12-01T10:00:00Z"
  }
]
```

**Response 500 Internal Server Error:**
```json
{
  "error": "Error al obtener productos"
}
```

---

### 2.2 Obtener Producto por ID

**Endpoint:** `GET /products/:id`

**Ejemplo:** `GET /products/674prod001`

**Response 200 OK:**
```json
{
  "_id": "674prod001",
  "name": "Sándwich Italiano",
  "description": "Tomate, palta, mayo casera. Pan amasado recién horneado.",
  "price": 4500,
  "category": "sandwiches",
  "ingredients": ["Pan amasado", "Tomate", "Palta", "Mayo casera"],
  "allergens": ["Gluten", "Huevo"],
  "image": "/assets/images/italiano.jpg",
  "available": true,
  "nutritionalInfo": {
    "calories": 450,
    "protein": 12,
    "carbs": 45,
    "fat": 18
  },
  "createdAt": "2025-12-01T10:00:00Z"
}
```

**Response 404 Not Found:**
```json
{
  "error": "Producto no encontrado"
}
```

---

### 2.3 Crear Producto (Solo Admin)

**Endpoint:** `POST /products`

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Sándwich de Pollo",
  "description": "Pollo grillado, lechuga, tomate",
  "price": 4200,
  "category": "sandwiches",
  "image": "/assets/images/pollo.jpg",
  "available": true
}
```

**Response 201 Created:**
```json
{
  "message": "Producto creado exitosamente",
  "product": {
    "_id": "674prod003",
    "name": "Sándwich de Pollo",
    "description": "Pollo grillado, lechuga, tomate",
    "price": 4200,
    "category": "sandwiches",
    "image": "/assets/images/pollo.jpg",
    "available": true,
    "createdAt": "2025-12-10T16:00:00Z"
  }
}
```

**Response 403 Forbidden:**
```json
{
  "error": "Acceso denegado - se requiere rol admin"
}
```

---

## 3. PEDIDOS (ORDERS)

### 3.1 Crear Pedido (Requiere autenticación)

**Endpoint:** `POST /orders`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request:**
```json
{
  "items": [
    {
      "product": "674prod001",
      "quantity": 2,
      "price": 4500
    },
    {
      "product": "674prod002",
      "quantity": 1,
      "price": 3500
    }
  ],
  "deliveryAddress": {
    "street": "Av. Providencia",
    "number": "1234",
    "commune": "Providencia",
    "city": "Santiago",
    "instructions": "Depto 301, tocar timbre"
  },
  "paymentMethod": "cash",
  "discountCode": "25MRSNDWCH"
}
```

**Response 201 Created:**
```json
{
  "message": "Pedido creado exitosamente",
  "order": {
    "_id": "674order001",
    "orderNumber": "MRS-123456",
    "user": "674abc123def456",
    "items": [
      {
        "product": {
          "_id": "674prod001",
          "name": "Sándwich Italiano",
          "image": "/assets/images/italiano.jpg"
        },
        "quantity": 2,
        "price": 4500,
        "subtotal": 9000
      },
      {
        "product": {
          "_id": "674prod002",
          "name": "Completo Italiano"
        },
        "quantity": 1,
        "price": 3500,
        "subtotal": 3500
      }
    ],
    "deliveryAddress": {
      "street": "Av. Providencia",
      "number": "1234",
      "commune": "Providencia",
      "city": "Santiago",
      "instructions": "Depto 301, tocar timbre"
    },
    "paymentMethod": "cash",
    "subtotal": 12500,
    "deliveryFee": 2990,
    "discount": 3125,
    "discountCode": "25MRSNDWCH",
    "total": 12365,
    "status": "pending",
    "paymentStatus": "pending",
    "createdAt": "2025-12-10T16:15:00Z",
    "estimatedDelivery": "2025-12-10T17:15:00Z"
  }
}
```

**Response 400 Bad Request:**
```json
{
  "error": "El carrito está vacío"
}
```

**Response 401 Unauthorized:**
```json
{
  "error": "Token inválido o expirado"
}
```

---

### 3.2 Obtener Pedidos del Usuario

**Endpoint:** `GET /orders/my`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response 200 OK:**
```json
[
  {
    "_id": "674order001",
    "orderNumber": "MRS-123456",
    "items": [...],
    "total": 12365,
    "status": "in_transit",
    "createdAt": "2025-12-10T16:15:00Z"
  },
  {
    "_id": "674order002",
    "orderNumber": "MRS-123457",
    "items": [...],
    "total": 8500,
    "status": "delivered",
    "createdAt": "2025-12-09T12:00:00Z",
    "deliveredAt": "2025-12-09T13:15:00Z"
  }
]
```

---

### 3.3 Obtener Pedido por ID

**Endpoint:** `GET /orders/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Ejemplo:** `GET /orders/674order001`

**Response 200 OK:**
```json
{
  "_id": "674order001",
  "orderNumber": "MRS-123456",
  "user": {
    "_id": "674abc123def456",
    "name": "Juan Pérez",
    "email": "juan@example.com"
  },
  "items": [...],
  "deliveryAddress": {...},
  "paymentMethod": "cash",
  "subtotal": 12500,
  "deliveryFee": 2990,
  "discount": 3125,
  "total": 12365,
  "status": "in_transit",
  "paymentStatus": "pending",
  "createdAt": "2025-12-10T16:15:00Z",
  "statusHistory": [
    { "status": "pending", "timestamp": "2025-12-10T16:15:00Z" },
    { "status": "confirmed", "timestamp": "2025-12-10T16:20:00Z" },
    { "status": "preparing", "timestamp": "2025-12-10T16:25:00Z" },
    { "status": "in_transit", "timestamp": "2025-12-10T16:50:00Z" }
  ]
}
```

**Response 404 Not Found:**
```json
{
  "error": "Pedido no encontrado"
}
```

---

### 3.4 Cancelar Pedido

**Endpoint:** `PUT /orders/:id/cancel`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response 200 OK:**
```json
{
  "message": "Pedido cancelado exitosamente",
  "order": {
    "_id": "674order001",
    "orderNumber": "MRS-123456",
    "status": "cancelled",
    "cancelledAt": "2025-12-10T16:30:00Z"
  }
}
```

**Response 400 Bad Request:**
```json
{
  "error": "No se puede cancelar un pedido en estado 'preparing'"
}
```

**Regla de negocio:** Solo se pueden cancelar pedidos en estado `pending` o `confirmed`.

---

### 3.5 Actualizar Estado de Pedido (Solo Admin)

**Endpoint:** `PUT /orders/:id/status`

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request:**
```json
{
  "status": "preparing"
}
```

**Estados válidos:** `pending`, `confirmed`, `preparing`, `ready`, `in_transit`, `delivered`, `cancelled`

**Response 200 OK:**
```json
{
  "message": "Estado actualizado exitosamente",
  "order": {
    "_id": "674order001",
    "orderNumber": "MRS-123456",
    "status": "preparing",
    "updatedAt": "2025-12-10T16:25:00Z"
  }
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Estado inválido. Estados permitidos: pending, confirmed, preparing, ready, in_transit, delivered, cancelled"
}
```

**Response 403 Forbidden:**
```json
{
  "error": "Acceso denegado - se requiere rol admin"
}
```

---

## 4. ADMINISTRACIÓN (Solo Admin)

### 4.1 Obtener Estadísticas

**Endpoint:** `GET /admin/stats`

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response 200 OK:**
```json
{
  "todaySales": 145000,
  "activeOrders": 8,
  "monthRevenue": 3200000,
  "monthOrders": 245,
  "averageTicket": 13061,
  "topProduct": {
    "name": "Sándwich Italiano",
    "sales": 78,
    "revenue": 351000
  },
  "paymentMethods": {
    "cash": 60,
    "card": 30,
    "transfer": 10
  },
  "statusDistribution": {
    "pending": 2,
    "confirmed": 1,
    "preparing": 3,
    "ready": 1,
    "in_transit": 1,
    "delivered": 237
  }
}
```

**Response 403 Forbidden:**
```json
{
  "error": "Acceso denegado - se requiere rol admin"
}
```

---

### 4.2 Obtener Todas las Órdenes (Admin)

**Endpoint:** `GET /admin/orders`

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters (opcionales):**
- `status`: string (filtrar por estado)
- `startDate`: ISO date
- `endDate`: ISO date

**Ejemplo:** `GET /admin/orders?status=in_transit`

**Response 200 OK:**
```json
[
  {
    "_id": "674order001",
    "orderNumber": "MRS-123456",
    "user": {
      "name": "Juan Pérez",
      "phone": "912345678"
    },
    "total": 12365,
    "status": "in_transit",
    "createdAt": "2025-12-10T16:15:00Z",
    "deliveryAddress": {
      "street": "Av. Providencia",
      "number": "1234",
      "commune": "Providencia"
    }
  }
]
```

---

### 4.3 Obtener Datos de Ventas

**Endpoint:** `GET /admin/sales`

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `startDate`: ISO date (requerido)
- `endDate`: ISO date (requerido)

**Ejemplo:** `GET /admin/sales?startDate=2025-12-01&endDate=2025-12-10`

**Response 200 OK:**
```json
[
  {
    "date": "2025-12-01",
    "orders": 15,
    "revenue": 185000
  },
  {
    "date": "2025-12-02",
    "orders": 18,
    "revenue": 220000
  },
  ...
  {
    "date": "2025-12-10",
    "orders": 12,
    "revenue": 145000
  }
]
```

---

## 5. CÓDIGOS DE ESTADO HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Operación exitosa (GET, PUT, DELETE) |
| 201 | Created | Recurso creado exitosamente (POST) |
| 400 | Bad Request | Datos inválidos o validación fallida |
| 401 | Unauthorized | Token ausente, inválido o expirado |
| 403 | Forbidden | Usuario no tiene permisos (rol insuficiente) |
| 404 | Not Found | Recurso no existe |
| 500 | Internal Server Error | Error del servidor |

---

## 6. AUTENTICACIÓN Y SEGURIDAD

### JWT Token Structure
```
Header: { "Authorization": "Bearer <token>" }

Token Payload:
{
  "userId": "674abc123def456",
  "role": "customer",
  "iat": 1702224000,
  "exp": 1702828800
}
```

### Validaciones Implementadas
- **Passwords:** Hasheados con bcrypt (10 rounds)
- **Emails:** Validación de formato y unicidad
- **Tokens:** Verificación de firma y expiración
- **Roles:** Middleware `verifyAdmin` para rutas protegidas
- **Input Sanitization:** express-validator en todos los endpoints POST/PUT

---

## 7. PAGINACIÓN (Futuro)

Para listas extensas, se implementará paginación:

**Query Parameters:**
- `page`: número de página (default: 1)
- `limit`: items por página (default: 20, max: 100)

**Response Headers:**
```
X-Total-Count: 245
X-Total-Pages: 13
```

---

## 8. MANEJO DE ERRORES

Todos los errores siguen el formato:

```json
{
  "error": "Mensaje descriptivo del error",
  "details": "Información adicional (solo en desarrollo)"
}
```

**Errores de validación (400):**
```json
{
  "error": "Validación fallida",
  "fields": {
    "email": "Formato de email inválido",
    "password": "La contraseña debe tener al menos 6 caracteres"
  }
}
```

---

**Versión:** 1.0.0  
**Última actualización:** Diciembre 2025  
**Ambiente de desarrollo:** http://localhost:5000/api
