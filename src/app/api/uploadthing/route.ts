import { createRouteHandler } from "uploadthing/next";
import { uploadRouter } from "@/modules/uploads/core";

export const { GET, POST } = createRouteHandler({
  router: uploadRouter,
});
