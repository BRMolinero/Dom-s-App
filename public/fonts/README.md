# Fuentes Domus

## Instrucciones para agregar las fuentes reales:

### 1. Rebelton (para títulos y encabezados)
- Descargar el archivo `Rebelton-Regular.woff2`
- Colocar en: `public/fonts/Rebelton-Regular.woff2`
- Reemplazar el archivo placeholder actual

### 2. Stinger Fit (para texto y cuerpo)
- Descargar el archivo `StingerFit-Regular.woff2`
- Colocar en: `public/fonts/StingerFit-Regular.woff2`
- Reemplazar el archivo placeholder actual

## Aplicación automática:
- Los títulos (h1, h2, h3, h4, h5, h6) usarán automáticamente Rebelton
- El resto del texto (body, p, span, div, button, etc.) usará Stinger Fit
- Las fuentes están configuradas en `src/index.css`

## Formato recomendado:
- Formato: WOFF2 (mejor compresión y compatibilidad)
- Fallback: sans-serif para ambos casos
- Font-display: swap (mejor rendimiento)

