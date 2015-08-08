'use babel';

import jsfmt from 'jsfmt';

export let config = {
  formatOnSave: {
    title: 'Format on Save',
    description: 'Execute formatting JavaScript on save.',
    type: 'boolean',
    default: false
  }
};

const formatOnSave = () => atom.config.get('jsfmt.formatOnSave');

const format = (text, syntax) => {

  try {
    let config = jsfmt.getConfig();
    if (syntax === 'javascript') {
      return jsfmt.format(text, config);
    } else if (syntax === 'json') {
      return jsfmt.formatJSON(text, config);
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

  let text = editor.getText();
  let selectedText = editor.getSelectedText();
  let grammer = editor.getGrammar().name.toLowerCase();

  if (selectedText.length !== 0) {
    let formatted = format(selectedText, grammer);
    if (formatted) {
      editor.setTextInBufferRange(
        editor.getSelectedBufferRange(),
        formatted
      );
    }
  } else {
    let formatted = format(text, grammer);
    if (formatted) {
      editor.setText(formatted);
    }
  }
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
