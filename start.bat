@echo off
echo.
echo ====================================
echo   Iniciando PetQR Backend...
echo ====================================
echo.

cd /d %~dp0

echo Verificando dependencias...
if not exist node_modules (
    echo Instalando dependencias...
    call npm install
)

echo.
echo Iniciando servidor de desarrollo...
echo.
call npm run dev
