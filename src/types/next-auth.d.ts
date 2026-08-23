import { type GlobalRole } from "@/generated/prisma/client";
import "next-auth";

declare module "next-auth" {
  interface User {
    role: GlobalRole;
  }

  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
      role: GlobalRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: GlobalRole;
  }
}
