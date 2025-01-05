import * as vscode from 'vscode';
const axios = require('axios').default;

interface AxiosError {
    response?: {
        data?: {
            error?: {
                message?: string;
            };
        };
    };
    message: string;
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Claude extension is now active');

    let disposable = vscode.commands.registerCommand('claude-vscode.askClaude', async () => {
        console.log('askClaude command triggered');

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active text editor');
            return;
        }

        const selection = editor.selection;
        const text = editor.document.getText(selection);

        if (!text) {
            vscode.window.showErrorMessage('No text selected');
            return;
        }

        // Create WebView panel
        console.log('Creating webview panel');
        const panel = vscode.window.createWebviewPanel(
            'claudeChat',
            'Claude Chat',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true
            }
        );

        // Update panel content with selected code
        panel.webview.html = getWebviewContent(text);
        console.log('Panel created and initial content set');

        try {
            const config = vscode.workspace.getConfiguration('claude-vscode');
            const apiKey = config.get<string>('apiKey');

            if (!apiKey) {
                vscode.window.showErrorMessage('Please set your Claude API key in settings');
                panel.webview.html = getWebviewContent(text, 'Please set your Claude API key in settings');
                return;
            }

            // Show loading state
            panel.webview.html = getWebviewContent(text, 'Asking Claude...');

            const response = await axios.post('https://api.anthropic.com/v1/messages', {
                messages: [{ role: 'user', content: text }],
                model: "claude-3-opus-20240229",
                max_tokens: 1000
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                }
            });

            // Update with response
            panel.webview.html = getWebviewContent(text, response.data.content[0].text);
            console.log('Response received and panel updated');

        } catch (error) {
            console.error('Error:', error);
            const err = error as AxiosError;
            const errorMessage = err.response?.data?.error?.message || err.message || 'Unknown error';
            panel.webview.html = getWebviewContent(text, `Error: ${errorMessage}`);
            vscode.window.showErrorMessage(`Error: ${errorMessage}`);
        }
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(code: string, response: string | null = null): string {
    return `<!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    padding: 20px;
                    color: var(--vscode-editor-foreground);
                }
                .code-section {
                    background-color: var(--vscode-editor-background);
                    padding: 15px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                }
                .response-section {
                    background-color: var(--vscode-editor-background);
                    padding: 15px;
                    border-radius: 6px;
                }
                pre {
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
                h3 {
                    margin-top: 0;
                    color: var(--vscode-editor-foreground);
                }
            </style>
        </head>
        <body>
            <div class="code-section">
                <h3>Selected Code</h3>
                <pre><code>${escapeHtml(code)}</code></pre>
            </div>
            
            <div class="response-section">
                <h3>Claude's Response</h3>
                ${response ? `<div>${formatResponse(response)}</div>` : '<div>Waiting for Claude\'s response...</div>'}
            </div>
        </body>
    </html>`;
}

function formatResponse(response: string): string {
    const parts = response.split('```');
    return parts.map((part, index) => {
        if (index % 2 === 0) {
            return escapeHtml(part).replace(/\n/g, '<br>');
        } else {
            return `<pre><code>${escapeHtml(part)}</code></pre>`;
        }
    }).join('');
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function deactivate() {}