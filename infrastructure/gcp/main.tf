terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project
  region  = var.gcp_region
}

# --- GKE Cluster (Kubernetes) ---
resource "google_container_cluster" "primary" {
  name     = "${var.project_name}-gke-cluster"
  location = var.gcp_region
  
  # Remover el node pool predeterminado, crear nodos con una Service Account específica (least privilege)
  remove_default_node_pool = true
  initial_node_count       = 1
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "${var.project_name}-node-pool"
  location   = var.gcp_region
  cluster    = google_container_cluster.primary.name
  node_count = 2

  node_config {
    machine_type = "e2-medium"
    
    # IAM: Usamos Service Account de Least Privilege
    service_account = google_service_account.gke_sa.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}

# --- Managed Database (Cloud SQL para PostgreSQL) ---
resource "google_sql_database_instance" "postgres" {
  name             = "${var.project_name}-postgres-db"
  database_version = "POSTGRES_15"
  region           = var.gcp_region

  settings {
    tier = "db-f1-micro"
  }
  deletion_protection = false # Falso para entornos Dev
}

# --- Event Bus / Stream (Pub/Sub) ---
resource "google_pubsub_topic" "iot_telemetry" {
  name = "${var.project_name}-iot-telemetry"
}

resource "google_pubsub_subscription" "telemetry_sub" {
  name  = "${var.project_name}-telemetry-sub"
  topic = google_pubsub_topic.iot_telemetry.name
  
  # Retention policies and dead-letter topics can be defined here
}
