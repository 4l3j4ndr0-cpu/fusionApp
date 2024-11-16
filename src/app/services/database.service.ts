import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc, setDoc } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  constructor(private auth: Auth, private firestore: Firestore) {
    console.log('Conectado a Firestore');
  }

  //Insertar usuarios con email y contraseña
  async insertUsuario(user: any) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, user.email, user.contrasena);
      const uid = userCredential.user.uid;
  
      const usuarioData = {
        uid,
        rut: user.rut, // Tomado directamente del formulario
        nombre_user: user.nombre_user,
        contrasena: user.contrasena,
        email: user.email,
        nombre: user.nombre,
        apellido_pat: user.apellido_pat,
        apellido_mat: user.apellido_mat,
        peso: user.peso,
        estatura: user.estatura,
        mesotipo: user.mesotipo,
        edad: user.edad,
        id_rol: 2, // Rol por defecto
        fecha_registro: new Date(),
        metodoRegistro: "email", // Indica el método de registro
      };
  
      const userDocRef = doc(this.firestore, `usuarios/${uid}`);
      await setDoc(userDocRef, usuarioData);
      console.log("Usuario registrado correctamente");
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      throw error;
    }
  }

  async getUsuarios(): Promise<{ id: string; [key: string]: any }[]> {
    try {
      const snapshot = await getDocs(collection(this.firestore, 'usuarios'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return []; 
    }
  }

  async getUsuariosPorUid(uid: string): Promise<{ id: string; [key: string]: any } | null> {
    try {
      const userDocRef = doc(this.firestore, `usuarios/${uid}`);
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        console.log('Documento del usuario encontrado:', userDocSnap.data());
        return { id: userDocSnap.id, ...userDocSnap.data() };
      } else {
        console.error('No se encontró el documento del usuario con el UID proporcionado.');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener el usuario por UID:', error);
      return null;
    }
  }
  
  async updateUserProfile(uid: string, data: { rut: string; nombre_user: string }): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, `usuarios/${uid}`);
      await setDoc(userDocRef, data, { merge: true }); // Merge para actualizar solo campos específicos
      console.log("Perfil del usuario actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar el perfil del usuario:", error);
      throw error;
    }
  }

  async updateUsuario(user: any) {
    try {
      const uid = user.uid; // Asegúrate de que uid esté definido correctamente.
      if (!uid) {
        throw new Error("UID no proporcionado");
      }
  
      const userDocRef = doc(this.firestore, `usuarios/${uid}`); // Referencia directa al documento del usuario
  
      // Filtrar los campos que son undefined
      const usuarioData = Object.fromEntries(
        Object.entries({
          nombre_user: user.nombre_user,
          contrasena: user.contrasena,
          email: user.email,
          nombre: user.nombre,
          apellido_pat: user.apellido_pat,
          apellido_mat: user.apellido_mat,
          peso: user.peso,
          estatura: user.estatura,
          mesotipo: user.mesotipo,
          edad: user.edad,
          rut: user.rut,
          uid: user.uid,
        }).filter(([_, value]) => value !== undefined)
      );
  
      // Actualizar el documento directamente
      await setDoc(userDocRef, usuarioData, { merge: true });
      console.log("Usuario actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      throw error;
    }
  }

  async deleteUsuario(id: string) {
    try {
      await deleteDoc(doc(this.firestore, 'usuarios', id));
      console.log('Usuario eliminado');
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  }

  // Tabla: rutina
  async insertRutina(rutina: any) {
    const rutinaData = {
      nombre_rutina: rutina.nombre_rutina,
      objetivo: rutina.objetivo,
      calentamiento: rutina.calentamiento,
      estiramientos: rutina.estiramientos,
      frecuencia: rutina.frecuencia,
      descanso: rutina.descanso,
      progresion: rutina.progresion,
      consejos: rutina.consejos,
      id_user: rutina.id_user 
    };
  
    try {
      const rutinaRef = await addDoc(collection(this.firestore, 'rutinas'), rutinaData);
      console.log('Rutina insertada correctamente');
      const rutinaId = rutinaRef.id;
      const ejerciciosRef = collection(this.firestore, 'rutinas/${rutinaId}/ejercicios');
  
      for (const ejercicio of rutina.ejercicios) {
        await addDoc(ejerciciosRef, {
          nombre_ejercicio: ejercicio.nombre_ejercicio,
          series: ejercicio.series,
          repeticiones: ejercicio.repeticiones,
          descripcion: ejercicio.descripcion,
          id_rutina: rutinaId,
        });
      }
  
      console.log('Ejercicios insertados correctamente');
    } catch (error) {
      console.error('Error al insertar rutina y ejercicios:', error);
    }
}
async getRutinas(): Promise<{ id: string; [key: string]: any }[]> {
  try {
    const snapshot = await getDocs(collection(this.firestore, 'rutinas'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error al obtener rutinas:', error);
    return [];
  }
}
  async updateRutina(rutina: any) {
    const rutinaData = {
      nombre_rutina: rutina.nombre_rutina,
      descripcion: rutina.descripcion,
      id_user: rutina.id_user, 
      objetivo: rutina.objetivo,
      ejercicios: rutina.ejercicios, 
    };

    try {
      const rutinaRef = doc(this.firestore, 'rutinas', rutina.id);
      await updateDoc(rutinaRef, rutinaData);
      console.log('Rutina actualizada');
    } catch (error) {
      console.error('Error al actualizar rutina:', error);
    }
  }

  async deleteRutina(id: string) {
    try {
      await deleteDoc(doc(this.firestore, 'rutinas', id));
      console.log('Rutina eliminada');
    } catch (error) {
      console.error('Error al eliminar rutina:', error);
    }
  }

  // Tabla: estadisticas
  // Tabla: estadisticas
  /*async insertEstadistica(estadistica: any) {
      const estadisticaData = {
        date_recorded: estadistica.date_recorded,
        sesiones_completadas: estadistica.sesiones_completadas,
        total_sesiones: estadistica.total_sesiones,
        porcentaje_de_mejora: estadistica.porcentaje_de_mejora,
        tiempo_total_ent: estadistica.tiempo_total_ent,
        heart_rate: estadistica.heart_rate,
        imc: estadistica.imc,
        id_user: estadistica.id_user,
      };

      try {
        // Verificar si el usuario existe
        const userRef = doc(this.firestore, 'usuarios', estadistica.id_user);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          await addDoc(collection(this.firestore, 'estadisticas'), estadisticaData);
          console.log('Estadística insertada');
        } else {
          console.error('Usuario no encontrado');
        }
      } catch (error) {
        console.error('Error al insertar estadística:', error);
      }
    }*/
  async insertEstadistica(estadistica: any) {
    const estadisticaData = {
      date_recorded: estadistica.date_recorded,
      sesiones_completadas: estadistica.sesiones_completadas,
      total_sesiones: estadistica.total_sesiones,
      porcentaje_de_mejora: estadistica.porcentaje_de_mejora,
      tiempo_total_ent: estadistica.tiempo_total_ent,
      heart_rate: estadistica.heart_rate,
      imc: estadistica.imc,
      id_user: estadistica.id_user,
    };
  
    try {
      await addDoc(collection(this.firestore, 'estadisticas'), estadisticaData);
      console.log('Estadística insertada');
    } catch (error) {
      console.error('Error al insertar estadística:', error);
    }
  }

  async getEstadisticas(): Promise<{ id: string; [key: string]: any }[]> {
    try {
      const snapshot = await getDocs(collection(this.firestore, 'estadisticas'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return []; 
    }
  }

  async updateEstadistica(estadistica: any) {
    const estadisticaData = {
      date_recorded: estadistica.date_recorded,
      sesiones_completadas: estadistica.sesiones_completadas,
      total_sesiones: estadistica.total_sesiones,
      porcentaje_de_mejora: estadistica.porcentaje_de_mejora,
      tiempo_total_ent: estadistica.tiempo_total_ent,
      heart_rate: estadistica.heart_rate,
      imc: estadistica.imc,
      id_user: estadistica.id_user,
    };

    try {
      const estadisticaRef = doc(this.firestore, 'estadisticas', estadistica.id);
      await updateDoc(estadisticaRef, estadisticaData);
      console.log('Estadística actualizada');
    } catch (error) {
      console.error('Error al actualizar estadística:', error);
    }
  }

  async deleteEstadistica(id: string) {
    try {
      await deleteDoc(doc(this.firestore, 'estadisticas', id));
      console.log('Estadística eliminada');
    } catch (error) {
      console.error('Error al eliminar estadística:', error);
    }
  }

  // Tabla: soporte
  /*async insertSoporte(soporte: any) {
    const soporteData = {
      modificacion: soporte.modificacion,
      razon: soporte.razon,
      fecha: soporte.fecha,
      id_user: soporte.id_user,
    };
  
    try {
      // Verificar si el usuario existe
      const userRef = doc(this.firestore, 'usuarios', soporte.id_user);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        await addDoc(collection(this.firestore, 'soporte'), soporteData);
        console.log('Soporte insertado');
      } else {
        console.error('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error al insertar soporte:', error);
    }
  }*/
  async insertSoporte(soporte: any) {
    const soporteData = {
      modificacion: soporte.modificacion,
      razon: soporte.razon,
      fecha: soporte.fecha,
      id_user: soporte.id_user,
    };
  
    try {
      await addDoc(collection(this.firestore, 'soporte'), soporteData);
      console.log('Soporte insertado');
    } catch (error) {
      console.error('Error al insertar soporte:', error);
    }
  }

  async getSoportes(): Promise<{ id: string; [key: string]: any }[]> {
    try {
      const snapshot = await getDocs(collection(this.firestore, 'soporte'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error al obtener soportes:', error);
      return []; 
    }
  }

  async updateSoporte(soporte: any) {
    const soporteData = {
      modificacion: soporte.modificacion,
      razon: soporte.razon,
      fecha: soporte.fecha,
      id_user: soporte.id_user,
    };

    try {
      const soporteRef = doc(this.firestore, 'soporte', soporte.id);
      await updateDoc(soporteRef, soporteData);
      console.log('Soporte actualizado');
    } catch (error) {
      console.error('Error al actualizar soporte:', error);
    }
  }

  async deleteSoporte(id: string) {
    try {
      const soporteRef = doc(this.firestore, 'soporte', id);
      await deleteDoc(soporteRef);
      console.log('Soporte eliminado');
    } catch (error) {
      console.error('Error al eliminar soporte:', error);
    }
  }
}


  // Aquí puedes añadir métodos para las tablas restantes: resumen, roles, rutina, rutina_ejercicios, rutina_usuario, soporte