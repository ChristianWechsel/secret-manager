locals {
  gcp_repository_name = "${var.github_owner}-${var.github_repo_name}"
}

# ------------------------------------------------------------------------------
# Reference existing shared resources with data blocks.
# ------------------------------------------------------------------------------
data "google_service_account" "cloudbuild_sa" {
  account_id = var.account_id
  project    = var.project_id
}

# ------------------------------------------------------------------------------
# Repository-specific Cloud Build triggers.
# ------------------------------------------------------------------------------
resource "google_cloudbuild_trigger" "main_branch_trigger" {
  name            = "${var.github_repo_name}-push-trigger"
  location        = var.location
  description     = "Starts Cloud Build on every push to ${var.target_branch}"
  service_account = data.google_service_account.cloudbuild_sa.id

  repository_event_config {
    repository = "projects/${var.project_id}/locations/${var.location}/connections/${var.github_connection_name}/repositories/${local.gcp_repository_name}"
    
    push {
      branch = "^${var.target_branch}$"
    }
  }

  filename = "cloudbuild.yaml"
  substitutions = {
    _SCOPE = var.npm_scope
    _GAR_REPOSITORY = var.npm_repository_id
    _NPM_SECRET_NAME = var.npm_secret_name
  }
}

resource "google_cloudbuild_trigger" "tag_release_trigger" {
  name            = "${var.github_repo_name}-tag-trigger"
  location        = var.location
  description     = "Publishes to npm for every Git tag matching v*"
  service_account = data.google_service_account.cloudbuild_sa.id
  
  repository_event_config {
    repository = "projects/${var.project_id}/locations/${var.location}/connections/${var.github_connection_name}/repositories/${local.gcp_repository_name}"
    
    push {
      tag = "^v.*"
    }
  }

  filename = "cloudbuild.yaml"
  substitutions = {
    _SCOPE = var.npm_scope
    _GAR_REPOSITORY = var.npm_repository_id
    _NPM_SECRET_NAME = var.npm_secret_name
  }  
}