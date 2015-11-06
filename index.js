'use babel';

import fs from 'fs';
import jsfmt from 'jsfmt';

const directory = atom.project.getDirectories().shift();
const configPath = directory ? directory.resolve('.jsfmtrc') : '';
const userConfig = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath)) : null;

export let config = {
  formatOnSave: {
    title: 'Format on Save',
    description: 'Format JavaScript on Save.',
    type: 'boolean',
    default: false
  }
};

const formatOnSave = () => atom.config.get('jsfmt.formatOnSave');

const format = (text, syntax) => {

  try {
    if (syntax === 'javascript') {
      return jsfmt.format(text, userConfig);
    } else if (syntax === 'json') {
      return jsfmt.formatJSON(text, userConfig);
    }
  } catch (e) {
    console.error(e);
  }

  return null;
};

const execute = () => {

  const editor = atom.workspace.getActiveTextEditor();

  if (!editor) {
    return;
  }

  let position = editor.getCursorBufferPosition();
  let text = editor.getText();
  let selectedText = editor.getSelectedText();
  let grammer = editor.getGrammar().name.toLowerCase();

  if (selectedText.length !== 0) {
    let formatted = format(selectedText, grammer);
    if (formatted) {
      let range = editor.getSelectedBufferRange()
      editor.setTextInBufferRange(range, formatted);
    }
  } else {
    let formatted = format(text, grammer);
    if (formatted) {
      editor.setText(formatted);
    }
  }

  editor.setCursorBufferPosition(position);
};

let editorObserver = null;

export const activate = (state) => {

  atom.commands.add('atom-workspace', 'jsfmt:execute', () => {
    execute();
  });

  editorObserver = atom.workspace.observeTextEditors((editor) => {
    editor.getBuffer().onWillSave(() => {
      if (formatOnSave()) {
        execute();
      }
    });
  });
};

export const deactivate = () => {
  editorObserver.dispose();
};
