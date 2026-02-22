# Cloud KMS Reference Architecture (GCP KMS-like)

This package provides a production-style design for a cloud-native Key Management Service modeled after Google Cloud KMS.

## Deliverables

- **System architecture diagram (textual):** `docs/system-architecture.md`
- **Database schema:** `db/schema.sql`
- **API specification (OpenAPI):** `api/openapi.yaml`
- **IAM model design:** `docs/iam-model.md`
- **Key lifecycle state machine:** `docs/key-lifecycle-state-machine.md`
- **Threat model:** `docs/threat-model.md`
- **Deployment architecture:** `docs/deployment-architecture.md`
- **Terraform baseline:** `iac/main.tf`

## Scope Highlights

- Key hierarchy: Project → Location → Key Ring → Crypto Key → Crypto Key Version
- Protection levels: SOFTWARE, HSM, EXTERNAL (EKM)
- Supported key types: AES-256 symmetric, RSA (2048/3072/4096), ECC (P-256/P-384), HMAC
- APIs: REST + gRPC-style endpoints for encrypt/decrypt/sign/verify/mac/random/public key
- IAM: inheritance at project, key ring, and key levels with deny-overrides and condition support
- Reliability goals: Multi-region replication and stateless API autoscaling for 99.99% availability
