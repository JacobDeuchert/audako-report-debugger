// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SidebarProvider } from './sidebar-webview';
import { ConfigurationService } from './configuration.service';
import { ReportDebugService } from './report-debug.service';
import { LoggerService } from './logger.service';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { ReportPreviewService } from './report-preview.service';
import { SigningService } from './signing.service';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('settings', vscode.workspace.getConfiguration());

	// create services
	const loggerService = new LoggerService();

	const configurationService = new ConfigurationService(context);

	const reportWebviewService = new ReportPreviewService();

	const signingService = new SigningService();

	const reportDebugService = new ReportDebugService(configurationService, loggerService, reportWebviewService);

	// register service commands
	const configurationDisposables = configurationService.registerConfigurationCommands();

	const debugDispoables = reportDebugService.registerCommands();

	// register webview sidebar
	var sidebarProvider = new SidebarProvider(context, configurationService);
	vscode.window.registerWebviewViewProvider("audako-report-debugger-view", sidebarProvider);


	// load dayjs plugins
	dayjs.extend(customParseFormat);

	context.subscriptions.push(...configurationDisposables, ...debugDispoables, loggerService);
}

// this method is called when your extension is deactivated
export function deactivate() {}
