import { Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  success(message: string, description?: string): void {
    toast.success(message, {
      description,
    });
  }

  error(message: string, description?: string): void {
    toast.error(message, {
      description,
    });
  }

  info(message: string, description?: string): void {
    toast(message, {
      description,
    });
  }

  warning(message: string, description?: string): void {
    toast.warning(message, {
      description,
    });
  }

  loading(message: string): void {
    toast.loading(message);
  }

  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    options?: { description?: string }
  ): Promise<T> {
    toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      description: options?.description,
    });
    return promise;
  }
}
