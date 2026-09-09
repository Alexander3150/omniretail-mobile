export function formatCurrency(value: number, currency = "GTQ"): string {
  const symbol = currency === "GTQ" ? "Q" : currency;
  return `${symbol} ${value.toFixed(2)}`;
}
