export async function withRetry<T>(fn: () => Promise<T>, retries = 3, backoff = 500): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (e: any) {
      attempt++;
      if (attempt >= retries) throw e;
      if (e.message && e.message.includes("Rate limit")) {
        await new Promise(r => setTimeout(r, backoff * attempt * 2)); // Exponential backoff for rate limit
      } else {
        await new Promise(r => setTimeout(r, backoff * attempt));
      }
    }
  }
  throw new Error("Retry failed");
}
