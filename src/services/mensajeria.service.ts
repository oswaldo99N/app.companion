/**
 * Servicio de Mensajería
 * Maneja el envío de mensajes al administrador y feedback
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface MensajeAdmin {
  id: string;
  usuario: string;
  email: string;
  asunto: string;
  mensaje: string;
  categoria: 'bug' | 'sugerencia' | 'consulta' | 'feedback' | 'otro';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  timestamp: Date;
  estado: 'enviado' | 'leido' | 'respondido' | 'cerrado';
  respuesta?: string;
  fechaRespuesta?: Date;
}

export interface EstadisticasMensajeria {
  totalEnviados: number;
  pendientes: number;
  respondidos: number;
  tiempoRespuestaPromedio: number;
}

@Injectable({
  providedIn: 'root'
})
export class MensajeriaService {
  private mensajesSubject = new BehaviorSubject<MensajeAdmin[]>([]);
  private estadisticasSubject = new BehaviorSubject<EstadisticasMensajeria>({
    totalEnviados: 0,
    pendientes: 0,
    respondidos: 0,
    tiempoRespuestaPromedio: 24
  });

  constructor(private authService: AuthService) {
    this.cargarMensajesGuardados();
  }

  /**
   * Observable de mensajes del usuario
   */
  get mensajes$(): Observable<MensajeAdmin[]> {
    return this.mensajesSubject.asObservable();
  }

  /**
   * Observable de estadísticas
   */
  get estadisticas$(): Observable<EstadisticasMensajeria> {
    return this.estadisticasSubject.asObservable();
  }

  /**
   * Envía un mensaje al administrador
   */
  enviarMensaje(datos: {
    asunto: string;
    mensaje: string;
    categoria: 'bug' | 'sugerencia' | 'consulta' | 'feedback' | 'otro';
    prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  }): Observable<boolean> {
    return new Observable(observer => {
      const usuario = this.authService.usuarioActual;
      if (!usuario) {
        observer.next(false);
        observer.complete();
        return;
      }

      const nuevoMensaje: MensajeAdmin = {
        id: Date.now().toString(),
        usuario: usuario.nombre,
        email: usuario.email,
        asunto: datos.asunto,
        mensaje: datos.mensaje,
        categoria: datos.categoria,
        prioridad: datos.prioridad,
        timestamp: new Date(),
        estado: 'enviado'
      };

      // Simular delay de envío
      setTimeout(() => {
        const mensajesActuales = this.mensajesSubject.value;
        const nuevosMensajes = [...mensajesActuales, nuevoMensaje];
        this.mensajesSubject.next(nuevosMensajes);
        
        // Guardar en localStorage
        this.guardarMensajes(nuevosMensajes);
        
        // Actualizar estadísticas
        this.actualizarEstadisticas();
        
        // Simular respuesta automática para algunos casos
        this.simularRespuestaAutomatica(nuevoMensaje);
        
        observer.next(true);
        observer.complete();
      }, 1000);
    });
  }

  /**
   * Obtiene mensajes del usuario actual
   */
  obtenerMensajesUsuario(): Observable<MensajeAdmin[]> {
    const usuario = this.authService.usuarioActual;
    if (!usuario) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    const mensajesUsuario = this.mensajesSubject.value.filter(m => m.email === usuario.email);
    return new Observable(observer => {
      observer.next(mensajesUsuario);
      observer.complete();
    });
  }

  /**
   * Marca un mensaje como leído
   */
  marcarComoLeido(id: string): void {
    const mensajes = this.mensajesSubject.value;
    const mensaje = mensajes.find(m => m.id === id);
    if (mensaje && mensaje.estado === 'enviado') {
      mensaje.estado = 'leido';
      this.mensajesSubject.next([...mensajes]);
      this.guardarMensajes(mensajes);
    }
  }

  /**
   * Simula respuesta automática del administrador
   */
  private simularRespuestaAutomatica(mensaje: MensajeAdmin): void {
    // Solo responder automáticamente a ciertos tipos de mensajes
    if (mensaje.categoria === 'consulta' || mensaje.prioridad === 'urgente') {
      setTimeout(() => {
        const respuestas = {
          'consulta': 'Gracias por tu consulta. Hemos recibido tu mensaje y te responderemos en las próximas 24 horas.',
          'bug': 'Hemos registrado el error reportado. Nuestro equipo técnico lo revisará y trabajará en una solución.',
          'sugerencia': 'Agradecemos tu sugerencia. La evaluaremos para futuras actualizaciones de la plataforma.',
          'feedback': 'Gracias por tu feedback. Es muy valioso para mejorar la experiencia de todos los supervivientes.',
          'otro': 'Hemos recibido tu mensaje. Te contactaremos pronto con más información.'
        };

        const mensajes = this.mensajesSubject.value;
        const mensajeIndex = mensajes.findIndex(m => m.id === mensaje.id);
        
        if (mensajeIndex !== -1) {
          mensajes[mensajeIndex].estado = 'respondido';
          mensajes[mensajeIndex].respuesta = respuestas[mensaje.categoria];
          mensajes[mensajeIndex].fechaRespuesta = new Date();
          
          this.mensajesSubject.next([...mensajes]);
          this.guardarMensajes(mensajes);
          this.actualizarEstadisticas();
        }
      }, 5000 + Math.random() * 10000); // Entre 5-15 segundos
    }
  }

  /**
   * Actualiza las estadísticas de mensajería
   */
  private actualizarEstadisticas(): void {
    const mensajes = this.mensajesSubject.value;
    const usuario = this.authService.usuarioActual;
    
    if (!usuario) return;

    const mensajesUsuario = mensajes.filter(m => m.email === usuario.email);
    
    const estadisticas: EstadisticasMensajeria = {
      totalEnviados: mensajesUsuario.length,
      pendientes: mensajesUsuario.filter(m => m.estado === 'enviado' || m.estado === 'leido').length,
      respondidos: mensajesUsuario.filter(m => m.estado === 'respondido').length,
      tiempoRespuestaPromedio: this.calcularTiempoRespuestaPromedio(mensajesUsuario)
    };

    this.estadisticasSubject.next(estadisticas);
  }

  /**
   * Calcula el tiempo promedio de respuesta
   */
  private calcularTiempoRespuestaPromedio(mensajes: MensajeAdmin[]): number {
    const mensajesRespondidos = mensajes.filter(m => m.estado === 'respondido' && m.fechaRespuesta);
    
    if (mensajesRespondidos.length === 0) return 24;

    const tiempos = mensajesRespondidos.map(m => {
      const tiempoRespuesta = m.fechaRespuesta!.getTime() - m.timestamp.getTime();
      return tiempoRespuesta / (1000 * 60 * 60); // Convertir a horas
    });

    const promedio = tiempos.reduce((sum, tiempo) => sum + tiempo, 0) / tiempos.length;
    return Math.round(promedio);
  }

  /**
   * Guarda mensajes en localStorage
   */
  private guardarMensajes(mensajes: MensajeAdmin[]): void {
    try {
      localStorage.setItem('mensajes_admin_tlou', JSON.stringify(mensajes));
    } catch (error) {
      console.error('Error al guardar mensajes:', error);
    }
  }

  /**
   * Carga mensajes desde localStorage
   */
  private cargarMensajesGuardados(): void {
    try {
      const mensajesGuardados = localStorage.getItem('mensajes_admin_tlou');
      if (mensajesGuardados) {
        const mensajes = JSON.parse(mensajesGuardados);
        // Convertir strings de fecha a objetos Date
        mensajes.forEach((m: any) => {
          m.timestamp = new Date(m.timestamp);
          if (m.fechaRespuesta) {
            m.fechaRespuesta = new Date(m.fechaRespuesta);
          }
        });
        this.mensajesSubject.next(mensajes);
        this.actualizarEstadisticas();
      }
    } catch (error) {
      console.error('Error al cargar mensajes guardados:', error);
    }
  }

  /**
   * Obtiene plantillas de mensajes comunes
   */
  obtenerPlantillasMensajes(): { [key: string]: string } {
    return {
      'bug_reporte': 'He encontrado un error en la aplicación. Descripción del problema: [Describe el error aquí]. Pasos para reproducir: [Lista los pasos]. Navegador utilizado: [Chrome/Firefox/Safari/etc.]',
      'sugerencia_mejora': 'Tengo una sugerencia para mejorar la aplicación: [Describe tu sugerencia]. Esto ayudaría porque: [Explica los beneficios].',
      'consulta_general': 'Tengo una consulta sobre: [Tema de consulta]. Me gustaría saber: [Pregunta específica].',
      'feedback_positivo': 'Quería compartir mi experiencia positiva con la aplicación: [Describe qué te gustó]. Especialmente me pareció útil: [Características específicas].',
      'problema_tecnico': 'Estoy experimentando un problema técnico: [Describe el problema]. El error ocurre cuando: [Situación específica]. Mi dispositivo: [Información del dispositivo].'
    };
  }
}