# 📋 Configuración Manual de Render para PWA

Si el `render.yaml` (blueprint) no funciona, aquí están las configuraciones que debes hacer **manualmente en el dashboard de Render**:

---

## 🚀 Paso 1: Crear/Configurar Static Site

### En el Dashboard de Render:

1. **Ve a tu servicio** (o crea uno nuevo: "New" → "Static Site")
2. **Nombre del servicio:** `domus-frontend`
3. **Tipo:** `Static Site`

---

## ⚙️ Paso 2: Configuración del Build

### En la sección "Build Command":
```
npm ci && npm run build
```

### En la sección "Publish Directory":
```
dist
```

---

## 🌐 Paso 3: Configuración de Rutas (Routes)

### En la sección "Routes" o "Rewrites":
Esto es **MUY IMPORTANTE** para React Router y PWA:

Necesitas agregar una ruta rewrite:

- **Tipo:** `rewrite`
- **Source:** `/*`
- **Destination:** `/index.html`

Esto asegura que:
- ✅ React Router funcione correctamente
- ✅ Los archivos PWA (`manifest.webmanifest`, `sw.js`) sean accesibles
- ✅ Las rutas de la SPA no devuelvan 404

---

## 📋 Paso 4: Headers HTTP (CRÍTICO para PWA)

### En la sección "Headers" o "HTTP Headers":

Necesitas agregar estos headers específicos para que la PWA funcione:

#### 1. Header para `manifest.webmanifest`:
- **Path:** `/manifest.webmanifest`
- **Name:** `Content-Type`
- **Value:** `application/manifest+json`

#### 2. Header para Cache de Manifest:
- **Path:** `/manifest.webmanifest`
- **Name:** `Cache-Control`
- **Value:** `public, max-age=3600`

#### 3. Header para Service Worker (`sw.js`):
- **Path:** `/sw.js`
- **Name:** `Content-Type`
- **Value:** `application/javascript`

#### 4. Header para Cache de Service Worker:
- **Path:** `/sw.js`
- **Name:** `Cache-Control`
- **Value:** `public, max-age=0`

#### 5. Header para Workbox (`workbox-*.js`):
- **Path:** `/workbox-*.js` (o patrón similar)
- **Name:** `Content-Type`
- **Value:** `application/javascript`

#### 6. Header para Cache de Workbox:
- **Path:** `/workbox-*.js`
- **Name:** `Cache-Control`
- **Value:** `public, max-age=31536000, immutable`

#### 7. Header para Assets (opcional pero recomendado):
- **Path:** `/assets/*`
- **Name:** `Cache-Control`
- **Value:** `public, max-age=31536000, immutable`

---

## 🔧 Paso 5: Variables de Entorno

### En la sección "Environment Variables":

Agrega estas variables:

- **Key:** `VITE_API_URL`
- **Value:** `https://domus-back-5529.onrender.com/api`

- **Key:** `VITE_WS_URL`
- **Value:** `wss://domus-back-5529.onrender.com`

---

## 🌍 Paso 6: Dominio Personalizado (Opcional)

### En la sección "Custom Domains":

Si tienes un dominio personalizado:
- **Domain:** `domus.humanixtech.com`
- Configura el DNS según las instrucciones de Render

---

## ✅ Paso 7: Auto-Deploy

### En la sección "Auto-Deploy":

- ✅ Habilita "Auto-Deploy" desde tu repositorio
- Selecciona la rama (generalmente `main` o `master`)
- Render hará deploy automáticamente con cada push

---

## 📍 Dónde Encontrar Cada Configuración en Render:

### En el Dashboard de Render:

1. **Ve a tu servicio** → Click en el nombre
2. **Settings** (Configuración) → Aquí encuentras:
   - Build Command
   - Publish Directory
   - Environment Variables
   - Custom Domains
   
3. **Headers** o **Custom Headers** → Sección separada para headers HTTP
   - Puede estar en "Settings" → "Headers"
   - O en una pestaña separada "Headers"

4. **Routes/Rewrites** → Sección para configurar rutas
   - Generalmente en "Settings" → "Routes" o "Rewrites"

---

## ⚠️ Configuraciones CRÍTICAS para PWA:

### Las 3 más importantes:

1. ✅ **Route Rewrite:** `/*` → `/index.html` (para React Router)
2. ✅ **Header:** `manifest.webmanifest` con `Content-Type: application/manifest+json`
3. ✅ **Header:** `sw.js` con `Content-Type: application/javascript` y `Cache-Control: no-cache`

Sin estas, la PWA **NO funcionará correctamente**.

---

## 🧪 Verificación Después del Deploy:

### 1. Verifica que los archivos sean accesibles:

- ✅ `https://tu-dominio.onrender.com/manifest.webmanifest` → Debe mostrar JSON
- ✅ `https://tu-dominio.onrender.com/sw.js` → Debe mostrar código JavaScript
- ✅ `https://tu-dominio.onrender.com/pwa-192x192.png` → Debe mostrar la imagen
- ✅ `https://tu-dominio.onrender.com/pwa-512x512.png` → Debe mostrar la imagen

### 2. Verifica en DevTools (F12):

- **Application** → **Manifest** → Debe mostrar información de la PWA
- **Application** → **Service Workers** → Debe estar registrado y activo

### 3. Prueba instalación:

- **Android:** Chrome debe mostrar opción "Instalar app"
- **iOS:** Safari debe permitir "Añadir a pantalla de inicio"

---

## 🐛 Si Algo No Funciona:

### Problema: El manifest no se carga
- ✅ Verifica que el header `Content-Type` esté configurado
- ✅ Verifica que `manifest.webmanifest` sea accesible en la URL

### Problema: El Service Worker no se registra
- ✅ Verifica que `sw.js` sea accesible
- ✅ Verifica que el header `Content-Type: application/javascript` esté configurado
- ✅ Verifica que `Cache-Control: no-cache` esté configurado para `sw.js`

### Problema: Las rutas de React Router dan 404
- ✅ Verifica que el route rewrite `/*` → `/index.html` esté configurado

### Problema: No aparece opción de instalar
- ✅ Verifica que estés usando HTTPS (Render lo proporciona automáticamente)
- ✅ Verifica que todos los iconos sean accesibles
- ✅ Verifica que el manifest esté correctamente formateado

---

## 📝 Resumen Rápido:

1. **Build Command:** `npm ci && npm run build`
2. **Publish Directory:** `dist`
3. **Route Rewrite:** `/*` → `/index.html`
4. **Headers:** Content-Type y Cache-Control para manifest y sw.js
5. **Environment Variables:** VITE_API_URL y VITE_WS_URL
6. **Auto-Deploy:** Habilitado desde tu repositorio

---

**¿Necesitas ayuda con alguna configuración específica?**

