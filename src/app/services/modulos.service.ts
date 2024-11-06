export class Usuario {
  id_user: number = 0;         
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

export class Ejercicio {
  nombre_ejercicio: string = "";
  series: number = 0;
  repeticiones: string = "";
  descripcion: string = "";
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

export class Estadistica {
  id_ent: number = 0;                   
  date_recorded: Date= new Date();              
  sesiones_completadas: number = 0;     
  total_sesiones: number = 0;           
  porcentaje_de_mejora: number = 0;     
  tiem_total_ent: number = 0;           
  heart_rate: number = 0;               
  imc: number = 0;                      
  id_rutina_us: number = 0;             
}
