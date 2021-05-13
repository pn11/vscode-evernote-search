import * as vscode from 'vscode';
import { Options, PythonShell } from 'python-shell';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('evernote-search.search', () => {
		// get Extension Path
		let ext_path = vscode.extensions.getExtension('undefined_publisher.evernote-search')?.extensionPath;
		// get pythonpath from VSCode config
		let pythonpath = vscode.workspace.getConfiguration('python').get<string>('pythonPath');
		console.log("Used Python Env:", pythonpath);
		
		let promptOptions = {
		    prompt: 'Evernote search query',
		    placeHolder: 'Evernote search query: https://dev.evernote.com/doc/articles/search_grammar.php',
		    value: '',
		    ignoreFocusOut: true
		};
		vscode.window.showInputBox(promptOptions).then(val => {
		    if (val != undefined) {
			  search(val, pythonpath, ext_path)
		    }
			else {
				console.log('error');
			}
		});
		

	});
	context.subscriptions.push(disposable);
}

// Request to Evernote using Python API
function search(search_query: string, pythonpath: string | undefined, ext_path: string | undefined) {
	let options: Options = {
		mode: 'text',
		pythonPath: pythonpath,
		pythonOptions: ['-u'], // get print results in real-time
		scriptPath: ext_path,
		args: [search_query]
	};

	PythonShell.run('python/search.py', options, function (err, res) {
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
}

export function deactivate() {}
