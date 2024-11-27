export class Usuario {
  uid: string = "";         
  rut: string = "";             
  nombre_user: string = "";     
  contrasena: string = "";      
  email: string = "";            
  nombre: string = "";           
  apellido_pat: string = "";     
  apellido_mat: string = "";     
  peso: number = 0;      
  estatura: number = 0;  
  mesotipo: string = "";         
  edad: number = 0;      
  id_rol: number = 0;      
}




export class Rutina {
  nombre_rutina: string = '';
  objetivo: string = '';
  calentamiento: string = '';
  ejercicios: Ejercicio[] = [];
  estiramientos: string = '';
  frecuencia: string = '';
  descanso: string = '';
  progresion: string = '';
  consejos: string = '';
  id_user: string = "";
}

export interface Registro {
  tipoRutina: string; // Asegúrate de incluir esta propiedad
  estado: boolean;
  fecha: string; // ISO string
  heartRate: number;
}


export class Estadistica {
  sesiones_completadas: number = 0;
  total_sesiones: number = 0;
  porcentaje_de_mejora: number = 0;
  heart_rate_promedio: number = 0;
  imc: number = 0;
  id_user: string = '';
}

export class Ejercicio {
  nombre_ejercicio: string;
  series: number;
  repeticiones: string;
  descripcion: string;

  constructor(
    nombre_ejercicio: string = '',
    series: number = 0,
    repeticiones: string = '',
    descripcion: string = ''
  ) {
    this.nombre_ejercicio = nombre_ejercicio;
    this.series = series;
    this.repeticiones = repeticiones;
    this.descripcion = descripcion;
  }

  toJSON() {
    return {
      nombre_ejercicio: this.nombre_ejercicio,
      series: this.series,
      repeticiones: this.repeticiones,
      descripcion: this.descripcion,
    };
  }
}