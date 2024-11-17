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
  sesiones_completadas: number = 0;                
  porcentaje_de_mejora: number = 0;               
  heart_rate: number = 0;               
  imc: number = 0;                      
  id_user: number = 0;             
}

export class registros {
  id_user: string = "";
  herat_rate: number = 0;
  

}