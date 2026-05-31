import "server-only";

type SupabaseErrorLike = {
  code?: string | null;
  details?: string | null;
  hint?: string | null;
  message?: string | null;
};

function includesRelationName(message: string, schema: string, relation: string) {
  return (
    message.includes(`${schema}.${relation}`) ||
    message.includes(`'${schema}.${relation}'`) ||
    message.includes(`"${schema}.${relation}"`) ||
    message.includes(`relation "${relation}"`) ||
    message.includes(`table '${relation}'`) ||
    message.includes(`table "${relation}"`)
  );
}

export function isMissingTableError(
  error: SupabaseErrorLike | null | undefined,
  relation: string,
  schema = "public"
) {
  const message = (error?.message ?? "").toLowerCase();
  const details = (error?.details ?? "").toLowerCase();
  const hint = (error?.hint ?? "").toLowerCase();
  const code = (error?.code ?? "").toUpperCase();

  if (!message && !details && !hint && !code) {
    return false;
  }

  const mentionsRelation =
    includesRelationName(message, schema, relation) ||
    includesRelationName(details, schema, relation) ||
    includesRelationName(hint, schema, relation);

  if (!mentionsRelation) {
    return false;
  }

  return (
    code === "42P01" ||
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("does not exist") ||
    details.includes("schema cache") ||
    details.includes("does not exist")
  );
}
