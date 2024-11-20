import { Component } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonicModule, MenuController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink, FormsModule, ReactiveFormsModule, CommonModule]
})

export class LoginPage {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  isLoading = false;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private fb: FormBuilder,
    private menuController: MenuController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      try {
        const response = await this.loginService.loginWithEmail(email, password); // Usa el método correcto
        if (response.success) {
          this.router.navigate(['/pruebas/home']);
          this.menuController.close(); // Cierra el menú al iniciar sesión
          this.errorMessage = null; // Resetea el mensaje en caso de éxito
        } else {
          this.errorMessage = response.error ?? null; // Establece el mensaje de error o null si no hay error
        }
      } catch (error) {
        console.error('Error inesperado en el login:', error);
        this.errorMessage = 'Ocurrió un error inesperado al intentar iniciar sesión.';
      }
    } else {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
    }
  }

   //Inicio de sesión con google función asincrona para 
   async onLoginWithGoogle() {
    console.time('LoginWithGoogle');
    this.isLoading = true;
    try {
      const result = await this.loginService.loginWithGoogle();
      this.router.navigate(['/pruebas/home']);
    } catch (error) {
      console.error("Error en inicio de sesión con Google:", error);
    } finally {
      console.timeEnd('LoginWithGoogle')
      this.isLoading = false;
    }
  }
}