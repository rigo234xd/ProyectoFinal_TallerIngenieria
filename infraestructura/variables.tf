# ==============================================================================
# DEFINICIÓN DE VARIABLES GLOBALES DEL PROYECTO
# ==============================================================================

variable "region" {
  type        = string
  default     = "us-east-1"
  description = "Región de AWS donde se desplegarán todos los recursos de la infraestructura"
}

variable "project" {
  type        = string
  default     = "ulagos-fdici12"
  description = "Código o nombre del proyecto utilizado para estandarizar las etiquetas (tags) y nombres de los recursos"
}