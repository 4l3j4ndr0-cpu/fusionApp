import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-estadistica',
  templateUrl: './estadistica.page.html',
  styleUrls: ['./estadistica.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink]
})
export class EstadisticaPage implements OnInit {

  presentingElement: any = null;

  constructor() { }

  ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page');
  }

  async canDismiss(data?: any, role?: string) {
    return role !== 'gesture';
  }
  
}


