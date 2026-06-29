#!/bin/bash

echo "Iniciando destrucción de la infraestructura"

if [ $? -eq 0 ]; then
    echo "¡Infraestructura destruida exitosamente!"
    
    # 3. Limpiar los archivos locales generados por terraform
    echo "Limpiando archivos locales de configuración..."
    rm -rf .terraform/
    rm -f .terraform.lock.hcl
    rm -f terraform.tfstate
    rm -f terraform.tfstate.backup
    
    echo "Todo limpio. Hasta la próxima."
else
    echo "ERROR: La destrucción falló. Revisa los permisos o el estado en AWS."
fi