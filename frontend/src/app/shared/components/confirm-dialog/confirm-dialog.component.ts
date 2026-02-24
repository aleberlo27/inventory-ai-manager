import { Component } from '@angular/core';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';

/**
 * Shared wrapper that renders PrimeNG ConfirmDialog and Toast.
 * Place this component once in any layout that needs confirmation dialogs and toasts.
 * The parent component must provide ConfirmationService and MessageService.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ ConfirmDialog, Toast],
  templateUrl: 'confirm-dialog.component.html',
})
export class ConfirmDialogComponent {}
