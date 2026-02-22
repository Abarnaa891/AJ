terraform {
  required_version = ">= 1.6.0"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.32"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

resource "kubernetes_namespace" "kms_system" {
  metadata {
    name = "kms-system"
  }
}

resource "kubernetes_deployment" "kms_api_gateway" {
  metadata {
    name      = "kms-api-gateway"
    namespace = kubernetes_namespace.kms_system.metadata[0].name
    labels = {
      app = "kms-api-gateway"
    }
  }
  spec {
    replicas = 3
    selector {
      match_labels = {
        app = "kms-api-gateway"
      }
    }
    template {
      metadata {
        labels = {
          app = "kms-api-gateway"
        }
      }
      spec {
        container {
          name  = "gateway"
          image = "ghcr.io/example/kms-api-gateway:1.0.0"
          port {
            container_port = 8443
          }
        }
      }
    }
  }
}

resource "kubernetes_horizontal_pod_autoscaler_v2" "kms_api_hpa" {
  metadata {
    name      = "kms-api-gateway"
    namespace = kubernetes_namespace.kms_system.metadata[0].name
  }

  spec {
    min_replicas = 3
    max_replicas = 30

    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment.kms_api_gateway.metadata[0].name
    }

    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = 60
        }
      }
    }
  }
}
