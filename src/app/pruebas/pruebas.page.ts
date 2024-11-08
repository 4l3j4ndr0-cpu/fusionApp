import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';


@Component({
  selector: 'app-pruebas',
  templateUrl: './pruebas.page.html',
  styleUrls: ['./pruebas.page.scss'],
  standalone: true,
  imports: [ CommonModule,IonicModule, RouterLink]
})
export class PruebasPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
