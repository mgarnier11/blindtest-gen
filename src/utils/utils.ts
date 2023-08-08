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

  if (typeof value === "object") {
    currentObject[properties[properties.length - 1]] = dumbDeepCopy(value);
  } else {
    currentObject[properties[properties.length - 1]] = value;
  }
}

export function dumbDeepCopy<T>(object: T): T {
  return JSON.parse(JSON.stringify(object));
}

export type AllPaths<T> = T extends object
  ? {
      [K in keyof T]-?: K extends string ? (T[K] extends object ? `${K}` | `${K}.${AllPaths<T[K]>}` : `${K}`) : never;
    }[keyof T]
  : "";

export function generateId() {
  //generate unique id based on timestamp
  const timestamp = Date.now().toString(36);

  //generate random 16 digit string
  const randomString = Math.random().toString(36).substring(2, 15);

  //combine timestamp and random string
  const id = timestamp + randomString;

  return id;
}
