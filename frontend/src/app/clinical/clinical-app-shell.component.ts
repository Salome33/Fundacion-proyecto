import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ClinicalMainNavComponent } from './clinical-main-nav.component';
import { ClinicalSidebarService } from './clinical-sidebar.service';
import { DailyVitalsService } from './daily-vitals.service';
import { IntakeStoreService } from './intake-store.service';
import { MedicalAppointmentsService } from './medical-appointments.service';
import { NursingNotesService } from './nursing-notes.service';

@Component({
  selector: 'app-clinical-app-shell',
  standalone: true,
  imports: [ClinicalMainNavComponent, RouterOutlet],
  styleUrl: './clinical-theme.css',
  template: `
    <div
      class="clinical-app-shell clinical-scroll-shell"
      [class.clinical-sidebar-open]="sidebar.open()"
    >
      @if (!sidebar.open()) {
        <button
          type="button"
          class="clinical-sidebar-toggle"
          (click)="sidebar.openPanel()"
          aria-expanded="false"
          aria-controls="clinical-main-nav"
        >
          Menú
        </button>
      }
      @if (sidebar.open()) {
        <button
          type="button"
          class="clinical-sidebar-backdrop"
          aria-label="Cerrar menú"
          (click)="sidebar.close()"
        ></button>
      }
      <app-clinical-main-nav id="clinical-main-nav" />
      <main class="clinical-page clinical-scroll-main lun-main lun-main--app">
        <router-outlet />
      </main>
    </div>
  `,
})
export class ClinicalAppShellComponent implements OnInit {
  readonly sidebar = inject(ClinicalSidebarService);
  private store = inject(IntakeStoreService);
  private appointments = inject(MedicalAppointmentsService);
  private vitals = inject(DailyVitalsService);
  private notes = inject(NursingNotesService);

  ngOnInit(): void {
    this.store.loadFromServer();
    this.appointments.loadFromServer();
    this.vitals.loadFromServer();
    this.notes.loadFromServer();
  }
}
