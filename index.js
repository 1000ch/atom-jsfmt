'use babel';

import { normalize, join } from 'path';
import { spawn } from 'child_process';
import { CompositeDisposable } from 'atom';

const JSFMT_PATH = normalize(join(__dirname, 'node_modules', '.bin', 'jsfmt'));

let subscriptions;
let editorObserver;
let formatOnSave;

export function activate(state) {
  subscriptions = new CompositeDisposable();
  subscriptions.add(atom.config.observe('jsfmt.formatOnSave', value => formatOnSave = value));

  atom.commands.add('atom-workspace', 'jsfmt:execute', () => {
    execute();
  });

  editorObserver = atom.workspace.observeTextEditors(editor => {
    editor.getBuffer().onWillSave(() => {
      if (formatOnSave) {
        execute();
      }
    });
  });
}

export function deactivate() {
  subscriptions.dispose();
  editorObserver.dispose();
}

function execute() {
  const editor = atom.workspace.getActiveTextEditor();

  if (!editor) {
    return;
  }

  let position = editor.getCursorBufferPosition();
  let filePath = editor.getPath();
  let grammer = editor.getGrammar().name.toLowerCase();

  let args = [filePath];
  if (grammer === 'json') {
    args.push('--json');
  }

  let chunks = [];
  let cp = spawn(JSFMT_PATH, args);
  cp.stdout.on('data', chunk => {
    chunks.push(chunk);
  });

  cp.on('error', error => {
    console.error(error);
  });

  cp.on('exit', () => {
    let position = editor.getCursorBufferPosition();
    editor.setText(Buffer.concat(chunks).toString());
    editor.setCursorBufferPosition(position);
  });
}
