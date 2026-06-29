#!/bin/bash

echo "Iniciando destrucción de la infraestructura..."

# 1. Ejecutar la destrucción real en AWS
echo "Ejecutando terraform destroy..."
terraform destroy -auto-approve

# 2. Verificar si la destrucción fue exitosa
if [ $? -eq 0 ]; then
    echo "¡Infraestructura destruida exitosamente!"
    
    # 3. Limpiar los archivos locales generados por terraform
    echo "Limpiando archivos locales de configuración..."
    rm -rf .terraform/
    rm -f .terraform.lock.hcl
    rm -f tfplan
    
    echo "Todo limpio. Hasta la próxima."
else
    echo "ERROR: La destrucción falló. Revisa los permisos o dependencias atascadas en AWS."
fi