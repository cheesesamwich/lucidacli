import path from 'path';

export function getPathFromProjectRoot(p: string): string {
    return path.join(process.cwd(), p);
}