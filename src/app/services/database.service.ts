import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  constructor(private firestore: Firestore) {
    console.log('Conectado a Firestore'); 
  }
   // Tabla: usuario
   async insertUsuario(user: any) {
    const usuarioData = {
      rut: user.rut,
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
      id_rol: 2, 
      fecha_registro: new Date()
    };
  
    try {
      await addDoc(collection(this.firestore, 'usuarios'), usuarioData);
      console.log('Usuario insertado');
    } catch (error) {
      console.error('Error al insertar usuario:', error);
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

  async updateUsuario(user: any) {
    const usuarioData = {
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
    };

    try {
      const userRef = doc(this.firestore, 'usuarios', user.id);
      await updateDoc(userRef, usuarioData);
      console.log('Usuario actualizado');
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
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
  /*async insertRutina(rutina: any) {
  const rutinaData = {
    nombre_rutina: rutina.nombre_rutina,
    objetivo: rutina.objetivo,
    calentamiento: rutina.calentamiento,
    estiramientos: rutina.estiramientos,
    frecuencia: rutina.frecuencia,
    descanso: rutina.descanso,
    progresion: rutina.progresion,
    consejos: rutina.consejos,
    id_user: rutina.id_user, // Descomentado para verificar el usuario
    ejercicios: rutina.ejercicios.map((ejercicio: Ejercicio) => ({
      nombre_ejercicio: ejercicio.nombre_ejercicio,
      series: ejercicio.series,
      repeticiones: ejercicio.repeticiones,
      descripcion: ejercicio.descripcion
    }))
  };
  try {
    // Verificar si el usuario existe antes de insertar la rutina
    const userRef = doc(this.firestore, 'usuarios', rutina.id_user);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      // Insertar la rutina en la colección 'rutinas'
      await addDoc(collection(this.firestore, 'rutinas'), rutinaData);
      console.log('Rutina y ejercicios insertados correctamente');
    } else {
      console.error('Usuario no encontrado');
    }
  } catch (error) {
    console.error('Error al insertar rutina y ejercicios:', error);
  }
}*/
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
    id_user: rutina.id_user,  // Si es necesario
  };

  try {
    // Insertar la rutina en la colección 'rutinas'
    const rutinaRef = await addDoc(collection(this.firestore, 'rutinas'), rutinaData);
    console.log('Rutina insertada correctamente');
    
    // Obtener el ID de la rutina insertada
    const rutinaId = rutinaRef.id;

    // Insertar los ejercicios en la subcolección 'ejercicios' de la rutina recién insertada
    const ejerciciosRef = collection(this.firestore, `rutinas/${rutinaId}/ejercicios`);

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