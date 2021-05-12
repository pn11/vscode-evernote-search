import * as vscode from 'vscode';
import { Options, PythonShell } from 'python-shell';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('evernote-search.search', () => {
		// get Extension Path
		let ext_path = vscode.extensions.getExtension('undefined_publisher.evernote-search')?.extensionPath;
		// get pythonpath from VSCode config
		let pythonpath = vscode.workspace.getConfiguration('python').get<string>('pythonPath');
		console.log("Used Python Env:", pythonpath);

		let options: Options = {
			mode: 'text',
			pythonPath: pythonpath,
			pythonOptions: ['-u'], // get print results in real-time
			scriptPath: ext_path,
			args: ['テスト']
		};

		PythonShell.run('python/search.py', options, function (err, res) {
			console.log('Test executing a python script');
			if (err) {
				console.log(err);
				vscode.window.showErrorMessage((res || ['']).join('\n'));
				throw err;
			}
			const res_str: string = (res || ['']).join('\n');
			console.log(res_str);
			const panel = vscode.window.createWebviewPanel('searchResult', 'Evernote Search Result', vscode.ViewColumn.One);
			panel.webview.html = res_str;
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
