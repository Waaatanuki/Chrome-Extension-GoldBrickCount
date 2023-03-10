export const getImgSrc = (prop: string) =>
  new URL(`/src/assets/image/${prop}.png`, import.meta.url).href
