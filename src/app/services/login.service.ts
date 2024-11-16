import { Injectable, inject} from '@angular/core';
import { Auth, signInWithEmailAndPassword, onAuthStateChanged, UserCredential, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Firestore, collection, query, where, getDocs, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        const userData = await this.getUserFromFirestore(user.uid);
        this.currentUserSubject.next(userData);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }


  //Inicio de sesión con email y contraseña normal del servicio de firebase
  async loginWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      if (userCredential.user?.email) {
        const userData = await this.getUserFromEmail(userCredential.user.email);
        this.currentUserSubject.next(userData);
        console.log('Usuario logueado exitosamente');
        return { success: true };
      } else {
        console.error('El correo electrónico del usuario no está disponible');
        return { success: false, error: 'El correo electrónico del usuario no está disponible' };
      }
    } catch (error: any) {
      console.error('Error de inicio de sesión:', error);
      if (error.code === 'auth/user-not-found') {
        return { success: false, error: 'No se encontró una cuenta con ese correo.' };
      } else if (error.code === 'auth/wrong-password') {
        return { success: false, error: 'Contraseña incorrecta.' };
      } else {
        return { success: false, error: 'Error al iniciar sesión. Verifica tus credenciales.' };
      }
    }
  }

  // Inicio de sesión con google, servicio de firebase
  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;
  
      if (user) {
        const userDocRef = doc(this.firestore, `usuarios/${user.uid}`);
        const userDocSnap = await getDoc(userDocRef);
  
        // Estructura de datos uniforme
        const usuarioData = {
          uid: user.uid,
          rut: "", // Por defecto vacío, se completará en la página de completar perfil
          nombre_user: "", // Por defecto vacío, se completará en la página de completar perfil
          contrasena: null, // No aplica para Google
          email: user.email || "",
          nombre: user.displayName || "",
          apellido_pat: "", // Por defecto vacío
          apellido_mat: "", // Por defecto vacío
          peso: null, // Por defecto vacío
          estatura: null, // Por defecto vacío
          mesotipo: "", // Por defecto vacío
          edad: null, // Por defecto vacío
          id_rol: 2, // Rol por defecto
          fecha_registro: new Date(),
          metodoRegistro: "google", // Indica el método de registro
        };
  
        // Si el usuario no existe en Firestore, se crea un documento
        if (!userDocSnap.exists()) {
          await setDoc(userDocRef, usuarioData);
          console.log("Usuario registrado correctamente con Google.");
        } else {
          console.log("El usuario ya existe en Firestore.");
        }
  
        // Verificar si faltan datos obligatorios
        const userData = userDocSnap.exists() ? userDocSnap.data() : usuarioData;
        if (!userData?.['rut'] || !userData?.['nombre_user']) {
          console.warn("Faltan datos del perfil, redirigiendo...");
          this.router.navigate(['/completar-perfil']); // Redirigir a la página de completar perfil
        } else {
          console.log("Inicio de sesión exitoso y perfil completo.");
          // Aquí puedes redirigir al home si el perfil está completo
          this.router.navigate(['/pruebas/home']);
        }
      }
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    }
  }

  // Verificar y crear/actualizar el usuario en Firestore
  private async checkAndCreateFirestoreUser(uid: string, additionalData: any = {}) {
    const userDocRef = doc(this.firestore, `usuarios/${uid}`);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      // Si el usuario no existe en Firestore, crea el documento
      const userData = {
        uid,
        ...additionalData,
        rut: "",  // Dejar estos campos vacíos para que el usuario los complete después
        nombre_user: "",
        apellido_pat: "",
        apellido_mat: "",
        peso: 0,
        estatura: 0,
        mesotipo: "",
        edad: 0,
        id_rol: 2,
        fecha_registro: new Date(),
      };
      await setDoc(userDocRef, userData);
      console.log('Usuario creado en Firestore');
    } else {
      console.log('El usuario ya existe en Firestore');
    }
  }

  // Obtener usuario desde Firestore
  private async getUserFromFirestore(uid: string): Promise<any> {
    try {
      const userDocRef = doc(this.firestore, `usuarios/${uid}`);
      const userDocSnap = await getDoc(userDocRef);
      return userDocSnap.exists() ? userDocSnap.data() : null;
    } catch (error) {
      console.error('Error al obtener el usuario de Firestore:', error);
      return null;
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
      console.error('Error al obtener usuario por correo:', error);
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