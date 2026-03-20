terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# --- EKS Cluster (Kubernetes) ---
module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  version         = "~> 20.0"
  cluster_name    = "${var.project_name}-${var.environment}-eks"
  cluster_version = "1.29"

  vpc_id                   = var.vpc_id
  subnet_ids               = var.subnet_ids
  control_plane_subnet_ids = var.subnet_ids

  eks_managed_node_groups = {
    core_nodes = {
      min_size     = 2
      max_size     = 5
      desired_size = 2
      instance_types = ["t3.medium"]
      
      iam_role_arn = aws_iam_role.eks_node_role.arn
    }
  }
}

# --- Managed Database (PostgreSQL) ---
resource "aws_db_instance" "postgres" {
  identifier           = "${var.project_name}-${var.environment}-db"
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "16.1"
  instance_class       = "db.t3.micro"
  username             = "admin"
  password             = "supersecret" # FIXME: Use AWS Secrets Manager in production
  skip_final_snapshot  = true
}

# --- Time-Series (Timestream / Timescale DB Alternative) ---
resource "aws_timestreamwrite_database" "telemetry" {
  database_name = "${var.project_name}_${var.environment}_telemetry"
}

# --- Event Bus (MSK / Kafka) ---
resource "aws_msk_cluster" "kafka" {
  cluster_name           = "${var.project_name}-${var.environment}-msk"
  kafka_version          = "3.5.1"
  number_of_broker_nodes = 3

  broker_node_group_info {
    instance_type   = "kafka.t3.small"
    client_subnets  = var.subnet_ids
    security_groups = [var.default_sg]
  }
}
