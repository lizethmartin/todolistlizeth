import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
    getRemoteConfig,
    //   fetchAndActivate,
    getValue,
    RemoteConfig,
    onConfigUpdate,
    activate,
    fetchConfig,
} from 'firebase/remote-config';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
    private remoteConfig: RemoteConfig;

    // Observables
    private _showCategories = new BehaviorSubject<boolean>(true);
    private _showFilters = new BehaviorSubject<boolean>(true);

    showCategories$ = this._showCategories.asObservable();
    showFilters$ = this._showFilters.asObservable();

    constructor() {
        //Init firebase
        const app = initializeApp(environment.firebase);
        this.remoteConfig = getRemoteConfig(app);

        // Values to defect
        this.remoteConfig.defaultConfig = {
            get_categories: true,
            get_filters: true,
        };

        const minutes = (m: number) => m * 60 * 1000;
        const ONE_HOUR = minutes(60);
        const HALF_HOUR = minutes(30);

        // Time to refresh : in dev half hour, prod one hour
        this.remoteConfig.settings.minimumFetchIntervalMillis = 0;
        // environment.production ? ONE_HOUR : HALF_HOUR;

        //Get changes on firebase
        // onConfigUpdate(this.remoteConfig, {
        //     next: async (configUpdate) => {
        //         await activate(this.remoteConfig);
        //         await this.getFilters(); // refresh data
        //     },
        //     complete: () => console.log('completado'),
        //     error: (err) => console.error(err),
        // });
    }

    async init(): Promise<void> {
        try {
            await fetchConfig(this.remoteConfig);
            await activate(this.remoteConfig);
            await this.getFilters(); 
            this.startPolling();
        } catch (e) {
            console.warn('Remote Config no disponible, usando defaults', e);
        }
    }

    private pollingInterval: any;

    startPolling(intervalMs = 10000) { // cada 10 segundos
    this.stopPolling();
    this.pollingInterval = setInterval(async () => {
        try {
        await fetchConfig(this.remoteConfig);
        await activate(this.remoteConfig);
        await this.getFilters();
        } catch (e) {
        console.warn('Polling falló', e);
        }
    }, intervalMs);
    }

    stopPolling() {
    if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
    }
}
    async getFilters() {
        const categories = this.showCategories;
        const filters = this.showFilters;
        console.log('get_categories:', categories);
    console.log('get_filters:', filters);
        // Update observables with Firebase data
        this._showCategories.next(categories);
        this._showFilters.next(filters);
    }

    //Get categories value of firebase
    get showCategories(): boolean {
        return getValue(this.remoteConfig, 'get_categories').asBoolean();
    }

    //Get filters value of firebase
    get showFilters(): boolean {
        return getValue(this.remoteConfig, 'get_filters').asBoolean();
    }
}
