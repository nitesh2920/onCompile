import { useAuth, useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { CodeEditor } from "@/components/code-editor";
import { LanguageSelector } from "@/components/language-selector";
import {
  compileCode,
  getResult,
  saveCode,
  shareCode,
  getSharedCode,
  CompileResult
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  Save,
  Share,
  Download,
  Loader2,
  RotateCcw,
  Share2,
  MoreVertical
} from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCompiler } from "@/context/CompilerContext";
import { CompilerSkeleton } from "@/components/loaders/CompilerSkeleton";

export function Compiler() {
  const { isSignedIn, getToken } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clerk = useClerk();

  const {
    code,
    setCode,
    language,
    setLanguage,
    stdin,
    setStdin,
    title,
    setTitle,
    output,
    setOutput,
    isRunning,
    setIsRunning,
    isSaving,
    setIsSaving,
    isSharing,
    setIsSharing,
    resetCode
  } = useCompiler();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [tempTitle, setTempTitle] = useState("");

  const sharedId = searchParams.get("shared");

  useEffect(() => {
    if (sharedId) {
      loadSharedCode(sharedId);
    }
  }, [sharedId]);

  const loadSharedCode = async (sharedId: string) => {
    try {
      const sharedCode = await getSharedCode(sharedId);
      setCode(sharedCode.code);
      setLanguage(sharedCode.language);
      setStdin(sharedCode.stdin);
      setTitle(sharedCode.title);
      toast({
        title: "Shared code loaded",
        description: `Loaded: ${sharedCode.title}`
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to load shared code",
        variant: "destructive"
      });
    }
  };

  const handleRun = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter some code to run",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setOutput("Running...");

    try {
      const result = await compileCode(code, language, stdin);
      if (result.token) {
        let attempts = 0;
        const maxAttempts = 10;

        const pollResult = async (): Promise<void> => {
          attempts++;
          try {
            const finalResult: CompileResult = await getResult(result.token);

            if (finalResult.status?.id === 1 || finalResult.status?.id === 3) {
              if (attempts < maxAttempts) {
                setTimeout(pollResult, 1000);
                return;
              }
            }

            let outputText = "";

            if (finalResult.stdout)
              outputText += `${cleanOutput(finalResult.stdout)}\n`;

            if (finalResult.stderr)
              outputText += `${finalResult.stderr.trim()}\n`;

            if (finalResult.compile_output)
              outputText += `${finalResult.compile_output.trim()}\n`;

            if (finalResult.time || finalResult.memory) {
              outputText += `\n---\n`;
              if (finalResult.time)
                outputText += `Execution Time: ${finalResult.time}s\n`;
              if (finalResult.memory)
                outputText += `Memory Used: ${finalResult.memory} KB\n`;
            }

            setOutput(outputText || "No output");
          } catch (error) {
            setOutput("Error getting result: " + (error as Error).message);
          } finally {
            setIsRunning(false);
          }
        };

        pollResult();
      }
    } catch (error) {
      setOutput("Error: " + (error as Error).message);
      setIsRunning(false);
    }
  };

  const handleSave = async () => {
    if (!isSignedIn) {
      toast({
        title: "Authentication required",
        description: "To use this you need to signup",
        variant: "destructive"
      });
      return false;
    }

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your code",
        variant: "destructive"
      });
      return false;
    }

    setIsSaving(true);
    try {
      const token = await getToken();
      if (token) {
        await saveCode({ title, code, language, stdin }, token);
        toast({
          title: "Success",
          description: "Code saved successfully!"
        });
        return true;
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to save code",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
    return false;
  };

  const handleShare = async () => {
    if (!isSignedIn) {
      toast({
        title: "Authentication required",
        description: "To use this you need to signup",
        variant: "destructive"
      });
      return;
    }
    setIsSharing(true);
    try {
      const token = await getToken();
      if (token) {
        const codeTitle = title.trim() || "Untitled";
        const savedCode = await saveCode(
          { title: codeTitle, code, language, stdin },
          token
        );
        const shareResult = await shareCode(savedCode.id, token);
        const shareUrl = `${window.location.origin}/?shared=${shareResult.sharedId}`;

        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Code Shared Successfully",
          description: "Share link copied to clipboard!"
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to share code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = () => {
    if (!isSignedIn) {
      toast({
        title: "Authentication required",
        description: "To use this you need to signup",
        variant: "destructive"
      });
      return;
    }
    const fileName = `code.${language}`;
    const blob = new Blob([code], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Download Started",
      description: "Your code file is being downloaded."
    });
  };

  function cleanOutput(raw?: string): string {
    if (!raw) return "";
    let cleaned = raw.trim();
    if (cleaned.startsWith("[1]")) {
      cleaned = cleaned.replace(/^\[1\]\s*"?|"?$/g, "");
    }
    return cleaned;
  }

  return (
    <div className="space-y-4">
      {!clerk.loaded ? (
        <CompilerSkeleton />
      ) : (
        <div className="mx-auto px-4 py-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT */}
            <div className="space-y-6 lg:col-span-2">
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex sm:items-center justify-between sm:gap-4">
                    <div className="flex items-center gap-3">
                      <LanguageSelector
                        value={language}
                        onChange={setLanguage}
                      />
                      <Button
                        onClick={handleRun}
                        disabled={isRunning}
                        size="sm"
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      >
                        {isRunning ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        Run Code
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="hidden sm:flex gap-2">
                        <Button
                          onClick={() => setShowSaveDialog(true)}
                          size="sm"
                          variant="outline"
                        >
                          <Save className="h-4 w-4 mr-2" /> Save
                        </Button>
                        <Button
                          onClick={handleShare}
                          disabled={isSharing}
                          size="sm"
                          variant="outline"
                        >
                          {isSharing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Share2 className="h-4 w-4 mr-2" />
                          )}
                          Share
                        </Button>
                        <Button
                          onClick={handleDownload}
                          size="sm"
                          variant="outline"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button onClick={resetCode} size="sm" variant="outline">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                      </div>

                      {/* Mobile */}
                      <div className="sm:hidden flex">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setShowSaveDialog(true)}
                            >
                              <Save className="h-4 w-4 mr-2" /> Save
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleShare}>
                              <Share2 className="h-4 w-4 mr-2" /> Share
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDownload}>
                              <Download className="h-4 w-4 mr-2" /> Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={resetCode}>
                              <RotateCcw className="h-4 w-4 mr-2" /> Reset
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <div className="relative">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={language}
                />
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-4">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>Output</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-slate-950 text-green-400 p-4 rounded-lg min-h-[300px] max-h-[400px] overflow-auto lg:overflow-hidden">
                    {output ||
                      (isRunning
                        ? "Running your code..."
                        : "Click 'Run Code' to see output here...")}
                  </pre>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>Input (stdin)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    rows={4}
                    className="font-mono"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter a title to save your code</DialogTitle>
            <DialogDescription>
              This title will help you identify your saved code snippet.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="e.g. Bubble Sort in Python"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
          />
          <DialogFooter>
            <Button
              onClick={async () => {
                if (!tempTitle.trim()) {
                  toast({
                    title: "Missing Title",
                    description: "Please enter a title before saving.",
                    variant: "destructive"
                  });
                  return;
                }
                setTitle(tempTitle);

                const success = await handleSave(); // return true/false from handleSave
                if (success) {
                  setShowSaveDialog(false);
                  setTempTitle("");
                }
              }}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
