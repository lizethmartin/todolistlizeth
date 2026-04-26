export interface Category {
    id: string;
    name: string;
    color?: string;
}

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    categoryId: string;
    createdDate: number;
}