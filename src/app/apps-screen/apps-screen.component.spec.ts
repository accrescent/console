// Copyright 2023 Logan Magee
//
// SPDX-License-Identifier: AGPL-3.0-only

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppsScreenComponent } from './apps-screen.component';

describe('AppsScreenComponent', () => {
    let component: AppsScreenComponent;
    let fixture: ComponentFixture<AppsScreenComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppsScreenComponent]
        });
        fixture = TestBed.createComponent(AppsScreenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
