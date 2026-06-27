# CONFIGURACIÓN DE REQUERIMIENTOS DE TERRAFORM Y PROVEEDORES

terraform {
  required_version = ">= 1.0.0"

  backend "s3" {
    bucket       = "ulagos-fdici12-terraform-state-bucket"
    key          = "taller-ingenieria/hito1/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true 
  }

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