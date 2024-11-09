import { Component, OnInit, Inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, getDoc, doc, getDocs, where, collection, query} from '@angular/fire/firestore';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule,RouterLink],
})
export class HomePage implements OnInit {
  nombre_user: string | null = null; // Variable para almacenar el nombre de usuario

  constructor(private auth: Auth, @Inject(Firestore) private firestore: Firestore) {}

  ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        const uid = user.uid;
        console.log('UID del usuario autenticado:', uid);
        try {
          const usersRef = collection(this.firestore, 'usuarios');
          const q = query(usersRef, where('uid', '==', uid));
          const querySnapshot = await getDocs(q);
    
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0]; // Toma el primer documento encontrado
            console.log('Documento del usuario encontrado:', userDoc.data());
            this.nombre_user = userDoc.data()['nombre_user'] || 'Desconocido';
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