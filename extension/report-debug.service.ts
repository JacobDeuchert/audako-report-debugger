import * as vscode from 'vscode';
import * as fs from 'fs';
import { ConfigurationService } from "./configuration.service";
import { CommandService } from "./interfaces/command-service.interface";
import axios from "axios";
import * as FormData from "form-data";
import { Configuration } from './models/configuration.model';
import { ClientConfiguration } from './models/client-configuration.model';
import { LoggerService } from './logger.service';
import { DateFormats } from './utils/DateUtils';
import * as dayjs from 'dayjs';
import { ReportPreviewService } from './report-preview.service';

export class ReportDebugService implements CommandService {

  private _currentReportName: string;


  constructor(private configurationService: ConfigurationService, private loggerService: LoggerService, private reportWebviewService: ReportPreviewService) {

  }

  public registerCommands(): vscode.Disposable[] {

    var dp1 = vscode.commands.registerCommand('audako-report-debugger.uploadRunCurrentFile', async () => {

      this.loggerService.createLogger();

      try {
        let configuration = this.configurationService.getConfiguration();

        configuration = await this._validateConfiguration(configuration);

        const clientConfiguration = await this._getClientConfiguration(configuration.ClientUrl);

        this.loggerService.log('Uploading File....');

        await this._uploadFile(configuration, clientConfiguration);

        this.loggerService.log('Run Report...');

        await this._runReport(configuration, clientConfiguration);

      } catch (err) {
        this.loggerService.log(err);
      }
      


    });

    return [dp1];
  }


  private async _uploadFile(configuration: Configuration, clientConfiguration: ClientConfiguration): Promise<void> {

    
    const activeEditor = vscode.window.activeTextEditor;

    if (!activeEditor) {
      throw new Error('No active editor/file was found');
    }

    console.log(activeEditor);
    const filePath = activeEditor.document.uri.fsPath;

    this._currentReportName = this._getFileNameFromPath(filePath);

    console.log('FilePaht', filePath, 'hello');

    if (!filePath) {
      throw new Error('FilePath for active editor not found. Make sure to save the file!');
    }

    const fileStream = fs.createReadStream(filePath);


    const formData = new FormData();
    formData.append('file', fileStream);

    const fileType = this._currentReportName.endsWith('html') ? 'template' : 'script';

    try
    {
      const uploadUrl = this._getUploadUrl(configuration, clientConfiguration, fileType);

      console.log(uploadUrl);

      const uploadResponse = await axios.post(uploadUrl, formData, {
        headers: {
          'Authorization': 'Bearer ' + configuration.IdToken,
          ...formData.getHeaders()
        }
      });

      if (uploadResponse.status === 200) {
        return null;
      }

      throw new Error('Unknown Reponse' + JSON.stringify(uploadResponse));

    } catch (err) {
      throw new Error('Failed to upload file with error: ' + err);
    }


  }

  private async _runReport(configuration: Configuration, clientConfiguration: ClientConfiguration): Promise<void> {

    try {
      const debugUrl = this._getDebugUrl(configuration, clientConfiguration);
      
      let debugDate = dayjs(configuration.DebugDate, DateFormats);

      if (!debugDate.isValid()) {
        debugDate = dayjs();
      }

      const body = {
        Timezone: 'CET',
        StartDate: debugDate.toDate(),
        EndDate: debugDate.toDate()
      }

      const debugResponse = await axios.post(debugUrl, JSON.stringify(body), {
        headers: {    'Authorization': 'Bearer ' + configuration.IdToken, 'content-type': 'application/json'},
        
      });

      if (debugResponse.status === 200) {
        const data = debugResponse.data as {report: string, logs: string};
        this.loggerService.log(data.logs);

        this.reportWebviewService.showReport(this._currentReportName, data.report);
      }

      const test = 1;

      return null;
    } catch (err) {
      throw new Error('Failed to run report: ' + err)
    }
  }

  private async _getClientConfiguration(clientUrl: string): Promise<ClientConfiguration> {

    try {
      const url = clientUrl + '/assets/conf/application.config';
      const request = await axios.get(url);

      if (request.status === 200) {
        return request.data as ClientConfiguration;
      } else {
        throw new Error('Unknown Reponse' + JSON.stringify(request));
      }
      
    } catch (err) {
     throw new Error('Failed to retrieve application config with error: ' + err);
    }
  }

  private _getUploadUrl(configuration: Configuration, clientConfiguration: ClientConfiguration, fileType: 'template' | 'script'): string {
    return `${clientConfiguration.Services.BaseUri}${clientConfiguration.Services.Structure}/scada/reporttemplate/${configuration.ReportTemplateId}/file/${fileType}`;
  }

  private _getDebugUrl(configuration: Configuration, clientConfiguration: ClientConfiguration): string {
    return `${clientConfiguration.Services.BaseUri}${clientConfiguration.Services.Reporting}/report/${configuration.ReportId}/generate/template/${configuration.ReportTemplateId}?$debugging=true`
  }

  private async _validateConfiguration(configuration: Configuration): Promise<Configuration> {

    if (!configuration.ClientUrl) {
      throw new Error('Missing client url');
    }

    configuration.ClientUrl = this._validateClientUrl(configuration.ClientUrl);

    if (!configuration.ReportTemplateId) {
      throw new Error('Missing report id');
    }

    if (!configuration.ReportId) {
      throw new Error('Missing report id');
    }

    // if not token was provided execute command to set id token
    if (!configuration.IdToken) {
      const newToken = await this._requestNewToken();

      console.log('New Token', newToken);

      configuration.IdToken = newToken;
    }


    return configuration;
  }

  private _validateClientUrl(url: string): string {

    if (!(url.startsWith('http') || url.startsWith('https'))) {
      url = 'http://' + url;
    }


    if (url.endsWith('/home')) {
      url.replace('/home', '');
    }

    if (url.endsWith('/')) {
      url.slice(0, -1);
    }

    return url;
  }

  private async _requestNewToken(): Promise<string> {
    const token = await vscode.commands.executeCommand('audako-report-debugger.setIdToken') as string;
    if (!token || token.length === 0) {
      throw new Error('No Valid Id Token provided');
    }

    return token;
  }

  private _getFileNameFromPath(path: string): string {

    if (!path) 
      return null;

    const pathElements = path.split('/');

    return pathElements[pathElements.length - 1];
  }
}