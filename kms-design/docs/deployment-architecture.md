# Deployment Architecture

## Runtime Topology (Kubernetes)

- **Namespace split:** `kms-system`, `kms-data`, `kms-observability`.
- **Stateless services:**
  - `kms-api-gateway` (REST + gRPC ingress)
  - `kms-control-plane`
  - `kms-crypto-plane`
  - `kms-iam-engine`
  - `kms-audit-service`
  - `kms-ui` (React + Material UI)
- **Stateful services:**
  - PostgreSQL HA (metadata)
  - Redis (cache/rate limit counters)
  - Object storage (audit segment archival)

## Multi-Region Strategy

- Deploy identical stacks in three regions.
- Global load balancer routes to nearest healthy region.
- Metadata DB: logical replication + regional read replicas; consensus for IAM/key state changes.
- Disaster recovery:
  - RPO < 5 minutes for metadata
  - RTO < 30 minutes for regional failover

## CI/CD

1. PR validation: lint, unit, API compatibility checks, IaC validation.
2. Build: signed container images + SBOM generation.
3. Deploy: progressive rollout (canary), policy checks (OPA), auto rollback on SLO breach.
4. Post-deploy: synthetic encrypt/decrypt/sign probes.

## Security Controls

- TLS 1.3 at ingress, mTLS for service mesh.
- Pod security standards + non-root containers.
- KMS services isolated with NetworkPolicies.
- Dedicated node pools for crypto plane and HSM simulation components.

## UI Dashboard Functional Modules

- Project selector and location filter.
- Key ring and crypto key browser.
- Key version timeline with lifecycle state badges.
- IAM policy editor (binding + conditions + dry-run simulator).
- Rotation scheduler (manual + periodic).
- Audit log viewer with export filters.
- API usage metrics and latency panels (Google Cloud Console-style information hierarchy).
