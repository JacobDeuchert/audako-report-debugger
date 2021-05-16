export class ClientConfiguration {
  public Authentication: { BaseUril: string, ClientId: string};

  public Configuration: { MaintenanceEnabled: boolean, WikiUrl: string, MultiCopyEnabled: boolean};

  public Services: { BaseUri: string, Structure: string, Driver: string, Calendar: string, Camera: string, Event: string, Historian: string, Live: string, Maintenance: string, Messenger: string, Reporting: string};
}