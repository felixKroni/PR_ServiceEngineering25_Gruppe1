import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Portfolio } from '../../Models/portfolio';

@Component({
    standalone: true,
    selector: 'app-portfolio-placeholder',
    imports: [CommonModule, RouterLink],
    templateUrl: './portfolio-placeholder.component.html',
    styleUrl: './portfolio-placeholder.component.scss'
})
export class PortfolioPlaceholderComponent {
    @Input({ required: true }) portfolio!: Portfolio;
}
