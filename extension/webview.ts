import * as vscode from 'vscode';
import * as path from 'path';
import { getVSCodeDownloadUrl } from 'vscode-test/out/util';
import { Configuration } from './configuration.model';
import { ConfigurationService } from './configuration.service';
import { config } from 'process';

export class SidebarProvider implements vscode.WebviewViewProvider {

  private webviewView: vscode.WebviewView;

  constructor(private context: vscode.ExtensionContext, private configurationService: ConfigurationService) {

    this.configurationService.onConfigurationChanged((config) => this._updateWebviewConfig(config));
  
  }

  public resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void {

    this.webviewView = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
    };

    webviewView.webview.html = this._getWebviewContent();

    webviewView.webview.onDidReceiveMessage(message => this._handleWebviewMessage(message));
  }

  private _handleWebviewMessage(message: { command: string, args: any[] }): void {
    switch (message.command) {
      case 'init':
        this._updateWebviewConfig(this.configurationService.getConfiguration());
        break;
      case 'setClientUrl':
      case 'setReportTemplateId':
      case 'setReportId':
        this._execCommand(message.command); 
        break;
    }
  }


  private _execCommand(command: string): void {
    vscode.commands.executeCommand(`audako-report-debugger.${command}`);
  }



  private _getWebviewContent(): string {



    const bundleJS = this._getWebviewFileUrl('bundle.js');
    const bundleCSS = this._getWebviewFileUrl('bundle.css');
    const vscodeCSS = this._getWebviewFileUrl('vscode.css');

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    
      <link rel='stylesheet' href="${bundleCSS}">

      
      <link rel='stylesheet' href="${vscodeCSS}">
    
      <script defer src="${bundleJS}"></script>

      <script> const vscode = acquireVsCodeApi()</script>

    </head>
    <body>
    
    </body>
    </html>`;
  }

  private _getWebviewFileUrl(file: string): vscode.Uri {
    return this.webviewView.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, 'dist', 'webview', file)));
  }

  private _updateWebviewConfig(configuration: Configuration): void {
    this.webviewView.webview.postMessage({
      command: 'setConfiguration',
      configuration: JSON.stringify(configuration)
    })
  }
}
