import { Router } from "express";
import type { Request, Response } from "express";
import axios, { type AxiosRequestConfig } from "axios";
import prisma from "../prisma/client.js";

const router = Router();

function isBase64(str: string) {
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}

router.post("/compile", async (req: Request, res: Response) => {
  const { code, language_id, stdin } = req.body;

  if (!code || !language_id) {
    return res.status(400).json({ error: `code and language_id are required ${code} ${language_id}` });
  }

    const encodedCode = isBase64(code)
    ? code
    : Buffer.from(code, "utf-8").toString("base64");

  const encodedStdin =
    stdin && !isBase64(stdin)
      ? Buffer.from(stdin, "utf-8").toString("base64")
      : stdin || "";

  const options: AxiosRequestConfig = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions",
    params: {
      base64_encoded: "true",
      wait: "false",
      fields: "*"
    },
    headers: {
      "x-RapidAPI-Key": process.env.JUDGE0_API_KEY,
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json"
    },
    data: {
      source_code: encodedCode,
      language_id: language_id,
      stdin: encodedStdin,
    },
  };

  try {
    const response = await axios.request(options);
    res.json(response.data);
  } catch (err: any) {
    res.status(500).json({
      error: err.message
    });
  }




});


router.get("/result/:token",async(req:Request, res:Response)=>{
    const {token }= req.params;

     const options: AxiosRequestConfig = {
    method: "GET",
    url: `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
    params: {
      base64_encoded: "true",
      fields: "*"
    },
    headers: {
      "x-RapidAPI-Key": process.env.JUDGE0_API_KEY,
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com"
    }
  };

    try {
    const response = await axios.request(options);
    const decoded={...response.data}
      if (decoded.stdout) {
      decoded.stdout = Buffer.from(decoded.stdout, "base64").toString("utf-8");
    }
    if (decoded.stderr) {
      decoded.stderr = Buffer.from(decoded.stderr, "base64").toString("utf-8");
    }
    if (decoded.compile_output) {
      decoded.compile_output = Buffer.from(
        decoded.compile_output,
        "base64"
      ).toString("utf-8");
    }
       res.json(decoded);

  } catch (err: any) {
    res.status(500).json({
      error:  err.message
    });


}
});

router.get("/shared/:sharedId", async (req: Request, res: Response) => {
  const { sharedId } = req.params;

  try {
     const where:any ={sharedId};

     if(sharedId!==undefined) where.sharedId=sharedId
     
    const code = await prisma.code.findUnique({
      where,
    });

    if (!code || !code.isPublic) {
      return res.status(404).json({ message: "Code not found or not shared" });
    }
    res.json(code);
  } catch (error:any) {
    res.status(500).json({ error: "Failed to fetch shared code" ,detail:error.message});
  }
});

export default router;
