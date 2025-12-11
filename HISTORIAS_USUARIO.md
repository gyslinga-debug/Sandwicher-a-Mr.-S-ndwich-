# Historias de Usuario INVEST+3C con Gherkin
## Criterio 4: Refinamiento de Requisitos y Especificación de Comportamiento

---

## HISTORIA 1: Explorar Catálogo de Productos

### Card (Descripción breve)
**Como** usuario móvil  
**Quiero** ver el catálogo completo de productos con fotos, precios y descripciones  
**Para** decidir qué pedir sin necesidad de llamar por teléfono

### Conversation (Detalles discutidos)
- El catálogo debe cargar en menos de 2 segundos en 4G
- Las imágenes deben estar optimizadas para móvil (max 200KB)
- Debe mostrar indicador de disponibilidad (agotado/disponible)
- Filtros: por categoría (Sándwiches, Acompañamientos, Bebidas) y rango de precio
- Búsqueda por texto en nombre/descripción del producto
- Vista grid en móvil (2 columnas), lista en tablet
- Debe funcionar offline mostrando productos cacheados

### Confirmation (Criterios de aceptación)

**Escenario 1: Listar productos exitosamente**
```gherkin
Given estoy en la página del catálogo (B07_Catalogo.html)
  And hay productos disponibles en el backend
When la página carga
Then debo ver una grilla de productos con imagen, nombre y precio
  And cada producto debe mostrar su estado de disponibilidad
  And debe haber un botón "Agregar al carrito" para cada producto
```

**Escenario 2: Filtrar productos por categoría**
```gherkin
Given estoy en el catálogo con 30 productos cargados
  And hay productos de 3 categorías diferentes
When hago clic en el filtro "Sándwiches"
Then solo debo ver productos de la categoría "Sándwiches"
  And el contador debe mostrar la cantidad de resultados
  And el botón de filtro debe aparecer activo visualmente
```

**Escenario 3: Buscar producto por nombre**
```gherkin
Given estoy en el catálogo con productos cargados
When escribo "pollo" en el campo de búsqueda
  And presiono Enter o hago clic en el botón buscar
Then debo ver solo productos cuyo nombre o descripción contenga "pollo"
  And si no hay resultados, debo ver mensaje "No se encontraron productos"
```

**Escenario 4: Error al cargar productos**
```gherkin
Given estoy en el catálogo
  And el backend no está disponible
When intento cargar los productos
Then debo ver un mensaje de error "No se pudieron cargar los productos"
  And debe haber un botón "Reintentar"
  And el spinner de carga debe detenerse
```

### Mockups Vinculados
- `B07_Catalogo.html` - Vista principal del catálogo
- `B08_Filtros_Busqueda.html` - Interfaz de filtros
- `B09_Detalle_Producto.html` - Vista detalle al hacer clic

### API Contract Vinculado
```
GET /api/products
Response 200: 
[
  {
    "_id": "...",
    "name": "Sándwich Italiano",
    "description": "Tomate, palta, mayo",
    "price": 4500,
    "category": "sandwiches",
    "image": "...",
    "available": true
  }
]
Response 500: { "error": "Error al obtener productos" }
```

### INVEST Check
- ✅ **Independent**: No depende de otras historias para funcionar
- ✅ **Negotiable**: Los detalles de filtros pueden ajustarse
- ✅ **Valuable**: Permite al usuario tomar decisión de compra informada
- ✅ **Estimable**: 3 puntos de historia (1 día desarrollo + testing)
- ✅ **Small**: Completable en 1 sprint
- ✅ **Testable**: Criterios de aceptación claros con Gherkin

### Definition of Ready
- ✅ Mockups de B07, B08, B09 completados
- ✅ API contract GET /api/products documentado
- ✅ Modelo Product definido en backend
- ✅ Diseño responsive aprobado (mobile-first)
- ✅ Criterios de aceptación definidos
- ✅ Dependencias identificadas: ninguna

---

## HISTORIA 2: Agregar Producto al Carrito

### Card
**Como** usuario móvil  
**Quiero** agregar productos al carrito y ver el total actualizado  
**Para** preparar mi pedido antes de hacer checkout

### Conversation
- El carrito debe persistir en localStorage (no se pierde al refrescar)
- Mostrar badge en ícono de carrito con cantidad de items
- Al agregar, mostrar feedback visual (toast "Producto agregado")
- Permitir modificar cantidad directamente desde el carrito
- Calcular subtotal automáticamente
- Botón "Vaciar carrito" con confirmación
- Responsive: carrito en modal bottom sheet en móvil

### Confirmation

**Escenario 1: Agregar producto exitosamente**
```gherkin
Given estoy viendo el detalle de un producto (B09_Detalle_Producto.html)
  And el producto está disponible
  And tengo 2 productos en mi carrito
When hago clic en "Agregar al carrito"
Then debo ver un mensaje "Producto agregado al carrito"
  And el badge del ícono de carrito debe mostrar "3"
  And el producto debe aparecer en mi carrito con cantidad 1
```

**Escenario 2: Modificar cantidad en carrito**
```gherkin
Given estoy en la página del carrito (B10_Carrito_de_Compras.html)
  And tengo un producto con cantidad 2
When hago clic en el botón "+" del selector de cantidad
Then la cantidad debe cambiar a 3
  And el subtotal del producto debe recalcularse (precio × 3)
  And el total general debe actualizarse
  And los cambios deben guardarse en localStorage
```

**Escenario 3: Eliminar producto del carrito**
```gherkin
Given estoy en el carrito con 3 productos
When hago clic en el botón "Eliminar" de un producto
  And confirmo la acción en el diálogo
Then el producto debe desaparecer del carrito
  And el total debe recalcularse sin ese producto
  And el badge del carrito debe decrementar
  And si el carrito queda vacío, debo ver mensaje "Tu carrito está vacío"
```

**Escenario 4: Carrito persiste después de refrescar**
```gherkin
Given he agregado 2 productos al carrito
  And cierro la pestaña del navegador
When vuelvo a abrir la aplicación
  And navego al carrito
Then debo ver los 2 productos que había agregado previamente
  And las cantidades deben ser las mismas
  And el total debe ser correcto
```

### Mockups Vinculados
- `B09_Detalle_Producto.html` - Botón "Agregar al carrito"
- `B10_Carrito_de_Compras.html` - Vista completa del carrito

### API Contract Vinculado
```
Nota: El carrito se maneja en frontend (localStorage)
No requiere API hasta el momento del checkout
```

### INVEST Check
- ✅ **Independent**: Funciona independiente del checkout
- ✅ **Negotiable**: Detalles de persistencia pueden cambiar
- ✅ **Valuable**: Esencial para proceso de compra
- ✅ **Estimable**: 2 puntos (medio día)
- ✅ **Small**: Completable en 1 sprint
- ✅ **Testable**: Escenarios Gherkin verificables

### Definition of Ready
- ✅ Mockup B10 completado
- ✅ Diseño de estructura localStorage definido
- ✅ Lógica de cálculo de totales especificada
- ✅ Criterios de validación (stock, cantidad mínima/máxima) definidos
- ✅ Sin dependencias bloqueantes

---

## HISTORIA 3: Completar Checkout y Crear Pedido

### Card
**Como** usuario móvil  
**Quiero** completar el proceso de pago ingresando mi dirección y método de pago  
**Para** confirmar mi pedido y recibir mi comida

### Conversation
- Formulario debe validar todos los campos antes de enviar
- Dirección: calle, número, comuna, ciudad, instrucciones opcionales
- Métodos de pago: efectivo, tarjeta, transferencia
- Aplicar código de descuento opcional (ej: 25MRSNDWCH)
- Calcular costo de delivery ($2.990)
- Mostrar resumen de pedido antes de confirmar
- Requerir autenticación (JWT token) para crear pedido
- Enviar email de confirmación (futuro)

### Confirmation

**Escenario 1: Completar checkout exitosamente**
```gherkin
Given estoy en la página de checkout (B11_Checkout.html)
  And tengo 3 productos en mi carrito ($12.000 subtotal)
  And estoy autenticado con un token válido
When completo el formulario de dirección correctamente
  And selecciono "Efectivo" como método de pago
  And hago clic en "Confirmar Pedido"
Then debo ver la página de confirmación (B12_Confirmacion_Pedido.html)
  And debo ver el número de pedido generado (ej: "MRS-123456")
  And debo ver el total final ($12.000 + $2.990 = $14.990)
  And el pedido debe crearse en el backend con estado "pending"
  And mi carrito debe vaciarse
```

**Escenario 2: Aplicar código de descuento válido**
```gherkin
Given estoy en checkout con subtotal $10.000
When ingreso el código "25MRSNDWCH" en el campo de cupón
  And hago clic en "Aplicar"
Then debo ver un mensaje "¡Cupón aplicado! 25% de descuento"
  And el descuento debe aparecer en el resumen (-$2.500)
  And el total debe recalcularse ($10.000 - $2.500 + $2.990 = $10.490)
  And el código debe enviarse al backend al crear el pedido
```

**Escenario 3: Error de validación en formulario**
```gherkin
Given estoy en checkout
When intento confirmar el pedido sin completar el campo "Calle"
Then debo ver un mensaje de error "Este campo es obligatorio" bajo el campo vacío
  And el campo debe marcarse con borde rojo
  And el botón "Confirmar Pedido" no debe enviar el formulario
  And debo permanecer en la misma página
```

**Escenario 4: Error al crear pedido (backend caído)**
```gherkin
Given estoy en checkout con formulario completo
  And el backend no está disponible
When hago clic en "Confirmar Pedido"
Then debo ver un mensaje de error "No se pudo procesar tu pedido. Intenta nuevamente."
  And debo permanecer en la página de checkout
  And mis datos del formulario no deben perderse
  And el carrito debe conservarse
```

**Escenario 5: Usuario no autenticado intenta checkout**
```gherkin
Given estoy en checkout
  And NO tengo un token de autenticación válido
When intento confirmar el pedido
Then debo ser redirigido a la página de login (B01_Inicio_Sesion.html)
  And debo ver un mensaje "Debes iniciar sesión para completar tu pedido"
  And mi carrito debe conservarse para después del login
```

### Mockups Vinculados
- `B11_Checkout.html` - Formulario de checkout
- `B12_Confirmacion_Pedido.html` - Página de confirmación

### API Contract Vinculado
```
POST /api/orders
Headers: { Authorization: "Bearer <jwt_token>" }
Request Body:
{
  "items": [
    { "product": "product_id", "quantity": 2, "price": 4500 }
  ],
  "deliveryAddress": {
    "street": "Av. Providencia",
    "number": "1234",
    "commune": "Providencia",
    "city": "Santiago",
    "instructions": "Depto 301"
  },
  "paymentMethod": "cash",
  "discount": 2500,
  "discountCode": "25MRSNDWCH"
}

Response 201:
{
  "order": {
    "_id": "...",
    "orderNumber": "MRS-123456",
    "total": 14990,
    "status": "pending",
    "createdAt": "2025-12-10T15:30:00Z"
  }
}

Response 400: { "error": "Validación fallida" }
Response 401: { "error": "Token inválido o expirado" }
Response 500: { "error": "Error al crear pedido" }
```

### INVEST Check
- ✅ **Independent**: Depende de carrito pero puede testearse independientemente
- ✅ **Negotiable**: Métodos de pago pueden ajustarse
- ✅ **Valuable**: Crítico para conversión
- ✅ **Estimable**: 5 puntos (2 días desarrollo + testing)
- ✅ **Small**: Completable en 1 sprint
- ✅ **Testable**: Múltiples escenarios Gherkin

### Definition of Ready
- ✅ Mockups B11 y B12 completados
- ✅ API contract POST /api/orders documentado
- ✅ Modelo Order definido en backend
- ✅ Middleware de autenticación implementado
- ✅ Lógica de validación de cupones definida
- ✅ Dependencias: Historia 2 (carrito) completada

---

## HISTORIA 4: Rastrear Estado del Pedido

### Card
**Como** usuario móvil  
**Quiero** ver el estado actual de mi pedido en tiempo real  
**Para** saber cuándo llegará mi comida sin tener que llamar

### Conversation
- Estados posibles: pending → confirmed → preparing → ready → in_transit → delivered
- Cada estado debe tener ícono y color distintivo
- Mostrar tiempo estimado de entrega al confirmar pedido
- Permitir ver historial completo de pedidos
- Opción de cancelar pedido (solo si estado es pending o confirmed)
- Vista detalle: productos, dirección, total, método de pago
- Botón para descargar boleta digital

### Confirmation

**Escenario 1: Ver estado de pedido activo**
```gherkin
Given tengo un pedido con número "MRS-123456"
  And el pedido está en estado "preparing"
When navego a la página de estado de entrega (B20_Estado_Entrega.html?id=MRS-123456)
Then debo ver el número de pedido "MRS-123456"
  And debo ver el estado "Preparando tu pedido" con ícono de cocina
  And debo ver una barra de progreso mostrando 50% completado
  And debo ver el tiempo estimado de entrega "20-30 minutos"
```

**Escenario 2: Ver historial de pedidos**
```gherkin
Given he realizado 5 pedidos en el último mes
  And estoy autenticado
When navego a "Historial de Pedidos" (B06_Historial_Pedidos.html)
Then debo ver una lista de mis 5 pedidos ordenados por fecha (más reciente primero)
  And cada pedido debe mostrar: número, fecha, total, estado
  And debe haber un botón "Ver Detalle" para cada pedido
```

**Escenario 3: Cancelar pedido exitosamente**
```gherkin
Given tengo un pedido en estado "confirmed"
  And estoy en la página de detalle del pedido
When hago clic en "Cancelar Pedido"
  And confirmo la cancelación en el diálogo
Then el estado del pedido debe cambiar a "cancelled"
  And debo ver un mensaje "Pedido cancelado exitosamente"
  And el pedido debe aparecer como cancelado en mi historial
  And debo recibir confirmación del backend (PUT /api/orders/:id/cancel)
```

**Escenario 4: Intentar cancelar pedido en preparación (error)**
```gherkin
Given tengo un pedido en estado "preparing"
  And estoy en la página de detalle del pedido
When intento hacer clic en "Cancelar Pedido"
Then el botón debe estar deshabilitado o no visible
  And debe haber un mensaje "No puedes cancelar pedidos en preparación"
```

**Escenario 5: Ver pedido en mapa (admin)**
```gherkin
Given soy un administrador autenticado
  And hay 3 pedidos en estado "in_transit"
When navego al mapa de pedidos (B21_Mapa_Pedidos.html)
Then debo ver un mapa con 3 marcadores
  And cada marcador debe tener color según estado (naranja = in_transit)
  And al hacer clic en un marcador debo ver: número pedido, dirección, cliente
  And debe haber un marcador para la ubicación del local
```

### Mockups Vinculados
- `B06_Historial_Pedidos.html` - Lista de pedidos
- `B14_Boleta_Digital.html` - Detalle completo con boleta
- `B20_Estado_Entrega.html` - Seguimiento en tiempo real
- `B21_Mapa_Pedidos.html` - Vista de mapa (admin)

### API Contracts Vinculados
```
GET /api/orders/my
Headers: { Authorization: "Bearer <jwt_token>" }
Response 200: [ ...lista de pedidos del usuario... ]

GET /api/orders/:id
Response 200: { ...detalle completo del pedido... }

PUT /api/orders/:id/cancel
Headers: { Authorization: "Bearer <jwt_token>" }
Response 200: { "message": "Pedido cancelado", "order": {...} }
Response 400: { "error": "No se puede cancelar pedido en este estado" }

GET /api/admin/orders (solo admin)
Response 200: [ ...todos los pedidos... ]
```

### INVEST Check
- ✅ **Independent**: Funciona independiente de checkout
- ✅ **Negotiable**: Estados pueden refinarse
- ✅ **Valuable**: Reduce llamadas de consulta, mejora UX
- ✅ **Estimable**: 5 puntos (2 días)
- ✅ **Small**: Completable en 1 sprint
- ✅ **Testable**: Múltiples escenarios claros

### Definition of Ready
- ✅ Mockups B06, B14, B20, B21 completados
- ✅ API contracts documentados
- ✅ Lógica de estados definida en modelo Order
- ✅ Reglas de negocio para cancelación definidas
- ✅ Dependencia: Historia 3 (crear pedido) completada

---

## HISTORIA 5: Gestionar Panel Administrativo

### Card
**Como** administrador del local  
**Quiero** ver un dashboard con estadísticas de ventas y gestionar estados de pedidos  
**Para** operar eficientemente y tomar decisiones basadas en datos

### Conversation
- Dashboard debe mostrar: ventas del día, pedidos activos, ingresos del mes, producto más vendido
- Lista de pedidos filtrable por estado
- Botón para actualizar estado de pedido (preparing → ready → in_transit → delivered)
- Gráficos de ventas por día/semana/mes
- Filtros por rango de fechas
- Caja virtual para registrar ventas en efectivo
- Solo accesible con rol "admin" (verificado en backend)

### Confirmation

**Escenario 1: Ver dashboard de administración**
```gherkin
Given soy un usuario con rol "admin"
  And estoy autenticado
When navego al dashboard (B16_Dashboard.html)
Then debo ver las siguientes estadísticas:
  | Métrica | Valor |
  | Ventas del día | $45.000 |
  | Pedidos activos | 8 |
  | Ingresos del mes | $1.200.000 |
  | Producto más vendido | Sándwich Italiano |
  And debo ver un gráfico de ventas de los últimos 7 días
  And debo ver botones de acceso rápido a: Órdenes, Gráficos, Caja, Mapa
```

**Escenario 2: Actualizar estado de pedido**
```gherkin
Given soy admin en la página de órdenes de despacho (B19_Ordenes_Despacho.html)
  And hay un pedido en estado "confirmed"
When hago clic en el botón "Estado" del pedido
  And selecciono "Preparando" del dropdown
  And hago clic en "Guardar"
Then el estado del pedido debe actualizarse a "preparing"
  And debo ver un mensaje "Estado actualizado exitosamente"
  And el pedido debe moverse visualmente a la sección "Preparando"
  And el backend debe recibir PUT /api/orders/:id/status
```

**Escenario 3: Ver gráficos de ventas con filtro de fechas**
```gherkin
Given soy admin en la página de gráficos (B17_Graficos_Ventas.html)
When selecciono fecha inicio "01/12/2025" y fecha fin "10/12/2025"
  And hago clic en "Aplicar Filtro"
Then debo ver un gráfico de barras con ventas diarias del 1 al 10 de diciembre
  And debo ver el total de ventas del período
  And debo ver el promedio de ventas por día
```

**Escenario 4: Usuario no admin intenta acceder**
```gherkin
Given soy un usuario con rol "customer"
  And estoy autenticado
When intento navegar a B16_Dashboard.html directamente
Then debo ser redirigido a la página de inicio (index.html)
  And debo ver un mensaje "No tienes permisos para acceder a esta sección"
  And el backend debe retornar 403 Forbidden en APIs de admin
```

**Escenario 5: Registrar venta en caja virtual**
```gherkin
Given soy admin en la caja virtual (B13_Caja_Virtual.html)
When selecciono productos manualmente para un pedido en local
  And selecciono método de pago "Efectivo"
  And ingreso monto recibido "$15.000" para total "$12.990"
Then debo ver el vuelto calculado "$2.010"
  And al confirmar la venta, debe crearse un pedido con estado "delivered"
  And debe actualizarse el total de ventas del día
```

### Mockups Vinculados
- `B13_Caja_Virtual.html` - Registro de ventas en local
- `B16_Dashboard.html` - Panel principal
- `B17_Graficos_Ventas.html` - Análisis visual
- `B18_Filtros_Fechas.html` - Filtros temporales
- `B19_Ordenes_Despacho.html` - Gestión de entregas

### API Contracts Vinculados
```
GET /api/admin/stats
Headers: { Authorization: "Bearer <admin_jwt_token>" }
Response 200:
{
  "todaySales": 45000,
  "activeOrders": 8,
  "monthRevenue": 1200000,
  "topProduct": { "name": "Sándwich Italiano", "sales": 45 }
}
Response 403: { "error": "Acceso denegado - se requiere rol admin" }

PUT /api/orders/:id/status
Headers: { Authorization: "Bearer <admin_jwt_token>" }
Request Body: { "status": "preparing" }
Response 200: { "order": {...} }
Response 400: { "error": "Estado inválido" }

GET /api/admin/sales?startDate=2025-12-01&endDate=2025-12-10
Response 200: [ { "date": "2025-12-01", "total": 35000 }, ... ]
```

### INVEST Check
- ✅ **Independent**: Funciona independiente de otras historias
- ✅ **Negotiable**: Métricas del dashboard pueden ajustarse
- ✅ **Valuable**: Crítico para operación eficiente
- ✅ **Estimable**: 8 puntos (3 días)
- ✅ **Small**: Completable en 1 sprint (aunque grande)
- ✅ **Testable**: Escenarios verificables con rol admin

### Definition of Ready
- ✅ Mockups B13, B16, B17, B18, B19 completados
- ✅ API contracts admin documentados
- ✅ Middleware de verificación de rol implementado
- ✅ Modelo de estadísticas definido
- ✅ Lógica de cálculo de métricas especificada
- ✅ Dependencia: Autenticación y roles funcionando

---

## Resumen de Cobertura

| Historia | Épica | Páginas | Prioridad | Puntos |
|----------|-------|---------|-----------|--------|
| H1: Explorar Catálogo | Épica 1 | B07, B08, B09 | ALTA | 3 |
| H2: Agregar al Carrito | Épica 2 | B09, B10 | ALTA | 2 |
| H3: Completar Checkout | Épica 2 | B11, B12 | CRÍTICA | 5 |
| H4: Rastrear Pedido | Épica 3 | B06, B14, B20, B21 | ALTA | 5 |
| H5: Panel Admin | Épica 4 | B13, B16-B19 | MEDIA | 8 |

**Total: 23 puntos de historia**

Todas las historias cumplen con:
- ✅ **INVEST** completo
- ✅ **3C Framework** aplicado (Card, Conversation, Confirmation)
- ✅ **Gherkin** con Given-When-Then para casos de éxito y error
- ✅ **DoR** (Definition of Ready) evidenciado
- ✅ Vinculación con mockups y API contracts
- ✅ Trazabilidad completa diseño → implementación

---

**Versión:** 1.0.0  
**Fecha:** Diciembre 2025
