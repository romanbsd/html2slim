// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import https from 'https';

async function convert(text: string) : Promise<string> {
    return new Promise((resolve, reject) => {
        // URL encode the text
        const params = new URLSearchParams();
        params.append('raw_text', text);

        // Define your API endpoint and options
        const options = {
            hostname: 'html-2-slim.onrender.com',
            port: 443,
            path: '/convert',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        };

        // Make the request
        const req = https.request(options, res => {
            let data = '';

            // A chunk of data has been received.
            res.on('data', chunk => data += chunk);

            // The whole response has been received.
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    if (parsedData.converted_text) {
                        resolve(parsedData.converted_text);
                    } else {
                        reject('No converted_text found');
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);

        // Send the request
        req.write(params.toString());
        req.end();
    });
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.convertContents', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No editor is active');
            return;
        }

        const selection = editor.selection;
        const text = editor.document.getText(selection);

        // Check if there's a selection
        if (!text) {
            vscode.window.showInformationMessage('No text is selected');
            return;
        }

        try {
            const convertedText = await convert(text);
            editor.edit(editBuilder => {
                editBuilder.replace(selection, convertedText);
            });
        } catch (error) {
            vscode.window.showErrorMessage('Error converting text: ' + error);
        }
    });

    context.subscriptions.push(disposable);
}


// This method is called when your extension is deactivated
export function deactivate() {}
