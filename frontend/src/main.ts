import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';
import { ThemeService } from './app/core/ui/theme.service';

bootstrapApplication(AppComponent, appConfig).then(ref => {
  ref.injector.get(ThemeService).apply();
});