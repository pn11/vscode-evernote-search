// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Options, PythonShell } from 'python-shell';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-extension-with-python" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vscode-extension-with-python.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// List all extensions (yours comes last)
		// vscode.extensions.all.filter( e => {console.log(e)});

		// get path to extension
		console.log(vscode.extensions.getExtension('undefined_publisher.vscode-extension-with-python')?.extensionPath);
		let ext_path = vscode.extensions.getExtension('undefined_publisher.vscode-extension-with-python')?.extensionPath;

		// get pythonpath from VSCode config
		let pythonpath = vscode.workspace.getConfiguration('python').get<string>('pythonPath');
		console.log(pythonpath);

		let options1: Options = {
			mode: 'text', // response in text format
			pythonPath: pythonpath,
			pythonOptions: ['-u'], // get print results in real-time
		};
		PythonShell.runString(
			'\n\
import sys\n\
print(sys.executable)\n\
print(sys.version)\n\
import os\n\
print(os.getcwd())', options1, function (err, res) {
			console.log('Test executing a python string');
			if (err) {
				console.log(err);
				throw err;
			}
			res?.filter(r => {console.log(r)});
		});

		let options2: Options = {
			mode: 'text',
			pythonPath: pythonpath,
			pythonOptions: ['-u'], // get print results in real-time
			scriptPath: ext_path,
			args: ['Hello world from Python']
		};

		PythonShell.run('python/hello.py', options2, function (err, res) {
			console.log('Test executing a python script');
			if (err) {
				console.log(err);
				throw err;
			}
			const res_str: string = (res || [''])[0];
			console.log(res_str);
			// Display a message box to the user
			vscode.window.showInformationMessage(res_str);
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
