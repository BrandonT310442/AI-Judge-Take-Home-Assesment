import React, { useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import tokenizerService from '@/services/tokenizer';

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  onTokensChange?: (tokens: number) => void;
  model?: string;
  height?: string;
  readOnly?: boolean;
}

export function PromptEditor({
  value,
  onChange,
  onTokensChange,
  model = 'gpt-4',
  height = '400px',
  readOnly = false
}: PromptEditorProps) {
  // Handle editor change
  const handleEditorChange = useCallback((newValue: string | undefined) => {
    const val = newValue || '';
    onChange(val);
    
    // Calculate tokens
    if (onTokensChange) {
      const tokens = tokenizerService.countTokens(val, model);
      onTokensChange(tokens);
    }
  }, [onChange, onTokensChange, model]);

  // Configure Monaco editor on mount
  const handleEditorMount = (editor: any, monaco: any) => {
    // Register custom theme
    monaco.editor.defineTheme('promptTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'variable', foreground: '4EC9B0' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editor.lineHighlightBackground': '#2d2d2d',
        'editorLineNumber.foreground': '#5a5a5a',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
      },
    });

    // Register custom language for prompt templates
    monaco.languages.register({ id: 'prompt' });
    monaco.languages.setMonarchTokensProvider('prompt', {
      tokenizer: {
        root: [
          [/\{\{[^}]+\}\}/, 'variable'],         // {{variable}}
          [/\[\[[^\]]+\]\]/, 'keyword'],         // [[placeholder]]
          [/#.*$/, 'comment'],                   // # Comments
          [/\*\*[^*]+\*\*/, 'strong'],          // **bold**
          [/```[\s\S]*?```/, 'code'],           // Code blocks
          [/"[^"]*"/, 'string'],                 // "strings"
          [/'[^']*'/, 'string'],                 // 'strings'
        ],
      },
    });

    // Set editor options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Monaco, Consolas, "Courier New", monospace',
      lineHeight: 20,
      padding: { top: 10, bottom: 10 },
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Trigger save action if needed
      console.log('Save triggered');
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      // Trigger run action
      const event = new CustomEvent('runPlayground');
      window.dispatchEvent(event);
    });
  };

  return (
    <div className="w-full h-full min-h-[400px]">
      <Editor
        height={height}
        defaultLanguage="markdown"
        theme="vs-dark"
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          wordWrap: 'on',
          lineNumbers: 'on',
          rulers: [80],
          bracketPairColorization: { enabled: true },
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
          readOnly,
          scrollBeyondLastLine: false,
          renderLineHighlight: 'all',
          folding: true,
          foldingStrategy: 'indentation',
          formatOnPaste: true,
          formatOnType: false,
          automaticLayout: true,
          tabSize: 2,
        }}
      />
    </div>
  );
}