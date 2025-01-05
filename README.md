# Claude VS Code Extension

A Visual Studio Code extension that integrates Claude AI directly into your editor. Get AI assistance, code explanations, and more without leaving VS Code.

## Features

- 🤖 Direct integration with Claude AI
- ⌨️ Simple keyboard shortcuts
- 🔒 Secure API key storage
- 📝 Support for multiple Claude models
- 💡 Context-aware responses based on your code

## Installation

1. Download the .vsix file from the releases page
2. In VS Code, press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Install from VSIX" and select the downloaded file
4. Restart VS Code

## Configuration

Before using the extension, you need to configure your Claude API key:

1. Get your API key from [Anthropic Console](https://console.anthropic.com/)
2. Open VS Code Settings (`Ctrl+,` or `Cmd+,` on Mac)
3. Search for "Claude"
4. Enter your API key in the "Claude VS Code: Api Key" field

Additional settings:
- `claude-vscode.model`: Choose which Claude model to use (default: claude-3-opus-20240229)

## Usage

1. Select text in your editor
2. Use one of these methods to ask Claude:
   - Press `Ctrl+Shift+C` (`Cmd+Shift+C` on Mac)
   - Press `Ctrl+Shift+P` and type "Ask Claude"
   - Right-click and select "Ask Claude" from the context menu
3. Claude's response will appear in a new output channel

## Examples

Here are some ways you can use the extension:

1. Code explanation:
   - Select a complex piece of code
   - Ask Claude to explain what it does

2. Code improvement:
   - Select code you want to improve
   - Ask Claude for suggestions

3. Documentation:
   - Select a function or class
   - Ask Claude to generate documentation

4. Bug finding:
   - Select problematic code
   - Ask Claude to identify potential issues

## Development

To build the extension locally:

```bash
# Clone the repository
git clone https://github.com/nnaveenraju/claude-ai-assist.git

# Install dependencies
cd claude-vscode
npm install

# Compile
npm run compile

# Package
npm install -g vsce
vsce package
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Author

Naveen N (naveen.ai.startup@gmail.com)

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.