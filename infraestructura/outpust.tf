output "vpc_id" {
  value       = aws_vpc.main.id
  description = "El ID de la VPC creada"
}

output "ec2_public_ip" {
  value       = aws_instance.backend.public_ip
  description = "La direccion IP publica para conectarte por SSH a tu servidor backend"
}