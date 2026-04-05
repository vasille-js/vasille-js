export interface CompilationErrorReport {
  from: [number, number];
  to: [number, number];
  message: string;
  class: "error" | "warning";
}

export interface CompilationErrorReports {
  filePath: string;
  reports: CompilationErrorReport[];
}

export type CompilationErrorReporter = (reports: CompilationErrorReports) => void;
