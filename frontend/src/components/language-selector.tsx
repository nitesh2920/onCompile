import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LANGUAGE_MAP } from "@/lib/api";

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const LANGUAGE_OPTIONS = Object.keys(LANGUAGE_MAP).map(lang => ({
  value: lang,
  label: getLanguageLabel(lang),
  short: getLanguageShort(lang)
}));

function getLanguageLabel(lang: string): string {
  const labels: Record<string, string> = {
    javascript: "JavaScript",
    python: "Python", 
    java: "Java",
    cpp: "C++",
    c: "C",
    typescript: "TypeScript",
    go: "Go",
    rust: "Rust",
    php: "PHP",
    ruby: "Ruby",
    r: "R"
  };
  return labels[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
}

function getLanguageShort(lang: string): string {
  const shorts: Record<string, string> = {
    javascript: "JS",
    python: "PY", 
    java: "JAVA",
    cpp: "CPP",
    c: "C",
    typescript: "TS",
    go: "GO",
    rust: "RS",
    php: "PHP",
    ruby: "RB",
    r: "R"
  };
  return shorts[lang] || lang.toUpperCase();
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const selectedOption = LANGUAGE_OPTIONS.find(opt => opt.value === value);
  
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[60px] sm:w-[100px]">
        <SelectValue>
          <span className="font-mono text-sm font-semibold">
            {selectedOption?.short || "LANG"}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LANGUAGE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center justify-between w-full">
              <span className="font-mono text-xs font-bold text-primary">
                {option.short}
              </span>
              <span className="text-sm text-muted-foreground ml-3">
                {option.label}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}