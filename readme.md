## Infraestructura AWS con Terraform
<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" alt="AWS" width="120" />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Terraform_Logo.svg" alt="Terraform" width="300" />
</div>

<br>

Este proyecto automatiza la infraestructura en la nube necesaria para el sistema de gestión de talleres mecánicos "RoadMap", utilizando AWS y Terraform.

Este proyecto automatiza la infraestructura en la nube necesaria para el sistema de gestión de talleres mecánicos "RoadMap", utilizando AWS y Terraform.

## Requisitos previos

* [Terraform](https://www.terraform.io/) instalado.
* [AWS CLI](https://aws.amazon.com/es/cli/) configurado con tus credenciales.
* Permisos de acceso a S3 y EC2 en tu cuenta de AWS.

## Configuración Inicial Obligatoria (Para cada usuario)

Dado que AWS exige que los nombres de los buckets de S3 sean **únicos a nivel mundial**, es vital que cada desarrollador personalice sus variables antes de desplegar para no chocar con la infraestructura de sus compañeros.

1. Abre el archivo `variables.tf`.
2. Modifica el valor por defecto de la variable `project` para que incluya tu identificador único (por ejemplo, tu nombre).
   ```hcl
   variable "project" {
     description = "Nombre base para los recursos (debe ser único)"
     default     = "hito1-fdici12-tunombre" # <- CAMBIA ESTO PARA QUE SEA ÚNICO
   }
3. **El Bucket de Estado (¡Crucial para el equipo!):** El nombre del bucket S3 que guarda el estado remoto de Terraform también debe ser único para cada miembro. Si usan el mismo, la infraestructura fallará.
   * Abre `deploy.sh` y cambia la variable `BUCKET_NAME` por algo tuyo (ej. `tunombre-roadmap-estado-tf-2026`).
   * Abre `provider.tf`, busca el bloque `backend "s3"` y pon **exactamente ese mismo nombre único** en el campo `bucket = "..."`.
  
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
