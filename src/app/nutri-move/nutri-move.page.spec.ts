import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NutriMovePage } from './nutri-move.page';

describe('NutriMovePage', () => {
  let component: NutriMovePage;
  let fixture: ComponentFixture<NutriMovePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NutriMovePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
