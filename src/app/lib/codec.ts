import basex from "base-x";

const BASE66 =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789-_.!~";
const BASE27 = "abcdefghijklmnopqrstuvwxyz ";

const bs66 = basex(BASE66);
const bs27 = basex(BASE27);

const textLength = 80n;
const idLength = 64;
const padding = "0";

export function prepText(text: string) {
  return text
    .toLowerCase()
    .split("")
    .filter((c) => BASE27.includes(c))
    .join("")
    .padEnd(Number(textLength), " ");
}

function bigIntToUint8Array(big: bigint) {
  let hex = big.toString(16);
  if (hex.length % 2) hex = "0" + hex;
  return Buffer.from(hex, "hex");
}

function uint8ArrayToBigInt(arr: Uint8Array<ArrayBufferLike>) {
  const hex = new Buffer(arr).toString("hex");
  return hex ? BigInt(`0x${hex}`) : 0n;
}

export function textToBigInt(text: string) {
  return uint8ArrayToBigInt(bs27.decode(prepText(text)));
}

export function bigIntToText(big: bigint) {
  return bs27
    .encode(bigIntToUint8Array(big))
    .padStart(Number(textLength), BASE27[0]);
}

export function idToBigInt(id: string) {
  return uint8ArrayToBigInt(bs66.decode(id.replaceAll(padding, "")));
}

export function bigIntToId(big: bigint) {
  return bs66.encode(bigIntToUint8Array(big)).padEnd(idLength, padding);
}

export function textToId(text: string) {
  const big = textToBigInt(text);
  return bigIntToId(big);
}

export function idToText(id: string) {
  const decoded = idToBigInt(id);
  return bigIntToText(decoded);
}
