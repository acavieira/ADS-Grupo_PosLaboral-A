// Generic avatar drawn locally: it identifies nobody and requests nothing from the network.
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  '<rect width="100" height="100" fill="#cccccc"/>' +
  '<circle cx="50" cy="42" r="16" fill="#999999"/>' +
  '<ellipse cx="50" cy="100" rx="34" ry="36" fill="#999999"/>' +
  '</svg>'

export const PSEUDONYM_AVATAR_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
