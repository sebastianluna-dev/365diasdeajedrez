import { notFound } from "next/navigation";

// The profile, with the games played (planning/jugar, phase 3). Until its
// screens are built — and while PLAY_ENABLED is off — there is nothing here;
// the folder exists so the proxy protects the prefix from the first commit.
export default function ProfilePage(): never {
  notFound();
}
