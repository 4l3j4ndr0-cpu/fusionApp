import { Component } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink, FormsModule,CommonModule]
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(private loginService: LoginService, private router: Router) {}
  async onLogin() {
    try {
      await this.loginService.login(this.email, this.password);
      this.router.navigate(['/pruebas/home']);
    } catch (error) {
      console.error('Error en el login:', error);
      alert('Error al iniciar sesión. Verifica tus credenciales.');
    }
  }
}



