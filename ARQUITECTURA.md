# Diagramas de Arquitectura - Mr. Sandwich
## Criterios 7 y 8: Modelo de Dominio y Arquitectura Backend

---

## Criterio 7: Diagrama de Clases (Modelo de Dominio)

### Diagrama UML

```mermaid
classDiagram
    class User {
        +String _id
        +String name
        +String email
        +String password
        +String phone
        +String role
        +Date createdAt
        +comparePassword(password) Boolean
    }

    class Product {
        +String _id
        +String name
        +String description
        +Number price
        +String category
        +String image
        +Boolean available
        +Array~String~ ingredients
        +Array~String~ allergens
        +Date createdAt
        +Date updatedAt
    }

    class Order {
        +String _id
        +String orderNumber
        +ObjectId user
        +Array~OrderItem~ items
        +Address deliveryAddress
        +String paymentMethod
        +Number subtotal
        +Number deliveryFee
        +Number discount
        +String discountCode
        +Number total
        +String status
        +String paymentStatus
        +Date createdAt
        +Date deliveredAt
        +calculateTotal() Number
        +canBeCancelled() Boolean
    }

    class OrderItem {
        +ObjectId product
        +Number quantity
        +Number price
        +Number subtotal
    }

    class Address {
        +String street
        +String number
        +String commune
        +String city
        +String instructions
    }

    User "1" --> "*" Order : places
    Order "1" *-- "*" OrderItem : contains
    Order "1" *-- "1" Address : delivers_to
    OrderItem "*" --> "1" Product : references
```

### Descripción de Entidades

#### User (Usuario)
Representa tanto clientes como administradores del sistema.

**Atributos:**
- `_id`: Identificador único MongoDB
- `name`: Nombre completo del usuario
- `email`: Email único para login
- `password`: Hash bcrypt de la contraseña
- `phone`: Teléfono de contacto
- `role`: "customer" | "admin"
- `createdAt`: Fecha de registro

**Métodos:**
- `comparePassword(candidatePassword)`: Compara contraseña ingresada con hash almacenado

**Relaciones:**
- Un usuario puede tener múltiples pedidos (1:N)

---

#### Product (Producto)
Representa los items del menú (sándwiches, bebidas, acompañamientos).

**Atributos:**
- `_id`: Identificador único
- `name`: Nombre del producto
- `description`: Descripción breve
- `price`: Precio en pesos chilenos
- `category`: "sandwiches" | "bebidas" | "acompañamientos" | "promociones"
- `image`: URL de la imagen
- `available`: Boolean indicando stock
- `ingredients`: Array de strings (opcional)
- `allergens`: Array de alérgenos (opcional)

**Métodos:**
- Ninguno (entidad de datos)

**Relaciones:**
- Un producto puede estar en múltiples OrderItems (1:N)

---

#### Order (Pedido)
Representa una orden de compra realizada por un usuario.

**Atributos:**
- `_id`: Identificador único
- `orderNumber`: Código legible (ej: "MRS-123456")
- `user`: Referencia a User (ObjectId)
- `items`: Array de OrderItem
- `deliveryAddress`: Objeto Address embebido
- `paymentMethod`: "cash" | "card" | "transfer"
- `subtotal`: Suma de items
- `deliveryFee`: Costo de envío
- `discount`: Monto descontado
- `discountCode`: Código aplicado (opcional)
- `total`: Monto final a pagar
- `status`: "pending" | "confirmed" | "preparing" | "ready" | "in_transit" | "delivered" | "cancelled"
- `paymentStatus`: "pending" | "paid" | "failed"
- `createdAt`: Fecha de creación
- `deliveredAt`: Fecha de entrega (nullable)

**Métodos:**
- `calculateTotal()`: Calcula subtotal + deliveryFee - discount
- `canBeCancelled()`: Retorna true si status es "pending" o "confirmed"

**Relaciones:**
- Pertenece a un User (N:1)
- Contiene múltiples OrderItems (1:N composición)
- Tiene una Address embebida (1:1 composición)

---

#### OrderItem (Item de Pedido)
Representa un producto dentro de un pedido con su cantidad y precio en el momento de la compra.

**Atributos:**
- `product`: Referencia a Product (ObjectId)
- `quantity`: Cantidad ordenada
- `price`: Precio unitario al momento del pedido (denormalizado para histórico)
- `subtotal`: quantity × price

**Relaciones:**
- Referencia a Product (N:1)
- Pertenece a Order (parte de composición)

---

#### Address (Dirección)
Objeto embebido dentro de Order que representa la dirección de entrega.

**Atributos:**
- `street`: Nombre de calle/avenida
- `number`: Número de domicilio
- `commune`: Comuna
- `city`: Ciudad
- `instructions`: Instrucciones especiales (opcional)

**Relaciones:**
- Embebido en Order (composición)

---

### Cardinalidades

| Relación | Cardinalidad | Tipo | Descripción |
|----------|--------------|------|-------------|
| User → Order | 1:N | Asociación | Un usuario puede tener 0 o más pedidos |
| Order → OrderItem | 1:N | Composición | Un pedido contiene 1 o más items |
| OrderItem → Product | N:1 | Asociación | Cada item referencia a 1 producto |
| Order → Address | 1:1 | Composición | Un pedido tiene exactamente 1 dirección de entrega |

---

### Coherencia con API Contracts

| Entidad | Endpoint API | Operación |
|---------|--------------|-----------|
| User | POST /api/auth/register | Crear usuario |
| User | POST /api/auth/login | Autenticar usuario |
| User | GET /api/auth/me | Obtener perfil |
| Product | GET /api/products | Listar productos |
| Product | GET /api/products/:id | Obtener producto |
| Product | POST /api/products | Crear producto (admin) |
| Order | POST /api/orders | Crear pedido |
| Order | GET /api/orders/my | Listar pedidos del usuario |
| Order | GET /api/orders/:id | Obtener detalle de pedido |
| Order | PUT /api/orders/:id/cancel | Cancelar pedido |
| Order | PUT /api/orders/:id/status | Actualizar estado (admin) |

---

## Criterio 8: Arquitectura de Componentes Backend

### Diagrama de Capas y Componentes

```mermaid
graph TB
    subgraph "Capa de Presentación - Frontend Móvil"
        A[HTML5 Pages<br/>B01-B21]
        B[JavaScript Modules<br/>api.js, auth.js, cart.js]
        C[CSS Responsive<br/>mobile.css]
    end

    subgraph "Protocolo de Comunicación"
        D[HTTP/HTTPS REST API<br/>JSON Format<br/>JWT Tokens]
    end

    subgraph "Capa de Aplicación - Backend Express"
        E[Express Server<br/>server.js]
        F[Routes<br/>auth.routes.js<br/>product.routes.js<br/>order.routes.js<br/>admin.routes.js]
        G[Middleware<br/>auth.middleware.js<br/>CORS<br/>express-validator]
        H[Controllers<br/>auth.controller.js<br/>product.controller.js<br/>order.controller.js<br/>admin.controller.js]
    end

    subgraph "Capa de Dominio"
        I[Models Mongoose<br/>User.js<br/>Product.js<br/>Order.js]
        J[Business Logic<br/>generateToken<br/>comparePassword<br/>calculateTotal]
    end

    subgraph "Capa de Persistencia"
        K[(MongoDB<br/>Database)]
    end

    A --> D
    B --> D
    D --> E
    E --> G
    G --> F
    F --> H
    H --> I
    H --> J
    I --> K
    J --> I

    style A fill:#A66B3A,color:#fff
    style B fill:#A66B3A,color:#fff
    style C fill:#A66B3A,color:#fff
    style D fill:#27965b,color:#fff
    style E fill:#d94a3b,color:#fff
    style K fill:#2b2b2b,color:#fff
```

### Descripción de Capas

#### 1. Capa de Presentación (Frontend Móvil)

**Componentes:**
- **HTML Pages (B01-B21)**: 21 páginas móvil-first con estructura semántica
- **JavaScript Modules**:
  - `api.js`: Cliente REST que encapsula llamadas HTTP
  - `auth.js`: Gestión de login, registro, tokens
  - `cart.js`: Lógica de carrito en localStorage
  - `products.js`: Catálogo y filtros
  - `orders.js`: Gestión de pedidos
  - `admin.js`: Panel administrativo
- **CSS Responsive**: Sistema de diseño mobile-first con breakpoints

**Responsabilidades:**
- Renderizar interfaz adaptativa
- Capturar interacciones del usuario (touch events)
- Validar datos en cliente antes de enviar
- Gestionar estado de aplicación (carrito, sesión)
- Manejar feedback visual (loaders, toasts, errores)

---

#### 2. Capa de Comunicación

**Protocolo:** HTTP/HTTPS REST

**Formato de Datos:** JSON

**Autenticación:** JWT (JSON Web Tokens)
- Token enviado en header: `Authorization: Bearer <token>`
- Payload incluye: `userId`, `role`, `exp`
- Firmado con `JWT_SECRET` del servidor

**Headers Típicos:**
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**CORS:** Configurado para permitir origen `http://localhost:5000`

---

#### 3. Capa de Aplicación (Backend Express)

##### 3.1 Express Server (`server.js`)
- Punto de entrada de la aplicación
- Configuración de middleware global (CORS, JSON parser, static files)
- Conexión a MongoDB
- Registro de rutas
- Manejo de errores global
- Documentación Swagger (futuro)

##### 3.2 Routes
Define los endpoints de la API y mapea a controladores:

- **`auth.routes.js`**: 
  - POST /api/auth/register
  - POST /api/auth/login
  - GET /api/auth/me

- **`product.routes.js`**:
  - GET /api/products
  - GET /api/products/:id
  - POST /api/products (admin)

- **`order.routes.js`**:
  - POST /api/orders
  - GET /api/orders/my
  - GET /api/orders/:id
  - PUT /api/orders/:id/cancel
  - PUT /api/orders/:id/status (admin)

- **`admin.routes.js`**:
  - GET /api/admin/stats
  - GET /api/admin/orders
  - GET /api/admin/sales

##### 3.3 Middleware

- **`auth.middleware.js`**:
  - `verifyToken`: Valida JWT y añade `req.user`
  - `verifyAdmin`: Verifica rol "admin"

- **CORS**: Permite solicitudes desde frontend

- **express-validator**: Validaciones de entrada en POST/PUT

- **express.json()**: Parser de body JSON

- **express.static()**: Servir archivos estáticos del Frontend

##### 3.4 Controllers
Contienen la lógica de negocio de cada endpoint:

- **`auth.controller.js`**:
  - `register`: Crear usuario, hashear password, generar token
  - `login`: Validar credenciales, generar token
  - `getProfile`: Retornar datos del usuario autenticado

- **`product.controller.js`**:
  - `getAllProducts`: Listar con filtros opcionales
  - `getProductById`: Detalle de producto
  - `createProduct`: Crear nuevo producto (admin)

- **`order.controller.js`**:
  - `createOrder`: Validar carrito, calcular total, crear pedido
  - `getUserOrders`: Pedidos del usuario autenticado
  - `getOrderById`: Detalle completo de pedido
  - `cancelOrder`: Cambiar estado a "cancelled" (con validaciones)
  - `updateOrderStatus`: Actualizar estado (admin)

- **`admin.controller.js`**:
  - `getStats`: Calcular métricas del dashboard
  - `getAllOrders`: Listar todos los pedidos (filtrable)
  - `getSalesData`: Datos para gráficos de ventas

---

#### 4. Capa de Dominio

**Models (Mongoose Schemas):**
- Define la estructura de datos en MongoDB
- Implementa validaciones a nivel de esquema
- Define hooks (pre-save, pre-find, etc.)
- Métodos de instancia y estáticos

**Business Logic:**
- `generateToken(user)`: Crea JWT con userId y role
- `comparePassword(password)`: Compara hash con bcrypt
- `calculateTotal()`: Lógica de cálculo de totales de pedido
- Validaciones de reglas de negocio (ej: no cancelar pedido en preparación)

---

#### 5. Capa de Persistencia

**MongoDB Database:**
- Base de datos NoSQL orientada a documentos
- Colecciones: `users`, `products`, `orders`
- Conexión vía Mongoose ODM
- URI: `mongodb://localhost:27017/mr-sandwich`

**Ventajas elegidas:**
- Flexibilidad de esquema para iteraciones rápidas
- Documentos embebidos (Address en Order) evitan JOINs
- Escalabilidad horizontal futura
- JSON nativo alineado con API REST

---

### Flujo de Datos Completo (Ejemplo: Crear Pedido)

```mermaid
sequenceDiagram
    participant U as Usuario Móvil<br/>(B11_Checkout.html)
    participant API as api.js<br/>(Frontend)
    participant S as Express Server
    participant M as auth.middleware
    participant C as order.controller
    participant O as Order Model
    participant DB as MongoDB

    U->>API: Confirmar Pedido<br/>(datos formulario)
    API->>API: Validar formulario
    API->>S: POST /api/orders<br/>Authorization: Bearer token
    S->>M: verifyToken()
    M->>M: Decodificar JWT
    M->>S: req.user = {userId, role}
    S->>C: createOrder(req, res)
    C->>C: Validar items, calcular total
    C->>O: new Order({...})
    O->>O: Validar esquema
    O->>DB: save()
    DB-->>O: Documento creado
    O-->>C: order object
    C-->>S: res.status(201).json(order)
    S-->>API: HTTP 201 + JSON order
    API-->>U: Redirigir a B12_Confirmacion_Pedido.html
    U->>U: Mostrar número de pedido
```

---

### Decisiones de Arquitectura

#### Separación de Responsabilidades

| Capa | Responsabilidad | NO hace |
|------|----------------|---------|
| Frontend | UI/UX, validación cliente, gestión de estado local | Lógica de negocio, acceso directo a DB |
| Routes | Definir endpoints, aplicar middleware | Lógica de negocio |
| Controllers | Orquestar operaciones, validar, responder | Acceso directo a DB (usa Models) |
| Models | Esquema de datos, validaciones, métodos de dominio | HTTP, autenticación |
| Database | Persistencia, consultas, índices | Lógica de aplicación |

#### Beneficios de la Arquitectura

1. **Mantenibilidad**: Cada capa tiene responsabilidades claras
2. **Testabilidad**: Controllers y Models son testeables independientemente
3. **Escalabilidad**: Fácil añadir nuevos endpoints o modelos
4. **Seguridad**: Middleware centralizado de autenticación/autorización
5. **Reutilización**: Models y Controllers reutilizables en otros contextos

---

### Tecnologías y Justificación

| Componente | Tecnología | Justificación |
|-----------|------------|---------------|
| Frontend | Vanilla JS | Simplicidad, no requiere build, compatible con curso |
| Backend | Node.js + Express | JavaScript full-stack, comunidad amplia, simple para APIs REST |
| Database | MongoDB | Flexible, JSON nativo, fácil integración con Node.js |
| Auth | JWT + bcrypt | Stateless, escalable, seguro (bcrypt 10 rounds) |
| Validation | express-validator | Integración nativa con Express, declarativo |
| ODM | Mongoose | Schemas, validaciones, middleware, abstracc ión de MongoDB |

---

### Manejo de Errores en Cada Nivel

```mermaid
graph LR
    A[Error en Frontend] -->|Try-Catch| B[Mostrar Toast de Error]
    C[Error en Controller] -->|res.status| D[JSON con error]
    E[Error en Model] -->|throw| C
    F[Error en DB] -->|Promise.catch| E
    
    style A fill:#d94a3b,color:#fff
    style C fill:#d94a3b,color:#fff
    style E fill:#d94a3b,color:#fff
    style F fill:#d94a3b,color:#fff
```

**Estrategia:**
1. **Frontend**: Try-catch en llamadas API, mostrar mensajes user-friendly
2. **Controllers**: Validar datos, manejar errores de models, responder con código HTTP apropiado
3. **Models**: Lanzar excepciones en validaciones fallidas
4. **Database**: Mongoose maneja errores de conexión y validación

---

**Versión:** 1.0.0  
**Fecha:** Diciembre 2025  
**Stack:** Node.js 24 + Express 4.18 + MongoDB 6 + Mongoose 7.5
