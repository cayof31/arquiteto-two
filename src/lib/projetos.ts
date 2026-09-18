export function obrasDestaque<T extends { data: { destaque: boolean } }>(obras: T[]): T[] {
  return obras.filter((obra) => obra.data.destaque);
}
