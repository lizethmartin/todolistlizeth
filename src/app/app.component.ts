import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Platform } from '@ionic/angular/standalone';
import { FeatureFlagService } from './services/feature-falg.services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  template: `<ion-app><ion-router-outlet /></ion-app>`,
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private flag: FeatureFlagService,
  ) {}

  async ngOnInit() {
    await this.platform.ready();
    await this.flag.init();

    // Pausa polling cuando app va al fondo
    this.platform.pause.subscribe(() => {
      this.flag.stopPolling();
    });

    // Reanuda cuando vuelve al frente
    this.platform.resume.subscribe(async () => {
      await this.flag.init();
    });
  }
}
