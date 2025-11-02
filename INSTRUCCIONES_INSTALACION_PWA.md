# 📱 Instrucciones para Instalar la PWA Domüs

## 🟢 Android (Chrome)

### Opción 1: Banner de instalación automático
1. Abre la aplicación en **Chrome** desde tu dispositivo Android
2. Espera unos segundos - Chrome mostrará automáticamente un banner que dice:
   - "Instalar Domüs" o "Añadir a la pantalla de inicio"
3. Toca **"Instalar"** o **"Añadir"**
4. La aplicación se instalará y aparecerá como un ícono en tu pantalla de inicio

### Opción 2: Menú de Chrome
1. Abre la aplicación en **Chrome**
2. Toca el menú de tres puntos (⋮) en la esquina superior derecha
3. Busca la opción **"Instalar app"** o **"Añadir a pantalla de inicio"**
4. Toca la opción y confirma la instalación

### Opción 3: Desde la barra de direcciones
1. Abre la aplicación en **Chrome**
2. Busca el ícono de instalación (➕) en la barra de direcciones
3. Toca el ícono y confirma la instalación

---

## 🍎 iOS (Safari)

**⚠️ IMPORTANTE:** En iOS, solo Safari soporta la instalación de PWAs. No funciona en Chrome ni Firefox.

### Pasos para instalar:
1. Abre **Safari** en tu iPhone o iPad (no uses Chrome)
2. Ve a la URL de la aplicación
3. Toca el botón de **compartir** (cuadrado con flecha hacia arriba) en la parte inferior
4. Desplázate por el menú y busca **"Añadir a pantalla de inicio"** o **"Add to Home Screen"**
5. Toca esa opción
6. Puedes personalizar el nombre de la app si quieres
7. Toca **"Añadir"** en la esquina superior derecha
8. La aplicación aparecerá como un ícono en tu pantalla de inicio

---

## 🖥️ Desarrollo Local (Prueba)

### Opción 1: Desarrollo con HTTPS local

Si necesitas probar la PWA en local, necesitas servir la app con HTTPS:

1. **Usa Vite con HTTPS:**
   ```bash
   npm run dev -- --https
   ```
   
   O instala `@vitejs/plugin-basic-ssl` para certificados automáticos

2. **Usa ngrok para exponer localhost con HTTPS:**
   ```bash
   npx ngrok http 5173
   ```
   Luego accede a la URL HTTPS que te proporciona ngrok

### Opción 2: Build y Preview

1. **Genera el build:**
   ```bash
   npm run build
   ```

2. **Sirve el build con un servidor HTTPS:**
   ```bash
   npm run preview -- --https
   ```

### Opción 3: Prueba en dispositivo móvil

1. **Encuentra tu IP local:**
   - Windows: Abre PowerShell y ejecuta `ipconfig`
   - Busca la dirección IPv4 (ejemplo: `192.168.1.100`)

2. **Inicia el servidor de desarrollo accesible desde la red:**
   ```bash
   npm run dev -- --host
   ```

3. **Accede desde tu móvil:**
   - Android/iOS: Abre el navegador y ve a `http://TU_IP:5173`
   - Ejemplo: `http://192.168.1.100:5173`

   ⚠️ **Nota:** Para que funcione la instalación PWA, necesitas HTTPS. Para desarrollo, puedes usar ngrok o exponer con HTTPS.

---

## ✅ Requisitos para Instalación

### Para que la instalación funcione:
- ✅ La aplicación debe estar servida con **HTTPS** (o localhost en desarrollo)
- ✅ Debe existir el **manifest.webmanifest**
- ✅ Debe existir el **service worker** (sw.js)
- ✅ Los **iconos** deben estar disponibles
- ✅ El navegador debe soportar PWAs

### Navegadores compatibles:
- ✅ **Android:** Chrome, Edge, Samsung Internet, Firefox
- ✅ **iOS:** Safari (iOS 11.3+)
- ❌ **iOS:** Chrome/Firefox NO soportan instalación de PWA

---

## 🔍 Verificar que la PWA está funcionando

### En Chrome (Desktop):
1. Abre las **DevTools** (F12)
2. Ve a la pestaña **Application**
3. Revisa:
   - ✅ **Manifest** - Debe mostrar la información de la PWA
   - ✅ **Service Workers** - Debe estar registrado y activo
   - ✅ **Storage** - Puedes ver el cache de Workbox

### En Chrome Mobile:
1. Abre el menú (⋮)
2. Ve a **"Añadir a pantalla de inicio"**
3. Si la opción aparece, significa que la PWA está correctamente configurada

---

## 🚀 Desplegar en Producción

Para que los usuarios puedan instalar la app:

1. **Despliega en un servidor con HTTPS:**
   - GitHub Pages (con HTTPS automático)
   - Netlify
   - Vercel
   - Firebase Hosting
   - Tu propio servidor con certificado SSL

2. **Verifica que todos los archivos estén accesibles:**
   - `/manifest.webmanifest`
   - `/sw.js`
   - `/pwa-192x192.png`
   - `/pwa-512x512.png`
   - `/apple-touch-icon.png`

3. **Prueba la instalación:**
   - En Android: Abre Chrome y verifica que aparece la opción de instalación
   - En iOS: Abre Safari y verifica que puedes añadir a pantalla de inicio

---

## 🐛 Solución de Problemas

### No aparece la opción de instalar:
- ✅ Verifica que estés usando HTTPS (o localhost)
- ✅ Verifica que el manifest.webmanifest sea accesible
- ✅ Verifica que el service worker esté registrado
- ✅ En iOS, asegúrate de usar Safari

### El service worker no se registra:
- ✅ Verifica la consola del navegador para ver errores
- ✅ Asegúrate de que estés en HTTPS o localhost
- ✅ Verifica que el archivo `sw.js` exista en el directorio raíz

### Los iconos no aparecen:
- ✅ Verifica que los archivos de iconos existan en `/public`
- ✅ Ejecuta `npm run generate-icons` para regenerar los iconos
- ✅ Verifica que los paths en el manifest sean correctos

---

## 📝 Comandos Útiles

```bash
# Generar iconos PWA
npm run generate-icons

# Desarrollo normal
npm run dev

# Desarrollo con HTTPS (necesario para PWA)
npm run dev -- --https

# Build para producción
npm run build

# Preview del build
npm run preview

# Preview con HTTPS
npm run preview -- --https
```

---

## 🎯 Resumen Rápido

### Android:
1. Abre en Chrome
2. Toca el menú (⋮) → "Instalar app"
3. ¡Listo!

### iOS:
1. Abre en Safari (NO Chrome)
2. Toca compartir (□↑) → "Añadir a pantalla de inicio"
3. ¡Listo!

---

¿Necesitas ayuda con algún paso específico?

