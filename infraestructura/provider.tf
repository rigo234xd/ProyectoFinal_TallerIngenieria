# CONFIGURACIÓN DE REQUERIMIENTOS DE TERRAFORM Y PROVEEDORES

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0" 
    }
  }
}

#AWS

provider "aws" {
  region = var.region 

  default_tags {
    tags = {
      Project   = var.project
      ManagedBy = "Terraform"
    }
  }
}