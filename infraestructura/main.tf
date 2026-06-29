# Consultar ip publicas
data "http" "myip" {
  url = "http://ipv4.icanhazip.com"
}

# 1. Infraestructura de RED

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project}-vpc"
    Environment = "Taller-Proyecto"
  }
}

# Subred Pública 
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

# Subred Privada 
resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidr
  availability_zone = "${var.region}a"

  tags = {
    Name        = "${var.project}-private-subnet-1a"
    Environment = "Taller-Proyecto"
  }
}
# 2. Enrutamiento

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

# 3. Security group

resource "aws_security_group" "app_sg" {
  name        = "${var.project}-app-security-group"
  description = "Control de acceso perimetral para la aplicacion"
  vpc_id      = aws_vpc.main.id

  # Ingreso HTTP abierto al público general (Puerto 80)
  ingress {
    description = "Acceso HTTP publico"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Ingreso SSH RESTRINGIDO dinámicamente 
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

# 4. DB

resource "aws_instance" "backend" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public_1.id
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update
              sudo apt-get install -y docker.io
              sudo systemctl start docker
              EOF

  tags = {
    Name        = "${var.project}-api-server"
    Environment = "Taller-Proyecto"
  }
}

# Almacenamiento Estático S3
resource "aws_s3_bucket" "datos" {
  bucket        = "${var.project}-frontend-roadmap"
  force_destroy = true # Facilita el borrado limpio

  tags = {
    Name        = "${var.project}-frontend-bucket"
    Environment = "Taller-Proyecto"
  }
}

# Base de Datos NoSQL
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

# 5. Modularización

module "backend_preparacion" {
  source = "./prep_backend"
}