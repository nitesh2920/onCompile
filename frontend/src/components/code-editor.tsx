import { Editor } from "@monaco-editor/react";
import { useTheme } from "@/components/theme-provider";
import { Card } from "@/components/ui/card";
import { useCompiler } from "@/context/CompilerContext";

interface CodeEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  language?: string;
  height?: string;
}

/**
 * CodeEditor works in 2 modes:
 * 1. Controlled mode (props passed: value, onChange, language)
 * 2. Context mode (if props not provided, it auto-uses CompilerContext)
 */
export function CodeEditor({
  value,
  onChange,
  language,
  height = "500px",
}: CodeEditorProps) {
  const { theme } = useTheme();
  const compiler = useCompiler();

  // If props not provided, fallback to context
  const finalValue = value ?? compiler.code;
  const finalOnChange = onChange ?? compiler.setCode;
  const finalLanguage = language ?? compiler.language;

  const handleEditorChange = (val: string | undefined) => {
    finalOnChange(val || "");
  };

  return (
    <Card className="overflow-hidden">
      <Editor
        height={height}
        language={finalLanguage}
        value={finalValue}
        onChange={handleEditorChange}
        theme={theme === "dark" ? "vs-dark" : "light"}
        options={{
          minimap: { enabled: false },
          fontSize: 16,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          fontFamily:
            "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
          fontLigatures: true,
          lineNumbers: "on",
          renderLineHighlight: "gutter",
          selectOnLineNumbers: true,
          smoothScrolling: true,
          cursorStyle: "line",
          cursorBlinking: "smooth",
          formatOnType: true,
          formatOnPaste: true,
          suggestOnTriggerCharacters: true,
        }}
      />
    </Card>
  );
}
