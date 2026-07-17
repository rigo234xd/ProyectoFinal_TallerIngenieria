# Ulalert: 

Bienvenido al repositorio oficial de **Ulalert**, una plataforma moderna, escalable y **100% Serverless**, diseñada para la gestión eficiente de incidencias dentro de la **Universidad de Los Lagos**.

---

# Descripción

Ulalert permite reportar, gestionar y visualizar incidentes ocurridos dentro del campus universitario mediante una arquitectura moderna basada completamente en servicios administrados de AWS.

El proyecto fue desarrollado siguiendo buenas prácticas de:

- Arquitectura Serverless
- Infraestructura como Código (IaC)
- Seguridad de mínimo privilegio
- Automatización del despliegue

---

# Estructura del Proyecto

```text
ulalert-project/
│
├── backend/         # Código fuente de la función Lambda (Node.js)
│
├── frontend/        # Aplicación React + Vite
│
└── infra/           # Infraestructura como Código (Terraform)
```

---

# Guía de Despliegue

## Configuración del Bucket S3

Antes de ejecutar el despliegue, es necesario personalizar el nombre del bucket de Amazon S3 utilizado para alojar el frontend.

> **Importante:** Los nombres de los buckets de Amazon S3 son **únicos a nivel mundial**, por lo que dos usuarios no pueden crear un bucket con el mismo nombre.

Por ello, cada integrante debe modificar el nombre del bucket definido en el archivo de Terraform correspondiente (provider o variables, según la configuración del proyecto) y asignarle un nombre único. Una buena práctica es incluir tu nombre, apellido o iniciales, por ejemplo:

```text
ulalert-frontend-hito2
```

o

```text
ulalert-frontend
```

Realizar este cambio antes del despliegue evitará conflictos durante la creación de la infraestructura y permitirá que cada usuario disponga de su propio entorno de trabajo.

## Desplegar la infraestructura

Desde la carpeta raíz del proyecto, ejecuta el script de despliegue:

```bash
chmod +x deploy.sh
./deploy.sh
```

> **Nota:** Si el archivo ya tiene permisos de ejecución, basta con ejecutar:
>
> ```bash
> ./deploy.sh
> ```

El script se encargará de desplegar automáticamente toda la infraestructura necesaria en AWS utilizando Terraform.

---

## Importante

Al finalizar correctamente el despliegue, Terraform entregará una salida similar a:

```text
api_url = https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
```

Guarda esta URL.

Será utilizada por el frontend para comunicarse con el backend.

---

## Configuración de la API

Para mantener un código limpio, seguro y evitar modificar archivos manualmente, el frontend se conecta al backend utilizando variables de entorno. 

Una vez que obtengas la `api_url` generada por Terraform al terminar el despliegue, sigue estos pasos:

1. Dirígete a la carpeta `frontend/`.
2. Crea un nuevo archivo llamado `.env` en la raíz de esta carpeta (exactamente al mismo nivel que tu archivo `package.json`).
3. Agrega la URL de tu API Gateway y cualquier otro enlace necesario para tu entorno. Tu archivo `.env` debería verse así:

```env
# URL base de API Gateway (Entregada por Terraform)
VITE_API_URL=https://abcd1234.execute-api.us-east-1.amazonaws.com

# Agrega aquí otros enlaces necesarios para el proyecto

# Configurar y desplegar el Frontend

Regresa al directorio principal e ingresa al frontend.

```bash
cd ../frontend
```

Abre el archivo donde se encuentra la configuración de la API (`src/config.ts` o `.env`) y reemplaza la URL por la **api_url** entregada por Terraform.

Instala las dependencias:

```bash
npm install
```

Compila la aplicación:

```bash
npm run build
```

Sube los archivos generados a Amazon S3:

```bash
aws s3 sync dist/ s3://nombre-de-tu-bucket-frontend
```

Reemplaza:

```text
nombre-de-tu-bucket-frontend
```

por el nombre real del bucket creado mediante Terraform.

---

# Seguridad

Ulalert sigue las mejores prácticas de AWS:

- No utiliza credenciales permanentes.
- No requiere archivos `.env` con secretos en producción.
- AWS Lambda accede a DynamoDB mediante un **IAM Role** de mínimo privilegio.
- Todos los permisos son administrados automáticamente mediante Terraform.

---

# Limpieza de Recursos

Una vez finalizada la evaluación del proyecto, elimina toda la infraestructura para evitar costos innecesarios.

Ingresa nuevamente a Terraform:

```bash
cd infra
```

Ejecuta:

```bash
terraform destroy
```

Cuando Terraform solicite confirmación escribe:

```text
yes
```

Todos los recursos de AWS serán eliminados automáticamente.

---

# Servicios AWS utilizados

- Amazon S3
- Amazon CloudFront
- AWS Lambda
- Amazon API Gateway
- Amazon DynamoDB
- IAM
- Terraform

---

# Tecnologías utilizadas

- React
- Vite
- TypeScript
- Node.js
- Terraform
- AWS CLI
- Git
- GitHub

---

# Licencia

Este proyecto fue desarrollado con fines académicos para el Taller de Ingeniería en informática de la **Universidad de Los Lagos**.

---

## Ulalert

**Campus Incident Management Platform**

Desarrollado utilizando una arquitectura **Serverless**, enfocada en escalabilidad, disponibilidad, seguridad y optimización de costos en AWS.
