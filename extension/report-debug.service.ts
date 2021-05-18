import * as vscode from 'vscode';
import * as fs from 'fs';
import { ConfigurationService } from "./configuration.service";
import { CommandService } from "./interfaces/command-service.interface";
import { Configuration } from './models/configuration.model';
import { ClientConfiguration } from './models/client-configuration.model';
import { LoggerService } from './logger.service';
import { DateFormats } from './utils/DateUtils';
import * as dayjs from 'dayjs';
import { ReportPreviewService } from './report-preview.service';
import jwt_decode from 'jwt-decode';
import * as rp from 'request-promise-native';
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

    const filePath = activeEditor.document.uri.fsPath;

    this._currentReportName = this._getFileNameFromPath(filePath);

    if (!filePath) {
      throw new Error('FilePath for active editor not found. Make sure to save the file!');
    }

    const fileStream = fs.createReadStream(filePath);


    const formData = {
      file: fileStream,
    }

    const fileType = this._currentReportName.endsWith('html') ? 'template' : 'script';

    try
    {
      const uploadUrl = this._getUploadUrl(configuration, clientConfiguration, fileType);

      const uploadHeaders = {...this._getAuthorizationHeader(configuration.IdToken)};

      const uploadResponse = await rp.post(uploadUrl, {
        headers: uploadHeaders,
        formData: formData,
        resolveWithFullResponse: true
      });

      if (uploadResponse.statusCode === 200) {
        return null;
      }

      throw new Error('Unknown Reponse: ' + uploadResponse);

    } catch (e: any) {

      const err: string = e.toString();

      if (err.includes('StatusCodeError: 401')) {
        this._retryWithNewIdToken();  
        throw new Error('401 Unauthorized: Invalid Token.');
      } 

      throw new Error('Failed to upload file: ' + err);
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

      const debugResponse = await rp.post(debugUrl, {
        headers: {    'Authorization': 'Bearer ' + configuration.IdToken, 'content-type': 'application/json'},
        body: body,
        json: true,
        resolveWithFullResponse: true
      });

      console.log(debugResponse);

      if (debugResponse.statusCode === 200) {
        const data = debugResponse.body as {report: string, logs: string};
        this.loggerService.log(data.logs);

        this.reportWebviewService.showReport(this._currentReportName, data.report);
      }

      return null;
    } catch (err) {
      throw new Error('Failed to run report: ' + err)
    }
  }

  private async _getClientConfiguration(clientUrl: string): Promise<ClientConfiguration> {

    try {
      const url = clientUrl + '/assets/conf/application.config';
      const response = await rp.get(url, { json: true});
      console.log(response);
      return response as ClientConfiguration;
      
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

    this._validateIdToken(configuration.IdToken);
    

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

  private _getAuthorizationHeader(idToken:string): {[p: string]: any} {
    return {
      Authorization: 'Bearer ' + idToken
    }
  }

  private _getFileNameFromPath(path: string): string {

    if (!path) 
      return null;

    const pathElements = path.split('/');

    return pathElements[pathElements.length - 1];
  }

  private _validateIdToken(token:string): boolean {
    const decodedToken = jwt_decode(token) as {exp: number};

    if(decodedToken.exp * 1000 < new Date().getTime()) {
      this.loggerService.log('Token expired');

      return false;
    }

    return true;
  }


  private async _retryWithNewIdToken(): Promise<void> {
    var newToken =  await vscode.commands.executeCommand('audako-report-debugger.setIdToken') as string;

    if (!newToken) {
      vscode.window.showErrorMessage('No valid token provided');
      return;
    }

    vscode.commands.executeCommand('audako-report-debugger.uploadRunCurrentFile')
  }
}