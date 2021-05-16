import { Configuration } from "./models/configuration.model";
import * as vscode from 'vscode';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { DateFormats } from "./utils/DateUtils";
export class ConfigurationService {

  private _configuration: Configuration;

  private _configurationSubscriber: ((configuration: Configuration) => void)[];

  constructor(private context: vscode.ExtensionContext) {

    dayjs.extend(customParseFormat);
  
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
      return this._setConfiguration('ClientUrl');
    });

    const dp2 = vscode.commands.registerCommand('audako-report-debugger.setReportTemplateId', () => {
      return this._setConfiguration('ReportTemplateId');
    });

    
    const dp3 = vscode.commands.registerCommand('audako-report-debugger.setReportId', () => {
      return this._setConfiguration('ReportId');
    });

    
    const dp4 = vscode.commands.registerCommand('audako-report-debugger.setIdToken', () => {
      return this._setConfiguration('IdToken');
    });

        
    const dp5 = vscode.commands.registerCommand('audako-report-debugger.setDebugDate', () => {
      if (!this._configuration.DebugDate) {
        this._configuration.DebugDate = new Date().toLocaleString();
      }
      return this._setConfiguration('DebugDate');
    });

    return [dp1, dp2, dp3, dp4, dp5];
  }

  private async _setConfiguration(key: keyof Configuration): Promise<string> {

    const currentValue =  this._configuration[key];

    let newValue = await vscode.window.showInputBox({placeHolder: key, value: currentValue});

    if (newValue && newValue.length > 0) {

      if (key === 'DebugDate') {

        if (!this._isValidDate(newValue)) {
          vscode.window.showErrorMessage('Error: Invalid Date');
          newValue = new Date().toLocaleString();
        }

        
      }

      this._configuration[key] = newValue;
      this._storeConfiguration();
      this._proclaimConfiguration();
    }

    return newValue;
  }

  private _proclaimConfiguration(): void {
    this._configurationSubscriber.forEach(x => x(this._configuration));
  }

  private _loadConfiguration(): void {
    const configurationJSON = this.context.globalState.get('configuration') as string;

    if (configurationJSON?.length > 0) {
      this._configuration = JSON.parse(configurationJSON) as Configuration;
    } else {
      this._configuration = new Configuration();
    }
  }
  
  private _storeConfiguration(): void {
    const configurationJSON = JSON.stringify(this._configuration);

    this.context.globalState.update('configuration', configurationJSON);
  }

  private _isValidDate(dateString: string): boolean {
  
    const dayDate = dayjs(dateString, DateFormats);
    return dayDate.isValid();
  }


}