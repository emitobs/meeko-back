@echo off
echo.
echo ====================================
echo   Instalando PetQR Backend...
echo ====================================
echo.

cd /d %~dp0

echo [1/5] Instalando dependencias de Node.js...
call npm install

echo.
echo [2/5] Copiando archivo de configuracion...
if not exist .env (
    copy .env.example .env
    echo     Archivo .env creado. Edita las credenciales de la base de datos.
) else (
    echo     Archivo .env ya existe.
)

echo.
echo [3/5] Creando directorio de uploads...
if not exist uploads mkdir uploads
echo. > uploads\.gitkeep

echo.
echo [4/5] Generando cliente Prisma...
call npm run db:generate

echo.
echo ====================================
echo   Instalacion completada!
echo ====================================
echo.
echo IMPORTANTE: Antes de continuar, asegurate de:
echo 1. Tener PostgreSQL corriendo
echo 2. Editar .env con tus credenciales de DB
echo.
echo Luego ejecuta:
echo   npm run db:push     (para crear las tablas)
echo   npm run db:seed     (para datos de ejemplo)
echo   npm run dev         (para iniciar el servidor)
echo.
pause
