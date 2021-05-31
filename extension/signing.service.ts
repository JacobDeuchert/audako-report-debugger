import * as vscode from 'vscode';
import * as crypto from 'crypto';
import * as fs from 'fs';

export class SigningService implements vscode.Disposable {


  private _disposable: vscode.Disposable[];

  constructor() {

    this._disposable = [];

    this._registerCommands();
  }

  public dispose(): void {
    this._disposable.map(dp => dp.dispose());
  }

  private _registerCommands(): void {
    const dp1 = vscode.commands.registerCommand('audako-report-debugger.signCurrentFile', async () => {

      const activeEditor = vscode.window.activeTextEditor;

      if (activeEditor) {
        const fileContent = activeEditor.document.getText();

        const hash = crypto.createHash('sha256');
        const fileHash = hash.update(fileContent, 'utf8').digest('hex');

        const selectedFiles = await vscode.window.showOpenDialog({
          canSelectFiles: true,
          canSelectFolders: false,
          canSelectMany: false,
          filters: { certificate: ['pfx', 'pem', 'cert', 'crt', 'key'] },
          title: 'SigningCertificate'
        });

        const filePath = selectedFiles[0]?.fsPath;

        const certificate = await fs.promises.readFile(filePath, {encoding: 'utf8'});

        console.log(2);





        

        const rsa = null;


      }
    });

    this._disposable.push(dp1);
  }



}