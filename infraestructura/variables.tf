variable "region" {
  type        = string
  default     = "us-east-1"
  description = "Región de AWS donde se desplegarán todos los recursos"
}

variable "project" {
  type        = string
  default     = "hito1-fdici12"
  description = "Código o nombre del proyecto utilizado para estandarizar etiquetas y nombres"
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "Bloque de direccionamiento CIDR principal para la VPC"
}

variable "public_subnet_cidr" {
  type        = string
  default     = "10.0.1.0/24"
  description = "Bloque CIDR para la subred pública (Acceso Web/SSH)"
}

variable "private_subnet_cidr" {
  type        = string
  default     = "10.0.2.0/24"
  description = "Bloque CIDR para la subred privada (Aislamiento de Datos)"
}

variable "ami_id" {
  type        = string
  default     = "ami-04b70fa74e45c3917"
  description = "ID de la Amazon Machine Image (AMI) para el backend de cómputo"
}

variable "instance_type" {
  type        = string
  default     = "t3.micro"
  description = "Tipo y tamaño de la instancia de cómputo EC2"
}