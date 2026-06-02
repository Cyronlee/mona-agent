import lockfile from "proper-lockfile"

export async function withFileLock<T>(
  filePath: string,
  fn: () => Promise<T>,
): Promise<T> {
  const release = await lockfile.lock(filePath, {
    retries: { retries: 10, factor: 1.2, minTimeout: 30, maxTimeout: 200 },
  })
  try {
    return await fn()
  } finally {
    await release()
  }
}
