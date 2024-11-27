import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { LoginService } from '../services/login.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartDataset  } from 'chart.js';
import { ViewChild, ChangeDetectorRef } from '@angular/core';
import { Registro } from '../services/modulos.service';
import ChartDataLabels from 'chartjs-plugin-datalabels';



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
  @ViewChild('lineChart', { static: false }) lineChart?: BaseChartDirective;
  @ViewChild('barChart', { static: false }) barChart?: BaseChartDirective;

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
    maintainAspectRatio: true,
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
  public lineChartData: {
    labels: string[];
    datasets: ChartDataset<'line', (number | null)[]>[];
  } = {
    labels: [],
    datasets: [],
  };
  
  
  

  public chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  } = {
    labels: [],
    datasets: [],
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
    elements: {
      point: {
        radius: 5, // Asegura que los puntos sean visibles
        hoverRadius: 8,
      },
      line: {
        tension: 0.4, // Suavidad de las líneas
        borderWidth: 2, // Grosor de la línea
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
  ) { }


  ngAfterViewInit() {
    console.log('Doughnut Chart:', this.doughnutChart);
    console.log('Bar Chart:', this.chart);
  }

  ngOnInit() {
    this.lineChartOptions = {
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
      elements: {
        point: {
          radius: 5,
          hoverRadius: 8,
        },
        line: {
          tension: 0.4,
          borderWidth: 2,
          spanGaps: true, // Conectar puntos válidos
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
    const lineChartData: { [tipoRutina: string]: { dateToHeartRate: { [date: string]: number } } } = {};

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
        lineChartData[rutina] = { dateToHeartRate: {} };
      }
      lineChartData[rutina].dateToHeartRate[fecha] = heartRate;
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
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
        {
          label: 'No Completadas',
          data: Object.values(datosPorRutina).map((d) => d.noCompletadas),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
        },
      ],
    };

    // Preparar datos para el gráfico de líneas
    this.lineChartData.labels = Array.from(
      new Set(
        Object.values(lineChartData).flatMap((item) => Object.keys(item.dateToHeartRate))
      )
    ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // Dentro de calcularEstadisticas(), al asignar datasets
    this.lineChartData.datasets = Object.keys(lineChartData).map((rutina, index) => {
      const dateToHeartRate = lineChartData[rutina].dateToHeartRate;
      const data = this.lineChartData.labels.map((date) => dateToHeartRate[date] ?? null);
    
      return {
        label: rutina,
        data: data,
        borderColor: this.getRandomColor(index),
        backgroundColor: 'rgba(0, 0, 0, 0)',
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        spanGaps: true,
      } as ChartDataset<'line', (number | null)[]>;
    });

    // Imprimir para depuración
    console.log('Etiquetas (labels):', this.lineChartData.labels);
    console.log('Datos del dataset:', this.lineChartData.datasets);
    console.log('Datos por rutina:', lineChartData);

    // Forzar actualizaciones
    this.cd.detectChanges();
    this.lineChart?.update();
    this.barChart?.update();
    this.chart?.update();
    setTimeout(() => {
      this.chart?.update();
    }, 100);

  } catch (error) {
    console.error('Error al calcular estadísticas:', error);
  }
}


// Método para generar colores aleatorios
getRandomColor(index: number): string {
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
  return colors[index % colors.length];
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
    this.chart?.update();
    return;
  }

  try {
    console.log('Filtrando registros para la rutina:', this.selectedRutina);

    const registros = (await this.dbService.getRegistrosPorUsuario(this.idUser)) as Registro[];

    const registrosFiltrados = registros.filter(
      (registro: Registro) => registro.tipoRutina === this.selectedRutina
    );

    const completadas = registrosFiltrados.filter((reg) => reg.estado === true).length;
    const noCompletadas = registrosFiltrados.length - completadas;

    this.doughnutChartData = {
      ...this.doughnutChartData,
      datasets: [
        {
          ...this.doughnutChartData.datasets[0],
          data: [completadas, noCompletadas],
        },
      ],
    };

    // Preparar datos para el gráfico de líneas con los registros filtrados
    const lineChartData: { dateToHeartRate: { [date: string]: number } } = { dateToHeartRate: {} };

    registrosFiltrados.forEach((registro) => {
      const rawFecha = registro.fecha;
      const fechaProcesada = this.procesarFecha(rawFecha);
      if (fechaProcesada) {
        lineChartData.dateToHeartRate[fechaProcesada] = registro.heartRate;
      }
    });

    // Actualizar etiquetas del gráfico de líneas
    this.lineChartData.labels = Object.keys(lineChartData.dateToHeartRate).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    // Actualizar datasets del gráfico de líneas
    const data = this.lineChartData.labels.map(
      (date) => lineChartData.dateToHeartRate[date] ?? null
    );

    this.lineChartData.datasets = [
      {
        label: this.selectedRutina,
        data: data,
        borderColor: this.getRandomColor(0),
        backgroundColor: 'rgba(0, 0, 0, 0)',
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        spanGaps: true,
      } as ChartDataset<'line', (number | null)[]>,
    ];

    // Actualizar gráfico de barras si es necesario
    this.chartData = {
      labels: registrosFiltrados.map((reg) => {
        const fechaProcesada = this.procesarFecha(reg.fecha);
        return fechaProcesada ? fechaProcesada : '';
      }),
      datasets: [
        {
          label: 'Frecuencia Cardíaca',
          data: registrosFiltrados.map((reg) => reg.heartRate),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };

    this.totalSesionesRealizadas = registrosFiltrados.length;
    this.sesionesCompletadas = completadas;
    this.porcentajeCompletado = this.totalSesionesRealizadas
      ? Math.round((this.sesionesCompletadas / this.totalSesionesRealizadas) * 100)
      : 0;

    // Forzar la detección de cambios y actualizar el gráfico
    this.cd.detectChanges();
    this.lineChart?.update();
    this.barChart?.update();
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

private procesarFecha(rawFecha: string): string | null {
  let fecha = '';

  try {
    if (rawFecha && /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/.test(rawFecha)) {
      // Formato personalizado 'DD-MM-YYYY HH:mm:ss'
      const [day, month, yearAndTime] = rawFecha.split('-');
      const [year, time] = yearAndTime.split(' ');
      fecha = `${year}-${month}-${day}`; // Convertimos a formato 'YYYY-MM-DD'
    } else if (!isNaN(new Date(rawFecha).getTime())) {
      // Si es una fecha válida
      fecha = new Date(rawFecha).toISOString().split('T')[0];
    } else {
      console.warn('Fecha inválida detectada y omitida:', rawFecha);
      return null;
    }
    return fecha;
  } catch (error) {
    console.warn('Error al procesar fecha:', rawFecha, error);
    return null;
  }
}

}
