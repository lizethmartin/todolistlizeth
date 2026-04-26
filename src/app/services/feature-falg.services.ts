import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
    getRemoteConfig,
    fetchAndActivate,
    getValue,
    RemoteConfig,
    onConfigUpdate,
    activate,
} from 'firebase/remote-config';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
    private remoteConfig: RemoteConfig;

    constructor() {
        //Init firebase
        const app = initializeApp(environment.firebase);
        this.remoteConfig = getRemoteConfig(app);

        // Values to defect
        this.remoteConfig.defaultConfig = {
            get_categories: true,
            get_filters: true,
        };

        const minutes = (m:number) => m * 60 * 1000;
        const ONE_HOUR = minutes(60);
        const HALF_HOUR = minutes(30);

        // Time to refresh : in dev half hour, prod one hour
        this.remoteConfig.settings.minimumFetchIntervalMillis = environment.production ? ONE_HOUR : HALF_HOUR;

        //get changes in firebase
        onConfigUpdate(this.remoteConfig, {
            next: async (configUpdate) => {
                await activate(this.remoteConfig);
                await this.getFilters(); // refresh data
            },
            complete: () => console.log('completado'),
            error: (err) => console.error(err),
        });
    }

    async init(): Promise<void> {
        try {
            await fetchAndActivate(this.remoteConfig);
        } catch (e) {
            console.warn('Remote Config no disponible, usando defaults', e);
        }
    }

    async getFilters() {
        const categories = this.showCategories;
        const filter = this.showFilters;
        console.log('categories', categories);
        console.log('filter', filter);
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
