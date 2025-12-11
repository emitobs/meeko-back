import QRCode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import { promises as fs } from 'fs';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  logo?: {
    url?: string;
    size?: number;
    borderRadius?: number;
    backgroundColor?: string;
    padding?: number;
  };
}

/**
 * Generar código QR con logo/imagen opcional
 */
export async function generateQRCodeWithLogo(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    width = 400,
    margin = 2,
    darkColor = '#000000',
    lightColor = '#FFFFFF',
    errorCorrectionLevel = 'H', // Alto nivel de corrección para logos
    logo,
  } = options;

  // Generar QR base
  const qrDataUrl = await QRCode.toDataURL(data, {
    width,
    margin,
    color: {
      dark: darkColor,
      light: lightColor,
    },
    errorCorrectionLevel,
  });

  // Si no hay logo, retornar QR normal
  if (!logo || !logo.url) {
    return qrDataUrl;
  }

  try {
    // Crear canvas
    const canvas = createCanvas(width, width);
    const ctx = canvas.getContext('2d');

    // Cargar QR base
    const qrImage = await loadImage(qrDataUrl);
    ctx.drawImage(qrImage, 0, 0, width, width);

    // Configuración del logo
    const logoSize = logo.size || Math.floor(width * 0.2); // 20% del tamaño del QR
    const logoPadding = logo.padding || 8;
    const logoX = (width - logoSize) / 2;
    const logoY = (width - logoSize) / 2;
    const borderRadius = logo.borderRadius || 8;

    // Dibujar fondo blanco detrás del logo (para mejor contraste)
    if (logo.backgroundColor !== 'transparent') {
      const bgColor = logo.backgroundColor || '#FFFFFF';
      const bgSize = logoSize + logoPadding * 2;
      const bgX = logoX - logoPadding;
      const bgY = logoY - logoPadding;

      ctx.fillStyle = bgColor;
      
      // Fondo redondeado
      ctx.beginPath();
      ctx.roundRect(bgX, bgY, bgSize, bgSize, borderRadius + 4);
      ctx.fill();
    }

    // Cargar y dibujar logo
    const logoImage = await loadImage(logo.url);

    // Clip circular o redondeado para el logo
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoSize, logoSize, borderRadius);
    ctx.clip();
    ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
    ctx.restore();

    // Convertir canvas a data URL
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error agregando logo al QR:', error);
    // Si hay error, retornar QR sin logo
    return qrDataUrl;
  }
}

/**
 * Generar QR simple sin logo (para compatibilidad)
 */
export async function generateSimpleQRCode(
  data: string,
  width: number = 400
): Promise<string> {
  return generateQRCodeWithLogo(data, { width });
}

/**
 * Generar QR con logo de PetQR (predeterminado)
 */
export async function generatePetQRCode(
  petUrl: string,
  logoPath?: string
): Promise<string> {
  // Verificar si existe el logo predeterminado
  // En producción (Plesk), process.cwd() apunta a /httpdocs
  // En desarrollo, apunta a la raíz del proyecto
  const defaultLogoPath = path.join(process.cwd(), 'public', 'logo-qr.png');
  let finalLogoPath = logoPath;
  
  if (!finalLogoPath) {
    try {
      await fs.access(defaultLogoPath);
      finalLogoPath = defaultLogoPath;
      console.log('✅ Logo encontrado en:', defaultLogoPath);
    } catch (error) {
      console.warn('⚠️ Logo no encontrado en:', defaultLogoPath);
      console.warn('💡 Asegúrate de subir public/logo-qr.png al servidor');
      // Si no existe logo, generar QR sin logo
      finalLogoPath = undefined;
    }
  }
  
  return generateQRCodeWithLogo(petUrl, {
    width: 500,
    margin: 2,
    darkColor: '#1a1a1a',
    lightColor: '#FFFFFF',
    errorCorrectionLevel: 'H',
    logo: finalLogoPath ? {
      url: finalLogoPath,
      size: 100,
      borderRadius: 12,
      backgroundColor: '#FFFFFF',
      padding: 10,
    } : undefined,
  });
}
