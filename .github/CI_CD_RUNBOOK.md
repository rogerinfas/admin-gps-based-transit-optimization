# CI/CD Runbook (Admin Frontend)

## Branch strategy

- `develop`: integration branch, CI validation only.
- `main`: release branch, CI + CD deployment.

## CI workflow

File: `.github/workflows/ci.yml`

Jobs run in this order:

1. `lint`
2. `build`

Trigger:

- `pull_request` and `push` on `develop`, `main`, `master`.

## CD workflow

File: `.github/workflows/cd.yml`

Trigger:

- `push` on `main`, `master`.

Jobs run in this order:

1. `preflight`: validate required secrets.
2. `build_and_push`: build Docker image and push to Docker Hub.
3. `deploy`: SSH into VPS and deploy with `docker compose pull + up -d`.

## Required GitHub secrets

- `VPS_HOST`
- `VPS_USER`
- `VPS_PORT`
- `VPS_KEY`
- `FRONTEND_APP_PATH`
- `NEXT_PUBLIC_API_BASE_URL`
- `REGISTRY_USERNAME`
- `REGISTRY_TOKEN`

## Runtime image strategy

- Image repository: `rderoger/admin-gps-based-transit-optimization`
- Tags pushed by CD:
  - `${GITHUB_SHA}` (immutable deploy tag)
  - `latest` (rolling tag)

## Domain and Traefik requirements

- Domain: `https://gps-based-transit-optimization.onlinestornsoftware.win`
- Container must join `proxy_net`.
- Required labels include:
  - `traefik.enable=true`
  - router `rule=Host(...)`
  - `entrypoints=websecure`
  - `tls.certresolver=cloudflare`
  - service port `3000`

## Release checklist

1. Merge feature PR into `develop`.
2. Confirm CI is green on `develop`.
3. Promote `develop -> main`.
4. Confirm CD jobs pass (`preflight`, `build_and_push`, `deploy`).
5. Validate domain returns HTTP 200 over HTTPS.

## Fast troubleshooting

- `ssh: unable to authenticate`:
  - check `VPS_USER`, `VPS_HOST`, `VPS_PORT`, `VPS_KEY`.
- `Host key verification failed` during clone:
  - ensure `REPO_URL` uses `https://github.com/...` in CD workflow.
- CD passes but domain shows `404`:
  - check Traefik router labels, especially `entrypoints=websecure`.
- Docker push auth failures:
  - check `REGISTRY_USERNAME` and `REGISTRY_TOKEN`.
- TLS certificate not issued:
  - verify DNS A record points to VPS and Traefik has valid router + certresolver.
