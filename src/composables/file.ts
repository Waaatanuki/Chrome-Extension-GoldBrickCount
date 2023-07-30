export function getImgSrc(prop: string) {
  return new URL(`/src/assets/image/${prop}.png`, import.meta.url).href
}

export function getRaidImgSrc(prop: string) {
  return new URL(`/src/assets/image/raid/${prop}.png`, import.meta.url).href
}
