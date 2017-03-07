'use babel';

import { CompositeDisposable } from 'atom';
import { type } from 'os';
import { normalize, join } from 'path';
import execa from 'execa';

const unix = normalize(join(__dirname, 'node_modules', '.bin', 'jsfmt'));
const win = normalize(join(__dirname, 'node_modules', '.bin', 'jsfmt.cmd'));
const jsfmt = type() === 'Windows_NT' ? win : unix;

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

  const grammer = editor.getGrammar().name.toLowerCase();
  const args = grammer === 'json' ? ['--json'] : [];
  const buffer = Buffer.from(editor.getText());

  execa.stdout(jsfmt, args, {
    encoding: null,
    input: buffer
  }).then(stdout => {
    const position = editor.getCursorBufferPosition();
    editor.setText(stdout.toString());
    editor.setCursorBufferPosition(position);
  }).catch(error => {
    atom.notifications.addError(error.toString(), {});
  });
}
