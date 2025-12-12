import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StockHomepage } from '../../../components/stock/stock-homepage.component/stock-homepage.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterLink, StockHomepage],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

}
