import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { DatabaseService } from '../services/database.service';
import { LoginService } from '../services/login.service';
import { Router, RouterLink } from '@angular/router';
import { IonicModule, MenuController, NavController } from '@ionic/angular';
import { Auth } from '@angular/fire/auth';

interface UsuarioData {
  rut?: string;
  nombre_user?: string;
  [key: string]: any; // Para otras propiedades dinámicas
}



@Component({
  selector: 'app-completar-perfil',
  templateUrl: './completar-perfil.page.html',
  styleUrls: ['./completar-perfil.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule]
})
export class CompletarPerfilPage {

  completarPerfilForm: FormGroup;
  uid: string | null = null;
  userData: UsuarioData = {}; // Se inicializa el objeto vacío
  isHidden = false;

  constructor(
    private loginService: LoginService,
    private fb: FormBuilder,
    private databaseService: DatabaseService,
    private auth: Auth,
    private router: Router,
    private menuController: MenuController,
    private navController: NavController 
  ) {
    this.completarPerfilForm = this.fb.group({
    rut: ['', [Validators.required]],
    nombre_user: ['', [Validators.required]],
  });
  this.uid = this.auth.currentUser?.uid || null; // Obtén el UID del usuario actual
}

  async ionViewWillEnter() {
    this.isHidden = false;
    this.menuController.enable(false, 'mainMenu');
    const currentUser = await this.loginService.currentUser$.toPromise();
    if (currentUser) {
      this.userData.rut = currentUser.rut || '';
      this.userData.nombre_user = currentUser.nombre_user || '';
    }
  }

  ionViewWillLeave() {
    this.isHidden = true;
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      activeElement.blur(); // Retira el foco del elemento actual
    }
    this.menuController.enable(true, 'mainMenu');//se habilita nuevamente
  
    // Ocultar correctamente la página
  const pageElement = document.querySelector('app-completar-perfil');
  if (pageElement) {
    pageElement.setAttribute('aria-hidden', 'true');
  } 
  }

  async onSaveProfile() {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        console.error("No hay un usuario autenticado.");
        return;
      }
  
      const uid = currentUser.uid; // Obtiene el UID del usuario autenticado
  
      const userProfileData = {
        uid, // Incluye el UID
        rut: this.completarPerfilForm.value.rut,
        nombre_user: this.completarPerfilForm.value.nombre_user,
      };
  
      console.log("Formulario enviado:", userProfileData);
  
      await this.databaseService.updateUsuario(userProfileData);
      console.log("Perfil actualizado correctamente");
      this.router.navigate(['/pruebas/home'], { replaceUrl: true}); // Redirige al home después de completar el perfil
    } catch (error) {
      console.error("Error al guardar el perfil:", error);
    }
  }

}
