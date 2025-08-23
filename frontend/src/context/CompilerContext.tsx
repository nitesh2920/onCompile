import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type CompilerContextType = {
  code: string;
  setCode: (val: string) => void;
  language: string;
  setLanguage: (val: string) => void;
  stdin: string;
  setStdin: (val: string) => void;
  title: string;
  setTitle: (val: string) => void;
  output: string;
  setOutput: (val: string) => void;
  isRunning: boolean;
  setIsRunning: (val: boolean) => void;
  isSaving: boolean;
  setIsSaving: (val: boolean) => void;
  isSharing: boolean;
  setIsSharing: (val: boolean) => void;
  showSaveDialog: boolean;
  setShowSaveDialog: (val: boolean) => void;
  resetCode:()=>void;
};

const CompilerContext = createContext<CompilerContextType | undefined>(undefined);

const DEFAULT_CODE: Record<string, string> = {
  javascript: `console.log("Hello, edit me!");`,
  python: `print("Hello, edit me!")`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, edit me!");
    }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, edit me!" << endl;
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, edit me!\\n");
    return 0;
}`,
  typescript: `console.log("Hello, edit me!" as string);`,
  go: `package main
import "fmt"

func main() {
    fmt.Println("Hello, edit me!")
}`,
  rust: `fn main() {
    println!("Hello, edit me!");
}`,
  php: `<?php
echo "Hello, edit me!";
?>`,
  ruby: `puts "Hello, edit me!"`,
  r: `print("Hello, edit me!")`,
};

export const CompilerProvider = ({ children }: { children: ReactNode }) => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [stdin, setStdin] = useState("");
  const [title, setTitle] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Load default code when language changes or on init
  useEffect(() => {

      setCode(DEFAULT_CODE[language] || DEFAULT_CODE.javascript);
 
  }, [language]);
  const resetCode = () => {
  setCode(DEFAULT_CODE[language] || "");
};

  return (
    <CompilerContext.Provider
      value={{
        code, setCode,
        language, setLanguage,
        stdin, setStdin,
        title, setTitle,
        output, setOutput,
        isRunning, setIsRunning,
        isSaving, setIsSaving,
        isSharing, setIsSharing,
        showSaveDialog, setShowSaveDialog,
        resetCode,
      }}
    >
      {children}
    </CompilerContext.Provider>
  );
};

export const useCompiler = () => {
  const ctx = useContext(CompilerContext);
  if (!ctx) throw new Error("useCompiler must be used inside CompilerProvider");
  return ctx;
};
