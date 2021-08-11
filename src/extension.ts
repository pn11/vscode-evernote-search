import * as vscode from 'vscode';
import * as fs from "fs";
import * as ini from "ini"
import * as evernote from "evernote"

export function activate(context: vscode.ExtensionContext) {
	let log = vscode.window.createOutputChannel("Evernote Search");

	let disposable = vscode.commands.registerCommand('evernote-search.search', () => {
		let promptOptions = {
			prompt: 'Evernote search query',
			placeHolder: 'Evernote search query: https://dev.evernote.com/doc/articles/search_grammar.php',
			value: '',
			ignoreFocusOut: true
		};
		vscode.window.showInputBox(promptOptions).then(val => {
			if (val != undefined) {
				search(val, log);
			}
			else {
				log.appendLine('Unexpected error.');
				log.show();
			}
		});

	});
	context.subscriptions.push(disposable);
}

function load_token(log: vscode.OutputChannel): string {
	const homedir = require('os').homedir();
	try {
		const config = ini.parse(fs.readFileSync(homedir + '/.evernote-search.cfg', 'utf-8'))
		const token = config['settings']['EVERNOTE_TOKEN']
		return token
	} catch (e) {
		log.appendLine(e)
		log.show()
		return ''
	}
}

function request_search(search_query: string, log: vscode.OutputChannel) {
	const token = load_token(log)
	if (token == '') {
		return
	}
	var client = new evernote.Client({
		token: token,
		sandbox: false, // change to false when you are ready to switch to production
		china: false, // change to true if you wish to connect to YXBJ - most of you won't
	});

	var noteStore = client.getNoteStore();
	var filter = new evernote.NoteStore.NoteFilter({
		// この記法が使える https://dev.evernote.com/doc/articles/search_grammar.php
		words: search_query,
		ascending: false
	})
	var spec = new evernote.NoteStore.NotesMetadataResultSpec({
		includeTitle: true,
		includeContentLength: true,
		includeCreated: true,
		includeUpdated: true,
		includeDeleted: true,
		includeUpdateSequenceNum: true,
		includeNotebookGuid: true,
		includeTagGuids: true,
		includeAttributes: true,
		includeLargestResourceMime: true,
		includeLargestResourceSize: true,
	})
	return Promise.all([
		client.getUserStore().getUser(),
		noteStore.findNotesMetadata(filter, 0, 100, spec)])
		.then(function (res) {
			const [user, notesMetadataList] = res
			return createHTML(user, notesMetadataList)
		}).catch(function (err) {
			log.appendLine('Error code = ' + err.errorCode + ': ' + err.parameter)
			log.show()
			return 'Search Failed. See error message.'
		})
}

function make_link(user: evernote.Types.User, note: any) {
	return 'https://www.evernote.com/shard/' + user.shardId + '/nl/' + user.id + '/' + note.guid
}


function createHTML(user: evernote.Types.User, notesMetadataList: evernote.NoteStore.NotesMetadataList) {
	var html = ''
	html += '<ul>'
	notesMetadataList.notes?.filter(note => {
		html += '<li><a href=' + make_link(user, note) + '>' + note.title + '</a></li>'

	}
	)
	html += '</ul>'
	return html
}

export function search(search_query: string, log: vscode.OutputChannel) {
	const panel = vscode.window.createWebviewPanel('searchResult', 'Evernote Search Result', vscode.ViewColumn.One);
	request_search(search_query, log)?.then((html) => { panel.webview.html = html })
}

export function deactivate() { }
