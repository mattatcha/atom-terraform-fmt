'use babel';

import { CompositeDisposable, BufferedProcess } from 'atom';

// Modified from
// https://github.com/chrw/atom-hclfmt/blob/188d119bb6f6ab1996beaa57860343b93a57705b/lib/hclfmt.js
export default {
    config: {
        fmtOnSave: {
            type: 'boolean',
            default: true,
            title: 'Format on save'
        },
        binPath: {
            type: 'string',
            default: 'terraform',
            title: 'Path to the terraform executable'
        }
    },

    activate(state) {
        this.subscriptions = new CompositeDisposable();

        this.subscriptions.add(atom.workspace.observeTextEditors((textEditor) => {
            this.subscriptions.add(textEditor.onDidSave((event) => {
                if (textEditor.getGrammar().scopeName != 'source.terraform') return;
                if (!atom.config.get('terraform-fmt.fmtOnSave')) return;
                this.format(event.path);
            }));
        }));

        this.subscriptions.add(atom.commands.add('atom-text-editor[data-grammar~="Terraform"]', 'terraform-fmt:format', () => {
            let textEditor = atom.workspace.getActiveTextEditor();
            if (textEditor.getGrammar().scopeName != 'source.terraform') return;
            textEditor.save();
            if (!atom.config.get('terraform-fmt.fmtOnSave')) {
                this.format(textEditor.getPath());
            }
        }));
    },

    deactivate() {
        this.subscriptions.dispose();
    },

    format(file) {
        new BufferedProcess({command: atom.config.get('terraform-fmt.binPath'), args: ['fmt', file]});
    }

};
