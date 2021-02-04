import { ServiceDiscoveryClientConfig } from "@aws-sdk/client-servicediscovery";
import { Parser } from "./Parser";
import { AwsAdapter, AwsAdapterSendOutput } from "./aws/AwsAdapter";
import { ServiceDiscoveryClient } from "@aws-sdk/client-servicediscovery";
const defaultOptions: SimpleAwsCloudMapConfig = {
  awsClient: {},
  mapEnvToInstanceId: true,
};
export interface SimpleAwsCloudMapConfig {
  awsClient: ServiceDiscoveryClientConfig;
  environment?: string;
  mapEnvToInstanceId?: boolean;
}

export class SimpleAwsCloudMap {
  awsAdapter: AwsAdapter;
  parser: Parser;

  constructor(config: SimpleAwsCloudMapConfig) {
    const mergerdOptions = { ...defaultOptions, ...config };

    this.parser = new Parser(mergerdOptions);
    const client = new ServiceDiscoveryClient(mergerdOptions.awsClient);
    this.awsAdapter = new AwsAdapter(client);
  }

  async get(inputString: string): Promise<AwsAdapterSendOutput> {
    const requestAws = this.parser.read(inputString);

    return this.awsAdapter.send(requestAws);
  }
}
