function parseVersion(version: string): number[] {
  return version.split('.').map((part) => parseInt(part, 10) || 0);
}

export function isVersionNewer(latest: string, current: string): boolean {
  const latestParts = parseVersion(latest);
  const currentParts = parseVersion(current);
  const length = Math.max(latestParts.length, currentParts.length);

  for (let i = 0; i < length; i += 1) {
    const latestPart = latestParts[i] ?? 0;
    const currentPart = currentParts[i] ?? 0;
    if (latestPart > currentPart) return true;
    if (latestPart < currentPart) return false;
  }

  return false;
}
