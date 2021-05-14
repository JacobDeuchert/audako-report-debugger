import { Configuration } from "./configuration.model";
import * as vscode from 'vscode';

export class ConfigurationService {

  private _configuration: Configuration;

  private _configurationSubscriber: ((configuration: Configuration) => void)[];

  constructor(private context: vscode.ExtensionContext) {
  
    this._loadConfiguration();

    this._configurationSubscriber = [];
  }

  public getConfiguration(): Configuration {
    return this._configuration;
  }

  public onConfigurationChanged(callback: (configuration: Configuration) => void): void {
    this._configurationSubscriber.push(callback);
  }


  public registerConfigurationCommands(): vscode.Disposable[] {

    
    const dp1 = vscode.commands.registerCommand('audako-report-debugger.setClientUrl', () => {
      this._setConfiguration('ClientUrl');
    });

    const dp2 = vscode.commands.registerCommand('audako-report-debugger.setReportTemplateId', () => {
      this._setConfiguration('ReportTemplateId');
    });

    
    const dp3 = vscode.commands.registerCommand('audako-report-debugger.setReportId', () => {
      this._setConfiguration('ReportId');
    });

    
    const dp4 = vscode.commands.registerCommand('audako-report-debugger.setIdToken', () => {
      this._setConfiguration('IdToken');
    });

    return [dp1, dp2, dp3, dp4];
  }

  private async _setConfiguration(key: keyof Configuration): Promise<void> {

    const currentValue =  this._configuration[key];

    const newValue = await vscode.window.showInputBox({placeHolder: key, value: currentValue});

    if (newValue && newValue.length > 0) {
      this._configuration[key] = newValue;
      this._storeConfiguration();
      this._proclaimConfiguration();
    }
  }

  private _proclaimConfiguration(): void {
    this._configurationSubscriber.forEach(x => x(this._configuration));
  }

  private _loadConfiguration(): void {
    const configurationJSON = this.context.workspaceState.get('configuration') as string;

    if (configurationJSON?.length > 0) {
      this._configuration = JSON.parse(configurationJSON) as Configuration;
    } else {
      this._configuration = { ClientUrl: null, IdToken: null, ReportTemplateId: null, ReportId: null};
    }
  }
  
  private _storeConfiguration(): void {
    const configurationJSON = JSON.stringify(this._configuration);

    this.context.workspaceState.update('configuration', configurationJSON);
  }


}