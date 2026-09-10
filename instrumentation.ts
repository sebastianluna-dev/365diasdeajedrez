import type { Instrumentation } from "next";
import { logError } from "@/lib/logger";

// The single point every error Next catches while serving a request passes
// through (render, route handlers, server actions and proxy). Without this, a
// 500 in production showed on screen as "Algo salió mal" and on the server as
// nothing at all. The `digest` is the same one the error boundary shows, so
// with it the failure a student reports can be located.
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  logError("next.request", "Error sin capturar al servir una petición", error, {
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
  });
};
