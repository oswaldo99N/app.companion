/**
 * Servicio de Chat
 * Maneja la comunicación en tiempo real entre usuarios
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface MensajeChat {
  id: string;
  usuario: string;
  mensaje: string;
  timestamp: Date;
  avatar: string;
  tipo: 'usuario' | 'sistema' | 'admin';
}

export interface UsuarioOnline {
  id: string;
  nombre: string;
  avatar: string;
  estado: 'online' | 'ausente' | 'ocupado';
  ultimaActividad: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private mensajesSubject = new BehaviorSubject<MensajeChat[]>([]);
  private usuariosOnlineSubject = new BehaviorSubject<UsuarioOnline[]>([]);
  private mensajesPrivados = new Map<string, MensajeChat[]>();

  constructor(private authService: AuthService) {
    this.inicializarChat();
  }

  /**
   * Observable de mensajes del chat
   */
  get mensajes$(): Observable<MensajeChat[]> {
    return this.mensajesSubject.asObservable();
  }

  /**
   * Observable de usuarios online
   */
  get usuariosOnline$(): Observable<UsuarioOnline[]> {
    return this.usuariosOnlineSubject.asObservable();
  }

  /**
   * Inicializa el chat con mensajes de bienvenida
   */
  private inicializarChat() {
    const mensajesIniciales: MensajeChat[] = [
      {
        id: '1',
        usuario: 'Sistema',
        mensaje: '¡Bienvenidos al chat de supervivientes! Aquí pueden compartir estrategias y experiencias.',
        timestamp: new Date(Date.now() - 300000),
        avatar: '🤖',
        tipo: 'sistema'
      },
      {
        id: '2',
        usuario: 'Joel_Miller',
        mensaje: 'Recuerden siempre revisar sus suministros antes de salir de patrulla.',
        timestamp: new Date(Date.now() - 240000),
        avatar: '👨‍🦳',
        tipo: 'usuario'
      },
      {
        id: '3',
        usuario: 'Ellie_Williams',
        mensaje: '¿Alguien ha visto infectados cerca del río? Escuché ruidos extraños anoche.',
        timestamp: new Date(Date.now() - 180000),
        avatar: '👩‍🦰',
        tipo: 'usuario'
      },
      {
        id: '4',
        usuario: 'Tommy_Miller',
        mensaje: 'Área despejada por el momento. Mantengan la guardia alta.',
        timestamp: new Date(Date.now() - 120000),
        avatar: '👨‍🦲',
        tipo: 'usuario'
      }
    ];

    this.mensajesSubject.next(mensajesIniciales);

    // Simular usuarios online
    const usuariosOnline: UsuarioOnline[] = [
      {
        id: '1',
        nombre: 'Joel_Miller',
        avatar: '👨‍🦳',
        estado: 'online',
        ultimaActividad: new Date()
      },
      {
        id: '2',
        nombre: 'Ellie_Williams',
        avatar: '👩‍🦰',
        estado: 'online',
        ultimaActividad: new Date()
      },
      {
        id: '3',
        nombre: 'Tommy_Miller',
        avatar: '👨‍🦲',
        estado: 'ausente',
        ultimaActividad: new Date(Date.now() - 300000)
      },
      {
        id: '4',
        nombre: 'Dina_Woodward',
        avatar: '👩',
        estado: 'online',
        ultimaActividad: new Date()
      }
    ];

    this.usuariosOnlineSubject.next(usuariosOnline);
  }

  /**
   * Envía un mensaje al chat
   */
  enviarMensaje(mensaje: string): void {
    const usuario = this.authService.usuarioActual;
    if (!usuario || !mensaje.trim()) return;

    const nuevoMensaje: MensajeChat = {
      id: Date.now().toString(),
      usuario: usuario.nombre,
      mensaje: mensaje.trim(),
      timestamp: new Date(),
      avatar: '🎮',
      tipo: 'usuario'
    };

    const mensajesActuales = this.mensajesSubject.value;
    this.mensajesSubject.next([...mensajesActuales, nuevoMensaje]);

    // Simular respuesta automática ocasional
    if (Math.random() < 0.3) {
      setTimeout(() => {
        this.simularRespuestaAutomatica();
      }, 2000 + Math.random() * 3000);
    }
  }

  /**
   * Simula respuestas automáticas de otros usuarios
   */
  private simularRespuestaAutomatica(): void {
    const respuestas = [
      { usuario: 'Joel_Miller', mensaje: 'Buen punto, hay que tener cuidado.', avatar: '👨‍🦳' },
      { usuario: 'Ellie_Williams', mensaje: '¡Totalmente de acuerdo!', avatar: '👩‍🦰' },
      { usuario: 'Tommy_Miller', mensaje: 'Manténganse seguros ahí afuera.', avatar: '👨‍🦲' },
      { usuario: 'Dina_Woodward', mensaje: 'Gracias por la información.', avatar: '👩' },
      { usuario: 'Sistema', mensaje: 'Recordatorio: Revisen el mapa para nuevos puntos de interés.', avatar: '🤖' }
    ];

    const respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];
    const mensajeRespuesta: MensajeChat = {
      id: Date.now().toString(),
      usuario: respuesta.usuario,
      mensaje: respuesta.mensaje,
      timestamp: new Date(),
      avatar: respuesta.avatar,
      tipo: respuesta.usuario === 'Sistema' ? 'sistema' : 'usuario'
    };

    const mensajesActuales = this.mensajesSubject.value;
    this.mensajesSubject.next([...mensajesActuales, mensajeRespuesta]);
  }

  /**
   * Obtiene mensajes privados con un usuario
   */
  obtenerMensajesPrivados(usuarioId: string): MensajeChat[] {
    return this.mensajesPrivados.get(usuarioId) || [];
  }

  /**
   * Envía un mensaje privado
   */
  enviarMensajePrivado(usuarioId: string, mensaje: string): void {
    const usuario = this.authService.usuarioActual;
    if (!usuario || !mensaje.trim()) return;

    const nuevoMensaje: MensajeChat = {
      id: Date.now().toString(),
      usuario: usuario.nombre,
      mensaje: mensaje.trim(),
      timestamp: new Date(),
      avatar: '🎮',
      tipo: 'usuario'
    };

    const mensajesExistentes = this.mensajesPrivados.get(usuarioId) || [];
    this.mensajesPrivados.set(usuarioId, [...mensajesExistentes, nuevoMensaje]);
  }

  /**
   * Actualiza el estado de un usuario
   */
  actualizarEstadoUsuario(estado: 'online' | 'ausente' | 'ocupado'): void {
    const usuario = this.authService.usuarioActual;
    if (!usuario) return;

    const usuariosActuales = this.usuariosOnlineSubject.value;
    const usuarioExistente = usuariosActuales.find(u => u.nombre === usuario.nombre);

    if (usuarioExistente) {
      usuarioExistente.estado = estado;
      usuarioExistente.ultimaActividad = new Date();
    } else {
      const nuevoUsuario: UsuarioOnline = {
        id: Date.now().toString(),
        nombre: usuario.nombre,
        avatar: '🎮',
        estado: estado,
        ultimaActividad: new Date()
      };
      usuariosActuales.push(nuevoUsuario);
    }

    this.usuariosOnlineSubject.next([...usuariosActuales]);
  }
}