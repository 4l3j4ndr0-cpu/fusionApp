import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import {Rutina, Ejercicio} from '../services/modulos.service';
import { Home1Page } from '../home1/home1.page';
import { FormsModule } from '@angular/forms';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { GeminiService } from '../services/gemini.service';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [IonicModule,RouterLink,FormsModule,CommonModule,RouterOutlet,IonApp, IonRouterOutlet,Home1Page]
})
export class ChatPage {
  tittle = 'gemini-inte';

  prompt: string = '';

  geminiService: GeminiService = inject(GeminiService);

  loading: boolean = false;

  chatHistory: any[] = [];
  
  rutina: Rutina = new Rutina();

  constructor(private dbService: DatabaseService) { 
    this.geminiService.getMessageHistory().subscribe((res) =>{
      if(res) {
        this.chatHistory.push(res);
      }
    })
  }

  async onSubmit() {
    try {
      await this.dbService.insertRutina(this.rutina); 
      console.log('Rutina y ejercicios insertados correctamente');
    } catch (error) {
      console.error('Error al insertar rutina y ejercicios:', error);
    }
  }

  async sendData() {
    if (this.prompt && !this.loading) {
      this.loading = true;
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
  
      Los detalles del usuario son: joven de 24 años, mesomorfo, 174cm, 65kg, IMC 18.5 y hace ejercicio frecuentemente.
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
      } catch (error) {
        console.error('Error al obtener la rutina de Gemini:', error);
      } finally {
        this.loading = false;
      }
    }
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
  
    // Mapeo de los ejercicios a instancias de la clase Ejercicio
    rutina.ejercicios = ejerciciosMatches.map(match => {
      const nombre_ejercicio = match[2].trim();
      const series = parseInt(match[3], 10);
      const repeticiones = `${match[4]}-${match[5]}`;
      const descripcion = match[6].trim();
  
      // Crear una nueva instancia de Ejercicio y devolverla
      const ejercicio = new Ejercicio();
      ejercicio.nombre_ejercicio = nombre_ejercicio;
      ejercicio.series = series;
      ejercicio.repeticiones = repeticiones;
      ejercicio.descripcion = descripcion;
  
      return ejercicio;
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

  formatText(text: string) {
    const result = text.replaceAll('*', '');
    return result;
  }
 
}