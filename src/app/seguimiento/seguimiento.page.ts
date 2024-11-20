<<<<<<< HEAD
import { Component } from '@angular/core';
=======
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
>>>>>>> 0e067d9ccbfeb38fd4d8bfeaa0ae65919d532154
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { LoginService } from '../services/login.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
interface Rutina {
  id: string;
  nombre_rutina: string;
}
@Component({
  selector: 'app-seguimiento',
  templateUrl: './seguimiento.page.html',
  styleUrls: ['./seguimiento.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink, FormsModule, CommonModule],
})

export class SeguimientoPage {
  idUser: string | null = null;
  rutinas: Rutina[] = [];
  seguimiento = {
    fecha: new Date().toISOString(),
    tipoRutina: '',
    estado: false,
    heartRate: '',
  };

  constructor(
    private dbService: DatabaseService,
    private loginService: LoginService
  ) {}
  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  }
  async ionViewWillEnter() {
    this.idUser = this.loginService.currentUserId;
    await this.loadRutinas();
  }

  async loadRutinas() {
    try {
      if (this.idUser) {
        const rutinas = await this.dbService.getRutinasPorUsuario(this.idUser);
        this.rutinas = rutinas.map((rutina: any) => ({
          id: rutina.id,
          nombre_rutina: rutina.nombre_rutina,
        }));
      } else {
        console.error('ID de usuario no disponible.');
      }
    } catch (error) {
      console.error('Error al cargar rutinas:', error);
    }
  }

  async guardarSeguimiento() {
    try {
      if (!this.idUser) {
        console.error('ID de usuario no disponible.');
        return;
      }
      const fechaFormateada = this.formatDate(new Date(this.seguimiento.fecha));

      const registro = {
        ...this.seguimiento,
        fecha: fechaFormateada,
        estado: this.seguimiento.estado, 
        id_user: this.idUser,
      };
  
      await this.dbService.insertRegistro(registro);
      console.log('Seguimiento guardado exitosamente.');
      this.resetFormulario();
    } catch (error) {
      console.error('Error al guardar seguimiento:', error);
    }
  }

  resetFormulario() {
    this.seguimiento = {
      fecha: new Date().toISOString(),
      tipoRutina: '',
      estado: false,
      heartRate: '',
    };
  }
}


