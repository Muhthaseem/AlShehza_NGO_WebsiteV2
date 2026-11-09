// GitHub project pages use a repository prefix; custom domains use the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const assetPath = (path: string) => `${basePath}${path}`;
