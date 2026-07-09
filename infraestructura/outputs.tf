output "vpc_id" {
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
  description = "El ID del Grupo de Seguridad perimetral para la aplicación"
  value       = aws_security_group.app_sg.id
}

output "private_subnet_id" {
  description = "El ID de la subred privada creada para la proteccion de datos"
  value       = aws_subnet.private_1.id
}

output "ec2_public_ip" {
  description = "Direccion IP publica asignada al servidor de backend"
  value       = aws_instance.backend.public_ip
}

output "dynamodb_table_name" {
  description = "Nombre de la base de datos provisionada"
  value       = aws_dynamodb_table.db_proyecto.name
}
output "cloudfront_domain_name" {
  description = "URL publica de la distribucion de CloudFront para el Frontend"
  value       = aws_cloudfront_distribution.frontend_cdn.domain_name
}