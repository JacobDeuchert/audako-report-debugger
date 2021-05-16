import * as vscode from 'vscode';

export class ReportPreviewService implements vscode.Disposable {

  private panel: vscode.WebviewPanel;


  constructor() {

  }


  public showReport(reportName: string, html: string): void {
   
    if (!this.panel) {
      this._createWebviewPanel();
    }

    this.panel.title = 'Preview - '+ reportName;
    this.panel.webview.html = html;
  }

  public dispose(): void {
    this.panel?.dispose();
  }

  private _createWebviewPanel() {
    this.panel = vscode.window.createWebviewPanel('report-webview', 'ReportDebugger', vscode.ViewColumn.Beside, {enableScripts: true});
  }
}