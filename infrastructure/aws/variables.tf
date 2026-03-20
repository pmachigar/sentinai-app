variable "aws_region" {
  default = "us-east-1"
}
variable "project_name" {
  default = "sentinai"
}
variable "environment" {
  default = "dev"
}
variable "vpc_id" {
  description = "VPC ID where resources will be deployed"
  default     = "vpc-xxxxxxxx"
}
variable "subnet_ids" {
  type        = list(string)
  description = "Subnet IDs for the nodes and data layers"
  default     = ["subnet-xxxxxxxx", "subnet-yyyyyyyy", "subnet-zzzzzzzz"]
}
variable "default_sg" {
  description = "Default security group ID"
  default     = "sg-xxxxxxxx"
}
