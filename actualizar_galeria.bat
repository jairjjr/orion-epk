@echo off
echo ===================================================
echo     ORION EPK - Actualizador Automatico de Galeria
echo ===================================================
echo.
echo Escaneando carpeta media\img...

powershell -ExecutionPolicy Bypass -File "scripts\update_gallery.ps1"

echo.
echo Proceso completado. Ya puedes hacer tu commit a GitHub.
pause
