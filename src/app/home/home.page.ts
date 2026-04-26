import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonList,
  IonLabel,
  IonCheckbox,
  IonBadge,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardSubtitle,
  IonCardTitle,
  IonButtons,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { trashOutline, checkmarkOutline, createOutline } from 'ionicons/icons';

import { TaskService } from '../services/task.services';
import { CategoryService } from '../services/category.services';
import { FeatureFlagService } from '../services/feature-falg.services';
import { Task, Category } from '../models/task.model';
import { FormService } from '../services/form.services';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonLabel,
    IonBadge,
    IonNote,
    IonSegment,
    IonSegmentButton,
    IonSelect,
    IonSelectOption,
    IonIcon,
    IonText,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonButtons,
  ],
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  newTask = '';
  newCategory = '';
  updateCategory: Category = { id: '', name: '' };
  editCategory: boolean = false;
  selectedCategory = 'others';
  filteredCategory: Category = { id: 'all', name: 'Todas las categorias' };
  categories: Category[] = [];
  tasks: Task[] = [];

  private destroyRef = inject(DestroyRef);

  constructor(
    public taskService: TaskService,
    public categoryService: CategoryService,
    public formService: FormService,
    public flags: FeatureFlagService,
    private alertCtrl: AlertController,
  ) {
    addIcons({ trashOutline, checkmarkOutline, createOutline });
  }

  ngOnInit() {
    this.categoryService.categories$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((categories) => {
        this.categories = categories;
        const updatedCategory = categories.find(
          (c) => c.id === this.filteredCategory?.id,
        );
        if (updatedCategory) this.filteredCategory = updatedCategory;
        if (categories.length > 0 && !this.selectedCategory) {
          this.selectedCategory = 'others';
        }
      });

    this.taskService.tasks$.subscribe(() => {
      this.filter('all');
    });
  }

  async add(task: boolean) {
    await this.formService.handleAdd(
      task ? this.newTask : this.newCategory,
      task
        ? () => this.taskService.addTask(this.newTask, this.selectedCategory)
        : () => this.categoryService.addCategory(this.newCategory, 'tertiary'),
      `Escribe una ${task ? 'tarea ' : 'categoría'} primero`,
      `${task ? 'Tarea ' : 'Categoría'} agregada`,
      task ? () => (this.newTask = '') : () => (this.newCategory = ''),
    );
  }

  changeDataCategory() {
    this.editCategory = true;
    this.updateCategory = structuredClone(this.filteredCategory);
  }

  cancelEditedCategory() {
    this.editCategory = false;
  }

  async sendEditedCategory() {
    try {
      await this.categoryService.editCategory(
        this.updateCategory.id,
        this.updateCategory.name.trim(),
      );
      this.formService.showToast('Categoría actualizada', 'success');
      this.editCategory = false;
    } catch (error) {
      await this.formService.showToast('Ocurrió un error', 'warning');
    }
  }


  filter(categoryId: string | number | undefined) {
    const id = categoryId?.toString() ?? 'all';
    this.filteredCategory = this.categories.find(
      (category) => category.id === id,
    ) ?? { id: 'all', name: 'Todas las categorias' };
    this.tasks = this.taskService.filterCategory(id);
  }

  async completeTask(id: string) {
    await this.taskService.taskCompleted(id);
    const task = this.tasks.find((t) => t.id === id);
    const mensaje = task?.completed
      ? 'Tarea completada ✓'
      : 'Tarea marcada como pendiente';
    await this.formService.showToast(mensaje, 'success');
  }

  async deleteCategory(cat: Category) {
    const tasksInCategory = this.taskService.filterCategory(cat.id).length;

    const mensaje =
      tasksInCategory > 0
        ? `"${cat.name}" tiene ${tasksInCategory} tarea(s). Al eliminarla se eliminarán también.`
        : `¿Estás seguro de eliminar "${cat.name}"?`;

    const alert = await this.alertCtrl.create({
      header: '¿Eliminar categoría?',
      message: mensaje,
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'alert-button-cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            // Delete task in category, if there are
            if (tasksInCategory > 0) {
              await this.taskService.deleteByCategory(cat.id);
            }
            await this.delete(cat.id, false);
            if (this.filteredCategory.id === cat.id) {
              this.filter('all');
            }
          },
          cssClass: 'alert-button-confirm',
        },
      ],
    });
    await alert.present();
  }

  async delete(id: string, task: boolean) {
    if (task)
      await this.formService.handleDelete(
        () => this.taskService.deleteTask(id),
        'Tarea eliminada',
      );
    else
      await this.formService.handleDelete(
        () => this.categoryService.deleteCategory(id),
        'Categoría eliminada',
      );
  }

  getCategoryName(categoryId: string): string {
    return this.categories.find((c) => c.id === categoryId)?.name ?? '';
  }

  getCategoryColor(categoryId: string): string {
    return this.categories.find((c) => c.id === categoryId)?.color ?? 'medium';
  }

  get pendientes(): number {
    return this.tasks.filter((t) => !t.completed).length;
  }
}
