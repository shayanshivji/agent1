export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (["txt", "md", "csv", "json"].includes(ext)) {
    return file.text();
  }

  if (ext === "pdf") {
    throw new Error("PDF parsing not yet supported — paste text or use .txt/.md");
  }

  if (ext === "docx") {
    throw new Error("DOCX parsing not yet supported — paste text or use .txt/.md");
  }

  if (ext === "pptx") {
    throw new Error("PPTX parsing not yet supported — paste text or use .txt/.md");
  }

  return file.text();
}
