import { SimpleAwsCloudMapConfig } from "./SimpleAwsCloudMap";

export interface ParserOutput {
  namespace: string;
  serviceName: string;
  instanceId: string;
}

export class Parser {
  config: SimpleAwsCloudMapConfig;

  constructor(config: SimpleAwsCloudMapConfig) {
    this.config = config;
  }

  read(inputString: string): ParserOutput {
    const sp = inputString.split("->");
    const instance = sp[2] || "";
    const enviroment = this.config.environment || "";

    if (!instance && !enviroment) {
      throw new Error("Invalid instance id.");
    }

    return {
      namespace: sp[0],
      serviceName: sp[1],
      instanceId:
        this.config.mapEnvToInstanceId === true ? enviroment : instance,
    };
  }
}
