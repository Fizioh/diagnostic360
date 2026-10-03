export interface ExecutionTestCase {
  id: string;
  name: string;
}

export interface ExecutionTestResult {
  id: string;
  name: string;
  passed: boolean;
  message?: string;
}

export interface ExecutionResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  tests: ExecutionTestResult[];
  unsupportedReason?: string;
  durationMs: number;
}

export interface ExecutionRequest {
  profileId: string;
  language: string;
  source: string;
}

export interface ExecutionAdapter {
  id: string;
  canExecute(request: ExecutionRequest): boolean;
  execute(request: ExecutionRequest): Promise<ExecutionResult>;
}
