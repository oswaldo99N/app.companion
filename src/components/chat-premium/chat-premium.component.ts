/**
 * Componente Chat Premium
 * Chat integrado para usuarios premium
 */

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatService, MensajeChat, UsuarioOnline } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat-premium',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <!-- Header del chat -->
      <div class="chat-header">
        <div class="chat-title">
          <span class="chat-icon">💬</span>
          <h3>Chat de Supervivientes</h3>
          <span class="users-count">({{ usuariosOnline.length }} online)</span>
        </div>
        <div class="chat-controls">
          <button 
            class="control-btn"
            [class.active]="mostrarUsuarios"
            (click)="toggleUsuarios()"
            title="Ver usuarios online"
          >
            👥
          </button>
          <button 
            class="control-btn"
            (click)="limpiarChat()"
            title="Limpiar chat"
          >
            🗑️
          </button>
        </div>
      </div>

      <div class="chat-body">
        <!-- Lista de usuarios online -->
        <div class="usuarios-panel" [class.visible]="mostrarUsuarios">
          <h4>Usuarios Online</h4>
          <div class="usuarios-lista">
            <div 
              class="usuario-item"
              *ngFor="let usuario of usuariosOnline"
              [class]="'estado-' + usuario.estado"
            >
              <span class="usuario-avatar">{{ usuario.avatar }}</span>
              <div class="usuario-info">
                <span class="usuario-nombre">{{ usuario.nombre }}</span>
                <span class="usuario-estado">{{ getEstadoTexto(usuario.estado) }}</span>
              </div>
              <div class="estado-indicator" [attr.data-estado]="usuario.estado"></div>
            </div>
          </div>
        </div>

        <!-- Área de mensajes -->
        <div class="mensajes-area">
          <div class="mensajes-container" #mensajesContainer>
            <div 
              class="mensaje"
              *ngFor="let mensaje of mensajes"
              [class]="'mensaje-' + mensaje.tipo"
            >
              <div class="mensaje-header">
                <span class="mensaje-avatar">{{ mensaje.avatar }}</span>
                <span class="mensaje-usuario">{{ mensaje.usuario }}</span>
                <span class="mensaje-tiempo">{{ mensaje.timestamp | date:'HH:mm' }}</span>
              </div>
              <div class="mensaje-contenido">
                {{ mensaje.mensaje }}
              </div>
            </div>
          </div>

          <!-- Área de escritura -->
          <div class="mensaje-input-area">
            <div class="input-container">
              <input
                type="text"
                [(ngModel)]="nuevoMensaje"
                (keyup.enter)="enviarMensaje()"
                placeholder="Escribe tu mensaje..."
                class="mensaje-input"
                [disabled]="!puedeEnviarMensajes"
                maxlength="500"
              >
              <button 
                class="enviar-btn"
                (click)="enviarMensaje()"
                [disabled]="!nuevoMensaje.trim() || !puedeEnviarMensajes"
              >
                📤
              </button>
            </div>
            <div class="input-info">
              <span class="caracteres-restantes">
                {{ 500 - nuevoMensaje.length }} caracteres restantes
              </span>
              <div class="estado-usuario">
                <label for="estadoSelect">Estado:</label>
                <select 
                  id="estadoSelect"
                  [(ngModel)]="estadoActual"
                  (change)="cambiarEstado()"
                  class="estado-select"
                >
                  <option value="online">🟢 Online</option>
                  <option value="ausente">🟡 Ausente</option>
                  <option value="ocupado">🔴 Ocupado</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Indicador de escritura -->
      <div class="typing-indicator" *ngIf="alguienEscribiendo">
        <span class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </span>
        <span class="typing-text">Alguien está escribiendo...</span>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      height: 500px;
      background: var(--color-fondo-oscuro);
      border-radius: 12px;
      border: 2px solid var(--color-acento);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .chat-header {
      background: linear-gradient(90deg, var(--color-acento), #ff8c69);
      padding: var(--espaciado-sm);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--color-acento);
    }

    .chat-title {
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
      color: var(--color-texto-claro);
    }

    .chat-icon {
      font-size: 1.5rem;
    }

    .chat-title h3 {
      margin: 0;
      font-size: 1.2rem;
      font-family: var(--fuente-titulo);
    }

    .users-count {
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .chat-controls {
      display: flex;
      gap: var(--espaciado-xs);
    }

    .control-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 6px;
      padding: var(--espaciado-xs);
      color: var(--color-texto-claro);
      cursor: pointer;
      transition: all var(--transicion-rapida);
      font-size: 1.1rem;
    }

    .control-btn:hover,
    .control-btn.active {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }

    .chat-body {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .usuarios-panel {
      width: 200px;
      background: var(--color-fondo-medio);
      border-right: 1px solid var(--color-acento);
      padding: var(--espaciado-sm);
      transform: translateX(-100%);
      transition: transform var(--transicion-media);
      overflow-y: auto;
    }

    .usuarios-panel.visible {
      transform: translateX(0);
    }

    .usuarios-panel h4 {
      color: var(--color-acento);
      margin-bottom: var(--espaciado-sm);
      font-size: 1rem;
    }

    .usuarios-lista {
      display: flex;
      flex-direction: column;
      gap: var(--espaciado-xs);
    }

    .usuario-item {
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
      padding: var(--espaciado-xs);
      border-radius: 6px;
      transition: background var(--transicion-rapida);
      position: relative;
    }

    .usuario-item:hover {
      background: rgba(255, 107, 53, 0.1);
    }

    .usuario-avatar {
      font-size: 1.2rem;
    }

    .usuario-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .usuario-nombre {
      color: var(--color-texto-claro);
      font-weight: 600;
      font-size: 0.9rem;
    }

    .usuario-estado {
      color: rgba(245, 245, 245, 0.7);
      font-size: 0.7rem;
    }

    .estado-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      position: absolute;
      top: 4px;
      right: 4px;
    }

    .estado-indicator[data-estado="online"] {
      background: #4ade80;
    }

    .estado-indicator[data-estado="ausente"] {
      background: #fbbf24;
    }

    .estado-indicator[data-estado="ocupado"] {
      background: #ef4444;
    }

    .mensajes-area {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .mensajes-container {
      flex: 1;
      overflow-y: auto;
      padding: var(--espaciado-sm);
      display: flex;
      flex-direction: column;
      gap: var(--espaciado-sm);
    }

    .mensaje {
      display: flex;
      flex-direction: column;
      gap: var(--espaciado-xs);
      padding: var(--espaciado-sm);
      border-radius: 8px;
      max-width: 80%;
      word-wrap: break-word;
    }

    .mensaje-usuario {
      background: rgba(255, 107, 53, 0.1);
      border: 1px solid var(--color-acento);
      align-self: flex-end;
    }

    .mensaje-sistema {
      background: rgba(74, 93, 35, 0.1);
      border: 1px solid var(--color-supervivencia);
      align-self: center;
      max-width: 90%;
      text-align: center;
    }

    .mensaje-admin {
      background: rgba(178, 34, 34, 0.1);
      border: 1px solid var(--color-peligro);
      align-self: flex-start;
    }

    .mensaje-header {
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
      font-size: 0.8rem;
    }

    .mensaje-avatar {
      font-size: 1rem;
    }

    .mensaje-usuario-nombre {
      color: var(--color-acento);
      font-weight: 600;
    }

    .mensaje-tiempo {
      color: rgba(245, 245, 245, 0.6);
      margin-left: auto;
    }

    .mensaje-contenido {
      color: var(--color-texto-claro);
      line-height: 1.4;
    }

    .mensaje-input-area {
      border-top: 1px solid var(--color-acento);
      padding: var(--espaciado-sm);
      background: var(--color-fondo-medio);
    }

    .input-container {
      display: flex;
      gap: var(--espaciado-xs);
      margin-bottom: var(--espaciado-xs);
    }

    .mensaje-input {
      flex: 1;
      padding: var(--espaciado-sm);
      background: var(--color-fondo-oscuro);
      border: 1px solid var(--color-acento);
      border-radius: 6px;
      color: var(--color-texto-claro);
      font-size: 0.9rem;
    }

    .mensaje-input:focus {
      outline: none;
      border-color: var(--color-supervivencia);
      box-shadow: 0 0 5px rgba(74, 93, 35, 0.3);
    }

    .enviar-btn {
      background: var(--color-acento);
      border: none;
      border-radius: 6px;
      padding: var(--espaciado-sm);
      color: var(--color-texto-claro);
      cursor: pointer;
      transition: all var(--transicion-rapida);
      font-size: 1.1rem;
      min-width: 50px;
    }

    .enviar-btn:hover:not(:disabled) {
      background: #ff8c69;
      transform: scale(1.05);
    }

    .enviar-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .input-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: rgba(245, 245, 245, 0.7);
    }

    .estado-usuario {
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
    }

    .estado-select {
      background: var(--color-fondo-oscuro);
      border: 1px solid var(--color-acento);
      border-radius: 4px;
      color: var(--color-texto-claro);
      padding: 2px 6px;
      font-size: 0.8rem;
    }

    .typing-indicator {
      padding: var(--espaciado-xs) var(--espaciado-sm);
      background: rgba(255, 107, 53, 0.1);
      border-top: 1px solid var(--color-acento);
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
    }

    .typing-dots {
      display: flex;
      gap: 2px;
    }

    .typing-dots span {
      width: 4px;
      height: 4px;
      background: var(--color-acento);
      border-radius: 50%;
      animation: typing 1.4s ease-in-out infinite;
    }

    .typing-dots span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-dots span:nth-child(3) {
      animation-delay: 0.4s;
    }

    .typing-text {
      color: rgba(245, 245, 245, 0.7);
      font-size: 0.8rem;
      font-style: italic;
    }

    @keyframes typing {
      0%, 60%, 100% {
        transform: scale(1);
        opacity: 0.5;
      }
      30% {
        transform: scale(1.2);
        opacity: 1;
      }
    }

    /* Scrollbar personalizado */
    .mensajes-container::-webkit-scrollbar,
    .usuarios-panel::-webkit-scrollbar {
      width: 6px;
    }

    .mensajes-container::-webkit-scrollbar-track,
    .usuarios-panel::-webkit-scrollbar-track {
      background: var(--color-fondo-medio);
    }

    .mensajes-container::-webkit-scrollbar-thumb,
    .usuarios-panel::-webkit-scrollbar-thumb {
      background: var(--color-acento);
      border-radius: 3px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .chat-container {
        height: 400px;
      }

      .usuarios-panel {
        width: 150px;
      }

      .usuario-nombre {
        font-size: 0.8rem;
      }

      .mensaje {
        max-width: 90%;
      }

      .input-info {
        flex-direction: column;
        gap: var(--espaciado-xs);
        align-items: flex-start;
      }
    }
  `]
})
export class ChatPremiumComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef;

  mensajes: MensajeChat[] = [];
  usuariosOnline: UsuarioOnline[] = [];
  nuevoMensaje = '';
  mostrarUsuarios = false;
  estadoActual: 'online' | 'ausente' | 'ocupado' = 'online';
  alguienEscribiendo = false;
  puedeEnviarMensajes = true;

  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = false;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Suscribirse a mensajes
    const mensajesSub = this.chatService.mensajes$.subscribe(mensajes => {
      this.mensajes = mensajes;
      this.shouldScrollToBottom = true;
    });

    // Suscribirse a usuarios online
    const usuariosSub = this.chatService.usuariosOnline$.subscribe(usuarios => {
      this.usuariosOnline = usuarios;
    });

    this.subscriptions.push(mensajesSub, usuariosSub);

    // Actualizar estado del usuario
    this.chatService.actualizarEstadoUsuario(this.estadoActual);

    // Simular indicador de escritura ocasionalmente
    this.simularEscritura();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Envía un mensaje al chat
   */
  enviarMensaje() {
    if (!this.nuevoMensaje.trim() || !this.puedeEnviarMensajes) return;

    this.chatService.enviarMensaje(this.nuevoMensaje);
    this.nuevoMensaje = '';

    // Cooldown para evitar spam
    this.puedeEnviarMensajes = false;
    setTimeout(() => {
      this.puedeEnviarMensajes = true;
    }, 1000);
  }

  /**
   * Cambia el estado del usuario
   */
  cambiarEstado() {
    this.chatService.actualizarEstadoUsuario(this.estadoActual);
  }

  /**
   * Alterna la visibilidad del panel de usuarios
   */
  toggleUsuarios() {
    this.mostrarUsuarios = !this.mostrarUsuarios;
  }

  /**
   * Limpia el chat (solo visualmente para el usuario)
   */
  limpiarChat() {
    if (confirm('¿Estás seguro de que quieres limpiar el chat? Esto solo afectará tu vista.')) {
      this.mensajes = [];
    }
  }

  /**
   * Convierte el estado a texto legible
   */
  getEstadoTexto(estado: string): string {
    const estados: { [key: string]: string } = {
      'online': 'En línea',
      'ausente': 'Ausente',
      'ocupado': 'Ocupado'
    };
    return estados[estado] || estado;
  }

  /**
   * Hace scroll al final del chat
   */
  private scrollToBottom() {
    try {
      if (this.mensajesContainer) {
        const element = this.mensajesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error al hacer scroll:', err);
    }
  }

  /**
   * Simula el indicador de escritura
   */
  private simularEscritura() {
    setInterval(() => {
      if (Math.random() < 0.1) { // 10% de probabilidad cada 10 segundos
        this.alguienEscribiendo = true;
        setTimeout(() => {
          this.alguienEscribiendo = false;
        }, 2000 + Math.random() * 3000);
      }
    }, 10000);
  }
}