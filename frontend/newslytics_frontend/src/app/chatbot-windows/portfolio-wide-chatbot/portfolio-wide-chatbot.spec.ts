import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioWideChatbot } from './portfolio-wide-chatbot';

describe('PortfolioWideChatbot', () => {
  let component: PortfolioWideChatbot;
  let fixture: ComponentFixture<PortfolioWideChatbot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioWideChatbot]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioWideChatbot);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
