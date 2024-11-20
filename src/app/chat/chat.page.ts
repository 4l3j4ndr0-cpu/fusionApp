import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { Rutina, Ejercicio, Usuario } from '../services/modulos.service';

import { FormsModule } from '@angular/forms';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { GeminiService } from '../services/gemini.service';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DatabaseService } from '../services/database.service';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink, FormsModule, CommonModule, RouterOutlet, IonApp, IonRouterOutlet]
})
export class ChatPage {
  tittle = 'gemini-inte';

  prompt: string = '';

  geminiService: GeminiService = inject(GeminiService);

  loading: boolean = false;

  chatHistory: any[] = [];

  rutina: Rutina = new Rutina();

  Usuario: Usuario = new Usuario();
  
  idUser: string | null = null;

  constructor(
    private dbService: DatabaseService,
    private LoginService: LoginService
  ) { 
    this.geminiService.getMessageHistory().subscribe((res) => {
      if (res) {
        this.chatHistory.push(res);
      }
    });
  }

  async sendSimpleResponse() {
    this.loading = true;
    try {
      const geminiResponse = await this.geminiService.generateText(this.prompt);
      if (geminiResponse) {
        this.chatHistory.push({
          from: 'bot',
          message: geminiResponse
        });
      } else {
        console.error('No se recibió respuesta de Gemini');
      }
    } catch (error) {
      console.error('Error al obtener la respuesta de Gemini:', error);
    } finally {
      this.loading = false;
      this.prompt = ''; 
    }
  }

  async onSubmit() {
    if (this.idUser) {
      this.rutina.id_user = this.idUser;

      try {
        await this.dbService.insertRutina(this.rutina);
        console.log('Rutina y ejercicios insertados correctamente');
      } catch (error) {
        console.error('Error al insertar rutina y ejercicios:', error);
      }
    } else {
      console.error('Usuario no autenticado, no se puede insertar la rutina');
    }
  }

  async sendData() {
    this.idUser = this.LoginService.currentUserId;
    if (!this.prompt.trim()) {
      console.error('El mensaje no puede estar vacío.');
      return;
    }
    if (this.prompt.toLowerCase().includes('dame') || this.prompt.toLowerCase().includes('generar') || this.prompt.toLowerCase().includes('generame')) {
      console.log('Generando rutina...');
      await this.generateRutina();
    } else if (this.prompt.toLowerCase().includes('cambiar') || this.prompt.toLowerCase().includes('modificar') || this.prompt.toLowerCase().includes('mejorar') || this.prompt.toLowerCase().includes('mejora') || this.prompt.toLowerCase().includes('modifica')) {
      console.log('Actualizando rutina...');
      await this.updateRutina();
    } else {
      console.log('Enviando respuesta simple...');
      await this.sendSimpleResponse();
    }
  }
  
  async updateRutina() {
    if (!this.idUser) {
      console.error('Usuario no autenticado, no se puede actualizar la rutina');
      return;
    }
    const rutinasGenericas = await this.dbService.getRutinasPorUsuario(this.idUser);
    const rutinas: Rutina[] = rutinasGenericas.map(rutinaData => this.mapToRutina(rutinaData));
  
    if (!rutinas || rutinas.length === 0) {
      console.error('No se encontraron rutinas almacenadas para este usuario.');
      return;
    }
    const nombreRutinaUsuario = this.prompt.match(/"([^"]+)"/);
    if (!nombreRutinaUsuario || !nombreRutinaUsuario[1]) {
      console.error('No se proporcionó un nombre de rutina válido en el prompt.');
      return;
    }
    const nombreRutina = nombreRutinaUsuario[1].trim().toLowerCase();
    let rutinaSeleccionada = rutinas.find(rutina =>
      rutina.nombre_rutina.toLowerCase() === nombreRutina
    );
  
    if (!rutinaSeleccionada) {
      console.error('No se encontró una rutina que coincida con el nombre proporcionado.');
      console.log('Rutinas en la base de datos:', rutinas.map(rutina => rutina.nombre_rutina)); // Para depuración
      return;
    }
  
    const usuario = await this.dbService.getUsuariosPorUid(this.idUser);
    if (!usuario) {
      console.error('No se encontraron datos del usuario.');
      return;
    }
    const peso = usuario['peso'];
    const estatura = usuario['estatura'];
    const edad = usuario['edad'];
    const mesotipo = usuario['mesotipo'];
    const imc = this.calculateIMC(peso, estatura);
    const data = `
      ${this.prompt}
      Mejora la siguiente rutina:
      
      **Nombre de la Rutina:** ${rutinaSeleccionada.nombre_rutina}
  
      **Objetivo:** ${rutinaSeleccionada.objetivo}
  
      **Calentamiento:** ${rutinaSeleccionada.calentamiento}

      **Estiramientos:** ${rutinaSeleccionada.estiramientos}
  
      **Frecuencia:** ${rutinaSeleccionada.frecuencia}
  
      **Descanso:** ${rutinaSeleccionada.descanso}
  
      **Progresión:** ${rutinaSeleccionada.progresion}
  
      **Consejos:** ${rutinaSeleccionada.consejos}
  
      Detalles del usuario:
      - Edad: ${edad} años
      - Peso: ${peso} kg
      - Estatura: ${estatura} cm
      - IMC: ${imc}
      - Somatotipo: ${mesotipo}
  
      Genera una rutina mejorada siguiendo este formato:
      **Nombre de la Rutina:**
      **Objetivo:**
      **Calentamiento:**
      **Ejercicios:**
      1. Nombre del ejercicio (X series de X-X repeticiones) - Descripción
      **Estiramientos:**
      **Frecuencia:**
      **Descanso:**
      **Progresión:**
      **Consejos:**
    `;
  
    try {
      const geminiResponse = await this.geminiService.generateText(data);
      if (geminiResponse) {
        const rutinaActualizada = this.processGeminiResponse(geminiResponse);
        const rutinaData = {
          nombre_rutina: rutinaActualizada.nombre_rutina || rutinaSeleccionada.nombre_rutina || "Nombre no especificado",
          id_user: this.idUser,
          objetivo: rutinaActualizada.objetivo || rutinaSeleccionada.objetivo || "Objetivo no especificado",
          calentamiento: rutinaActualizada.calentamiento || rutinaSeleccionada.calentamiento || "Calentamiento no especificado",
          estiramientos: rutinaActualizada.estiramientos || rutinaSeleccionada.estiramientos || "Estiramientos no especificados",
          frecuencia: rutinaActualizada.frecuencia || rutinaSeleccionada.frecuencia || "Frecuencia no especificada",
          descanso: rutinaActualizada.descanso || rutinaSeleccionada.descanso || "Descanso no especificado",
          progresion: rutinaActualizada.progresion || rutinaSeleccionada.progresion || "Progresión no especificada",
          consejos: rutinaActualizada.consejos || rutinaSeleccionada.consejos || "Consejos no especificados",
        };
        await this.dbService.updateRutina(rutinaSeleccionada.nombre_rutina, rutinaSeleccionada, rutinaData);
        console.log('Rutina actualizada correctamente en Firestore');
      } else {
        console.error('No se recibió respuesta de Gemini');
      }
    } catch (geminiError) {
      console.error('Error al obtener la rutina de Gemini:', geminiError);
    }
  }
  
  private mapToRutina(data: any): Rutina {
    return {
      nombre_rutina: data.nombre_rutina || "",
      objetivo: data.objetivo || "",
      calentamiento: data.calentamiento || "",
      ejercicios: data.ejercicios || [],
      estiramientos: data.estiramientos || "",
      frecuencia: data.frecuencia || "",
      descanso: data.descanso || "",
      progresion: data.progresion || "",
      consejos: data.consejos || "",
      id_user: data.id_user,
    };
  }
  
  async generateRutina() {
    if (!this.idUser) {
      console.error('El UID del usuario no está disponible.');
      return;
    }
  
    try {
      const usuario = await this.dbService.getUsuariosPorUid(this.idUser);
  
      if (!usuario) {
        console.error('No se encontraron datos del usuario.');
        return;
      }
  
      const peso = usuario['peso'];
      const estatura = usuario['estatura'];
      const edad = usuario['edad'];
      const mesotipo = usuario['mesotipo'];
      const imc = this.calculateIMC(peso, estatura);
  
      const data = `
        ${this.prompt} siguiendo este formato:
        **Nombre de la Rutina:**
  
        **Objetivo:** 
  
        **Calentamiento:** 
  
        **Ejercicios:**
  
        **1. Nombre del ejercicio (X series de X-X repeticiones)**
        * Descripción del ejercicio.
  
        **Estiramientos:** 
  
        **Frecuencia:** 
  
        **Descanso:** 
  
        **Progresión:** 
  
        **Consejos:**
  
        Los detalles del usuario son: joven de ${edad} años, Somatotipo: (${mesotipo}), ${estatura}cm, ${peso}kg, IMC ${imc}.
      `;
  
      try {
        this.prompt = '';
        const geminiResponse = await this.geminiService.generateText(data);
        if (geminiResponse) {
          this.rutina = this.processGeminiResponse(geminiResponse);
          await this.onSubmit();
        } else {
          console.error('No se recibió respuesta de Gemini');
        }
      } catch (geminiError) {
        console.error('Error al obtener la rutina de Gemini:', geminiError);
      }
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
    }
  }  

  calculateIMC(peso: number, estatura: number): number {
    const estaturaEnMetros = estatura / 100;
    return peso / (estaturaEnMetros * estaturaEnMetros);
  }

  processGeminiResponse(response: string): Rutina {
    const rutina: Rutina = new Rutina();
  
    // Nombre de la Rutina
    rutina.nombre_rutina = response.split('**Nombre de la Rutina:**')[1].trim().split('**Objetivo:**')[0].trim();
  
    // Objetivo
    rutina.objetivo = response.split('**Objetivo:**')[1].trim().split('**Calentamiento:**')[0].trim();
  
    // Calentamiento
    rutina.calentamiento = response.split('**Calentamiento:**')[1].trim().split('**Ejercicios:**')[0].trim();
  
    // Ejercicios
    const ejerciciosRegex = /\*\*(\d+)\.\s*([A-Za-z\s]+)\s*\((\d+)\s*series\sde\s(\d+)-(\d+)\srepeticiones\)\*\*\s*-\s*([\s\S]*?)(?=\*\*\d+\.|$)/g;
    const ejerciciosMatches = [...response.matchAll(ejerciciosRegex)];
  
    rutina.ejercicios = [];  // Asegúrate de que el array de ejercicios esté vacío antes de agregar nuevos ejercicios

    ejerciciosMatches.forEach(match => {
      const nombre_ejercicio = match[2].trim();
      const series = parseInt(match[3], 10);
      const repeticiones = `${match[4]}-${match[5]}`;
      const descripcion = match[6].trim();

      // Crear una nueva instancia de Ejercicio
      const ejercicio = new Ejercicio();
      ejercicio.nombre_ejercicio = nombre_ejercicio;
      ejercicio.series = series;
      ejercicio.repeticiones = repeticiones;
      ejercicio.descripcion = descripcion;

      // Insertar el ejercicio en el array de ejercicios de la rutina
      rutina.ejercicios.push(ejercicio);
    });

    // Estiramientos
    const estiramientosRegex = /\*Estiramientos:\*\*(.*?)\*\*Frecuencia:\*/s;
    const estiramientosMatch = response.match(estiramientosRegex);
    rutina.estiramientos = estiramientosMatch ? estiramientosMatch[1].trim() : '';
  
    // Frecuencia
    rutina.frecuencia = response.split('**Frecuencia:**')[1].trim().split('**Descanso:**')[0].trim();
  
    // Descanso
    rutina.descanso = response.split('**Descanso:**')[1].trim().split('**Progresión:**')[0];
  
    // Progresión
    rutina.progresion = response.split('**Progresión:**')[1].trim().split('**Consejos:**')[0];
  
    // Consejos
    rutina.consejos = response.split('**Consejos:**')[1].trim();
  
    return rutina;
  }


  formatText(message: string): string {
  return message
    // Convierte **texto** en <strong>texto</strong>
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Convierte líneas con * al inicio en elementos <li>
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    // Añade <ul> antes y después de listas
    .replace(/(<li>.+?<\/li>)/gms, '<ul>$1</ul>')
    // Reemplaza saltos de línea con <br> solo si no son parte de una lista
    .replace(/(?<!<\/li>)\n/g, '<br>');
}


}
