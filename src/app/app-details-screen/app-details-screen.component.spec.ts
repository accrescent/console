// Copyright 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDetailsScreenComponent } from './app-details-screen.component';

describe('AppDetailsScreenComponent', () => {
    let component: AppDetailsScreenComponent;
    let fixture: ComponentFixture<AppDetailsScreenComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppDetailsScreenComponent]
        });
        fixture = TestBed.createComponent(AppDetailsScreenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
