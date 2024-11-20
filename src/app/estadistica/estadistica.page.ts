import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { LoginService } from '../services/login.service';
import { Chart } from 'chart.js'; 
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-estadistica',
  templateUrl: './estadistica.page.html',
  styleUrls: ['./estadistica.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink, FormsModule,CommonModule]
})
export class EstadisticasPage implements OnInit, AfterViewInit {
  idUser: string | null = null;
  totalSesionesMensuales: number = 0;
  sesionesCompletadas: number = 0;
  porcentajeCompletado: number = 0;
  chartFrecuenciaCardiacaDiaria: any;
  chartFrecuenciaCardiacaPorRutina: any;

  chartOptions: any = {
    responsive: true,
    scales: {
      y: { min: 0, max: 200 }
    }
  };

  constructor(
    private dbService: DatabaseService,
    private loginService: LoginService
  ) {}

  ngOnInit() {
    this.idUser = this.loginService.currentUserId;
    this.calcularEstadisticas();
    this.generarGraficos();
  }

  ngAfterViewInit() {
  }

  convertirFrecuenciaANumero(frecuencia: string): number {
    const frecuenciaLimpia = frecuencia.replace(/(\d+)\s*(horas|h)/i, '').trim();
    const regex = /(\d+)-(\d+)/;
    const match = frecuenciaLimpia.match(regex);
  
    if (match) {
      const min = parseInt(match[1], 10);
      const max = parseInt(match[2], 10);
      return (min + max) / 2;
    }
  
    const singleMatch = frecuenciaLimpia.match(/(\d+)/);
    if (singleMatch) {
      return parseInt(singleMatch[1], 10);
    }
  
    return 0;
  }

  async calcularEstadisticas() {
    try {
      if (!this.idUser) {
        console.error('ID de usuario no disponible.');
        return;
      }

      const rutinas = await this.dbService.getRutinasPorUsuario(this.idUser);
      this.totalSesionesMensuales = rutinas.reduce((total, rutina) => {
        const frecuenciaSemanal = this.convertirFrecuenciaANumero(rutina['frecuencia']);
        return total + frecuenciaSemanal * 4;
      }, 0);

      const registros = await this.dbService.getRegistrosPorUsuario(this.idUser);
      const registrosCompletados = registros.filter(reg => String(reg['estado']) === 'true');
      this.sesionesCompletadas = registrosCompletados.length;
      this.porcentajeCompletado = Math.min(
        (this.sesionesCompletadas / this.totalSesionesMensuales) * 100,
        100
      );
    } catch (error) {
      console.error('Error al calcular estadísticas:', error);
    }
  }

  async generarGraficos() {
    try {
      if (!this.idUser) {
        console.error('ID de usuario no disponible.');
        return;
      }

      const registros = await this.dbService.getRegistrosPorUsuario(this.idUser);

      const frecuenciaCardiacaDiaria = this.obtenerFrecuenciaCardiacaPorDia(registros);

      this.chartFrecuenciaCardiacaDiaria = new Chart('frecuenciaCardiacaDiariaCanvas', {
        type: 'line',
        data: {
          labels: Object.keys(frecuenciaCardiacaDiaria),
          datasets: [
            {
              label: 'Frecuencia Cardíaca Promedio',
              data: Object.values(frecuenciaCardiacaDiaria),
              fill: false,
              borderColor: 'rgba(255, 99, 132, 1)',
              tension: 0.1,
            }
          ]
        },
        options: this.chartOptions
      });

      const frecuenciaCardiacaPorRutina = this.obtenerFrecuenciaCardiacaPorRutina(registros);

      this.chartFrecuenciaCardiacaPorRutina = new Chart('frecuenciaCardiacaRutinaCanvas', {
        type: 'bar',
        data: {
          labels: Object.keys(frecuenciaCardiacaPorRutina),
          datasets: [
            {
              label: 'Frecuencia Cardíaca por Rutina',
              data: Object.values(frecuenciaCardiacaPorRutina),
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            }
          ]
        },
        options: this.chartOptions
      });
    } catch (error) {
      console.error('Error al generar gráficos:', error);
    }
  }

  obtenerFrecuenciaCardiacaPorDia(registros: any[]): { [key: string]: number } {
    const frecuenciaCardiacaPorDia: { [key: string]: number } = {};
    
    registros.forEach((registro: any) => {
      const fecha = new Date(registro.fecha);
      const fechaFormateada = `${fecha.getDate()}-${fecha.getMonth() + 1}-${fecha.getFullYear()}`;
      
      if (!frecuenciaCardiacaPorDia[fechaFormateada]) {
        frecuenciaCardiacaPorDia[fechaFormateada] = 0;
      }

      frecuenciaCardiacaPorDia[fechaFormateada] += registro.frecuenciaCardiaca;
    });
    
    for (const fecha in frecuenciaCardiacaPorDia) {
      const registrosPorDia = registros.filter(reg => {
        const fechaReg = new Date(reg.fecha);
        const fechaFormateadaReg = `${fechaReg.getDate()}-${fechaReg.getMonth() + 1}-${fechaReg.getFullYear()}`;
        return fechaFormateadaReg === fecha;
      });
      frecuenciaCardiacaPorDia[fecha] /= registrosPorDia.length;
    }
  
    return frecuenciaCardiacaPorDia;
  }

  obtenerFrecuenciaCardiacaPorRutina(registros: any[]): { [key: string]: number } {
    const frecuenciaCardiacaPorRutina: { [key: string]: number } = {};
  
    registros.forEach((registro: any) => {
      const rutina = registro.rutina;
      if (!frecuenciaCardiacaPorRutina[rutina]) {
        frecuenciaCardiacaPorRutina[rutina] = 0;
      }
      frecuenciaCardiacaPorRutina[rutina] += registro.frecuenciaCardiaca;
    });
  
    for (const rutina in frecuenciaCardiacaPorRutina) {
      const registrosPorRutina = registros.filter(reg => reg.rutina === rutina);
      frecuenciaCardiacaPorRutina[rutina] /= registrosPorRutina.length;
    }
  
    return frecuenciaCardiacaPorRutina;
  }
  //calcular estadistaca correcto
  /*async calcularEstadisticas() {
    try {
      if (!this.idUser) {
        console.error('ID de usuario no disponible.');
        return;
      }
  
      // Obtener las rutinas del usuario
      const rutinas = await this.dbService.getRutinasPorUsuario(this.idUser);
  
      // Calcular el total de sesiones mensuales de todas las rutinas
      this.totalSesionesMensuales = rutinas.reduce((total, rutina) => {
        const frecuenciaSemanal = this.convertirFrecuenciaANumero(rutina['frecuencia']); 
        return total + frecuenciaSemanal * 4; 
      }, 0);
  
      // Obtener los registros completados este mes
      const registros = await this.dbService.getRegistrosPorUsuario(this.idUser);
      const registrosEsteMes = registros.filter(
        reg => this.esDelMesActual(reg['fecha']) && reg['estado'] === true // Acceso con corchetes
      );
      this.sesionesCompletadas = registrosEsteMes.length;
      // Calcular porcentaje
      this.porcentajeCompletado = Math.min(
        (this.sesionesCompletadas / this.totalSesionesMensuales) * 100,
        100
      );
    } catch (error) {
      console.error('Error al calcular estadísticas:', error);
    }
  }*/
}


