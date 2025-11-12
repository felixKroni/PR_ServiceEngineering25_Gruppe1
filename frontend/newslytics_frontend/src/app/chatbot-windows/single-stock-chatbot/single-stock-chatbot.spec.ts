import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleStockChatbot } from './single-stock-chatbot';

describe('SingleStockChatbot', () => {
  let component: SingleStockChatbot;
  let fixture: ComponentFixture<SingleStockChatbot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleStockChatbot]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleStockChatbot);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
