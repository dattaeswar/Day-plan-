export type Category = 'Work' | 'Personal' | 'Health' | 'Urgent' | 'Other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  completed: boolean;
  category: Category;
  createdAt: number;
}

export interface DayPlan {
  date: string;
  tasks: Task[];
}
