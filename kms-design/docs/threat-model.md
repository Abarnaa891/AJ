# Threat Model

## Method

STRIDE-based analysis across API, control plane, crypto plane, storage, and integrations.

## Assets

- Key material (KEKs, HMAC secrets, asymmetric private keys)
- Policy and identity bindings
- Audit trail integrity
- Availability of encryption/decryption/signing services

## Threats and Mitigations

### 1. Spoofing
- **Threat:** Attacker impersonates workload identity.
- **Mitigations:** OIDC token validation, short-lived credentials, mTLS service identity, nonce and audience checks.

### 2. Tampering
- **Threat:** Unauthorized mutation of IAM policy or key states.
- **Mitigations:** RBAC with deny rules, dual-control for destructive actions, signed policy updates with etags, immutable audit logs.

### 3. Repudiation
- **Threat:** Actor denies performing key operations.
- **Mitigations:** Tamper-resistant append-only logs, clock synchronization, request signature traces, external archival.

### 4. Information Disclosure
- **Threat:** Exposure of private key material, plaintext, or decrypted DEKs.
- **Mitigations:** Non-exportable private keys, in-memory zeroization, envelope encryption, restricted debug paths, secret scanning.

### 5. Denial of Service
- **Threat:** High-volume encrypt/decrypt calls exhaust service.
- **Mitigations:** Global + per-principal quotas, adaptive rate limiting, autoscaling, circuit breakers, queue backpressure.

### 6. Elevation of Privilege
- **Threat:** Viewer role abuse to gain decrypt permissions.
- **Mitigations:** Principle of least privilege, permission boundaries, policy simulation tooling, break-glass workflow with approval.

## Compliance Mapping

- **FIPS 140-2:** HSM tier target equivalent controls; approved algorithms and key sizes.
- **GDPR:** Data minimization, region pinning, configurable retention for logs and key metadata.
- **SOC 2:** Access controls, auditability, change management, monitoring and incident response.
