import * as vscode from 'vscode';
import * as fs from "fs";
import { Options, PythonShell } from 'python-shell';

export function activate(context: vscode.ExtensionContext) {
	let log = vscode.window.createOutputChannel("Evernote Search");

	let disposable = vscode.commands.registerCommand('evernote-search.search', () => {
		// get Extension Path
		let ext_path = vscode.extensions.getExtension('pn11.evernote-search')?.extensionPath;
		if (ext_path != undefined){
			log.appendLine("Extension path: " + ext_path);
		}
		else {
			log.appendLine("Error: Extension evernote-search not found.");
			log.show();
			vscode.window.showErrorMessage("Extension evernote-search not found.");
			return;
		}

		// get pythonpath from VSCode config
		let pythonpath = vscode.workspace.getConfiguration('python').get<string>('pythonPath');
		if (pythonpath != undefined){
			log.appendLine("Using Python Env: " + pythonpath);
		}
		else {
			log.appendLine("Error: Python environment not set.");
			log.show();
			vscode.window.showErrorMessage("Python environment not set.");
			return;
		}
		/*
		if (fs.existsSync(pythonpath)) {
		} else {
			log.appendLine("Error: Python environment not found.");
			log.show();
			vscode.window.showErrorMessage("Error: Python environment not found.");
			return;
		}
		*/
		
		let promptOptions = {
		    prompt: 'Evernote search query',
		    placeHolder: 'Evernote search query: https://dev.evernote.com/doc/articles/search_grammar.php',
		    value: '',
		    ignoreFocusOut: true
		};
		vscode.window.showInputBox(promptOptions).then(val => {
		    if (val != undefined) {
			  search(val, (pythonpath || ''), (ext_path || ''), log);
		    }
			else {
				log.appendLine('Unexpected error when calling Python.');
				log.show();
			}
		});
		

	});
	context.subscriptions.push(disposable);
}

// Request to Evernote using Python API
export function search(search_query: string, pythonpath: string, ext_path: string, log: vscode.OutputChannel) {
	let options: Options = {
		mode: 'text',
		pythonPath: pythonpath,
		pythonOptions: ['-u'], // get print results in real-time
		scriptPath: ext_path,
		args: [search_query]
	};
	PythonShell.run('python/search.py', options, function (err, res) {
		if (err) {
			log.appendLine((err.message));
			log.appendLine((err.traceback.toString()));
			log.appendLine((res || ['']).join('\n'));
			log.show();
			vscode.window.showErrorMessage((res || ['']).join('\n'));
			throw err;
		}
		const res_str: string = (res || ['']).join('\n');
		log.appendLine(res_str)
		const panel = vscode.window.createWebviewPanel('searchResult', 'Evernote Search Result', vscode.ViewColumn.One);
		panel.webview.html = res_str;
	});
}

export function deactivate() {}
