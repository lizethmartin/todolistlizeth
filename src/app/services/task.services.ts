import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Task } from '../models/task.model'; 
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TaskService {
    private _tasks = new BehaviorSubject<Task[]>([]);
    tasks$ = this._tasks.asObservable();

    constructor(private storage: Storage) {
        this.init();
    }

    async init() {
        await this.storage.create();
        const guardados = await this.storage.get('tasks');
        this._tasks.next(guardados ?? []);
    }

    getAll(): Task[] {
        return this._tasks.value;
    }

    filterCategory(categoryId: string): Task[] {
        if (categoryId === 'all') return this._tasks.value;
        return this._tasks.value.filter(t => t.categoryId === categoryId);
    }

    async addTask(title: string, categoryId: string) {
        if (!title.trim()) return;
        const nuevo: Task = {
        id: Date.now().toString(),
        title: title.trim(),
        completed: false,
        categoryId,
        createdDate: Date.now()
        };
        const lista = [...this._tasks.value, nuevo];
        await this.save(lista);
    }

    async taskCompleted(id: string) {
        const lista = this._tasks.value.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
        );
        await this.save(lista);
    }

    async deleteTask(id: string) {
        const lista = this._tasks.value.filter(t => t.id !== id);
        await this.save(lista);
    }

    async deleteByCategory(categoryId: string) {
        const lista = this._tasks.value.filter(t => t.categoryId !== categoryId);
        await this.save(lista);
    }

    private async save(lista: Task[]) {
        await this.storage.set('tasks', lista);
        this._tasks.next(lista);
    }
}