export interface Task {
    id?: number;
    title: string;
    description?: string;
    status: TaskStatus;
    categoryId?: number;
    categoryName?: string;
    dueDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    ownerId?: number;
    ownerUsername?: string;
}

export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE'
} 