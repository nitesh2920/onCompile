import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Language mappings for Judge0
export const LANGUAGE_MAP: Record<string, number> = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  typescript: 74,
  go: 60,
  rust: 73,
  php: 68,
  ruby: 72,
  r: 80,
};

export interface Code {
  id: string;
  title: string;
  language: string;
  code: string;
  stdin: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  sharedId?: string;
  isPublic: boolean;
}

export interface CompileResult {
  token: string;
  status?: {
    id: number;
    description: string;
  };
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  time?: string;
  memory?: number;
}

// API functions
export const compileCode = async (code: string, language: string, stdin: string = ''): Promise<CompileResult> => {
  const language_id = LANGUAGE_MAP[language];
  if (!language_id) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const response = await api.post('/compile', {
    code,
    language_id,
    stdin
  });
  
  return response.data;
};

export const getResult = async (token: string): Promise<CompileResult> => {
  const response = await api.get(`/result/${token}`);
  return response.data;
};

export const getSharedCode = async (sharedId: string): Promise<Code> => {
  const response = await api.get(`/shared/${sharedId}`);
  return response.data;
};

// Authenticated API functions
export const saveCode = async (code: Omit<Code, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'sharedId' | 'isPublic'>, token: string): Promise<Code> => {
  const response = await api.post('/codes', code, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
export const updateCode = async (
  id: string,
  code: Partial<Code>,
  token: string
): Promise<{ count: number }> => {
  const res = await api.put(`/codes/${id}`, code, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data; // <- now returns { count: number }
};


export const deleteCode = async (id: string, token: string): Promise<void> => {
  await api.delete(`/codes/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const shareCode = async (id: string, token: string): Promise<{ sharedId: string }> => {
  const response = await api.post(`/codes/share/${id}`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
export const downloadCode = async (
  id: string,
  token: string
): Promise<{ blob: Blob; fileName: string }> => {
  const response = await api.get(`/codes/download/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob"
  });

  const contentDisposition = response.headers["content-disposition"];
  let fileName = "code.txt"; // fallback

  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) {
      fileName = match[1]; // 🔥 This includes extension, e.g., "hello.py"
    }
  }

  return { blob: response.data, fileName };
};


export const getUserCodes = async (token: string): Promise<Code[]> => {
  const response = await api.get('/codes', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};