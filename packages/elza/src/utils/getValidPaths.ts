import { existsSync } from 'fs';

export function getValidPaths(paths: string[]): string[] {
  return paths.filter((path) => {
    return existsSync(path);
  });
}
