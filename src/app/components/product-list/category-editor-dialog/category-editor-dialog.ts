import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { Product } from '../../../models/inventory.model';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-category-editor-dialog',
  imports: [CommonModule, HlmIconImports, FormsModule],
  providers: [provideIcons({ lucideX })],
  templateUrl: './category-editor-dialog.html',
  styleUrl: './category-editor-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryEditorDialogComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);

  product = input.required<Product>();
  closeDialog = output<void>();
  apply = output<{ categoria: string }>();

  categories = this.categoryService.categories;
  selectedCategory = signal<string>('');

  ngOnInit() {
    this.selectedCategory.set(this.product().categoria);
  }

  updateCategory(value: string) {
    this.selectedCategory.set(value);
  }

  onApply() {
    this.apply.emit({
      categoria: this.selectedCategory(),
    });
  }

  onClose() {
    this.closeDialog.emit();
  }
}
