export interface DoubleData {
  classes: string[];
  isDark: boolean;
}

export interface DoubleDataProps {
  content?(props: DoubleData): void;
  slot?(props: DoubleData): void;
}
