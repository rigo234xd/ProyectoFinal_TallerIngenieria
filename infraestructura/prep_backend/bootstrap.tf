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

output "bucket_name" {
  description = "Nombre del bucket exportado para el modulo"
  value       = aws_s3_bucket.state_bucket.bucket
}