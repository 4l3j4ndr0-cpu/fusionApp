import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nutri-move',
  templateUrl: './nutri-move.page.html',
  styleUrls: ['./nutri-move.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink]
})
export class NutriMovePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
