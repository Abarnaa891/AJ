# System Architecture Diagram (Textual)

## High-Level Logical Diagram

```text
                              ┌────────────────────────────────────────┐
                              │         Admin / Client SDKs          │
                              │ (REST, gRPC, Terraform, Console UI)  │
                              └──────────────────┬─────────────────────┘
                                                 │ TLS 1.3 + mTLS (svc-svc)
                                          ┌──────▼──────┐
                                          │ API Gateway │
                                          │ AuthN, WAF, │
                                          │ Quotas      │
                                          └──────┬──────┘
               ┌─────────────────────────────────┼──────────────────────────────────┐
               │                                 │                                  │
        ┌──────▼────────┐                ┌──────▼──────────┐                ┌──────▼────────────┐
        │ KMS Control   │                │ KMS Crypto      │                │ IAM Policy Engine │
        │ Plane Service │                │ Plane Service   │                │ + Inheritance     │
        │ (keys, policy │                │ (encrypt/sign)  │                │ evaluator         │
        │ lifecycle)    │                │ stateless pods  │                └──────┬────────────┘
        └──────┬────────┘                └──────┬──────────┘                       │
               │                                 │                                  │
  ┌────────────▼───────────────┐    ┌────────────▼─────────────┐         ┌─────────▼─────────┐
  │ Metadata Store (PostgreSQL)│    │ Key Material Boundary     │         │ Audit Log Service │
  │ projects/locations/rings/  │    │ - SOFTWARE KMS enclave    │         │ append-only hash  │
  │ keys/versions/iam policies │    │ - HSM pool abstraction     │         │ chain + export    │
  └────────────┬───────────────┘    │ - EKM connector clients    │         └─────────┬─────────┘
               │                    └────────────┬─────────────┘                   │
               │                                 │                                  │
        ┌──────▼─────────┐               ┌───────▼────────┐                 ┌───────▼──────────┐
        │ Redis Cache    │               │ HSM Mock Tier  │                 │ SIEM / Monitoring│
        │ policy & key   │               │ FIPS L3 sim    │                 │ (OTel, Prometheus│
        │ metadata cache │               └────────────────┘                 │ and log sinks)    │
        └────────────────┘                                                  └───────────────────┘
```

## Data Flow

1. Client authenticates via OAuth2/OIDC/JWT or workload identity.
2. API Gateway enforces TLS 1.3, request schema checks, quota/rate limit.
3. IAM policy engine resolves inherited policy from Project → Key Ring → Crypto Key.
4. Control plane handles key lifecycle changes (create, import, rotate, disable, destroy).
5. Crypto plane performs envelope operations using DEK + KEK model.
6. Key material stays inside secure boundary (software enclave/HSM/EKM proxy).
7. Audit service records immutable entries (hash-chained + signed segments).
8. Events/metrics exported to SIEM and cloud monitoring.

## Multi-Region Model

- Active-active API layer in 3+ regions.
- Regional key rings; optional multi-region rings with synchronous metadata replication.
- Strong consistency for IAM and key state transitions.
- Async replication for non-critical analytics and dashboards.
