import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const publicDir = join(process.cwd(), 'public');
const sourceImage = join(publicDir, 'logo domus robotOK.png');
const fallbackImage = join(publicDir, 'favicon.png');

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

    console.log(`Generando iconos PWA desde: ${imagePath}`);

    // Generar apple-touch-icon.png (180x180)
    await sharp(imagePath)
      .resize(180, 180, {
        fit: 'cover',
        position: 'center'
      })
      .toFile(join(publicDir, 'apple-touch-icon.png'));

    console.log('✓ apple-touch-icon.png (180x180) generado');

    // Generar pwa-192x192.png
    await sharp(imagePath)
      .resize(192, 192, {
        fit: 'cover',
        position: 'center'
      })
      .toFile(join(publicDir, 'pwa-192x192.png'));

    console.log('✓ pwa-192x192.png generado');

    // Generar pwa-512x512.png
    await sharp(imagePath)
      .resize(512, 512, {
        fit: 'cover',
        position: 'center'
      })
      .toFile(join(publicDir, 'pwa-512x512.png'));

    console.log('✓ pwa-512x512.png generado');

    console.log('\n✅ Todos los iconos PWA han sido generados exitosamente!');
  } catch (error) {
    console.error('❌ Error al generar iconos:', error.message);
    process.exit(1);
  }
}

generateIcons();

