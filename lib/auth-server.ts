// lib/auth-server.ts (NEW FILE - this is all you need to add)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

// Use the same User interface as your existing useAuth hook
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  keyBalance: number;
  isVerified: boolean;
}

export async function getServerUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    return {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name || "",
      keyBalance: decoded.keyBalance || 0,
      isVerified: decoded.isVerified || false,
    };
  } catch {
    return null;
  }
}

export async function requireServerAuth(): Promise<User> {
  const user = await getServerUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export async function redirectIfAuthenticated() {
  const user = await getServerUser();

  if (user) {
    redirect("/dashboard");
  }
}
