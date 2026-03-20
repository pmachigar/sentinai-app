# --- Dedicated Service Account for GKE Nodes (Principle of Least Privilege) ---
resource "google_service_account" "gke_sa" {
  account_id   = "${var.project_name}-gke-sa"
  display_name = "GKE Service Account for SentinAI"
}

# Otorgamos únicamente roles base para escritura logs y métricas, en vez de full Editor/Owner
resource "google_project_iam_member" "gke_logging" {
  project = var.gcp_project
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.gke_sa.email}"
}

resource "google_project_iam_member" "gke_monitoring" {
  project = var.gcp_project
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.gke_sa.email}"
}

# --- Role Assignment for Pub/Sub ---
# Restringido sólo para publicar al tópico específico de telemetría IoT
resource "google_pubsub_topic_iam_member" "pubsub_publisher" {
  project = var.gcp_project
  topic   = google_pubsub_topic.iot_telemetry.name
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${google_service_account.gke_sa.email}"
}
