# Panel Administrativo de Optimización de Transporte Público

Aplicación web orientada a la gestión, monitoreo y visualización del sistema de transporte público basado en GPS.

## 🌐 Demo en Vivo
La aplicación se encuentra desplegada y accesible en la siguiente URL:
👉 [**https://gps-based-transit-optimization.onlinestornsoftware.win/**](https://gps-based-transit-optimization.onlinestornsoftware.win/)

## 📌 Descripción
Este sistema permite a los administradores supervisar en tiempo real el estado de las unidades de transporte, gestionar rutas y analizar información relevante para la toma de decisiones.

Actúa como interfaz de interacción con la API backend, facilitando el control y la visualización de los datos procesados.

## 🧠 Enfoque de Desarrollo
El frontend está diseñado siguiendo buenas prácticas modernas de desarrollo:

- Separación de responsabilidades
- Componentización reutilizable
- Integración eficiente con servicios backend
- Enfoque en rendimiento y experiencia de usuario

## 🛠️ Tecnologías Utilizadas
- **React** para la construcción de interfaces de usuario
- **Next.js** como framework para renderizado y optimización
- Consumo de API REST para la interacción con el backend
- Integración con herramientas de visualización geográfica (mapas)

## ⚙️ Funcionalidades Principales
- Visualización en tiempo real de unidades de transporte
- Gestión de rutas y vehículos
- Monitoreo de ubicaciones GPS
- Panel de control administrativo
- Visualización de métricas y datos operativos

## 🎯 Objetivo
Brindar una herramienta intuitiva y eficiente para la administración del sistema de transporte, permitiendo una mejor supervisión y toma de decisiones basada en datos.

## 📌 Estado del Proyecto
Proyecto en desarrollo como parte de una propuesta de tesis orientada a la optimización del transporte público mediante tecnologías web y geolocalización.

## 🔐 Variables de entorno
1. Copia el archivo de ejemplo:
   - `cp .env.example .env`
2. Ajusta los valores para tu entorno.

Variables actuales:
- `NEXT_PUBLIC_API_BASE_URL`: URL base de la API backend (ejemplo local: `http://localhost:4000`).

## 🚀 CI/CD
- Rama de integración: `develop`.
- Rama de producción: `main`/`master`.
- CI corre en PR/push a `develop`, `main`, `master`.
- CD despliega automáticamente al hacer merge/push a `main` o `master`.

Secrets requeridos en GitHub Actions:
- `VPS_HOST`
- `VPS_USER`
- `VPS_PORT`
- `VPS_SSH_KEY`
- `FRONTEND_APP_PATH`
- `FRONTEND_PORT` (recomendado `3000`)
- `NEXT_PUBLIC_API_BASE_URL` (URL pública del backend)
