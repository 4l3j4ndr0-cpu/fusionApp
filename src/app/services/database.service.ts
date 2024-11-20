import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc, setDoc } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Rutina } from './modulos.service';

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
//--------------------------------------------------------------------------------------------------
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
      id_user: rutina.id_user,
      ejercicios: rutina.ejercicios 
    };

    try {
      await addDoc(collection(this.firestore, 'rutinas'), rutinaData);
      console.log('Rutina insertada correctamente');
    } catch (error) {
      console.error('Error al insertar rutina y ejercicios:', error);
    }
  }

//--------------------------------------------------------------------------------------------------
//                  CRUD Rutinas
// Obtener todas las rutinas
async getRutinas(): Promise<{ id: string; [key: string]: any }[]> {
  try {
    const snapshot = await getDocs(collection(this.firestore, 'rutinas'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error al obtener rutinas:', error);
    return [];
  }
}
// Obtener Rutina por el usuario
async getRutinasPorUsuario(userId: string): Promise<{ id: string; [key: string]: any }[]> {
  try {
    const q = query(
      collection(this.firestore, 'rutinas'),
      where('id_user', '==', userId) 
    );
    const snapshot = await getDocs(q); 
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error al obtener rutinas del usuario:', error);
    return []; 
  }
}
// Actualizar Rutina
async updateRutina(nombreRutina: string, rutinaSeleccionada: Rutina, rutinaActualizada: any) {
  const rutinaData = {
    nombre_rutina: rutinaActualizada.nombre_rutina,
    id_user: rutinaSeleccionada.id_user,
    objetivo: rutinaActualizada.objetivo,
    calentamiento: rutinaActualizada.calentamiento,
    estiramientos: rutinaActualizada.estiramientos,
    frecuencia: rutinaActualizada.frecuencia,
    descanso: rutinaActualizada.descanso,
    progresion: rutinaActualizada.progresion,
    consejos: rutinaActualizada.consejos,
  };

  try {
    // Verificar si el nombre de la rutina es válido
    if (!nombreRutina) {
      console.error('Nombre de rutina no válido');
      return;
    }

    // Crear una referencia a la colección de rutinas
    const rutinasRef = collection(this.firestore, 'rutinas');
    
    // Crear una consulta para buscar la rutina por su nombre
    const q = query(rutinasRef, where('nombre_rutina', '==', nombreRutina));
    
    // Obtener los documentos que coinciden con el nombre
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error('No se encontró una rutina con ese nombre');
      return;
    }

    // Obtener el primer documento que coincida con el nombre
    const rutinaDoc = querySnapshot.docs[0];

    // Obtener el ID del documento
    const rutinaId = rutinaDoc.id;

    console.log('Actualizando rutina con nombre:', nombreRutina);

    // Crear una referencia al documento de Firestore usando el ID de la rutina
    const rutinaRef = doc(this.firestore, 'rutinas', rutinaId);

    // Actualizar la rutina en la base de datos de Firestore
    await updateDoc(rutinaRef, rutinaData);
    console.log('Rutina actualizada correctamente');
  } catch (error) {
    console.error('Error al actualizar rutina:', error);
  }
}  
// Borrar Rutina
  async deleteRutina(id: string) {
    try {
      await deleteDoc(doc(this.firestore, 'rutinas', id));
      console.log('Rutina eliminada');
    } catch (error) {
      console.error('Error al eliminar rutina:', error);
    }
  }
//--------------------------------------------------------------------------------------------------
  // Tabla: estadisticas
  // Insertar una estadística
async insertEstadistica(estadistica: any) {
  const estadisticaData = {
    sesiones_completadas: estadistica.sesiones_completadas,
    total_sesiones: estadistica.total_sesiones,
    heart_rate_promedio: estadistica.heart_rate_promedio,
    imc: estadistica.imc,
    id_user: estadistica.id_user
  };

<<<<<<< HEAD
  try {
    await addDoc(collection(this.firestore, 'estadisticas'), estadisticaData);
    console.log('Estadística insertada correctamente');
  } catch (error) {
    console.error('Error al insertar estadística:', error);
  }
}

// Obtener estadísticas por usuario
async getEstadisticasPorUsuario(userId: string): Promise<{ id: string; [key: string]: any }[]> {
  try {
    const q = query(collection(this.firestore, 'estadisticas'), where('id_user', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error al obtener las estadísticas del usuario:', error);
    return [];
  }
}

// Actualizar una estadística
async updateEstadistica(id: string, estadistica: any) {
  const estadisticaData = {
    sesiones_completadas: estadistica.sesiones_completadas,
    total_sesiones: estadistica.total_sesiones,
    heart_rate_promedio: estadistica.heart_rate_promedio,
    imc: estadistica.imc,
    id_user: estadistica.id_user
  };
=======
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


  //--------------------------------------------------------------------------------------------------
  //                        CRUD Estadistica    
  // insertar estadistica
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
  // Solicitar estadistica
  async getEstadisticas(): Promise<{ id: string; [key: string]: any }[]> {
    try {
      const snapshot = await getDocs(collection(this.firestore, 'estadisticas'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return []; 
    }
  }
  // Actualizar estadistica
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
>>>>>>> 0e067d9ccbfeb38fd4d8bfeaa0ae65919d532154

  try {
    const estadisticaRef = doc(this.firestore, 'estadisticas', id);
    await updateDoc(estadisticaRef, estadisticaData);
    console.log('Estadística actualizada correctamente');
  } catch (error) {
    console.error('Error al actualizar estadística:', error);
  }
<<<<<<< HEAD
}

// Eliminar una estadística
async deleteEstadistica(id: string) {
  try {
    await deleteDoc(doc(this.firestore, 'estadisticas', id));
    console.log('Estadística eliminada');
  } catch (error) {
    console.error('Error al eliminar estadística:', error);
  }
}

=======
  // Borrar estadistica
  async deleteEstadistica(id: string) {
    try {
      await deleteDoc(doc(this.firestore, 'estadisticas', id));
      console.log('Estadística eliminada');
    } catch (error) {
      console.error('Error al eliminar estadística:', error);
    }
  }
//--------------------------------------------------------------------------------------------------
>>>>>>> 0e067d9ccbfeb38fd4d8bfeaa0ae65919d532154
  // Tabla: soporte
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
  //Tabla registro
async insertRegistro(registro: any) {
  const registroData = {
    heartRate: registro.heartRate,
    estado: registro.estado,
    fecha: registro.fecha,
    tipoRutina: registro.tipoRutina,
    id_user: registro.id_user
  };

  try {
    await addDoc(collection(this.firestore, 'registros'), registroData);
    console.log('Registro insertado correctamente');
  } catch (error) {
    console.error('Error al insertar el registro:', error);
  }
}
// Obtener registros por usuario
async getRegistrosPorUsuario(userId: string): Promise<{ id: string; [key: string]: any }[]> {
  try {
    const q = query(collection(this.firestore, 'registros'), where('id_user', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error al obtener los registros del usuario:', error);
    return [];
  }
}

// Actualizar un registro existente
async updateRegistro(id: string, registro: any) {
  const registroData = {
    heart_rate: registro.heart_rate,
    sesiones_completadas: registro.sesiones_completadas,
    fecha: registro.fecha,
    tiempo_total_entrenamiento: registro.tiempo_total_entrenamiento,
    calorias: registro.calorias,
    id_user: registro.id_user
  };

  try {
    const registroRef = doc(this.firestore, 'registros', id);
    await updateDoc(registroRef, registroData);
    console.log('Registro actualizado correctamente');
  } catch (error) {
    console.error('Error al actualizar el registro:', error);
  }
}

// Eliminar un registro
async deleteRegistro(id: string) {
  try {
    await deleteDoc(doc(this.firestore, 'registros', id));
    console.log('Registro eliminado');
  } catch (error) {
    console.error('Error al eliminar el registro:', error);
  }
}

}
