import { useAuth, useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

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
  Share2,
  Download,
  Loader2,
  RotateCcw,
  MoreVertical,
  FileText,
  Terminal,
  Settings,
  PanelLeft,
  PanelRight,
  ChevronsUpDown
} from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCompiler } from "@/context/CompilerContext";
import { CompilerSkeleton } from "@/components/loaders/CompilerSkeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";

export function Compiler() {
  const { isSignedIn, getToken } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clerk = useClerk();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [runClicked, setRunClicked] = useState(false);

  const sharedId = searchParams.get("shared");

  useEffect(() => {
    if (sharedId) {
      loadSharedCode(sharedId);
    }
  }, [sharedId]);

  useEffect(() => {
    if (runClicked && !isRunning && output && !isDesktop) {
      setIsDrawerOpen(true);
      setRunClicked(false);
    }
  }, [runClicked, isRunning, output, isDesktop]);

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

    setRunClicked(true);
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

    const date = new Date().toISOString().split("T")[0];
    const fileName = `${title || date + "-code"}.${language}`;

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
      cleaned = cleaned.replace(/^\\\\[1\\\\]\\s*"?|"?$/g, "");
    }
    return cleaned;
  }

  const renderSidebarContent = () => (
    <div className="flex-1 flex flex-col p-2 gap-2 h-full">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-row items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            <CardTitle className="text-base">Output</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <pre className="bg-background text-foreground p-4 rounded-lg h-full overflow-auto text-sm">
            {output ||
              (isRunning
                ? "Running your code..."
                : "Click 'Run Code' to see output here...")}
          </pre>
        </CardContent>
      </Card>
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-row items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle className="text-base">Input (stdin)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <Textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            className="font-mono h-full resize-none border-0"
          />
        </CardContent>
      </Card>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="h-[calc(100vh-3.5rem)] grid grid-cols-1 lg:grid-cols-[1fr_auto]">
        {!clerk.loaded ? (
          <CompilerSkeleton />
        ) : (
          <>
            <main className="flex flex-col h-full">
              <div className="flex items-center justify-between p-2 bg-background border-b">
                <div className="flex items-center gap-2">
                  <LanguageSelector
                    value={language}
                    onChange={setLanguage}
                  />
                  <Button
                    onClick={handleRun}
                    disabled={isRunning}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isRunning ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Run
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => setShowSaveDialog(true)}
                        size="icon"
                        variant="ghost"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Save Code</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleShare}
                        disabled={isSharing}
                        size="icon"
                        variant="ghost"
                      >
                        {isSharing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Share2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Share Code</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleDownload}
                        size="icon"
                        variant="ghost"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download Code</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={resetCode} size="icon" variant="ghost">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reset Code</p>
                    </TooltipContent>
                  </Tooltip>
                  {!isDesktop && (
                    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                      <DrawerTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <ChevronsUpDown className="h-4 w-4" />
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent className="h-[60vh]">
                        {renderSidebarContent()}
                      </DrawerContent>
                    </Drawer>
                  )}
                </div>
              </div>
              <div className="flex-grow relative">
                <CodeEditor
                  height="100%"
                />
              </div>
            </main>

            {isDesktop && (
              <aside
                className={`flex-col w-full lg:w-[350px] border-l bg-background transition-all duration-300 ${ isSidebarOpen ? "flex" : "hidden"}`}>
                {renderSidebarContent()}
              </aside>
            )}
          </>
        )}

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

                  const success = await handleSave();
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
    </TooltipProvider>
  );
}