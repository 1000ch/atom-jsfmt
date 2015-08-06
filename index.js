'use babel';

import jsfmt from 'jsfmt';

export let config = {
  executeOnSave: {
    title: 'Execute on save',
    description: 'Execute formatting JavaScript on save.',
    type: 'boolean',
    default: false
  }
};

const executeOnSave = () => atom.config.get('jsfmt.executeOnSave');

const execute = () => {

  console.log('execute');

  const editor = atom.workspace.getActiveTextEditor();

  if (!editor) {
    return;
  }

  let text = editor.getText();
  let selectedText = editor.getSelectedText();
  let formatted = '';
  let grammer = editor.getGrammar().name.toLowerCase();
  let config = jsfmt.getConfig();

  if (selectedText.length !== 0) {
    try {
      if (grammer === 'javascript') {
         formatted = jsfmt.format(selectedText, config)
      } else if (grammer === 'json') {
         formatted = jsfmt.formatJSON(selectedText, config)
      } else {
        return;
      }

      editor.setTextInBufferRange(editor.getSelectedBufferRange(), formatted);
    } catch (e) {}
  } else {
    try {
      if (grammer === 'javascript') {
         formatted = jsfmt.format(text, config)
      } else if (grammer === 'json') {
         formatted = jsfmt.formatJSON(text, config)
      } else {
        return;
      }

      editor.setText(formatted);
    } catch (e) {}
  }
};

let editorObserver = null;

export const activate = (state) => {

  atom.commands.add('atom-workspace', 'jsfmt:execute', () => {
    execute();
  });

  editorObserver = atom.workspace.observeTextEditors((editor) => {
    editor.getBuffer().onWillSave(() => {
      if (executeOnSave()) {
        execute();
      }
    });
  });
};

export const deactivate = () => {
  editorObserver.dispose();
};
