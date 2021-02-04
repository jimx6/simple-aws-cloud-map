import { Parser } from "../Parser";

describe("Parser test case", () => {
  it("Parser should return namespace", () => {
    const parser = new Parser({
      awsClient: {},
      environment: "production",
    });
    const parsed = parser.read("namespace->gateway");
    expect(parsed.namespace).toBe("namespace");
  });
  it("Parser should return serviceName", () => {
    const parser = new Parser({
      awsClient: {},
      environment: "production",
    });
    const parsed = parser.read("namespace->gateway");
    expect(parsed.serviceName).toBe("gateway");
  });
  it("Parser should return env as instanceId when mapEnvToInstanceId is true", () => {
    const parser = new Parser({
      awsClient: {},
      environment: "production",
      mapEnvToInstanceId: true,
    });
    const parsed = parser.read("namespace->gateway");
    expect(parsed.instanceId).toBe("production");
  });
  it("Parser should return instanceId", () => {
    const parser = new Parser({
      awsClient: {},
      environment: "production",
      mapEnvToInstanceId: false,
    });
    const parsed = parser.read("namespace->gateway->instanceId");
    expect(parsed.instanceId).toBe("instanceId");
  });
});
