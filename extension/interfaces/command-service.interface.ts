import * as vscode from 'vscode';
export interface CommandService {
  registerCommands(): vscode.Disposable[];
}