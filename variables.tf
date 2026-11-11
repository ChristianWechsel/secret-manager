variable "project_id" {
  type        = string
  description = "GCP Projekt-ID, in der die Ressourcen verwaltet werden."
}

variable "location" {
  type        = string
  description = "GCP Region für Cloud Build Trigger."
}

variable "github_connection_name" {
  type        = string
  description = "Name der GitHub-Verbindung in Cloud Build (2nd Gen)."
}

variable "github_repo_name" {
  type        = string
  description = "Name des verknüpften GitHub-Repositories."
}

variable "target_branch" {
  type        = string
  description = "Git-Branch, auf den der Cloud Build Push-Trigger reagieren soll."
}

variable "account_id" {
  type        = string
  description = "Account-ID des Service Accounts für Cloud Build."
}

variable "github_owner" {
  type        = string
  description = "GitHub Owner"
}

variable "npm_scope" {
  type        = string
  description = "Scope of npm project"
}

variable "npm_repository_id" {
  type        = string
  description = "Name des Artifact Registry Repositories für npm."
}

variable "npm_secret_name" {
  type        = string
  description = "Name des Secrets im Secret Manager für den NPM-Token."
}
