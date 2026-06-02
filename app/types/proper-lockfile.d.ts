declare module "proper-lockfile" {
  interface LockOptions {
    retries?: number | { retries: number; factor?: number; minTimeout?: number; maxTimeout?: number; randomize?: boolean }
    realpath?: boolean
    stale?: number
    lockfilePath?: string
    update?: number | boolean
    lock?: any
  }

  interface Lock {
    (file: string, options?: LockOptions): Promise<() => Promise<void>>
    lock(file: string, options?: LockOptions): Promise<() => Promise<void>>
    unlock(file: string, options?: LockOptions): Promise<void>
    lockSync(file: string, options?: LockOptions): () => void
    unlockSync(file: string, options?: LockOptions): void
    check(file: string, options?: LockOptions): Promise<boolean>
    checkSync(file: string, options?: LockOptions): boolean
  }

  const lockfile: Lock
  export default lockfile
}
