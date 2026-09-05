import "server-only";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary para la ZONA AUTENTICADA (portadas de curso, y lo que venga).
//
// El sitio público sube por Payload, que trae su propio adaptador
// (lib/payload/cloudinary-adapter.ts) y configura el SDK por su cuenta. Aquí no
// se puede depender de que aquello se haya cargado —son dos entradas distintas
// de la aplicación—, así que se configura otra vez y se deja dicho.
//
// Las credenciales NO salen de aquí. Lo que viaja al navegador es una FIRMA:
// una cadena caducable que autoriza una subida concreta a una carpeta concreta.
// El archivo va del navegador a Cloudinary sin pasar por nuestro servidor, que
// además esquiva el tope de tamaño del cuerpo de las server actions —1 MB por
// defecto, menos que muchas fotos—.

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

/** Dónde aterrizan las imágenes de la plataforma, separadas de las del sitio. */
export const PLATFORM_UPLOAD_FOLDER = "365-ajedrez/plataforma";

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  folder: string;
  /** Segundos desde época; Cloudinary rechaza una firma vieja. */
  timestamp: number;
  signature: string;
}

/**
 * Firma una subida a la carpeta de la plataforma.
 *
 * Devuelve `null` si faltan credenciales, en vez de lanzar: sin ellas la
 * pantalla tiene que poder seguir enseñando el campo de URL a mano, no
 * romperse.
 *
 * Se firma exactamente lo que se manda: `folder` y `timestamp`. Cloudinary
 * comprueba que la firma cubra TODOS los parámetros que le llegan (menos el
 * archivo y la clave), así que el navegador no puede añadir nada por su cuenta
 * —ni cambiar de carpeta— sin invalidarla.
 */
export function signPlatformUpload(): UploadSignature | null {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) return null;

  cloudinary.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET, secure: true });

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { folder: PLATFORM_UPLOAD_FOLDER, timestamp },
    API_SECRET,
  );

  return { cloudName: CLOUD_NAME, apiKey: API_KEY, folder: PLATFORM_UPLOAD_FOLDER, timestamp, signature };
}
