<<<<<<< Updated upstream
# --- 1. RED BASE ---
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags                 = { Name = "${var.project}-vpc" }
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  tags                    = { Name = "${var.project}-subnet-publica" }
}

# --- 2. ACCESO A INTERNET ---
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${var.project}-igw" }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  tags = { Name = "${var.project}-rt" }
}

resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public_rt.id
}

# --- 3. SEGURIDAD ---
resource "aws_security_group" "web_sg" {
  name        = "${var.project}-web-sg"
  description = "Permitir trafico HTTP y SSH para RoadMap"
  vpc_id      = aws_vpc.main.id

  ingress {
=======
# 1. INFRAESTRUCTURA VPC

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project}-vpc"
    Environment = "Taller-Proyecto"
  }
}

# 2. SEGMENTACIÓN DE RED (SUBNETS)

# Subred Pública
resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.region}a"

  tags = {
    Name        = "${var.project}-public-subnet-1a"
    Environment = "Taller-Proyecto"
  }
}

# 3. ROUTING

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "${var.project}-igw"
    Environment = "Taller-Proyecto"
  }
}

# Tabla de Enrutamiento
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

# 4. SECURITY GROUPS
resource "aws_security_group" "app_sg" {
  name        = "${var.project}-app-security-group"
  description = "Control de acceso para la capa de aplicacion del taller"
  vpc_id      = aws_vpc.main.id

  # Regreso/Ingreso HTTP
  ingress {
    description = "Acceso HTTP publico"
>>>>>>> Stashed changes
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

<<<<<<< Updated upstream
  ingress {
=======
  # Regreso/Ingreso SSH
  ingress {
    description = "Acceso SSH para administracion"
>>>>>>> Stashed changes
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
<<<<<<< Updated upstream

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "${var.project}-sg" }
}

# --- 4. CÓMPUTO Y ALMACENAMIENTO ---
resource "aws_instance" "backend" {
  ami                    = "ami-04b70fa74e45c3917"
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.public_a.id
  vpc_security_group_ids = [aws_security_group.web_sg.id]

  # key_name = "mi-llave-aws" # Necesitarás descomentar esto y poner el nombre de tu llave

  tags = { Name = "${var.project}-api-server" }
}

resource "aws_s3_bucket" "datos" {
  bucket = "${var.project}-frontend-roadmap"
=======
Tráfico de Salida (Egress)
  # 
  egress {
    description = "Salida irrestricta al exterior"
    from_port   = 0
    to_port     = 0
    protocol    = "-1" # Significa todos los protocolos
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project}-app-sg"
    Environment = "Taller-Avance"
  }
>>>>>>> Stashed changes
}