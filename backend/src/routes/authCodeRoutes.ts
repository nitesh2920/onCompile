import { requireAuth, getAuth } from "@clerk/express";

import { Router } from "express";
import type { Request, Response } from "express";
import prisma from "../prisma/client.js";
import crypto from "crypto";

const router = Router();

router.use(requireAuth());
console.log("idhar hai", requireAuth());

async function ensureUserExists(userId: string, email: string) {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    await prisma.user.create({
      data: { id: userId, email }
    });
  }
}

router.post("/", async (req: Request, res: Response) => {
  const { userId, sessionClaims } = getAuth(req);
  console.log("ddd", getAuth(req));
  if (!sessionClaims || !sessionClaims.email) {
    return res
      .status(400)
      .json({ message: "Email not found in session claims" });
  }
  const email = sessionClaims.email;

  if (typeof userId !== "string" || typeof email !== "string") {
    return res.status(400).json({ message: "Invalid auth info" });
  }


  await ensureUserExists(userId, email);

  const { title, code, language, stdin } = req.body;

  try {
    const newCode = await prisma.code.create({
      data: {
        title,
        language,
        code,
        stdin,
        userId: userId!
      }
    });
    res.status(201).json(newCode);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to save code",
      error: error.message
    });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const { id } = req.params;
  const { title, language, code, stdin } = req.body;

  try {
    const where: any = { userId };
    if (id !== undefined) where.id = id;
    const updated = await prisma.code.updateMany({
      where,
      data: { title, language, code, stdin }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update code" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const { id } = req.params;

  try {
    const where: any = { userId };
    if (id !== undefined) where.id = id;
    await prisma.code.deleteMany({ where });
    res.json({ message: "Deleted" });
  } catch (error:any) {
    res.status(500).json({ error: "Failed to delete code" });
  }
});

router.post("/share/:id", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const { id } = req.params;

  try {
    const where: any = { userId };
    if (id !== undefined) where.id = id;
    const sharedId = crypto.randomBytes(10).toString("hex");
    await prisma.code.updateMany({
      where,
      data: { sharedId, isPublic: true }
    });
    res.json({ sharedId });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate share link" });
  }
});

router.get("/download/:id", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const { id } = req.params;

  try {
    const where: any = { userId };
    if (id !== undefined) where.id = id;
    const code = await prisma.code.findFirst({ where });
    if (!code) return res.status(404).json({ message: "Code not found" });

    const extension = getExtensionFromLanguage(code.language); // You can create a helper for mapping language to extension
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${code.title || "code"}.${extension}`
    );
    res.setHeader("Content-Type", "text/plain");
    res.send(code.code);
  } catch (error) {
    res.status(500).json({ error: "Failed to download code" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);

  try {
    const codes = await prisma.code.findMany({
      where: { userId: userId! },
      orderBy: { updatedAt: "desc" }
    });
    res.json(codes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch codes" });
  }
});

function getExtensionFromLanguage(language: string): string {
  switch (language.toLowerCase()) {
    case "python":
      return "py";
    case "typescript":
      return "ts";
    case "java":
      return "java";
    case "c":
      return "c";
    case "cpp":
    case "c++":
      return "cpp";
    case "ruby":
      return "rb";
    case "go":
    case "golang":
      return "go";
    case "php":
      return "php";
    case "rust":
      return "rs";
    case "r":
    case "rscript":
      return "r";
    // Default to JavaScript extension
    default:
      return "js";
  }
}

export default router;
