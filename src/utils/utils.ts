export function toBuffer(arrayBuffer: ArrayBuffer) {
  const buffer = Buffer.alloc(arrayBuffer.byteLength);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < buffer.length; ++i) {
    buffer[i] = view[i];
  }
  return buffer;
}

export function getPropertyValue(object: any, propertyPath: string) {
  const properties = propertyPath.split(".");
  let value = object;
  for (const property of properties) {
    value = value[property];
  }
  return value;
}

export function setPropertyValue(object: any, propertyPath: string, value: any) {
  const properties = propertyPath.split(".");
  let currentObject = object;
  for (let i = 0; i < properties.length - 1; i++) {
    currentObject = currentObject[properties[i]];
  }
  currentObject[properties[properties.length - 1]] = value;
}

export function dumbDeepCopy(object: any) {
  return JSON.parse(JSON.stringify(object));
}
