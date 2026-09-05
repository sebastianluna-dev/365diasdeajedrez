"use server";

import { signPlatformUpload, type UploadSignature } from "@/lib/cloudinary";
import { requireStaff } from "@/lib/platform-auth/roles";
import { allowAction } from "@/lib/rate-limit";

/**
 * Firma una subida de imagen a Cloudinary.
 *
 * Sólo el staff: la firma AUTORIZA a escribir en nuestra cuenta, así que se
 * entrega con el mismo criterio con el que se entra al panel. Con límite de
 * frecuencia porque cada firma es una subida potencial.
 *
 * Devuelve `null` cuando faltan credenciales o se ha pedido demasiadas firmas
 * seguidas. El componente cae entonces a pedir la URL a mano, que es como
 * funcionaba antes: una portada que no se puede subir no debería impedir
 * guardar el resto del formulario.
 *
 * A quien no es staff no le devuelve nada: `requireStaff` redirige, igual que
 * en el resto del panel.
 */
export async function createUploadSignature(): Promise<UploadSignature | null> {
  const staff = await requireStaff();
  if (!(await allowAction(`${staff.user.id}:upload-sign`, 60, 60_000))) return null;

  return signPlatformUpload();
}
