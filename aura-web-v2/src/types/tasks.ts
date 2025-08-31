export interface Task {
  id: number;  // Backend uses number IDs
  description: string;
  done: boolean;
  created_at?: string;
  updated_at?: string;
}