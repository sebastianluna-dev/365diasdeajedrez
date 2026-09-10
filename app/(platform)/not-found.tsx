import { EmptyState } from "@/components/platform/shared/empty-state.comp";
import { platformRoutes } from "@/lib/platform-routes";

export default function PlatformNotFound() {
  return (
    <EmptyState
      title="No encontramos lo que buscabas"
      description="El contenido no existe o ya no está disponible."
      actionLabel="Volver al inicio"
      actionHref={platformRoutes.dashboard}
    />
  );
}
