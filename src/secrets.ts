import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

interface ProjectEnvProvider {
  getValue(key: "GOOGLE_PROJECT_ID"): string;
}

export class SecretManager<T> {
  private client: SecretManagerServiceClient;
  private readonly projectId: string;

  constructor(env: ProjectEnvProvider) {
    this.projectId = env.getValue("GOOGLE_PROJECT_ID");
    this.client = new SecretManagerServiceClient({
      projectId: this.projectId,
    });
  }

  public async getSecret(secretName: T): Promise<string> {
    const [version] = await this.client.accessSecretVersion({
      name: `projects/${this.projectId}/secrets/${secretName}/versions/latest`,
    });
    const secretPayload = version.payload?.data?.toString();
    if (!secretPayload) {
      throw new Error(`Secret ${secretName} has no payload.`);
    }
    return secretPayload;
  }
}
