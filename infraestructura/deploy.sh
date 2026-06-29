#!/bin/bash

# --- CONFIGURACIÓN ---
# Debe coincidir exactamente con el nombre en provider.tf
BUCKET_NAME="hito1-bucket" 
REGION="us-east-1"

echo "Iniciando el despliegue para RoadMap..."

# 1. Crear el bucket si no existe
echo "Verificando el bucket de estado en AWS..."
if ! aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    echo "El bucket $BUCKET_NAME ya existe."
else
    echo "El bucket no existe. Creando $BUCKET_NAME en $REGION..."
    aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION"
    # Esperamos un poco a que AWS propague la creación
    sleep 5
fi

# 2. Limpieza de entorno local para evitar conflictos
echo "Limpiando archivos locales de configuración..."
rm -rf .terraform/
rm -f .terraform.lock.hcl

# 3. Flujo de Terraform
echo "Ejecutando terraform init..."
terraform init -input=false

echo "Validando la configuración..."
terraform fmt
terraform validate

echo "Generando el plan de Terraform..."
terraform plan -out=tfplan

echo "Aplicando la infraestructura..."
terraform apply -auto-approve tfplan

echo "¡Despliegue finalizado con éxito!"