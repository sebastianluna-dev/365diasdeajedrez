// Says which databases the app and the scripts are pointing at.
//
//   npm run db:target
//
// `.env.local` decides it, and it is one commented line away from the managed
// databases: `npm run dev`, `db:migrate`, the seed and every script write to
// whichever it names. This prints the host and the database of each — never
// the URL, which carries the password — so the question "where am I about to
// write?" has an answer that can be read aloud, pasted and logged.

import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
config({ quiet: true });

import { databaseTargetOf, describeDatabaseTarget } from "../lib/database-target";

const DATABASES = [
  { variable: "PLATFORM_DATABASE_URL", label: "Plataforma" },
  { variable: "DATABASE_URI", label: "CMS (Payload)" },
] as const;

let remote = false;
for (const { variable, label } of DATABASES) {
  const target = databaseTargetOf(process.env[variable]);
  if (!target) {
    console.log(`✖ ${label}: ${variable} no está definida o no es una URL.`);
    continue;
  }
  remote ||= !target.isLocal;
  console.log(`${target.isLocal ? "✔" : "⚠"} ${label}: ${describeDatabaseTarget(target)}`);
}

if (remote) {
  console.log(
    "\nAl menos una apunta a una base gestionada: lo que se ejecute ahora escribe en datos reales.\n" +
      "Para volver al contenedor, cambia las líneas comentadas de .env.local y reinicia `npm run dev`.",
  );
}
