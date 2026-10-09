// How the engine client reaches an engine: lines of UCI text each way.
//
// Three implementations, one contract: a Web Worker in the browser
// (`components/chess/engine/worker-transport.ts`), a child process under Node
// for the calibration (`scripts/lib/engine-process-transport.ts`), and a
// scripted fake for the tests (`lib/testing/scripted-engine.ts`). The client
// never knows which one it has.

export interface EngineTransport {
  /** Sends one UCI command. */
  post(line: string): void;
  /** Every line the engine writes, one call each. Returns the unsubscribe. */
  onLine(listener: (line: string) => void): () => void;
  /**
   * The engine died: the worker threw, or the process exited. Every request
   * still pending is rejected with it. Returns the unsubscribe.
   */
  onError(listener: (error: Error) => void): () => void;
  /** Kills the engine. Nothing is heard from it afterwards. */
  terminate(): void;
}
