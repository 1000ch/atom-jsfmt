'use babel';

import * as path from 'path';
import jsfmt from 'jsfmt';

export const config = {
  formatOnSave: {
    title: 'Format on Save',
    description: 'Format JavaScript on Save.',
    type: 'boolean',
    default: false
  }
};

function format(text, syntax, config) {
  try {
    if (syntax === 'javascript') {
      return jsfmt.format(text, config);
    } else if (syntax === 'json') {
      return jsfmt.formatJSON(text, config);
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

function execute() {
  const editor = atom.workspace.getActiveTextEditor();

  if (!editor) {
    return;
  }

  let position = editor.getCursorBufferPosition();
  let filePath = editor.getPath();
  let text = editor.getText();
  let selectedText = editor.getSelectedText();
  let grammer = editor.getGrammar().name.toLowerCase();

  cosmiconfig('jsfmt', {
    cwd: path.dirname(filePath)
  }).then(result => {
    let config = {};

    if (result) {
      config = result.config;
    }

    if (selectedText.length !== 0) {
      let formatted = format(selectedText, grammer, config);
      if (formatted) {
        let range = editor.getSelectedBufferRange();
        editor.setTextInBufferRange(range, formatted);
        editor.setCursorBufferPosition(position);
      }
    } else {
      let formatted = format(text, grammer, config);
      if (formatted) {
        editor.setText(formatted);
        editor.setCursorBufferPosition(position);
      }
    }
  });
}

let editorObserver;
let formatOnSave;

export function activate(state) {
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

  formatOnSave = () => atom.config.get('jsfmt.formatOnSave');

  atom.config.observe('jsfmt.formatOnSave', value => formatOnSave = value);
}

export function deactivate() {
  editorObserver.dispose();
}
