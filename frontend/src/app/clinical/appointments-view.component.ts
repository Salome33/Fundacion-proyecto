import { Component } from '@angular/core';
import { MedicalAppointmentsPanelComponent } from './medical-appointments-panel.component';

@Component({
  selector: 'app-appointments-view',
  standalone: true,
  imports: [MedicalAppointmentsPanelComponent],
  styleUrl: './clinical-theme.css',
  template: `
    <div class="app-view app-view--wide">
      <app-medical-appointments-panel [embedded]="true" />
    </div>
  `,
})
export class AppointmentsViewComponent {}
