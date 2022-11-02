/**
 * @param {  Record<any, any> } ws
 * @return { string | null}
 */

export function getSocketRemoteAddress(ws) {
  if (ws._socket) {
    const address = ws._socket.remoteAddress;
    if (typeof address === "string") {
      return address;
    } else return null;
  }
  return null;
}

/**
 * @param {string} name
 * @param {string} id
 */
export function generateEntityPoolId(name, id) {
  return `${name}-${id}`;
}
