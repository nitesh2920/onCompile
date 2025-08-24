import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Loader2, Share, Download, Edit, Trash2 } from "lucide-react";
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

export function Dashboard() {
  const navigate = useNavigate();
  const {
    codes,
    loading,
    actionLoading,
    handleDelete,
    handleShare,
    handleDownload,
    handleUpdate,
  } = useUserCodes();

  const [editingCode, setEditingCode] = useState<Code | null>(null);
  const [isopen, setIsOpen] = useState<boolean | null>(false);

  const [editForm, setEditForm] = useState({
    title: "",
    code: "",
    language: "",
    stdin: "",
  });

  const handleEdit = (code: Code) => {
    setEditingCode(code);
    setEditForm({
      title: code.title,
      code: code.code,
      language: code.language,
      stdin: code.stdin,
    });
  };

  const openInEditor = (code: Code) => {
    const params = new URLSearchParams();
    if (code.sharedId) params.set("shared", code.sharedId);
    navigate(`/?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          My Codes
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage and organize your saved code snippets
        </p>
      </div>

      {codes.length === 0 ? (
        <Card className="border-dashed border-2 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">
              You haven’t saved any codes yet.
            </p>
            <Button onClick={() => navigate("/")}>Start Coding</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {codes.map((code) => (
            <Card
              key={code.id}
              className="group rounded-2xl border border-muted shadow-sm hover:shadow-lg transition-all"
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold truncate">
                  {code.title}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary">{code.language}</Badge>
                  {code.isPublic && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Share className="h-3 w-3" /> Shared
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted p-3 rounded-md">
                    <pre className="text-xs line-clamp-3 font-mono text-muted-foreground">
                      {code.code}
                    </pre>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Updated {formatDistanceToNow(new Date(code.updatedAt))} ago
                  </p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openInEditor(code)}
                    >
                      <Eye className="h-3 w-3 mr-1" /> Open
                    </Button>

                    {/* Edit Dialog */}
                    <Dialog open={isopen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            handleEdit(code);
                            setIsOpen(true);
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" /> Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/60 scrollbar-track-muted rounded-xl">
                        <DialogHeader>
                          <DialogTitle>Edit Code</DialogTitle>
                          <DialogDescription>
                            Update your saved snippet
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Label>Title</Label>
                          <Input
                            value={editForm.title}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                title: e.target.value,
                              }))
                            }
                          />
                          <Label>Language</Label>
                          <LanguageSelector
                            value={editForm.language}
                            onChange={(v) =>
                              setEditForm((p) => ({ ...p, language: v }))
                            }
                          />
                          <Label>Code</Label>
                          <CodeEditor
                            value={editForm.code}
                            onChange={(val) =>
                              setEditForm((prev) => ({ ...prev, code: val }))
                            }
                            language={editForm.language}
                            height="300px"
                          />
                          <Label>Input (stdin)</Label>
                          <Textarea
                            rows={3}
                            value={editForm.stdin}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                stdin: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={async () => {
                             await handleUpdate(code.id, editForm);
                              setIsOpen(false);
                            }}
                            disabled={actionLoading === `update-${code.id}`}
                          >
                            {actionLoading === `update-${code.id}` ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : null}
                            Update
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShare(code.id)}
                      disabled={actionLoading === `share-${code.id}`}
                    >
                      {actionLoading === `share-${code.id}` ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Share className="h-3 w-3 mr-1" />
                      )}
                      Share
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(code.id)}
                      disabled={actionLoading === `download-${code.id}`}
                    >
                      {actionLoading === `download-${code.id}` ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Download className="h-3 w-3 mr-1" />
                      )}
                      Download
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-xl">
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
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {actionLoading === `delete-${code.id}` ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3 mr-1" />
                            )}
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
