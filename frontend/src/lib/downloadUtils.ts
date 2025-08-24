
export const LANGUAGE_EXTENSIONS: Record<string, string> = {
  javascript: "js",
  python: "py",
  java: "java",
  cpp: "cpp",
  c: "c",
  typescript: "ts",
  go: "go",
  rust: "rs",
  php: "php",
  ruby: "rb",
  r: "r",
};


export function downloadCodeFile(
  title: string | undefined,
  language: string,
  code: string
) {
  const extension = LANGUAGE_EXTENSIONS[language] || "txt";
  const safeTitle = title?.trim() || "code";
  const fileName = `${safeTitle}.${extension}`;

  const blob = new Blob([code], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();

  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
