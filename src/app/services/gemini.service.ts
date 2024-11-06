import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  private generativeAI: GoogleGenerativeAI;

  private messageHistory: BehaviorSubject<any> = new BehaviorSubject(null);
  constructor() {
    this.generativeAI = new GoogleGenerativeAI('AIzaSyBmtMnAbe-lKtfmmHEH3gkTfhN27VFeegQ');
   }

   async generateText(promt: string){
    const model = this.generativeAI.getGenerativeModel({model: 'gemini-pro'});
    this.messageHistory.next({
       from: 'user',
       message: promt
    })

    const result = await model.generateContent(promt);
    const response  = await  result.response;
    const text = await response.text();
    console.log(text);
    this.messageHistory.next({
      from: 'bot',
      message: text
    })
    return text
  }

  public getMessageHistory(): Observable<any> {   
    return this.messageHistory.asObservable();
  }
}

