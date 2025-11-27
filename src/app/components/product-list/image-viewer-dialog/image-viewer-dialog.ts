import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight, lucideX } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { Product } from '../../../models/inventory.model';

@Component({
  selector: 'app-image-viewer-dialog',
  imports: [HlmIconImports],
  providers: [provideIcons({ lucideX, lucideChevronLeft, lucideChevronRight })],
  templateUrl: './image-viewer-dialog.html',
  styleUrl: './image-viewer-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageViewerDialogComponent {
  product = input.required<Product>();
  initialIndex = input<number>(0);
  closeDialog = output<void>();

  currentIndex = signal(0);

  images = computed(() => this.product().imagenes || []);

  currentImage = computed(() => {
    const imgs = this.images();
    const idx = this.currentIndex();
    return imgs.length > 0 ? imgs[idx] : null;
  });

  hasMultipleImages = computed(() => this.images().length > 1);

  constructor() {
    effect(() => {
      const idx = this.initialIndex();
      this.currentIndex.set(idx);
    });
  }

  nextImage() {
    const total = this.images().length;
    if (total <= 1) return;
    this.currentIndex.update((i) => (i + 1) % total);
  }

  prevImage() {
    const total = this.images().length;
    if (total <= 1) return;
    this.currentIndex.update((i) => (i - 1 + total) % total);
  }

  goToImage(index: number) {
    this.currentIndex.set(index);
  }

  onClose() {
    this.closeDialog.emit();
  }
}
