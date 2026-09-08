import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { functions } from "@/modules/jobs";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
