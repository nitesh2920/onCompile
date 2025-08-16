import type { Request,Response } from "express";
import prisma from "../prisma/client.js";
import type { CodeInput } from "../types/codeTypes.js";
import { clerkClient, getAuth } from "@clerk/express";


// Helper: ensure the authenticated user exists in DB
async function ensureDbUser(userId: string) {
  // Fetch from Clerk to get email
  const user = await clerkClient.users.getUser(userId);
  const primaryEmail =
    user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ??
    user.emailAddresses?.[0]?.emailAddress ??
    "unknown@unknown.com";

  // Upsert into Postgres
  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId, email: primaryEmail },
    update: { email: primaryEmail }
  });
}

// POST /api/code
export const saveCode = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { title, language, code } = req.body as CodeInput;

  try {
    await ensureDbUser(userId);

    const created = await prisma.code.create({
      data: { title, language, code, userId, stdin: "" }
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to save code" });
  }
};

// GET /api/code
export const getCodes = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    await ensureDbUser(userId);

    const codes = await prisma.code.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" }
    });

    res.json(codes);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to fetch codes" });
  }
};

// GET /api/code/:id
export const getCode = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.params;
  const sharedId = req.query.sharedId as string | undefined;

  try {
    if (!id || !sharedId) return res.status(400).json({ error: "Missing id or sharedId" });

    const code = await prisma.code.findUnique({ where: { id, sharedId } });
    if (!code) return res.status(404).json({ error: "Not found" });
    if (code.userId !== userId) return res.status(403).json({ error: "Forbidden" });

    res.json(code);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to fetch code" });
  }
};

// PUT /api/code/:id
export const updateCode = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.params;
  const { title, language, code } = req.body as Partial<CodeInput>;

  try {
    const sharedId = req.body.sharedId as string | undefined;
    if (!id || !sharedId) return res.status(400).json({ error: "Missing id or sharedId" });

    const existing = await prisma.code.findUnique({ where: { id, sharedId } });
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.userId !== userId) return res.status(403).json({ error: "Forbidden" });

    const updated = await prisma.code.update({
      where: { id, sharedId },
      data: {
        title: title ?? existing.title,
        language: language ?? existing.language,
        code: code ?? existing.code
      }
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to update code" });
  }
};

// DELETE /api/code/:id
export const deleteCode = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.params;
  const sharedId = req.query.sharedId as string | undefined;

  try {
    if (!id || !sharedId) return res.status(400).json({ error: "Missing id or sharedId" });

    const existing = await prisma.code.findUnique({ where: { id, sharedId } });
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.userId !== userId) return res.status(403).json({ error: "Forbidden" });

    await prisma.code.delete({ where: { id, sharedId } });
    res.json({ message: "Deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to delete code" });
  }
};
