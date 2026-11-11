# @christian-wechsel/secret-manager

A small TypeScript client for retrieving text secrets from [Google Cloud Secret Manager](https://cloud.google.com/secret-manager).

## Features

- Retrieves the latest version of a secret by name.
- Uses Google Cloud Application Default Credentials (ADC); credentials are managed by the Google Cloud client library.
- Ships TypeScript declarations and supports ECMAScript modules.

## Requirements

- Node.js 18 or later.
- A Google Cloud project with the Secret Manager API enabled.
- An identity with `roles/secretmanager.secretAccessor` access to the secrets it needs.

## Install

```sh
npm install @christian-wechsel/secret-manager
```

## Configure Google Cloud access

The Google Cloud client library uses ADC to authenticate. For local development, sign in with:

```sh
gcloud auth application-default login
```

In production, configure ADC using the credentials provided by your runtime, such as an attached service account or Workload Identity. Avoid embedding service account keys in your application.

Enable the API if it is not already enabled:

```sh
gcloud services enable secretmanager.googleapis.com --project=YOUR_PROJECT_ID
```

Grant the runtime identity access to each required secret. For example:

```sh
gcloud secrets add-iam-policy-binding DATABASE_PASSWORD \
  --project=YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"
```

Set `GOOGLE_PROJECT_ID` to the project containing the secrets. The package accepts a small provider function instead of reading environment variables directly.

## Usage

```js
import { SecretManager } from "@christian-wechsel/secret-manager";

const projectId = process.env.GOOGLE_PROJECT_ID;
if (!projectId) {
  throw new Error("GOOGLE_PROJECT_ID is required");
}

const secrets = new SecretManager({
  getValue: () => projectId,
});

const databasePassword = await secrets.getSecret("DATABASE_PASSWORD");
// Use databasePassword without logging or exposing it.
```

`getSecret(secretName)` returns a `Promise<string>` containing the UTF-8 value of the secret's `latest` version. It fetches the value from Secret Manager when called; it does not cache secrets. Make sure the identity used by ADC has access to the named secret.

## Errors and secret handling

Google Cloud API errors, including missing permissions and unknown secret names, are surfaced to the caller. The client also throws if the response has no payload. Handle these errors at the appropriate application boundary, and avoid logging, committing, or otherwise exposing secret values.

## Development

```sh
npm ci
npm run build-prod
npm test
```

Other available scripts:

| Command | Description |
| --- | --- |
| `npm run build` | Compile the development TypeScript project. |
| `npm run build-prod` | Compile the production package to `dist/`. |
| `npm run test:unit` | Build and run unit tests. |
| `npm run test:int` | Build and run integration tests. |

The repository's Cloud Build configuration runs tests on branch pushes and publishes `v*` tag releases to public npm. Branch builds publish to the configured private Artifact Registry. See [cloudbuild.yaml](cloudbuild.yaml) and [main.tf](main.tf) for the pipeline and trigger configuration.

## License

[MIT](LICENSE)
