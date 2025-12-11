import { generateQRCodeWithLogo, generatePetQRCode } from './dist/lib/qrcode.js';
import fs from 'fs';

async function testQRGeneration() {
  console.log('🧪 Probando generación de códigos QR con logo...\n');

  // Test 1: QR simple sin logo
  console.log('1️⃣ Generando QR sin logo...');
  const simpleQR = await generateQRCodeWithLogo('https://meeko.pet/test', {
    width: 400,
  });
  fs.writeFileSync('test-qr-simple.txt', simpleQR);
  console.log('✅ QR simple generado (guardado en test-qr-simple.txt)\n');

  // Test 2: QR con logo (si existe)
  console.log('2️⃣ Generando QR con logo predeterminado...');
  try {
    const logoQR = await generatePetQRCode('https://meeko.pet/firulais-test');
    fs.writeFileSync('test-qr-with-logo.txt', logoQR);
    console.log('✅ QR con logo generado (guardado en test-qr-with-logo.txt)\n');
  } catch (error) {
    console.log('⚠️ No se pudo generar con logo (probablemente no existe public/logo-qr.png)');
    console.log('💡 Coloca un logo en public/logo-qr.png para probarlo\n');
  }

  // Test 3: QR con logo personalizado (URL)
  console.log('3️⃣ Generando QR con logo desde URL...');
  try {
    const customQR = await generateQRCodeWithLogo('https://meeko.pet/custom', {
      width: 500,
      errorCorrectionLevel: 'H',
      logo: {
        url: 'https://raw.githubusercontent.com/github/explore/main/topics/nodejs/nodejs.png',
        size: 100,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        padding: 10,
      },
    });
    fs.writeFileSync('test-qr-custom-logo.txt', customQR);
    console.log('✅ QR con logo personalizado generado (guardado en test-qr-custom-logo.txt)\n');
  } catch (error) {
    console.log('⚠️ Error generando QR con logo personalizado:', error.message);
  }

  console.log('🎉 Tests completados!');
  console.log('\n📝 Para ver los QR:');
  console.log('   1. Abre cualquier archivo test-qr-*.txt');
  console.log('   2. Copia el contenido (data:image/png;base64,...)');
  console.log('   3. Pégalo en la barra de direcciones del navegador');
  console.log('   4. Escanea con tu celular para probar');
}

testQRGeneration().catch(console.error);
