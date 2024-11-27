import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { LoginService } from '../services/login.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ViewChild, ChangeDetectorRef } from '@angular/core';
import ChartDataLabels from 'chartjs-plugin-datalabels';


interface Registro {
  tipoRutina: string;
  estado: boolean;
  fecha: string; // ISO string o formato de fecha
  heartRate: number;
}

@Component({
  selector: 'app-estadistica',
  templateUrl: './estadistica.page.html',
  styleUrls: ['./estadistica.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink, FormsModule, CommonModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
})
export class EstadisticasPage implements OnInit {
  @ViewChild('doughnutChart', { static: false }) doughnutChart?: BaseChartDirective;
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  idUser: string | null = null;
  sesionesPorRutina: { [key: string]: { completadas: number; noCompletadas: number } } = {};
  selectedRutina: string = '';
  rutinas: string[] = []; // Lista de rutinas
  totalSesionesMensuales: number = 0;
  totalSesionesRealizadas: number = 0;
  sesionesCompletadas: number = 0;
  porcentajeCompletado: number = 0;
  isModalOpen = false; // Estado del modal

  
  // grafico de dona de progreso
  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    datasets: [
      {
        data: [0, 0], // Valores iniciales
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
      },
    ],
  };
  
  // Opciones de la dona
  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: true, // Mantener el aspecto proporcional
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Progreso Mensual',
      },
      datalabels: {
        color: '#fff',
        formatter: (value: number, context: any) => {
          const data: number[] = context.chart.data.datasets[0].data as number[];
          const total = data.reduce((a, b) => (a || 0) + (b || 0), 0);
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
          return `${percentage}%`;
        },
      },
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20, // Opcional: Ajuste si es necesario
        right: 20, // Opcional: Ajuste si es necesario
      },
    },
  };
  
  public doughnutChartPlugins = [
    {
      id: 'centerText',
      beforeDraw: (chart: any) => {
        const ctx = chart.ctx;
        const width = chart.width;
        const height = chart.height;
  
        const data: number[] = chart.data.datasets[0].data as number[];
        const total = data.reduce((a, b) => (a || 0) + (b || 0), 0);
  
        const porcentajeCompletado = total > 0 ? ((data[0] / total) * 100).toFixed(1) : '0';
  
        // Configurar el canvas
        ctx.restore();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
  
        // Texto del porcentaje
        ctx.font = 'bold 1.5em sans-serif';
        ctx.fillStyle = '#000';
        const text = `${porcentajeCompletado}%`;
        const textX = width / 2;
        const textY = height / 2 - 10; // Elevar un poco el texto para hacer espacio para la línea
        ctx.fillText(text, textX, textY);
  
        // Línea divisoria
        ctx.beginPath();
        ctx.moveTo(textX - 30, textY + 10); // Punto inicial
        ctx.lineTo(textX + 30, textY + 10); // Punto final
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000';
        ctx.stroke();
  
        // Texto "Total"
        ctx.font = 'normal 1em sans-serif';
        ctx.fillStyle = '#666';
        const totalText = 'Total Completados';
        const totalTextY = textY + 30; // Colocar debajo de la línea
        ctx.fillText(totalText, textX, totalTextY);
  
        ctx.save();
      },
    },
  ];
  

  // Datos para el gráfico
  public chartData: {
    labels: string[]; // Especifica que las etiquetas son un array de strings
    datasets: {
      label: string;
      data: number[]; // Especifica que los datos son un array de números
      backgroundColor: string[];
    }[];
  } = {
    labels: [], // Inicializa como un array vacío de strings
    datasets: [
      {
        label: 'Completadas',
        data: [], // Inicializa como un array vacío de números
        backgroundColor: ['rgba(75, 192, 192, 0.6)'],
      },
      {
        label: 'No Completadas',
        data: [], // Inicializa como un array vacío de números
        backgroundColor: ['rgba(255, 99, 132, 0.6)'],
      },
    ],
  };

  // Opciones del gráfico
  public chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Estadísticas por Rutina',
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 0,
          callback: function (value, index, values) {
            const label = this.getLabelForValue(value as number); // Obtiene la etiqueta
            return label.length > 20 ? label.slice(0, 20) + '...' : label; // Trunca si es mayor a 20 caracteres
          },
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };
  
  public lineChartData: {
    labels: string[]; // Etiquetas para el eje X (fechas)
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      tension: number; // Suavidad de las líneas
    }[];
  } = {
    labels: [], // Inicializamos las etiquetas vacías
    datasets: [],
  };
  
  // Opciones del gráfico de líneas
  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Frecuencia Cardíaca por Rutina',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Fecha',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Frecuencia Cardíaca (bpm)',
        },
      },
    },
  };
  

  constructor(
    private modalController: ModalController, // Injectar ModalController
    private dbService: DatabaseService,
    private loginService: LoginService,
    private cd: ChangeDetectorRef
  ) {}


  ngAfterViewInit() {
    console.log('Doughnut Chart:', this.doughnutChart);
    console.log('Bar Chart:', this.chart);
  }

  ngOnInit() {
    // Suscríbete al estado del usuario
    this.loginService.currentUser$.subscribe((user) => {
      if (user && user.uid) {
        this.idUser = user.uid;
        console.log('Usuario autenticado con ID:', this.idUser);
        // Carga las estadísticas una vez que el usuario está autenticado
      
        this.calcularEstadisticas();

      } else {
        console.error('Usuario no autenticado.');
        this.idUser = null;
      }
    });
  }


//  
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

// Conversión de fecha personalizada
convertirFecha(rawFecha: string): string | null {
  const regex = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/;
  const match = rawFecha.match(regex);
  if (match) {
    const [_, day, month, year, hour, minute, second] = match;
    return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
  }
  return null;
}


async calcularEstadisticas() {
  try {
    if (!this.idUser) {
      console.error('ID de usuario no disponible.');
      return;
    }

    const registros = (await this.dbService.getRegistrosPorUsuario(this.idUser)) as Registro[];

    // Estructuras para almacenar datos
    const datosPorRutina: { [key: string]: { completadas: number; noCompletadas: number } } = {};
    const lineChartData: { [tipoRutina: string]: { dates: string[]; heartRates: number[] } } = {};

    // Procesar registros
    registros.forEach((registro) => {
      const rutina = registro.tipoRutina;
      const rawFecha = registro.fecha;

      let fecha = '';

      try {
        // Manejo de fechas en formato personalizado
        if (rawFecha && /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/.test(rawFecha)) {
          const [day, month, yearAndTime] = rawFecha.split('-');
          const [year, time] = yearAndTime.split(' ');
          fecha = `${year}-${month}-${day}`; // Convertimos a formato YYYY-MM-DD
        } else if (!isNaN(new Date(rawFecha).getTime())) {
          // Si el formato es válido por defecto
          fecha = new Date(rawFecha).toISOString().split('T')[0];
        } else {
          console.warn('Fecha inválida detectada y omitida:', rawFecha);
          return; // Omitimos este registro si no es válido
        }
      } catch (error) {
        console.warn('Error al procesar fecha:', rawFecha, error);
        return; // Omitimos este registro si hay algún error
      }

      const heartRate = registro.heartRate;

      // Datos para el gráfico de barras
      if (!datosPorRutina[rutina]) {
        datosPorRutina[rutina] = { completadas: 0, noCompletadas: 0 };
      }
      if (registro.estado === true) {
        datosPorRutina[rutina].completadas++;
      } else {
        datosPorRutina[rutina].noCompletadas++;
      }

      // Datos para el gráfico de líneas
      if (!lineChartData[rutina]) {
        lineChartData[rutina] = { dates: [], heartRates: [] };
      }
      lineChartData[rutina].dates.push(fecha);
      lineChartData[rutina].heartRates.push(heartRate);
    });

    // Obtener las rutinas
    this.rutinas = Object.keys(datosPorRutina);
   

    // Calcular estadísticas generales
    const rutinas = await this.dbService.getRutinasPorUsuario(this.idUser);
    this.totalSesionesRealizadas = rutinas.reduce((total, rutina) => {
      const frecuenciaSemanal = this.convertirFrecuenciaANumero(rutina['frecuencia']);
      return total + frecuenciaSemanal * 4; // 4 semanas al mes
    }, 0);

    const totalSesionesHechas = registros.length;
    const sesionesCompletadas = registros.filter((reg) => reg.estado === true).length;
    const sesionesNoCompletadas = totalSesionesHechas - sesionesCompletadas;

    this.totalSesionesMensuales = this.totalSesionesRealizadas;
    this.totalSesionesRealizadas = totalSesionesHechas;
    this.sesionesCompletadas = sesionesCompletadas;
    this.porcentajeCompletado = totalSesionesHechas
      ? Math.round((sesionesCompletadas / totalSesionesHechas) * 100)
      : 0;

    // Actualizar gráfico de dona
    this.doughnutChartData = {
      ...this.doughnutChartData,
      datasets: [
        {
          ...this.doughnutChartData.datasets[0],
          data: [sesionesCompletadas, sesionesNoCompletadas],
        },
      ],
    };

    // Actualizar gráfico de barras
    this.chartData = {
      labels: this.rutinas,
      datasets: [
        {
          label: 'Completadas',
          data: Object.values(datosPorRutina).map((d) => d.completadas),
          backgroundColor: ['rgba(75, 192, 192, 0.6)'],
        },
        {
          label: 'No Completadas',
          data: Object.values(datosPorRutina).map((d) => d.noCompletadas),
          backgroundColor: ['rgba(255, 99, 132, 0.6)'],
        },
      ],
    };

    // Preparar datos para el gráfico de líneas
    this.lineChartData.labels = Array.from(
      new Set(Object.values(lineChartData).flatMap((item) => item.dates))
    ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    this.lineChartData.datasets = Object.keys(lineChartData).map((key) => ({
      label: key, // Nombre de la rutina
      data: this.lineChartData.labels.map((label) => {
        const index = lineChartData[key].dates.indexOf(label);
        return index !== -1 ? lineChartData[key].heartRates[index] : 0; // Completa con 0 si no hay datos
      }),
      borderColor: this.getRandomColor(),
      backgroundColor: 'rgba(0, 0, 0, 0)',
      tension: 0.4,
    }));

    // Imprimir para depuración
    console.log('Etiquetas (labels):', this.lineChartData.labels);
    console.log('Datos del dataset:', this.lineChartData.datasets);
    console.log('Fechas por rutina:', lineChartData);

    // Forzar actualizaciones
    this.cd.detectChanges();
    this.chart?.update();
  } catch (error) {
    console.error('Error al calcular estadísticas:', error);
  }
}

// Método para generar colores aleatorios
getRandomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

//Filtrado de rutina 
async filtrarRutina() {
  if (!this.idUser) {
    console.error('ID de usuario no disponible.');
    return;
  }

  if (!this.selectedRutina || this.selectedRutina === 'Todas') {
    console.log('Mostrando todas las rutinas.');
    await this.calcularEstadisticas();
    this.cd.detectChanges();
    //this.doughnutChart?.update();
    this.chart?.update();
    return;
  }

  try {
    console.log('Filtrando registros para la rutina:', this.selectedRutina);

    const registros = await this.dbService.getRegistrosPorUsuario(this.idUser);

    const registrosFiltrados = registros.filter(
      (registro: { tipoRutina: string; estado: boolean }) =>
        registro.tipoRutina === this.selectedRutina
    );

    const completadas = registrosFiltrados.filter((reg) => reg.estado === true).length;
    const noCompletadas = registrosFiltrados.length - completadas;

    // Reasignar datos completos para el gráfico de dona
    this.doughnutChartData = {
      ...this.doughnutChartData,
      datasets: [
        {
          ...this.doughnutChartData.datasets[0],
          data: [completadas, noCompletadas],
        },
      ],
    };

    // Reasignar datos completos para el gráfico de barras
    this.chartData = {
      labels: [this.selectedRutina],
      datasets: [
        {
          label: 'Completadas',
          data: [completadas],
          backgroundColor: ['rgba(75, 192, 192, 0.6)'],
        },
        {
          label: 'No Completadas',
          data: [noCompletadas],
          backgroundColor: ['rgba(255, 99, 132, 0.6)'],
        },
      ],
    };

    // Actualizar progreso mensual
    this.totalSesionesRealizadas = registrosFiltrados.length;
    this.sesionesCompletadas = completadas;
    this.porcentajeCompletado = this.totalSesionesRealizadas
      ? Math.round((this.sesionesCompletadas / this.totalSesionesRealizadas) * 100)
      : 0;

    // Forzar la actualización
    this.cd.detectChanges();
    //this.doughnutChart?.update();
    this.chart?.update();
  } catch (error) {
    console.error('Error al filtrar registros por rutina:', error);
  }
}

// Uso de modal para la opción de tomar la rutina

seleccionarRutina(rutina: string) {
  console.log('Rutina seleccionada:', this.selectedRutina);
  this.selectedRutina = rutina; // Actualiza la rutina seleccionada
  this.filtrarRutina(); // Llamar a la lógica de filtrado
  this.cerrarModal(); // Cerrar el modal
}

// Cerrar modal
cerrarModal() {
  this.isModalOpen = false;
}

 // Abrir modal
 abrirModal() {
  this.isModalOpen = true;
}

}
