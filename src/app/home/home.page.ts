import { Component, OnInit, Inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, getDoc, doc, getDocs, where, collection, query} from '@angular/fire/firestore';
import { LoginPage } from '../login/login.page';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule,RouterLink],
})
export class HomePage implements OnInit {
  nombre_user: string | null = null; // Variable para almacenar el nombre de usuario
  
  constructor(
    private auth: Auth,
    @Inject(Firestore)
    private firestore: Firestore,
    private loginService: LoginService,
    private router: Router) {}

  

    async ionViewWillEnter() {
      const currentUser = await this.loginService.currentUser$.toPromise();
      if (currentUser && (!currentUser.rut || !currentUser.nombre_user)) {
        // Redirige a completar perfil si faltan rut o nombre_user
        this.router.navigate(['/completar-perfil']);
      }
    }

  ngOnInit() {
    this.checkUserProfile();
  }
  
  async checkUserProfile() {

    let isRedirecting = false;

    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        const uid = user.uid;
        console.log('UID del usuario autenticado:', uid);
    
        try {
          // Referencia al documento del usuario
          const userDocRef = doc(this.firestore, `usuarios/${uid}`);
          const userDocSnap = await getDoc(userDocRef);
    
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            console.log('Documento del usuario encontrado:', userData);
    
            // Verifica si faltan campos obligatorios
            if (
              !userData ||
              typeof userData['rut'] !== 'string' ||
              userData['rut'].trim() === '' ||
              typeof userData['nombre_user'] !== 'string' ||
              userData['nombre_user'].trim() === ''
            ) {
              console.warn('Faltan datos del perfil, redirigiendo...');
              setTimeout(() => {
                this.router.navigate(['/completar-perfil']);
              }, 2000); // Reduce el tiempo para una mejor UX
            } else {
              this.nombre_user = userData['nombre_user'] || 'Desconocido';
            }
          } else {
            console.error('No se encontró el documento del usuario con el UID proporcionado');
          }
        } catch (error) {
          console.error('Error al obtener el documento del usuario:', error);
        }
      } else {
        console.error('No hay usuario logueado');
      }
    });

  }
}