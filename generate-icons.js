import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const publicDir = join(process.cwd(), 'public');
const sourceImage = join(publicDir, 'logo domus robotOK.png');
const fallbackImage = join(publicDir, 'favicon.png');

/**
 * Genera un icono PWA adaptativo que muestra el logo completo con padding
 * @param {number} size - Tamaño del icono (ej: 192, 512, 180)
 * @param {string} outputPath - Ruta donde guardar el icono
 * @param {string} imagePath - Ruta de la imagen fuente
 */
async function generateAdaptiveIcon(size, outputPath, imagePath) {
  // Padding del 10% para que el logo sea más grande y visible
  // Cambia este valor (0.10) para ajustar el tamaño:
  // - Menor valor (ej: 0.05) = logo más grande
  // - Mayor valor (ej: 0.20) = logo más pequeño
  const padding = Math.floor(size * 0.10);
  const logoSize = size - (padding * 2);
  
  // Obtener metadata de la imagen original
  const metadata = await sharp(imagePath).metadata();
  const isTransparent = metadata.hasAlpha;
  
  // Crear el logo redimensionado con contain para mantener proporciones
  const logoBuffer = await sharp(imagePath)
    .resize(logoSize, logoSize, {
      fit: 'contain',
      background: isTransparent ? { r: 0, g: 0, b: 0, alpha: 0 } : { r: 255, g: 255, b: 255 }
    })
    .toBuffer();
  
  // Crear fondo blanco con el logo centrado
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([
      {
        input: logoBuffer,
        top: padding,
        left: padding
      }
    ])
    .png()
    .toFile(outputPath);
}

async function generateIcons() {
  try {
    // Verificar que existe la imagen fuente
    let imagePath = sourceImage;
    if (!existsSync(imagePath)) {
      console.log('Logo no encontrado, usando favicon como alternativa');
      imagePath = fallbackImage;
    }

    if (!existsSync(imagePath)) {
      throw new Error('No se encontró ninguna imagen fuente (logo domus robotOK.png ni favicon.png)');
    }

    console.log(`Generando iconos PWA adaptativos desde: ${imagePath}`);
    console.log('📐 Usando fit: "contain" para mostrar el logo completo con padding\n');

    // Generar apple-touch-icon.png (180x180)
    await generateAdaptiveIcon(
      180,
      join(publicDir, 'apple-touch-icon.png'),
      imagePath
    );
    console.log('✓ apple-touch-icon.png (180x180) generado');

    // Generar pwa-192x192.png
    await generateAdaptiveIcon(
      192,
      join(publicDir, 'pwa-192x192.png'),
      imagePath
    );
    console.log('✓ pwa-192x192.png generado');

    // Generar pwa-512x512.png
    await generateAdaptiveIcon(
      512,
      join(publicDir, 'pwa-512x512.png'),
      imagePath
    );
    console.log('✓ pwa-512x512.png generado');

    console.log('\n✅ Todos los iconos PWA han sido generados exitosamente!');
    console.log('💡 Los iconos muestran el logo completo de Domus con padding adecuado.');
  } catch (error) {
    console.error('❌ Error al generar iconos:', error.message);
    process.exit(1);
  }
}

generateIcons();

