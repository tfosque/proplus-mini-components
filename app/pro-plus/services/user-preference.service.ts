import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type searchingParams =
    | 'JobName'
    | 'ProductOrSKU'
    | 'OrderPlacedDate'
    | 'MincronOrderNumber'
    | 'OrderStatus'
    | 'CustPO'
    | 'Street'
    | 'IsPROPlusOrder';

const defaultPreference = {
    pageSize: 10,
    searchParam: 'OrderPlacedDate',
    searchTerm: "",
};

export type UserPreferences = typeof defaultPreference;

@Injectable({
    providedIn: 'root',
})
export class UserPreferenceService {
    public userPreference$ = new BehaviorSubject<UserPreferences>(
        defaultPreference
    );

    setUserPreference(preferences: UserPreferences) {
        localStorage.setItem('preferences', JSON.stringify(preferences));
        this.userPreference$.next(preferences);
    }

    getUserPreference(): UserPreferences {
        const pref = localStorage.getItem('preferences');
        const preferences = this.userPreference$.value;

        if (!pref) {
            return preferences;
        } else {
            try {
                return JSON.parse(pref);
            } catch {
                return preferences;
            }
        }
    }
}
