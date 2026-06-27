provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "state_bucket" {
  bucket        = "ulagos-fdici12-terraform-state-bucket"
  force_destroy = true 
}

resource "aws_s3_bucket_versioning" "state_versioning" {
  bucket = aws_s3_bucket.state_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}