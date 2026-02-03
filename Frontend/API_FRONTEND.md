# API WMS - Documentación para Frontend

## Base URL
```
http://localhost:3000
```

---

# 📥 MÓDULO INGRESO (Entrada de productos)

## Validación Individual

### GET `/api/movil/ordenes/por-validar`
Obtiene órdenes con productos pendientes de validar.

**Response:**
```json
[
  {
    "id": 1,
    "nroDocumento": "ING-2024-001",
    "estado": 0,
    "estadoNombre": "PALETIZADO",
    "detalles": [
      {
        "id": 123,
        "codItem": "FARM-001",
        "cantidad": 100,
        "estado": 0,
        "estadoNombre": "PENDIENTE",
        "item": { "codigo": "FARM-001", "descripcion": "Paracetamol 500mg" }
      }
    ],
    "resumen": {
      "totalDetalles": 3,
      "pendientes": 2,
      "validados": 1,
      "almacenados": 0
    }
  }
]
```

---

### POST `/api/movil/iniciar-validacion`
Captura timestamp de inicio de validación.

**Body:**
```json
{
  "detalleId": 123,
  "usuario": "OPERADOR_1"
}
```

**Response:**
```json
{
  "exito": true,
  "mensaje": "Validación iniciada para el item Paracetamol 500mg",
  "detalle": { "id": 123, "codItem": "FARM-001" },
  "inicioValidacion": "2024-01-15T10:30:00.000Z"
}
```

---

### POST `/api/movil/validar-detalle`
Valida un producto con la cantidad recibida.

**Body:**
```json
{
  "detalleId": 123,
  "cantidadRecibida": 100,
  "usuario": "OPERADOR_1"
}
```

**Response:**
```json
{
  "exito": true,
  "mensaje": "Detalle validado correctamente",
  "detalle": {
    "id": 123,
    "codItem": "FARM-001",
    "cantidadRecibida": 100,
    "estado": "VALIDADO",
    "tiempoValidacion": 45
  },
  "orden": { "id": 1, "nroDocumento": "ING-2024-001", "estado": "PARCIAL" },
  "siguientePaso": "Almacenaje"
}
```

---

### GET `/api/movil/ordenes/por-almacenar`
Obtiene órdenes con productos listos para almacenar.

**Response:** Similar a `/por-validar`, solo muestra detalles con estado VALIDADO.

---

### POST `/api/movil/iniciar-almacenaje`
Captura timestamp de inicio de almacenaje.

**Body:**
```json
{
  "detalleId": 123,
  "usuario": "OPERADOR_2"
}
```

---

### POST `/api/movil/almacenar-detalle`
Almacena un producto en una ubicación.

**Body:**
```json
{
  "detalleId": 123,
  "ubicacion": "A-01-02-03",
  "usuario": "OPERADOR_2"
}
```

**Response:**
```json
{
  "exito": true,
  "mensaje": "Detalle almacenado correctamente en A-01-02-03",
  "detalle": {
    "id": 123,
    "ubicacionFinal": "A-01-02-03",
    "estado": "ALMACENADO",
    "tiempoAlmacenaje": 120
  },
  "stock": { "item": "FARM-001", "ubicacion": "A-01-02-03", "cantidad": 100 }
}
```

---

### GET `/api/movil/metricas-operario/:usuarioId`
Estadísticas de productividad del operario.

**Response:**
```json
{
  "usuario": "OPERADOR_1",
  "validaciones": { "total": 150, "tiempoPromedio": 45, "tiempoMin": 12, "tiempoMax": 180 },
  "almacenajes": { "total": 145, "tiempoPromedio": 68, "tiempoMin": 25, "tiempoMax": 240 }
}
```

---

# 📦 MÓDULO SALIDA (Órdenes de salida)

### GET `/api/salida/ordenes`
Lista todas las órdenes de salida.

**Query params:** `?estado=0` (opcional, filtra por estado)

**Response:**
```json
[
  {
    "id": 1,
    "nroDocumento": "OS-2024-001",
    "cliente": "Farmacia San José",
    "destino": "Av. Principal 123",
    "prioridad": 1,
    "estado": 0,
    "estadoNombre": "PENDIENTE",
    "detalles": [...],
    "resumen": { "totalDetalles": 2, "pendientes": 2, "pickeados": 0 }
  }
]
```

---

### GET `/api/salida/ordenes/:id`
Detalle de una orden específica.

---

### POST `/api/salida/ordenes`
Crea una orden de salida manualmente.

**Body:**
```json
{
  "nroDocumento": "OS-2024-005",
  "cliente": "Mi Cliente",
  "destino": "Dirección de entrega",
  "prioridad": 2,
  "almacenCodigo": "ALM-CENT",
  "observacion": "Notas opcionales",
  "detalles": [
    { "codItem": "FARM-001", "cantidad": 10 },
    { "codItem": "ELEC-001", "cantidad": 5 }
  ]
}
```

---

### POST `/api/salida/importar`
Simula importación desde sistema ERP externo.

**Body:**
```json
{
  "nroDocumento": "ERP-2024-100",
  "cliente": "Cliente ERP",
  "destino": "Dirección",
  "prioridad": 1,
  "almacenCodigo": "ALM-CENT",
  "items": [
    { "codigo": "FARM-001", "cantidad": 50 }
  ]
}
```

---

# 🏃 MÓDULO PICKING (Recogida de productos)

### GET `/api/picking/ordenes/pendientes`
Órdenes listas para picking.

**Response:**
```json
[
  {
    "id": 1,
    "nroDocumento": "OS-2024-001",
    "cliente": "Farmacia San José",
    "prioridad": 1,
    "estadoNombre": "PENDIENTE",
    "detalles": [
      {
        "id": 1,
        "codItem": "FARM-001",
        "cantidadSolicitada": 20,
        "ubicacionOrigen": "A-01-01-01",
        "estadoNombre": "PENDIENTE",
        "item": { "descripcion": "Paracetamol 500mg" }
      }
    ],
    "resumen": { "totalDetalles": 2, "pendientes": 2, "pickeados": 0 }
  }
]
```

---

### POST `/api/picking/iniciar-orden`
Inicia el picking de una orden.

**Body:**
```json
{
  "ordenId": 1,
  "usuario": "PICKER_1"
}
```

**Response:**
```json
{
  "exito": true,
  "mensaje": "Picking iniciado para orden OS-2024-001",
  "orden": { "id": 1, "nroDocumento": "OS-2024-001", "estado": "EN_PICKING" }
}
```

---

### POST `/api/picking/iniciar-detalle`
Captura tiempo de inicio para un item.

**Body:**
```json
{
  "detalleId": 1,
  "usuario": "PICKER_1"
}
```

---

### POST `/api/picking/pickear-detalle`
Confirma recogida de un producto.

**Body:**
```json
{
  "detalleId": 1,
  "cantidadPickeada": 20,
  "usuario": "PICKER_1"
}
```

**Response:**
```json
{
  "exito": true,
  "mensaje": "Item pickeado correctamente",
  "detalle": {
    "id": 1,
    "codItem": "FARM-001",
    "cantidadPickeada": 20,
    "estado": "PICKEADO",
    "tiempoPicking": 35
  },
  "orden": { "id": 1, "nroDocumento": "OS-2024-001", "estado": "EN_PICKING" }
}
```

---

### POST `/api/picking/completar-orden`
Finaliza el picking de una orden.

**Body:**
```json
{
  "ordenId": 1,
  "usuario": "PICKER_1"
}
```

**Response:**
```json
{
  "exito": true,
  "mensaje": "Picking completado para orden OS-2024-001",
  "orden": {
    "id": 1,
    "nroDocumento": "OS-2024-001",
    "estado": "COMPLETADA",
    "pickingStartedAt": "2024-01-15T10:00:00.000Z",
    "pickingCompletedAt": "2024-01-15T10:15:00.000Z"
  },
  "siguientePaso": "Despacho"
}
```

---

### GET `/api/picking/metricas/:usuarioId`
Estadísticas del picker.

**Response:**
```json
{
  "usuario": "PICKER_1",
  "picking": { "total": 200, "tiempoPromedio": 35, "tiempoMin": 10, "tiempoMax": 120 }
}
```

---

# Estados

| Módulo | Estado | Valor | Descripción |
|--------|--------|-------|-------------|
| OrdenIngreso | PALETIZADO | 0 | Recién llegada |
| OrdenIngreso | VALIDADO | 1 | Todos validados |
| OrdenIngreso | ALMACENADO | 2 | Todos almacenados |
| OrdenIngreso | ANULADO | 3 | Cancelada |
| OrdenIngreso | PARCIAL | 5 | En proceso |
| DetalleIngreso | PENDIENTE | 0 | Sin validar |
| DetalleIngreso | VALIDADO | 1 | Validado |
| DetalleIngreso | ALMACENADO | 2 | En ubicación |
| OrdenSalida | PENDIENTE | 0 | Lista para picking |
| OrdenSalida | EN_PICKING | 1 | En proceso |
| OrdenSalida | COMPLETADA | 2 | Picking terminado |
| OrdenSalida | DESPACHADA | 3 | Entregada |
| DetalleSalida | PENDIENTE | 0 | Sin pickear |
| DetalleSalida | PICKEADO | 1 | Recogido |
