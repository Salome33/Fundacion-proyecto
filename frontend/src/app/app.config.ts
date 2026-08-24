import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { clearClinicalLocalData, needsClinicalDataReset } from './clinical/clinical-data-migration';

function initializeClinicalData(): () => Promise<void> {
  return () => {
    if (needsClinicalDataReset()) {
      clearClinicalLocalData();
    }
    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeClinicalData,
      multi: true,
    },
  ],
};
