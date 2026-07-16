terraform {
  required_version = ">= 1.0.0"

  backend "s3" {
    bucket       = "ulalert-bucket-olea"
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

provider "aws" {
  region = var.region
}