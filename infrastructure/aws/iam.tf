# --- Principle of Least Privilege for EKS Nodes ---
resource "aws_iam_role" "eks_node_role" {
  name = "${var.project_name}-${var.environment}-eks-node-role"

  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
    Version = "2012-10-17"
  })
}

# Solo permisos básicos de worker node en lugar de administrador
resource "aws_iam_role_policy_attachment" "eks_worker_node" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "eks_cni" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "ecr_readonly" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_node_role.name
}

# --- Specific Access to the Event Bus (MSK) ---
data "aws_iam_policy_document" "msk_least_privilege_policy" {
  statement {
    actions = [
      "kafka-cluster:Connect",
      "kafka-cluster:DescribeCluster",
      "kafka-cluster:ReadData",
      "kafka-cluster:WriteData"
    ]
    # Restrict to the specific MSK cluster ARN
    resources = [aws_msk_cluster.kafka.arn]
  }
}

resource "aws_iam_policy" "msk_access" {
  name   = "${var.project_name}-${var.environment}-msk-access"
  policy = data.aws_iam_policy_document.msk_least_privilege_policy.json
}

resource "aws_iam_role_policy_attachment" "eks_msk_access" {
  policy_arn = aws_iam_policy.msk_access.arn
  role       = aws_iam_role.eks_node_role.name
}
