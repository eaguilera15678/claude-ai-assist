"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const axios = require('axios').default;
function activate(context) {
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
        const panel = vscode.window.createWebviewPanel('claudeChat', 'Claude Chat', vscode.ViewColumn.Beside, {
            enableScripts: true
        });
        // Update panel content with selected code
        panel.webview.html = getWebviewContent(text);
        console.log('Panel created and initial content set');
        try {
            const config = vscode.workspace.getConfiguration('claude-vscode');
            const apiKey = config.get('apiKey');
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
        }
        catch (error) {
            console.error('Error:', error);
            const err = error;
            const errorMessage = err.response?.data?.error?.message || err.message || 'Unknown error';
            panel.webview.html = getWebviewContent(text, `Error: ${errorMessage}`);
            vscode.window.showErrorMessage(`Error: ${errorMessage}`);
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function getWebviewContent(code, response = null) {
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
function formatResponse(response) {
    const parts = response.split('```');
    return parts.map((part, index) => {
        if (index % 2 === 0) {
            return escapeHtml(part).replace(/\n/g, '<br>');
        }
        else {
            return `<pre><code>${escapeHtml(part)}</code></pre>`;
        }
    }).join('');
}
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map