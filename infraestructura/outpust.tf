output "vpc_id" {
<<<<<<< Updated upstream
  value       = aws_vpc.main.id
  description = "El ID de la VPC creada"
}

output "ec2_public_ip" {
  value       = aws_instance.backend.public_ip
  description = "La direccion IP publica para conectarte por SSH a tu servidor backend"
=======
  description = "El ID único de la VPC principal generada en AWS"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "El bloque de direccionamiento IP (CIDR) asignado a la VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_id" {
  description = "El ID de la subred pública donde se desplegará la capa de aplicación"
  value       = aws_subnet.public_1.id
}

output "security_group_id" {
  description = "El ID del Grupo de Seguridad (Firewall) perimetral para la aplicación"
  value       = aws_security_group.app_sg.id
>>>>>>> Stashed changes
}