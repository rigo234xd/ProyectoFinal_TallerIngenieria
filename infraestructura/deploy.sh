#!/bin/bash

echo "Iniciando el despliegue de infraestructura para RoadMap..."

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