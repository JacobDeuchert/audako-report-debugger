export class Configuration {
  public ClientUrl: string;
  public ReportTemplateId: string;
  public ReportId: string;
  public IdToken: string;

  constructor() {
    this.ClientUrl = null;
    this.ReportTemplateId = null;
    this.ReportId = null;
    this.IdToken = null;
  }
}