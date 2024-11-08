import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';

import { Home1Page } from '../home1/home1.page';
import { FormsModule } from '@angular/forms';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { GeminiService } from '../services/gemini.service';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';


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
  constructor() { 
    this.geminiService.getMessageHistory().subscribe((res) =>{
      if(res) {
        this.chatHistory.push(res);
      }
    })
  }

  async sendData() {
    if(this.prompt &&  !this.loading){
      this.loading = true;
      const data = this.prompt +' para joven de 24 años que mide 174cm pesa 65k es mesomorfo y hace frecuentemente ejercicio y tiene un imc de 18.5, responde en 5 lineas';
      this.prompt = '';
      await this.geminiService.generateText(data);
      this.loading = false;
    }
  }

  formatText(text: string) {
    const result = text.replaceAll('*', '');
    return result;
  }
 
}