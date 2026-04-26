import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Category } from '../models/task.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoryService {
    private _categories = new BehaviorSubject<Category[]>([]);
    private initialized = false;
    
    categories$ = this._categories.asObservable();

    private readonly DEFAULT_CATEGORIES: Category[] = [
        { id: 'personal', name: 'Personal', color: 'primary' },
        { id: 'work', name: 'Trabajo', color: 'success' },
        { id: 'others', name: 'Otros', color: 'warning' },
    ];

    constructor(private storage: Storage) {
        this.init();
    }

    async init() {
        if (this.initialized) return;
        await this.storage.create();
        this.initialized = true;
        const saved = await this.storage.get('categories');
        this._categories.next(saved ?? this.DEFAULT_CATEGORIES);
    }

    getAll(): Category[] {
        return this._categories.value;
    }

    async addCategory(name: string, color: string) {
        const nueva: Category = {
        id: Date.now().toString(),
        name,
        color,
        };
        const list = [...this._categories.value, nueva];
        await this.storage.set('categories', list);
        this._categories.next(list);
    }

    async showEditCard(id: string, name: string) {
        const list = this._categories.value.map((c) => c.id === id ? { ...c, name } : c);
        await this.storage.set('categories', list);
        this._categories.next(list);
    }

    async deleteCategory(id: string) {
        const list = this._categories.value.filter((c) => c.id !== id);
        await this.storage.set('categories', list);
        this._categories.next(list);
    }
}
