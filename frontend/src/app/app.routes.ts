import { Routes } from '@angular/router';
import { authGuard, editGuard, guestGuard } from './auth/auth.guard';
import { ClinicalAppShellComponent } from './clinical/clinical-app-shell.component';
import { HomeViewComponent } from './clinical/home-view.component';
import { ExploreSectionsViewComponent } from './clinical/explore-sections-view.component';
import { RecordsListViewComponent } from './clinical/records-list-view.component';
import { AppointmentsViewComponent } from './clinical/appointments-view.component';
import { VitalsViewComponent } from './clinical/vitals-view.component';
import { NursingNotesViewComponent } from './clinical/nursing-notes-view.component';
import { SectionHubComponent } from './clinical/section-hub.component';
import { ClinicalIntakeComponent } from './clinical/clinical-intake.component';
import { IntakeLayoutComponent } from './clinical/intake-layout.component';
import { IntakeSectionPageComponent } from './clinical/intake-section-page.component';
import { ScratchViewerComponent } from './scratch/scratch-viewer.component';
import { LoginViewComponent } from './clinical/login-view.component';

export const routes: Routes = [
  { path: 'login', component: LoginViewComponent, canActivate: [guestGuard] },
  {
    path: '',
    component: ClinicalAppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: HomeViewComponent },
      { path: 'explorar', component: ExploreSectionsViewComponent },
      { path: 'fichas', component: RecordsListViewComponent },
      { path: 'citas', component: AppointmentsViewComponent },
      { path: 'signos-vitales', component: VitalsViewComponent },
      { path: 'notas-enfermeria', component: NursingNotesViewComponent },
      { path: 'seccion/:section', component: SectionHubComponent },
    ],
  },
  {
    path: 'nuevo',
    component: ClinicalIntakeComponent,
    canActivate: [authGuard, editGuard],
  },
  {
    path: 'ficha/:id',
    component: ClinicalIntakeComponent,
    canActivate: [authGuard],
  },
  {
    path: 'ingreso/:id',
    component: IntakeLayoutComponent,
    canActivate: [authGuard, editGuard],
    children: [
      { path: '', redirectTo: 'contrato', pathMatch: 'full' },
      { path: ':section', component: IntakeSectionPageComponent },
    ],
  },
  { path: 'demo-3d', component: ScratchViewerComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
