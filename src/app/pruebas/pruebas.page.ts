import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, MenuController } from '@ionic/angular';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { home, documentText, chatboxEllipses, barbell, calendar, analytics } from 'ionicons/icons';
import { LoginService } from '../services/login.service';
import { logOutOutline } from 'ionicons/icons';



@Component({
  selector: 'app-pruebas',
  templateUrl: './pruebas.page.html',
  styleUrls: ['./pruebas.page.scss'],
  standalone: true,
  imports: [ CommonModule, IonicModule, RouterLink, RouterModule]
})



export class PruebasPage implements OnInit {

  constructor(
    private router: Router,
    private loginService: LoginService,
    private alertController: AlertController,
    private menuController: MenuController) {
    
    addIcons({
      home,
      documentText,
      chatboxEllipses,
      calendar,
      barbell,
      analytics,
      logOutOutline
     });
   }

   navigateTo(path: string) {
    // Cierra el menú antes de redirigir
    this.menuController.close().then(() => {
      this.router.navigate([`/pruebas/${path}`]);
    });
  }
  
   // Mostrar popup de confirmación antes de cerrar sesión
   async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Confirmar Cierre de Sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'no-button',
          handler: () => {
            console.log('Cierre de sesión cancelado');
          },
        },
        {
          text: 'Sí',
          cssClass: 'yes-button',
          handler: async () => {
            await this.logout();
          },
        },
      ],
    });

    await alert.present();
  }

   // Logout
   async logout() {
    try {
      await this.loginService.logout();
      console.log('Sesión cerrada');
      this.router.navigate(['/login']); // Redirige al login
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  onMenuWillClose() {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      activeElement.blur(); // Quita el foco del elemento activo
    }
  }

  ngOnInit() {
  }

}
