import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterLink, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { home, documentText, chatboxEllipses, barbell, calendar, analytics } from 'ionicons/icons';



@Component({
  selector: 'app-pruebas',
  templateUrl: './pruebas.page.html',
  styleUrls: ['./pruebas.page.scss'],
  standalone: true,
  imports: [ CommonModule, IonicModule, RouterLink, RouterModule]
})
export class PruebasPage implements OnInit {

  constructor() {
    addIcons({home, documentText, chatboxEllipses, calendar, barbell, analytics });
   }

  ngOnInit() {
  }

}
