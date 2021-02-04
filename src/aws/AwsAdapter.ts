import { ParserOutput } from "./../Parser";
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
  InstanceSummary,
} from "@aws-sdk/client-servicediscovery";

export type AwsAdapterSendInput = ParserOutput;
export type NamespaceSummaryAws = NamespaceSummary | null;
export type InstanceSummaryAws = InstanceSummary | null;
export type ServiceSummaryAws = ServiceSummary | null;
export type AwsAdapterSendOutput = { [key: string]: string } | null;

export class AwsAdapter {
  client: ServiceDiscoveryClient;

  constructor(client: ServiceDiscoveryClient) {
    this.client = client;
  }

  async send(request: AwsAdapterSendInput): Promise<AwsAdapterSendOutput> {
    const foundNS: NamespaceSummaryAws = await this.findNamespace(
      request.namespace
    );
    if (!foundNS || !foundNS.Id) {
      return null;
    }

    const foundService: ServiceSummaryAws = await this.findService(
      foundNS.Id,
      request.serviceName
    );
    if (!foundService || !foundService.Id) {
      return null;
    }

    const foundInstance: InstanceSummaryAws = await this.findInstance(
      foundService.Id,
      request.instanceId
    );

    if (!foundInstance || !foundInstance.Attributes) {
      return null;
    }

    return foundInstance.Attributes;
  }

  protected async findInstance(
    serviceId: string,
    instanceId: string
  ): Promise<InstanceSummaryAws> {
    const paramsInstance: ListInstancesCommandInput = {
      ServiceId: serviceId,
    };
    const commandInstances = new ListInstancesCommand(paramsInstance);
    let iResponse;

    try {
      iResponse = await this.client.send(commandInstances);
    } catch (error) {
      console.log(error);
    }

    const foundInstances = iResponse?.Instances?.filter(
      (instance: InstanceSummary) => instance.Id === instanceId
    );
    if (!foundInstances || foundInstances.length === 0) {
      return null;
    }

    const foundInstance: InstanceSummary = foundInstances[0];

    return foundInstance;
  }

  protected async findService(
    namespaceId: string,
    serviceName: string
  ): Promise<ServiceSummaryAws> {
    const params: ListServicesCommandInput = {
      Filters: [
        {
          Name: "NAMESPACE_ID",
          Condition: "EQ",
          Values: [namespaceId],
        },
      ],
    };
    const commandServices = new ListServicesCommand(params);
    let sResponse;
    try {
      sResponse = await this.client.send(commandServices);
    } catch (error) {
      console.log(error);
    }

    const foundServices = sResponse?.Services?.filter(
      (service: ServiceSummary) => service.Name === serviceName
    );
    if (!foundServices || foundServices.length === 0) {
      return null;
    }

    const foundService: ServiceSummary = foundServices[0];

    return foundService;
  }

  protected async findNamespace(
    namespaceName: string
  ): Promise<NamespaceSummaryAws> {
    const requestAws: ListNamespacesCommandInput = {};

    const command = new ListNamespacesCommand(requestAws);
    let nsResponse;
    try {
      nsResponse = await this.client.send(command);
    } catch (error) {
      console.log(error);
    }

    const foundNamespaces = nsResponse?.Namespaces?.filter(
      (ns: NamespaceSummary) => ns.Name === namespaceName
    );
    if (!foundNamespaces || foundNamespaces.length === 0) {
      return null;
    }

    const foundNS: NamespaceSummary = foundNamespaces[0];
    return foundNS;
  }
}
