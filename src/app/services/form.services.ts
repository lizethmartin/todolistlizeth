import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  constructor(private toastCtrl: ToastController) {}

  //Method to show confirmation messages
  async showToast(
    mensaje: string,
    color: 'success' | 'danger' | 'warning' | 'primary' = 'primary',
  ) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      color,
      position: 'bottom',
      icon: color === 'success' ? 'checkmark-outline' : 'trash-outline',
    });
    await toast.present();
  }

  //General method to create a category or task
  async handleAdd<T>(
    value: string,
    action: () => Promise<T>,
    emptyMsg: string,
    successMsg: string,
    reset: () => void,
  ): Promise<T | void> {
    if (!value.trim()) {
      await this.showToast(emptyMsg, 'warning');
      return;
    }

    const result = await action();
    reset();
    await this.showToast(successMsg, 'success');
    return result;
  }

  //General method to delete a category or task
  async handleDelete(action: () => Promise<void>, successMessage: string) {
    try {
      await action();
      await this.showToast(successMessage, 'danger');
    } catch (error) {
      await this.showToast('Ocurrió un error', 'warning');
    }
  }
}
