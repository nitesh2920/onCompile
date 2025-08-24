import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { getUserCodes, deleteCode, shareCode, downloadCode, updateCode, Code } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Define action types
type ActionType = "delete" | "share" | "download" | "update";

export function useUserCodes() {
  const { getToken } = useAuth();
  const { toast } = useToast();

  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);
  // Now actionLoading stores both action + id
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      const token = await getToken();
      if (token) {
        const userCodes = await getUserCodes(token);
        setCodes(userCodes);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load your codes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(`delete-${id}`);
    try {
      const token = await getToken();
      if (token) {
        await deleteCode(id, token);
        setCodes(codes.filter((c) => c.id !== id));
        toast({ title: "Success", description: "Code deleted successfully" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete code", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleShare = async (id: string) => {
    setActionLoading(`share-${id}`);
    try {
      const token = await getToken();
      if (token) {
        const result = await shareCode(id, token);
        const shareUrl = `${window.location.origin}/?shared=${result.sharedId}`;
        await navigator.clipboard.writeText(shareUrl);

        toast({ title: "Share link copied!", description: "Copied to clipboard" });
        setCodes(codes.map((c) => (c.id === id ? { ...c, sharedId: result.sharedId, isPublic: true } : c)));
      }
    } catch {
      toast({ title: "Error", description: "Failed to share code", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

// const handleDownload = async (id: string) => {
//   setActionLoading(`download-${id}`);
//   try {
//     const token = await getToken();
//     if (token) {
//       const codeToDownload = codes.find((c) => c.id === id);
//       if (!codeToDownload) throw new Error("Code not found");

//       // Directly download from local state
//       downloadCodeFile(
//         codeToDownload.title,
//         codeToDownload.language,
//         codeToDownload.code
//       );

//       toast({
//         title: "Download Started",
//         description: "Your code file is being downloaded."
//       });
//     }
//   } catch {
//     toast({
//       title: "Error",
//       description: "Failed to download code",
//       variant: "destructive"
//     });
//   } finally {
//     setActionLoading(null);
//   }
// };



const handleUpdate = async (id: string, updated: Partial<Code>) => {
  setActionLoading(`update-${id}`);
  try {
    const token = await getToken();
    if (token) {
      const res = await updateCode(id, updated, token); // { count: 1 }

      if (res.count > 0) {
        setCodes((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, ...updated, updatedAt: new Date().toISOString() }
              : c
          )
        );

        toast({
          title: "Success",
          description: "Code updated successfully",
        });
      } else {
        toast({
          title: "No changes",
          description: "No code was updated on the server",
        });
      }
    }
  } catch {
    toast({
      title: "Error",
      description: "Failed to update code",
      variant: "destructive",
    });
  } finally {
    setActionLoading(null);
  }
};


  return {
    codes,
    loading,
    actionLoading,
    setCodes,
    loadCodes,
    handleDelete,
    handleShare,
    // handleDownload,
    handleUpdate,
  };
}
