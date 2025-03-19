export interface TaskShare {
    id?: number;
    taskId: number;
    taskTitle?: string;
    userId: number;
    username?: string;
    permission: Permission;
    sharedAt?: Date;
}

export enum Permission {
    VIEW = 'VIEW',
    EDIT = 'EDIT'
} 