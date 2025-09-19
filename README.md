# bori-cano-chat-v4
# 🦆 Borí Cano Chat - Tu Concierge Virtual Boricua

<div align="center">
  <img src="https://static.wixstatic.com/media/86b1c8_2d816491cf534b53b2b2bac9ac0a558f~mv2.png" alt="Borí Cano Logo" width="200"/>
  
  [![Deploy Status](https://img.shields.io/badge/deploy-active-brightgreen)](https://your-deployment-url.com)
  [![Version](https://img.shields.io/badge/version-3.8.0-blue)](#)
  [![Language](https://img.shields.io/badge/languages-ES%20%7C%20EN-orange)](#)
</div>

## 🌴 Descripción

**Borí Cano Chat** es una aplicación web interactiva que presenta a Borí Cano, tu guía pelícano virtual en Puerto Rico. Esta experiencia digital combina tecnología de IA conversacional con información turística local, ofreciendo un concierge virtual para Vista Pelícano en Isleta Marina, Fajardo.

### ✨ Características Principales

- 🎤 **Chat de Voz en Tiempo Real** - Conversaciones naturales con IA usando ElevenLabs
- 🌐 **Interfaz Bilingüe** - Soporte completo en español e inglés
- 🏨 **Información Turística** - Detalles sobre Vista Pelícano, Harbor Café y aventuras locales
- 📱 **Diseño Responsivo** - Optimizado para móviles y desktop
- 🎵 **Experiencia Multimedia** - Música de fondo con karaoke sincronizado
- 🛍️ **Borí Shop** - Catálogo curado de aventuras en Puerto Rico

## 🏗️ Estructura del Proyecto

```
bori-cano-chat-v4/
├── 📄 index.html          # Landing page principal (ES)
├── 📄 index_EN.html       # Landing page en inglés  
├── 📄 chat.html           # Interfaz de chat con IA
├── 🎨 index.css           # Estilos principales
├── 📄 metadata.json       # Metadatos del proyecto
├── 🐳 Dockerfile          # Configuración de contenedor
├── ☁️ cloudbuild.yaml     # Pipeline de CI/CD
├── 🌐 nginx.conf          # Configuración del servidor
└── 📂 public/
    └── 📂 borishop/       # Catálogo de aventuras
        ├── 📄 index.html
        ├── 🎨 borishop.css
        ├── 📄 adrenalina.html
        ├── 📄 exploracion-rios.html
        ├── 📄 magia-submarino.html
        └── 📄 playa-navegacion.html
```

## 🚀 Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **IA Conversacional**: [ElevenLabs ConvAI Widget](https://elevenlabs.io/)
- **Containerización**: Docker + Nginx
- **Deployment**: Google Cloud Build + Cloud Run
- **Fonts**: Google Fonts (Poppins, Fredoka One)
- **Assets**: Wix Media CDN

## 📋 Funcionalidades

### 🎯 Página Principal
- Hero section con carrusel de imágenes
- Presentación de Borí Cano con video interactivo
- Información sobre Vista Pelícano y Harbor Café
- Testimonios de huéspedes
- Integración con WhatsApp y Airbnb

### 💬 Chat Interactivo
- Conversaciones de voz en tiempo real
- Client tools para mostrar imágenes y videos
- Música de fondo con sistema de karaoke
- Interfaz responsive con controles de audio

### 🛍️ Borí Shop
- Catálogo de aventuras categorizadas:
  - 🏄 Adrenalina Extrema (ATV, zipline)
  - 🏖️ Día de Playa y Navegación
  - 🌿 Exploración y Ríos (El Yunque)
  - 🤿 Magia y Descubrimiento Submarino
- Integración con Viator para reservas

## 🛠️ Instalación y Desarrollo

### Requisitos Previos
- Node.js (opcional, para desarrollo local)
- Docker (para containerización)
- Google Cloud SDK (para deployment)

### Desarrollo Local

1. **Clona el repositorio**
```bash
git clone https://github.com/tu-usuario/bori-cano-chat-v4.git
cd bori-cano-chat-v4
```

2. **Ejecuta un servidor local**
```bash
# Con Python
python -m http.server 8080

# Con Node.js (npx)
npx serve -p 8080

# Con Live Server (VS Code extension)
# Click derecho > "Open with Live Server"
```

3. **Accede a la aplicación**
- Página principal: `http://localhost:8080`
- Chat: `http://localhost:8080/chat.html`
- Borí Shop: `http://localhost:8080/public/borishop/`

### 🐳 Docker

```bash
# Construir imagen
docker build -t bori-cano-chat .

# Ejecutar contenedor
docker run -p 8080:8080 bori-cano-chat
```

## ☁️ Deployment

El proyecto utiliza Google Cloud Build para CI/CD automático:

```bash
# Deploy manual
gcloud builds submit --config cloudbuild.yaml
```

### Variables de Entorno
- `PROJECT_ID`: ID del proyecto en Google Cloud
- `SHORT_SHA`: Hash corto del commit (automático)

## 🔧 Configuración

### ElevenLabs Agent
El chat utiliza el agent ID: `agent# 🦆 Borí Cano Chat - Tu Concierge Virtual Boricua

<div align="center">
  <img src="https://static.wixstatic.com/media/86b1c8_2d816491cf534b53b2b2bac9ac0a558f~mv2.png" alt="Borí Cano Logo" width="200"/>
  
  [![Deploy Status](https://img.shields.io/badge/deploy-active-brightgreen)](https://your-deployment-url.com)
  [![Version](https://img.shields.io/badge/version-3.8.0-blue)](#)
  [![Language](https://img.shields.io/badge/languages-ES%20%7C%20EN-orange)](#)
</div>

## 🌴 Descripción

**Borí Cano Chat** es una aplicación web interactiva que presenta a Borí Cano, tu guía pelícano virtual en Puerto Rico. Esta experiencia digital combina tecnología de IA conversacional con información turística local, ofreciendo un concierge virtual para Vista Pelícano en Isleta Marina, Fajardo.

### ✨ Características Principales

- 🎤 **Chat de Voz en Tiempo Real** - Conversaciones naturales con IA usando ElevenLabs
- 🌐 **Interfaz Bilingüe** - Soporte completo en español e inglés
- 🏨 **Información Turística** - Detalles sobre Vista Pelícano, Harbor Café y aventuras locales
- 📱 **Diseño Responsivo** - Optimizado para móviles y desktop
- 🎵 **Experiencia Multimedia** - Música de fondo con karaoke sincronizado
- 🛍️ **Borí Shop** - Catálogo curado de aventuras en Puerto Rico

## 🏗️ Estructura del Proyecto

```
bori-cano-chat-v4/
├── 📄 index.html          # Landing page principal (ES)
├── 📄 index_EN.html       # Landing page en inglés  
├── 📄 chat.html           # Interfaz de chat con IA
├── 🎨 index.css           # Estilos principales
├── 📄 metadata.json       # Metadatos del proyecto
├── 🐳 Dockerfile          # Configuración de contenedor
├── ☁️ cloudbuild.yaml     # Pipeline de CI/CD
├── 🌐 nginx.conf          # Configuración del servidor
└── 📂 public/
    └── 📂 borishop/       # Catálogo de aventuras
        ├── 📄 index.html
        ├── 🎨 borishop.css
        ├── 📄 adrenalina.html
        ├── 📄 exploracion-rios.html
        ├── 📄 magia-submarino.html
        └── 📄 playa-navegacion.html
```

## 🚀 Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **IA Conversacional**: [ElevenLabs ConvAI Widget](https://elevenlabs.io/)
- **Containerización**: Docker + Nginx
- **Deployment**: Google Cloud Build + Cloud Run
- **Fonts**: Google Fonts (Poppins, Fredoka One)
- **Assets**: Wix Media CDN

## 📋 Funcionalidades

### 🎯 Página Principal
- Hero section con carrusel de imágenes
- Presentación de Borí Cano con video interactivo
- Información sobre Vista Pelícano y Harbor Café
- Testimonios de huéspedes
- Integración con WhatsApp y Airbnb

### 💬 Chat Interactivo
- Conversaciones de voz en tiempo real
- Client tools para mostrar imágenes y videos
- Música de fondo con sistema de karaoke
- Interfaz responsive con controles de audio

### 🛍️ Borí Shop
- Catálogo de aventuras categorizadas:
  - 🏄 Adrenalina Extrema (ATV, zipline)
  - 🏖️ Día de Playa y Navegación
  - 🌿 Exploración y Ríos (El Yunque)
  - 🤿 Magia y Descubrimiento Submarino
- Integración con Viator para reservas

## 🛠️ Instalación y Desarrollo

### Requisitos Previos
- Node.js (opcional, para desarrollo local)
- Docker (para containerización)
- Google Cloud SDK (para deployment)

### Desarrollo Local

1. **Clona el repositorio**
```bash
git clone https://github.com/tu-usuario/bori-cano-chat-v4.git
cd bori-cano-chat-v4
```

2. **Ejecuta un servidor local**
```bash
# Con Python
python -m http.server 8080

# Con Node.js (npx)
npx serve -p 8080

# Con Live Server (VS Code extension)
# Click derecho > "Open with Live Server"
```

3. **Accede a la aplicación**
- Página principal: `http://localhost:8080`
- Chat: `http://localhost:8080/chat.html`
- Borí Shop: `http://localhost:8080/public/borishop/`

### 🐳 Docker

```bash
# Construir imagen
docker build -t bori-cano-chat .

# Ejecutar contenedor
docker run -p 8080:8080 bori-cano-chat
```

## ☁️ Deployment

El proyecto utiliza Google Cloud Build para CI/CD automático:

```bash
# Deploy manual
gcloud builds submit --config cloudbuild.yaml
```

### Variables de Entorno
- `PROJECT_ID`: ID del proyecto en Google Cloud
- `SHORT_SHA`: Hash corto del commit (automático)

## 🔧 Configuración

### ElevenLabs Agent
El chat utiliza el agent ID: `agent