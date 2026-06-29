# Infraestructura AWS con Terraform

Este proyecto automatiza la infraestructura necesaria, utilizando AWS y Terraform.

## Requisitos previos

* [Terraform](https://www.terraform.io/) instalado.
* [AWS CLI](https://aws.amazon.com/es/cli/) configurado con tus credenciales.
* Permisos de acceso a S3 y EC2 en tu cuenta de AWS.

## Estructura del Proyecto

* `main.tf`: Configuración principal de la VPC, Subredes, EC2 y S3.
* `provider.tf`: Configuración de los proveedores y backend remoto (S3).
* `variables.tf`: Definición de variables del proyecto.
* `deploy.sh`: Script principal para automatizar la creación de la infraestructura.
* `destroy.sh`: Script para eliminar la infraestructura al finalizar.

## Cómo usar el proyecto

### 1. Despliegue (Desplegar infraestructura)
Para desplegar todo el entorno, simplemente ejecuta el script de despliegue:

```bash
chmod +x deploy.sh
./deploy.sh
