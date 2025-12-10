# 🔧 Solución de Problemas CORS

## ✅ Configuración Implementada

La configuración de CORS ha sido mejorada para ser más flexible en desarrollo:

### En Desarrollo (NODE_ENV=development)
- ✅ Permite múltiples puertos de localhost (3000, 4321, 5173, 5174)
- ✅ Permite 127.0.0.1 y localhost
- ✅ Permite solicitudes sin origin (Postman, Thunder Client, curl)
- ✅ CORS habilitado en archivos estáticos (/uploads)

### En Producción (NODE_ENV=production)
- ✅ Solo permite el dominio configurado en `FRONTEND_URL`
- ✅ Más restrictivo para mayor seguridad

## 🐛 Errores Comunes de CORS

### Error 1: "Access to fetch has been blocked by CORS policy"

**Causa:** El frontend está en un dominio/puerto no permitido

**Solución:**
1. Verifica que `FRONTEND_URL` en `.env` coincida con tu frontend:
```env
FRONTEND_URL="http://localhost:4321"
```

2. Si usas otro puerto, agrégalo en `src/server.ts`:
```typescript
const allowedOrigins = [
  'http://localhost:4321',
  'http://localhost:TU_PUERTO', // Agregar aquí
  // ...
];
```

3. Reinicia el servidor:
```bash
npm run dev
```

---

### Error 2: "No 'Access-Control-Allow-Origin' header is present"

**Causa:** El servidor no está enviando los headers CORS correctos

**Solución:**
1. Asegúrate de que el servidor esté corriendo
2. Verifica que hayas reiniciado después de cambiar `.env`
3. Verifica en el navegador (F12 > Network) que el servidor responda

---

### Error 3: Preflight request fails (OPTIONS)

**Causa:** El navegador envía una petición OPTIONS antes de la real

**Solución:**
Ya está configurado en el código:
```typescript
methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
optionsSuccessStatus: 204
```

Si persiste, verifica que no haya otro middleware bloqueando OPTIONS.

---

### Error 4: "Credentials mode is 'include' but not allowed"

**Causa:** Estás enviando cookies/credenciales pero CORS no lo permite

**Solución:**
Ya está configurado:
```typescript
credentials: true,
```

En el frontend, asegúrate de usar:
```javascript
fetch(url, {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})
```

---

### Error 5: "Images/Files not loading from /uploads"

**Causa:** Los archivos estáticos necesitan CORS habilitado

**Solución:**
Ya está configurado:
```typescript
app.use('/uploads', cors(), express.static(config.upload.dir));
```

---

## 🧪 Verificar Configuración CORS

### Desde el navegador (consola):
```javascript
fetch('http://localhost:3000/api/v1/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### Desde curl:
```bash
curl -I http://localhost:3000/api/v1/health
```

Deberías ver estos headers:
```
Access-Control-Allow-Origin: http://localhost:4321
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
```

---

## 🔍 Debugging CORS

### 1. Verificar origen de la petición
En las DevTools del navegador (F12 > Network):
- Click en la petición fallida
- Ver "Request Headers" > "Origin"
- Asegúrate de que ese origen esté en `allowedOrigins`

### 2. Ver respuesta del servidor
En la misma petición:
- Ver "Response Headers"
- Buscar `Access-Control-Allow-Origin`
- Si no está, el problema es del servidor

### 3. Ver errores de consola
La consola del navegador te dirá exactamente qué falta:
- `Allow-Origin` missing?
- `Allow-Methods` missing?
- `Allow-Headers` missing?

---

## 🛠️ Configuración por Ambiente

### Desarrollo Local
```env
NODE_ENV=development
FRONTEND_URL=http://localhost:4321
```
→ Permite múltiples orígenes

### Staging/QA
```env
NODE_ENV=production
FRONTEND_URL=https://staging.tuapp.com
```
→ Solo permite ese dominio

### Producción
```env
NODE_ENV=production
FRONTEND_URL=https://tuapp.com
```
→ Solo permite ese dominio

---

## 🌐 CORS con Dominios Personalizados

Si tienes múltiples dominios en producción:

```typescript
// src/server.ts
const allowedOrigins = config.isProduction
  ? [
      'https://tuapp.com',
      'https://www.tuapp.com',
      'https://app.tuapp.com'
    ]
  : [/* ... desarrollo ... */];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

---

## 📱 CORS con Apps Móviles

Las apps móviles pueden no enviar el header `Origin`:

```typescript
origin: (origin, callback) => {
  // Permitir solicitudes sin origin (apps móviles)
  if (!origin) {
    callback(null, true);
    return;
  }
  // ... resto de lógica
}
```

---

## 🔐 Seguridad

### ⚠️ Nunca en Producción:
```typescript
// ❌ PELIGRO - Permite cualquier origen
app.use(cors({ origin: '*' }));

// ❌ PELIGRO - Permite cualquier origen con credenciales
app.use(cors({ origin: '*', credentials: true }));
```

### ✅ Buenas Prácticas:
```typescript
// ✅ Lista específica de dominios
origin: ['https://tuapp.com', 'https://www.tuapp.com']

// ✅ Validación dinámica
origin: (origin, callback) => {
  if (allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
}
```

---

## 🆘 Solución Rápida (Temporal)

Si necesitas hacer funcionar algo URGENTEMENTE en desarrollo:

```typescript
// SOLO PARA DESARROLLO - NO USAR EN PRODUCCIÓN
app.use(cors({ origin: true, credentials: true }));
```

Pero recuerda cambiarlo después por la configuración correcta.

---

## 📞 Contacto

Si el problema persiste después de probar estas soluciones:

1. Verifica la consola del navegador (errores exactos)
2. Verifica la consola del servidor (logs)
3. Usa las DevTools Network tab
4. Abre un issue con:
   - Error exacto de consola
   - URL de frontend
   - URL de backend
   - Headers de la petición
