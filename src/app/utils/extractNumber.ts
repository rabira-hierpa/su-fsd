export default function extractNumber(str: string) {
  const match = str.match(/(\d+)/);
  return match ? parseInt(match[0], 10) : NaN;
}
