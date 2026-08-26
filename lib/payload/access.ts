import type { Access, FieldAccess } from "payload";

export const isAdmin: Access = ({ req }) => req.user?.role === "admin";

export const isAdminFieldAccess: FieldAccess = ({ req }) => req.user?.role === "admin";

export const isAdminOrEditor: Access = ({ req }) => Boolean(req.user);

export const anyone: Access = () => true;

export const isAdminOrSelf: Access = ({ req }) => {
  if (!req.user) return false;
  if (req.user.role === "admin") return true;
  return { id: { equals: req.user.id } };
};

export const isPublishedOrLoggedIn: Access = ({ req }) => {
  if (req.user) return true;
  return { _status: { equals: "published" } };
};
