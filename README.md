# README – Ejecución del Proyecto

## 1. Requisitos

- Docker  
- Docker Compose  
- Node.js (v18 o superior)  

## 2. Posicionarse en la raíz del proyecto

```bash
cd monitoreo-docker-prometheus-elk
```

## 3. Compilar y levantar el stack Docker

docker compose -f docker-compose.monitoring.yml up -d --build

## 4. Verificar que los contenedores estén activos

docker compose -f docker-compose.monitoring.yml ps

## 5. Ejecutar el script de pruebas

node test-monitoring.js