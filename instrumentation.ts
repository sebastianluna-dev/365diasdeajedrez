import type { Instrumentation } from "next";
import { logError } from "@/lib/logger";

// Único punto por el que pasan TODOS los errores que Next captura al servir
// una petición (render, route handlers, server actions y proxy). Sin esto, un
// 500 en producción se veía en pantalla como «Algo salió mal» y en el servidor
// como nada. El `digest` es el mismo que muestra el error boundary, así que
// con él se localiza el fallo que reporta un alumno.
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  logError("next.request", "Error sin capturar al servir una petición", error, {
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
  });
};
