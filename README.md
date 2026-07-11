# Ulalert: Campus Incident Management

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
ulalert-frontend-rigo
```

o

```text
ulalert-frontend-pamela-acuna
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

Una vez obtenida la `api_url` desde Terraform, debes actualizarla manualmente en los siguientes archivos del frontend:

- `frontend/src/pages/AddReport.jsx`
- `frontend/src/pages/SectorView.jsx`

En ambos archivos, reemplaza la siguiente línea:

```javascript
const API_URL = "https://xxxxxxxx.execute-api.us-east-1.amazonaws.com";
```

por la URL entregada por Terraform. Por ejemplo:

```javascript
const API_URL = "https://abcd1234.execute-api.us-east-1.amazonaws.com";
```

> **Importante:** No agregues `/prod` al final de la URL, ya que los endpoints de la aplicación construyen esa ruta automáticamente.

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

# FinOps

Para facilitar la administración de costos, todos los recursos creados poseen la etiqueta:

```text
Environment = "Taller-Proyecto"
```

Esto permite:

- Auditoría de recursos.
- Control de presupuesto.
- Fácil identificación de infraestructura.

---

# Git

El proyecto incluye un `.gitignore` configurado para evitar subir:

- Archivos `.tfstate`
- Credenciales temporales
- Archivos generados automáticamente
- Dependencias locales

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
