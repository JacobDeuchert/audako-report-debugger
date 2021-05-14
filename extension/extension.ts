// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SidebarProvider } from './webview';
import * as child_process from 'child_process';
import * as path from 'path';
import { ConfigurationService } from './configuration.service';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const configurationService = new ConfigurationService(context);

	const configurationDisposables = configurationService.registerConfigurationCommands();

	var sidebarProvider = new SidebarProvider(context, configurationService);
	vscode.window.registerWebviewViewProvider("audako-report-debugger-view", sidebarProvider);


	context.subscriptions.push(...configurationDisposables);
}

// this method is called when your extension is deactivated
export function deactivate() {}
