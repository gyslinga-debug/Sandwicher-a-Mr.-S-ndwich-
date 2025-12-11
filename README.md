# 🥪 Mr. Sandwich - Sistema de Pedidos en Línea

## Criterio 1: Contexto y Transferencia desde E-commerce de Sushi

### Caso Base: E-commerce de Sushi
El proyecto se fundamenta en el caso de estudio de e-commerce de sushi presentado en el curso, el cual establece los patrones y flujos de trabajo esenciales para un sistema de pedidos en línea de productos gastronómicos con entrega a domicilio.

### Transferencia Tecnológica al Caso Mr. Sandwich
Mr. Sandwich representa la aplicación directa de los conceptos, arquitectura y flujos del caso sushi, adaptados al contexto específico de una sandwichería:

**Conceptos Transferidos:**
- **Catálogo de productos**: Sistema de categorización y búsqueda adaptado de productos de sushi a sándwiches, acompañamientos y bebidas
- **Gestión de carrito**: Funcionalidad de agregar/modificar/eliminar productos antes de confirmar pedido
- **Proceso de pedido**: Flujo checkout → pago → confirmación → preparación → despacho
- **Sistema de usuarios**: Autenticación, perfiles, direcciones guardadas, historial de compras
- **Panel administrativo**: Gestión de productos, órdenes, estadísticas de ventas, estado de entregas

**Adaptaciones Específicas para Móvil:**
1. **Interfaz touch-first**: Diseño con botones mínimo 44x44px, navegación por gestos, bottom tab bar
2. **Contexto de uso móvil**: Pedidos on-the-go, notificaciones de estado, geolocalización para seguimiento
3. **Restricciones técnicas**: Optimización de imágenes, manejo de conectividad intermitente, localStorage para carrito persistente
4. **Ventajas competitivas**: Pedido rápido desde cualquier ubicación, seguimiento en tiempo real, notificaciones push (preparado para implementar)

**Flujo Completo Transferido:**
```
Usuario Móvil:
1. Navegar catálogo → 2. Agregar al carrito → 3. Checkout → 
4. Confirmar pedido → 5. Seguir estado → 6. Recibir entrega

Administrador:
1. Ver pedido → 2. Actualizar estado (preparando/listo/en tránsito) → 
3. Ver en mapa → 4. Marcar entregado
```

**Justificación de la Transferencia:**
- **Similitud de dominio**: Ambos son productos gastronómicos perecederos con entrega rápida
- **Mismo flujo de negocio**: Catálogo → Pedido → Pago → Preparación → Despacho
- **Contexto móvil idéntico**: Usuarios que piden comida desde sus dispositivos móviles esperando entrega a domicilio
- **Modelo de negocio análogo**: Venta directa con margen en productos + cargo por delivery

---

## Criterio 2: Modelo de Negocio y Segmentos de Usuarios

### Business Model Canvas

**Segmentos de Clientes:**
1. **Cliente Final (Consumidor)**
   - Profesionales jóvenes (25-45 años) que buscan almuerzo/cena rápida
   - Familias que desean comida casera sin cocinar
   - Estudiantes con presupuesto limitado buscando promociones

2. **Repartidor/Delivery**
   - Partner de entrega (propio o tercerizado)
   - Necesita información clara de direcciones y tiempos

3. **Administrador de Local**
   - Encargado de cocina que gestiona preparación de pedidos
   - Gerente que analiza ventas y optimiza inventario

### Jobs-to-be-Done Framework

**Cliente Final:**

**Jobs (Trabajos por realizar):**
- Pedir almuerzo/cena rápidamente sin llamar por teléfono
- Ver menú completo con precios y fotos antes de decidir
- Guardar direcciones frecuentes para no repetir datos
- Rastrear el estado de mi pedido en tiempo real
- Aplicar códigos de descuento y promociones

**Pains (Frustraciones):**
- Esperar en línea telefónica para hacer pedido
- No saber cuánto falta para que llegue mi pedido
- Escribir dirección completa cada vez
- Precios no claros (sorpresas al pagar)
- No poder modificar pedido una vez enviado

**Gains (Ganancias esperadas):**
- Hacer pedido en 2 minutos desde mi celular
- Ver tiempo estimado de entrega
- Recibir notificación cuando salga el delivery
- Acumular historial de pedidos favoritos
- Pagar con método preferido (efectivo/tarjeta/transferencia)

**Administrador:**

**Jobs:**
- Ver todos los pedidos pendientes en un solo lugar
- Actualizar estado de pedidos conforme avanzan
- Analizar ventas por día/semana/mes
- Gestionar inventario de productos
- Visualizar entregas activas en mapa

**Pains:**
- Coordinar múltiples pedidos simultáneos en papel
- No saber qué productos se venden más
- Perder pedidos por mala comunicación
- No poder priorizar entregas por zona

**Gains:**
- Dashboard centralizado de operaciones
- Estadísticas automáticas de ventas
- Sistema ordenado por estado (pending → preparing → ready → in_transit → delivered)
- Optimización de rutas de entrega visualizando mapa

### Propuesta de Valor
**Para el cliente móvil:**
- Pedido en menos de 3 minutos sin llamadas
- Menú visual con fotos de productos
- Seguimiento en tiempo real del pedido
- Historial y reorden rápido
- Múltiples métodos de pago

**Para el administrador:**
- Centralización de pedidos en un solo sistema
- Visibilidad completa del estado de operaciones
- Datos para toma de decisiones (productos más vendidos, horas peak)
- Reducción de errores en pedidos

### Modelo de Ingresos
1. **Venta de productos**: Margen del 60-70% en sándwiches y acompañamientos
2. **Cargo por delivery**: $2.990 por pedido (mínimo $10.000)
3. **Promociones estratégicas**: Cupones de descuento para fidelización (ej: 25MRSNDWCH = 25% off)

### Estructura de Costos
- Ingredientes y materiales (30-40% del precio venta)
- Personal de cocina y delivery
- Plataforma tecnológica (hosting, dominio, mantenimiento)
- Marketing digital y promociones

### Canales
- **Aplicación web móvil** (canal principal)
- Redes sociales para promociones
- Email/SMS para notificaciones de pedido

### Relación con Clientes
- Autoservicio mediante app móvil
- Soporte vía WhatsApp/email
- Programa de fidelización (futuro: puntos por compra)
- Notificaciones push de estado de pedido

### Conexión con Contexto Móvil
El modelo de negocio está diseñado específicamente para el contexto móvil:
- **Pedidos on-the-go**: Usuario pide desde trabajo, casa, calle
- **Geolocalización**: Cálculo automático de tiempos de entrega según ubicación
- **Notificaciones push**: Alertas de estado sin necesidad de revisar app constantemente
- **Persistencia offline**: Carrito guardado en localStorage (continuar pedido si se cierra app)
- **Touch-optimized checkout**: Formulario diseñado para completar rápido en pantalla móvil

---

**Versión:** 1.0.0  
**Fecha:** Diciembre 2025  
**Equipo:** Desarrollo Web Móvil
