#!/bin/bash

# --- CONFIGURACIÓN ---
BUCKET_NAME="ulalert-bucket-olea" 
REGION="us-east-1"

echo "Iniciando el despliegue para Campus Alert Serverless"

# 1. Crear el bucket de estado de Terraform si no existe
echo "[1/4] Verificando el bucket de estado en AWS..."
if ! aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    echo "El bucket $BUCKET_NAME ya existe."
else
    echo "El bucket no existe. Creando $BUCKET_NAME en $REGION..."
    aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION"
    sleep 5
fi

# 2. Empaquetar el Backend
echo "[2/4] Preparando el código del Backend para Lambda..."
if [ -d "backend" ]; then
    cd backend
    echo "Instalando dependencias (node_modules)..."
    npm install
    
    echo "Comprimiendo en backend.zip..."
    # Comprimimos y enviamos el zip DIRECTAMENTE a la carpeta de infraestructura
    zip -r ../infraestructura/backend.zip reportes.js package.json node_modules
    
    # Volvemos a la raíz
    cd ..
else
    echo "Error: No se encontró la carpeta 'backend'. Asegúrate de estar en la raíz del proyecto."
    exit 1
fi

# 3. Flujo de Terraform
echo "[3/4] Ejecutando rutinas de Terraform..."
if [ -d "infraestructura" ]; then
    # Entramos a la carpeta de infraestructura donde están los archivos .tf
    cd infraestructura

    echo "Limpiando archivos locales de configuración antigua..."
    rm -rf .terraform/
    rm -f .terraform.lock.hcl

    echo "Inicializando (terraform init)..."
    terraform init -input=false

    echo "Validando formato (terraform fmt / validate)..."
    terraform fmt
    terraform validate

    echo "Generando el plan (terraform plan)..."
    terraform plan -out=tfplan

    echo "Aplicando la infraestructura (terraform apply)..."
    terraform apply -auto-approve tfplan

    cd ..
else
    echo "Error: No se encontró la carpeta 'infraestructura'. Asegúrate de que tus archivos .tf estén allí."
    exit 1
fi

echo "¡Despliegue finalizado con éxito!"