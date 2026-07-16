# Consulta la IP pública de la máquina que ejecuta Terraform en tiempo real
data "http" "myip" {
  url = "http://ipv4.icanhazip.com"
}

# 1. INFRAESTRUCTURA DE RED (VPC Y SUBREDES)

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project}-vpc"
    Environment = "Taller-Proyecto"
  }
}

# Subred Pública (Para el Servidor Backend con Acceso Externo)
resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr
  map_public_ip_on_launch = true
  availability_zone       = "${var.region}a"

  tags = {
    Name        = "${var.project}-public-subnet-1a"
    Environment = "Taller-Proyecto"
  }
}

# Subred Privada (Para proteger las Bases de Datos)
resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidr
  availability_zone = "${var.region}a"

  tags = {
    Name        = "${var.project}-private-subnet-1a"
    Environment = "Taller-Proyecto"
  }
}

# 2. ENRUTAMIENTO (ROUTING)

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "${var.project}-igw"
    Environment = "Taller-Proyecto"
  }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    Name        = "${var.project}-public-rt"
    Environment = "Taller-Proyecto"
  }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public_rt.id
}

# 3. SEGURIDAD (SECURITY GROUPS)

resource "aws_security_group" "app_sg" {
  name        = "${var.project}-app-security-group"
  description = "Control de acceso perimetral para la aplicacion"
  vpc_id      = aws_vpc.main.id

  # Ingreso HTTP abierto al público general
  ingress {
    description = "Acceso HTTP publico"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Ingreso SSH RESTRINGIDO dinámicamente a tu IP actual
  ingress {
    description = "Acceso SSH protegido para administracion"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["${chomp(data.http.myip.response_body)}/32"]
  }

  # Tráfico de salida irrestricto
  egress {
    description = "Salida irrestricta al exterior"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project}-app-sg"
    Environment = "Taller-Proyecto"
  }
}

# 4. CÓMPUTO SERVERLESS, ALMACENAMIENTO Y BASE DE DATOS

# Almacenamiento Estático S3
resource "aws_s3_bucket" "datos" {
  bucket        = "${var.project}-frontend-roadmap"
  force_destroy = true # Facilita el borrado limpio en entornos académicos

  tags = {
    Name        = "${var.project}-frontend-bucket"
    Environment = "Taller-Proyecto"
  }
}

# Base de Datos (BD NoSQL Administrada - Completa Criterio 4)
resource "aws_dynamodb_table" "db_proyecto" {
  name         = "${var.project}-app-data"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name        = "${var.project}-dynamodb-table"
    Environment = "Taller-Proyecto"
  }
}

# --- INFRAESTRUCTURA SERVERLESS ---

# A. Rol IAM para Lambda (Principio de Mínimo Privilegio)
resource "aws_iam_role" "lambda_exec" {
  name = "${var.project}-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

# Permiso básico para que Lambda escriba logs en CloudWatch
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Permiso estricto para que Lambda solo acceda a TU tabla de DynamoDB
resource "aws_iam_policy" "dynamodb_access" {
  name        = "${var.project}-dynamodb-policy"
  description = "Permisos de DynamoDB para el backend de Lambda"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:Scan",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:GetItem"
      ]
      Resource = aws_dynamodb_table.db_proyecto.arn
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.dynamodb_access.arn
}

# B. Función Lambda
resource "aws_lambda_function" "api_backend" {
  # IMPORTANTE: El archivo "backend.zip" debe estar en la misma carpeta que main.tf
  filename      = "backend.zip"
  function_name = "${var.project}-api-backend"
  role          = aws_iam_role.lambda_exec.arn

  # Si tu código transpilado de reportes.ts exporta "handler" en un archivo "reportes.js", esto debe ser "reportes.handler"
  # Si usas el server.js envuelto en serverless-http, esto debería ser "server.handler"
  handler = "reportes.handler"

  runtime          = "nodejs20.x"
  source_code_hash = filebase64sha256("backend.zip")

  environment {
    variables = {
      DYNAMO_TABLE_NAME = aws_dynamodb_table.db_proyecto.name
      GOOGLE_CLIENT_ID  = var.google_client_id
    }
  }

  tags = {
    Name        = "${var.project}-lambda"
    Environment = "Taller-Proyecto"
  }
}

# C. API Gateway (Para exponer la Lambda a internet)
resource "aws_apigatewayv2_api" "http_api" {
  name          = "${var.project}-http-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"] # Para pruebas locales y acceso web.
    allow_methods = ["GET", "POST", "OPTIONS", "PUT", "DELETE"]
    allow_headers = ["Content-Type", "Authorization"]
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.http_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.api_backend.invoke_arn
}

resource "aws_apigatewayv2_route" "default_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_backend.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

# 5. DISTRIBUCIÓN DE CONTENIDO (CLOUDFRONT)

# Control de Acceso (OAC) para que CloudFront lea el Bucket S3 de forma segura
resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "${var.project}-oac"
  description                       = "OAC para el bucket del frontend"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Distribución de CloudFront
resource "aws_cloudfront_distribution" "frontend_cdn" {
  origin {
    domain_name              = aws_s3_bucket.datos.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.datos.bucket}"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html" # Archivo principal de React/Vite

  # Manejo de rutas SPA para React Router (Redirige 404/403 a index.html)
  custom_error_response {
    error_caching_min_ttl = 10
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
  }
  
  custom_error_response {
    error_caching_min_ttl = 10
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.datos.bucket}"

    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name        = "${var.project}-cloudfront"
    Environment = "Taller-Proyecto"
  }
}

# Política del Bucket S3 para permitir que CloudFront acceda a los archivos
resource "aws_s3_bucket_policy" "cdn_policy" {
  bucket = aws_s3_bucket.datos.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.datos.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend_cdn.arn
          }
        }
      }
    ]
  })
}

# 6. OUTPUTS 

output "api_url" {
  value       = aws_apigatewayv2_api.http_api.api_endpoint
  description = "URL base de la API Gateway para tu backend. Cópiala y pégala en tu código Frontend de React."
}

output "cloudfront_domain" {
  value       = aws_cloudfront_distribution.frontend_cdn.domain_name
  description = "URL pública de tu Frontend alojado en CloudFront."
}