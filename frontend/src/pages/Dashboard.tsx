import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Loader2, Share, Download, Edit, Trash2, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { CodeEditor } from "@/components/code-editor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LanguageSelector } from "@/components/language-selector";
import { useUserCodes } from "@/hooks/useUserCodes";
import { Code } from "@/lib/api";
import { useDownloadCode } from "@/hooks/useDownlaodCode";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function Dashboard() {
  const navigate = useNavigate();
  const {
    codes,
    loading,
    actionLoading,
    handleDelete,
    handleShare,
    handleUpdate,
  } = useUserCodes();
  const { handleDownload } = useDownloadCode();

  const [editingCode, setEditingCode] = useState<Code | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    code: "",
    language: "",
    stdin: "",
  });

  const handleEditClick = (code: Code) => {
    setEditingCode(code);
    setEditForm({
      title: code.title,
      code: code.code,
      language: code.language,
      stdin: code.stdin,
    });
    setIsEditDialogOpen(true);
  };

  const openInEditor = (code: Code) => {
    const params = new URLSearchParams();
    if (code.sharedId) params.set("shared", code.sharedId);
    navigate(`/?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center items-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Code Snippets</h1>
            <p className="text-muted-foreground">
              Browse, edit, and share your saved code.
            </p>
          </div>
          <Button onClick={() => navigate("/")}>
            <Plus className="h-4 w-4 mr-2" />
            New Snippet
          </Button>
        </div>

        {codes.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">No Snippets Yet</h2>
            <p className="text-muted-foreground mt-2 mb-4">
              Click "New Snippet" to create your first one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {codes.map((code) => (
              <Card key={code.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="truncate">{code.title}</CardTitle>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant="secondary">{code.language}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(code.updatedAt))} ago
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <pre className="bg-muted p-3 rounded-md text-xs line-clamp-4 font-mono text-muted-foreground h-24">
                    {code.code}
                  </pre>
                </CardContent>
                <div className="flex items-center justify-end p-4 border-t gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openInEditor(code)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Open in Editor</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditClick(code)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleShare(code.id)}
                        disabled={actionLoading === `share-${code.id}`}
                      >
                        {actionLoading === `share-${code.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Share className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Share</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDownload(code)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download</TooltipContent>
                  </Tooltip>
                  <AlertDialog>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{code.title}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(code.id)}
                          disabled={actionLoading === `delete-${code.id}`}
                        >
                          {actionLoading === `delete-${code.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : null}
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Edit Code Snippet</DialogTitle>
              <DialogDescription>
                Update the details of your code snippet.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 py-4 overflow-auto">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, title: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Language</Label>
                  <LanguageSelector
                    value={editForm.language}
                    onChange={(v) =>
                      setEditForm((p) => ({ ...p, language: v }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="stdin">Input (stdin)</Label>
                  <Textarea
                    id="stdin"
                    rows={5}
                    value={editForm.stdin}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, stdin: e.target.value }))
                    }
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <Label htmlFor="code-editor">Code</Label>
                <div className="flex-grow mt-2 rounded-md overflow-hidden border">
                  <CodeEditor
                    value={editForm.code}
                    onChange={(val) =>
                      setEditForm((prev) => ({ ...prev, code: val }))
                    }
                    language={editForm.language}
                    height="100%"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (editingCode) {
                    await handleUpdate(editingCode.id, editForm);
                  }
                  setIsEditDialogOpen(false);
                }}
                disabled={actionLoading === `update-${editingCode?.id}`}
              >
                {actionLoading === `update-${editingCode?.id}` ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}