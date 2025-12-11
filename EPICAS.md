# Épicas y Objetivos de Negocio
## Criterio 3: Alineación de Historias Épicas con Objetivos Medibles

---

## ÉPICA 1: Gestión de Catálogo y Búsqueda de Productos

### Descripción
Permitir a los usuarios explorar el catálogo completo de productos (sándwiches, acompañamientos, bebidas) mediante navegación intuitiva, categorización clara, búsqueda por nombre, y filtros por precio/categoría. El sistema debe mostrar información detallada de cada producto incluyendo foto, descripción, ingredientes y precio.

### Valor de Negocio
Facilitar la exploración de productos aumenta la tasa de conversión y el ticket promedio al exponer al usuario a todo el menú disponible, no solo a sus favoritos habituales.

### Objetivos Medibles
- **Aumentar conversión de visitas a pedidos**: De 15% a 25% en 3 meses
- **Incrementar ticket promedio**: De $8.000 a $12.000 mediante cross-selling de acompañamientos
- **Reducir tasa de rebote**: De 40% a 20% en página de catálogo

### KPIs Asociados
| Métrica | Valor Actual | Meta 3 Meses | Forma de Medición |
|---------|--------------|--------------|-------------------|
| Tasa de conversión | 15% | 25% | (Pedidos / Visitas) × 100 |
| Ticket promedio | $8.000 | $12.000 | Total ventas / Número pedidos |
| Productos por pedido | 1.5 | 2.5 | Total items / Número pedidos |
| Tiempo promedio en catálogo | 45 seg | 90 seg | Analytics móvil |
| Uso de filtros | N/A | 30% de usuarios | Eventos tracking |

### Cobertura Funcional
- Navegación por categorías (Sándwiches, Acompañamientos, Bebidas, Promociones)
- Búsqueda por texto en nombre/descripción
- Filtros por rango de precio
- Vista detalle de producto con imagen, ingredientes, alergenos
- Sugerencias de productos relacionados

---

## ÉPICA 2: Proceso de Carrito, Checkout y Pago

### Descripción
Proporcionar un flujo de compra simple y rápido donde el usuario pueda agregar productos al carrito, modificar cantidades, aplicar códigos de descuento, ingresar dirección de entrega, seleccionar método de pago (efectivo/tarjeta/transferencia) y confirmar el pedido en menos de 3 minutos.

### Valor de Negocio
Un checkout optimizado reduce el abandono de carrito (principal causa de pérdida de ventas en e-commerce) y mejora la experiencia móvil, generando recompra y recomendaciones.

### Objetivos Medibles
- **Reducir abandono de carrito**: De 60% a 35% en 2 meses
- **Disminuir tiempo promedio de checkout**: De 5 minutos a 2.5 minutos
- **Aumentar uso de códigos de descuento**: De 5% a 20% de pedidos
- **Incrementar órdenes completadas**: +40% en primer trimestre

### KPIs Asociados
| Métrica | Valor Actual | Meta 3 Meses | Forma de Medición |
|---------|--------------|--------------|-------------------|
| Tasa de abandono de carrito | 60% | 35% | (Carritos no completados / Total carritos) × 100 |
| Tiempo promedio checkout | 5 min | 2.5 min | Timestamp confirmación - timestamp inicio |
| Pedidos con cupón aplicado | 5% | 20% | (Pedidos con descuento / Total pedidos) × 100 |
| Tasa de error en formularios | N/A | <5% | Validaciones fallidas / Intentos |
| Métodos de pago utilizados | N/A | Efectivo 60%, Tarjeta 30%, Transfer 10% | Distribución por tipo |

### Cobertura Funcional
- Agregar/modificar/eliminar productos del carrito
- Cálculo automático de subtotal + delivery
- Aplicación de códigos promocionales (ej: 25MRSNDWCH = 25% descuento)
- Formulario de dirección con autocompletado de direcciones guardadas
- Selección de método de pago
- Resumen de pedido pre-confirmación
- Validación de datos antes de enviar

---

## ÉPICA 3: Sistema de Seguimiento de Pedidos en Tiempo Real

### Descripción
Permitir a los clientes rastrear el estado de su pedido desde la confirmación hasta la entrega, mostrando claramente las etapas: Confirmado → Preparando → Listo → En Tránsito → Entregado. Incluir tiempo estimado de entrega y posibilidad de ver ubicación del repartidor en mapa (para pedidos en tránsito).

### Valor de Negocio
La visibilidad del estado del pedido reduce llamadas de consulta al local, mejora la percepción de profesionalismo, y aumenta la satisfacción del cliente (NPS), generando recompra.

### Objetivos Medibles
- **Aumentar NPS (Net Promoter Score)**: De 40 a 65 en 6 meses
- **Reducir llamadas de consulta "¿dónde está mi pedido?"**: De 30 llamadas/día a 5 llamadas/día
- **Incrementar tasa de recompra**: De 20% a 35% en 4 meses
- **Mejorar calificación de servicio**: De 3.8/5 a 4.5/5 estrellas

### KPIs Asociados
| Métrica | Valor Actual | Meta 6 Meses | Forma de Medición |
|---------|--------------|--------------|-------------------|
| NPS | 40 | 65 | Encuesta post-entrega "Recomendarías 0-10" |
| Llamadas de consulta/día | 30 | 5 | Registro de llamadas entrantes |
| Tasa de recompra | 20% | 35% | (Clientes con 2+ pedidos / Total clientes) × 100 |
| Calificación promedio | 3.8/5 | 4.5/5 | Promedio ratings post-entrega |
| Tiempo real de entrega vs estimado | +15 min | ±5 min | Desviación promedio |

### Cobertura Funcional
- Página de confirmación con número de pedido y tiempo estimado
- Historial de pedidos con acceso a detalles
- Estados visibles: pending, confirmed, preparing, ready, in_transit, delivered
- Mapa de seguimiento en tiempo real (B21_Mapa_Pedidos.html)
- Opción de cancelar pedido (hasta estado "preparing")
- Boleta digital descargable

---

## ÉPICA 4: Panel de Administración y Gestión Operativa

### Descripción
Proporcionar a los administradores un dashboard centralizado para gestionar productos, visualizar pedidos en tiempo real, actualizar estados de órdenes, analizar estadísticas de ventas por período, y monitorear entregas activas en un mapa interactivo. Incluir registro de caja virtual para control de pagos en efectivo.

### Valor de Negocio
La eficiencia operativa reduce tiempos de preparación, minimiza errores, optimiza rutas de entrega y permite toma de decisiones basada en datos, aumentando la rentabilidad del negocio.

### Objetivos Medibles
- **Reducir tiempo promedio de preparación**: De 25 min a 15 min por pedido
- **Disminuir errores en pedidos**: De 8% a 2%
- **Aumentar eficiencia de entregas**: De 4 entregas/hora a 6 entregas/hora por repartidor
- **Incrementar margen operativo**: De 15% a 22% mediante optimización

### KPIs Asociados
| Métrica | Valor Actual | Meta 3 Meses | Forma de Medición |
|---------|--------------|--------------|-------------------|
| Tiempo promedio preparación | 25 min | 15 min | Timestamp "ready" - timestamp "confirmed" |
| Tasa de error en pedidos | 8% | 2% | (Pedidos con reclamo / Total pedidos) × 100 |
| Entregas por hora/repartidor | 4 | 6 | Total entregas / Horas trabajadas / Repartidores |
| Margen operativo | 15% | 22% | (Ingresos - Costos) / Ingresos × 100 |
| Productos más vendidos | N/A | Top 10 identificado | Ranking por cantidad vendida |

### Cobertura Funcional
- Dashboard con métricas clave (ventas día, pedidos activos, ingresos mes)
- Lista de órdenes de despacho filtrable por estado
- Actualización de estado de pedidos (botón "Marcar como Listo", etc.)
- Mapa interactivo de entregas activas con colores por estado
- Gráficos de ventas por día/semana/mes
- Filtros por rango de fechas
- Caja virtual para registro de ventas en efectivo
- Gestión de productos (agregar/editar/eliminar - futuro)

---

## ÉPICA 5: Programa de Fidelización y Retención de Clientes

### Descripción
Implementar sistema de cupones de descuento, promociones recurrentes, y notificaciones personalizadas para incentivar la recompra. Incluir códigos promocionales (ej: 25MRSNDWCH = 25% descuento), ofertas por temporada, y descuentos por volumen.

### Valor de Negocio
Aumentar el Customer Lifetime Value (CLTV) mediante estrategias de retención es 5-7 veces más rentable que adquirir nuevos clientes. Un cliente fidelizado genera compras recurrentes y recomendaciones orgánicas.

### Objetivos Medibles
- **Aumentar frecuencia de compra**: De 1.5 pedidos/mes a 3 pedidos/mes por cliente activo
- **Incrementar CLTV (Customer Lifetime Value)**: De $45.000 a $85.000 en 12 meses
- **Mejorar tasa de retención**: De 30% a 50% (clientes que compran 2+ veces)
- **Aumentar referidos orgánicos**: De 5% a 15% de nuevos clientes vía recomendación

### KPIs Asociados
| Métrica | Valor Actual | Meta 12 Meses | Forma de Medición |
|---------|--------------|---------------|-------------------|
| Frecuencia de compra | 1.5/mes | 3/mes | Pedidos por cliente / Meses activo |
| CLTV | $45.000 | $85.000 | Valor total pedidos cliente / Tiempo desde primer pedido |
| Tasa de retención | 30% | 50% | (Clientes mes N que compraron en mes N-1) / Total clientes mes N-1 × 100 |
| Clientes por referido | 5% | 15% | (Nuevos clientes con código referido / Total nuevos) × 100 |
| Uso de cupones recurrente | N/A | 40% | Clientes que usan 2+ cupones / Total clientes |

### Cobertura Funcional
- Sistema de códigos promocionales aplicables en checkout
- Cupones de bienvenida para nuevos usuarios
- Descuentos por volumen (ej: gasta $20.000 y obtén $3.000 off)
- Notificaciones de promociones (email/SMS - futuro)
- Historial de cupones usados por cliente
- Panel admin para crear/gestionar cupones

---

## Resumen de Cobertura de Procesos Críticos

| Proceso Crítico | Épicas que lo Cubren | Páginas Implementadas |
|----------------|---------------------|----------------------|
| **Navegación y búsqueda de productos** | Épica 1 | B07, B08, B09 |
| **Gestión de carrito** | Épica 2 | B10 |
| **Checkout y pago** | Épica 2 | B11, B12 |
| **Seguimiento de pedidos** | Épica 3 | B06, B14, B20, B21 |
| **Gestión de perfiles** | Todas | B01, B02, B03, B04, B05 |
| **Panel administrativo** | Épica 4 | B13, B16, B17, B18, B19, B21 |
| **Fidelización** | Épica 5 | B10, B11 (códigos descuento) |

---

## Visión Estratégica

Las 5 épicas definidas cubren el ciclo completo de valor tanto para el cliente (descubrimiento → compra → seguimiento → recompra) como para el negocio (operación eficiente → datos para decisiones → retención de clientes).

La estrategia prioriza:
1. **Corto plazo (Mes 1-3)**: Épicas 1, 2, 3 - Producto funcional básico
2. **Mediano plazo (Mes 4-6)**: Épica 4 - Optimización operativa
3. **Largo plazo (Mes 7-12)**: Épica 5 - Crecimiento sostenible

Cada épica tiene métricas claras que permiten medir su impacto real en el negocio, garantizando que el desarrollo tecnológico esté alineado con objetivos comerciales concretos.

---

**Versión:** 1.0.0  
**Fecha:** Diciembre 2025
