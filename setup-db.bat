@echo off
echo.
echo ====================================
echo   Configurando Base de Datos...
echo ====================================
echo.

cd /d %~dp0

echo [1/3] Sincronizando schema con la base de datos...
call npm run db:push

echo.
echo [2/3] Poblando datos de ejemplo...
call npm run db:seed

echo.
echo [3/3] Abriendo Prisma Studio...
call npm run db:studio
