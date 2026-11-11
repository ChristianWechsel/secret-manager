import { SecretManager } from "../index.js";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

jest.mock("@google-cloud/secret-manager", () => ({
  SecretManagerServiceClient: jest.fn().mockImplementation(() => ({
    accessSecretVersion: jest.fn().mockResolvedValue([
      { payload: { data: Buffer.from("integration-secret") } },
    ]),
  })),
}));

describe("SecretManager public API", () => {
  it("uses the configured project and returns a secret through the package entry point", async () => {
    const projectId = "integration-project";
    const env = { getValue: jest.fn().mockReturnValue(projectId) };
    const secretManager = new SecretManager(env);

    await expect(secretManager.getSecret("integration-secret-name")).resolves.toBe(
      "integration-secret",
    );

    expect(env.getValue).toHaveBeenCalledWith("GOOGLE_PROJECT_ID");
    expect(SecretManagerServiceClient).toHaveBeenCalledWith({ projectId });
  });
});