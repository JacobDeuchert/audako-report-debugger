import * as vscode from 'vscode';

export class LoggerService implements vscode.Disposable {

  private outputChannel: vscode.OutputChannel;

  constructor() {
  }

  dispose() {
    if (this.outputChannel) {
      this.outputChannel.dispose();
    }
  }

  public createLogger(): void {

    if (this.outputChannel) {
      this.outputChannel.clear();
    }

    this.outputChannel = vscode.window.createOutputChannel('report-debugger');
    this.outputChannel.show(true);
  }

  public log(message: string): void {
    this.outputChannel.appendLine(message);
  }
}