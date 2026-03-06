export function formatLastUsed(lastUsedAt: string | null): string {
  if (!lastUsedAt) return "Never used";
  const diffDays = Math.floor(
    (Date.now() - new Date(lastUsedAt + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Used today";
  if (diffDays === 1) return "Used yesterday";
  if (diffDays < 7) return `Used ${diffDays} days ago`;
  if (diffDays < 30) return `Used ${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? "s" : ""} ago`;
  return `Used ${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? "s" : ""} ago`;
}
