import { ParserOutput } from './../Parser';
import {
  ServiceDiscoveryClient,
  ListNamespacesCommand,
  ListNamespacesCommandInput,
  NamespaceSummary,
  ListServicesCommand,
  ListServicesCommandInput,
  ServiceSummary,
  ListInstancesCommand,
  ListInstancesCommandInput,
  InstanceSummary
} from "@aws-sdk/client-servicediscovery";

export interface AwsAdapterSendInput extends ParserOutput {
}

export class AwsAdapter {

  client: ServiceDiscoveryClient

  constructor(client: ServiceDiscoveryClient) {
    this.client = client;
  }

  async send(request: AwsAdapterSendInput): Promise<string | {} | null> {
    const foundNS: NamespaceSummary|null = await this.findNamespace(request.namespace);
    if (!foundNS || !foundNS.Id) {
      return null;
    }

    const foundService: ServiceSummary| null = await this.findService(foundNS.Id, request.serviceName);
    if (!foundService || !foundService.Id) {
      return null;
    }

    const foundInstance: InstanceSummary| null = await this.findInstance(foundService.Id, request.instanceId);

    if (!foundInstance || !foundInstance.Attributes) {
      return null;
    }

    return foundInstance.Attributes;
  }

  protected async findInstance(serviceId: string, instanceId: string): Promise<InstanceSummary | null>{
    const paramsInstance:ListInstancesCommandInput = {
      ServiceId: serviceId
    }
    const commandInstances = new ListInstancesCommand(paramsInstance);
    let iResponse;
    
    try {
      iResponse = await this.client.send(commandInstances);
    } catch (error) {
      console.log(error)
    } finally {
    }

    const foundInstances = iResponse?.Instances?.filter((instance: InstanceSummary) => instance.Id === instanceId)
    if (!foundInstances || foundInstances.length === 0) {
      return null;
    }

    const foundInstance:InstanceSummary = foundInstances[0];

    return foundInstance;
  }

  protected async findService(namespaceId: string, serviceName: string): Promise<ServiceSummary | null>{

    const params: ListServicesCommandInput = {
      Filters: [
        {
          Name: 'NAMESPACE_ID',
          Condition: 'EQ',
          Values: [ namespaceId ]
        }
      ]
    };
    const commandServices = new ListServicesCommand(params);
    let sResponse;
    try {
      sResponse = await this.client.send(commandServices);
    } catch (error) {
      console.log(error)
    } finally {
    }

    const foundServices = sResponse?.Services?.filter((service: ServiceSummary) => service.Name === serviceName)
    if (!foundServices || foundServices.length === 0) {
      return null;
    }

    const foundService: ServiceSummary = foundServices[0];

    return foundService;
  }

  protected async findNamespace(namespaceName: string): Promise<NamespaceSummary | null>{
    const requestAws: ListNamespacesCommandInput = {}

    const command = new ListNamespacesCommand(requestAws);
    let nsResponse;
    try {
      nsResponse = await this.client.send(command);
    } catch (error) {
      console.log(error)
    } finally {
    }

    const foundNamespaces = nsResponse?.Namespaces?.filter((ns: NamespaceSummary) => ns.Name === namespaceName)
    if (!foundNamespaces || foundNamespaces.length === 0) {
      return null;
    }

    const foundNS: NamespaceSummary = foundNamespaces[0];
    return foundNS;
  }
}