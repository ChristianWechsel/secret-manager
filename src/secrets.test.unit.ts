import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { SecretManager } from "./secrets.js";

jest.mock("@google-cloud/secret-manager", () => ({
  SecretManagerServiceClient: jest.fn().mockImplementation(() => ({
    accessSecretVersion: jest.fn(),
  })),
}));

describe("SecretManager", () => {
  const projectId = "test-project";
  const secretName = "database-password";
  const env = {
    getValue: jest.fn().mockReturnValue(projectId),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates the Google client with the configured project", () => {
    new SecretManager(env);

    expect(env.getValue).toHaveBeenCalledWith("GOOGLE_PROJECT_ID");
    expect(SecretManagerServiceClient).toHaveBeenCalledWith({ projectId });
  });

  it("retrieves and returns the latest secret payload", async () => {
    const secretManager = new SecretManager(env);
    const client = jest.mocked(SecretManagerServiceClient).mock.results[0]
      ?.value;
    const accessSecretVersion = jest.mocked(client.accessSecretVersion);
    accessSecretVersion.mockResolvedValue([
      { payload: { data: Buffer.from("sensitive-value") } },
    ]);

    await expect(secretManager.getSecret(secretName)).resolves.toBe(
      "sensitive-value",
    );
    expect(accessSecretVersion).toHaveBeenCalledWith({
      name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
    });
  });

  it("throws when the secret response has no payload", async () => {
    const secretManager = new SecretManager(env);
    const client = jest.mocked(SecretManagerServiceClient).mock.results[0]
      ?.value;
    jest.mocked(client.accessSecretVersion).mockResolvedValue([{}]);

    await expect(secretManager.getSecret(secretName)).rejects.toThrow(
      `Secret ${secretName} has no payload.`,
    );
  });

  it("throws when the secret payload is empty", async () => {
    const secretManager = new SecretManager(env);
    const client = jest.mocked(SecretManagerServiceClient).mock.results[0]
      ?.value;
    jest
      .mocked(client.accessSecretVersion)
      .mockResolvedValue([{ payload: { data: Buffer.from("") } }]);

    await expect(secretManager.getSecret(secretName)).rejects.toThrow(
      `Secret ${secretName} has no payload.`,
    );
  });

  it("propagates errors from Google Secret Manager", async () => {
    const secretManager = new SecretManager(env);
    const client = jest.mocked(SecretManagerServiceClient).mock.results[0]
      ?.value;
    const apiError = new Error("Permission denied");
    jest.mocked(client.accessSecretVersion).mockRejectedValue(apiError);

    await expect(secretManager.getSecret(secretName)).rejects.toBe(apiError);
  });
});
