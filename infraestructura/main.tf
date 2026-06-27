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
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Regreso/Ingreso SSH
  ingress {
    description = "Acceso SSH para administracion"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
# Tráfico de Salida (Egress)
  egress {
    description = "Salida irrestricta al exterior"
    from_port   = 0
    to_port     = 0
    protocol    = "-1" # todos los protocolos 
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project}-app-sg"
    Environment = "Taller-Avance"
  }
}

resource "aws_instance" "app_server" {
  ami           = "ami-0c7217cdde317cfec" # Ubuntu Server v22.04 LTS
  instance_type = "t2.micro"              # Capa gratuita elegible
  subnet_id     = aws_subnet.public_1.id
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update
              sudo apt-get install -y docker.io
              sudo systemctl start docker
              EOF

  tags = {
    Name = "${var.project}-backend-server"
  }
}