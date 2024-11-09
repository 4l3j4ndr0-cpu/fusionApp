import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, onAuthStateChanged, UserCredential, setPersistence, browserLocalPersistence } from '@angular/fire/auth';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private auth: Auth, private firestore: Firestore) {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        const userData = await this.getUserFromEmail(user.email!);
        this.currentUserSubject.next(userData);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(this.auth, email, password);
      if (userCredential.user?.email) {
        const userData = await this.getUserFromEmail(userCredential.user.email);
        this.currentUserSubject.next(userData);  
        console.log('Usuario logueado exitosamente');
        return true;
      } else {
        console.error('El correo electrónico del usuario no está disponible');
        return false;
      }
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      return false;
    }
  }

  async getUserFromEmail(email: string): Promise<{ id: string; [key: string]: any } | null> {
    try {
      const q = query(collection(this.firestore, 'usuarios'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  }

  logout(): void {
    this.auth.signOut().then(() => {
      this.currentUserSubject.next(null);
      console.log('Usuario desconectado');
    });
  }

  get currentUserId(): string | null {
    return this.auth.currentUser ? this.auth.currentUser.uid : null;
  }
}
