import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockSearchChatbot } from './stock-search-chatbot';

describe('StockSearchChatbot', () => {
  let component: StockSearchChatbot;
  let fixture: ComponentFixture<StockSearchChatbot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockSearchChatbot]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockSearchChatbot);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
