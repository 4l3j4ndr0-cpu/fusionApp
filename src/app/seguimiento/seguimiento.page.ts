import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-seguimiento',
  templateUrl: './seguimiento.page.html',
  styleUrls: ['./seguimiento.page.scss'],
  standalone: true,
  imports: [IonicModule,RouterLink]
})
export class SeguimientoPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
