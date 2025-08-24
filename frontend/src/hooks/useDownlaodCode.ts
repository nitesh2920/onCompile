import { useToast } from "@/hooks/use-toast";
import { downloadCode } from "@/lib/api";
import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";

export function useDownloadCode() {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (id: string) => {
    setDownloadingId(id);

    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const { blob, fileName } = await downloadCode(id, token);

      // ✅ Trigger file download with correct filename & extension
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);

      toast({
        title: "Download Started",
        description: `Your file (${fileName}) is being downloaded.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download code.",
        variant: "destructive"
      });
    } finally {
      setDownloadingId(null);
    }
  };

  return { handleDownload, downloadingId };
}
