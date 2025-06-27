/**
 * Componente Mensajería Premium
 * Sistema de mensajes al administrador
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MensajeriaService, MensajeAdmin, EstadisticasMensajeria } from '../../services/mensajeria.service';

@Component({
  selector: 'app-mensajeria-premium',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mensajeria-container">
      <!-- Header -->
      <div class="mensajeria-header">
        <h3>
          <span class="mensajeria-icon">📧</span>
          Centro de Mensajería
        </h3>
        <div class="header-stats">
          <span class="stat-item">
            <span class="stat-icon">📤</span>
            {{ estadisticas.totalEnviados }} enviados
          </span>
          <span class="stat-item">
            <span class="stat-icon">⏱️</span>
            {{ estadisticas.pendientes }} pendientes
          </span>
        </div>
      </div>

      <!-- Navegación -->
      <div class="mensajeria-nav">
        <button 
          class="nav-btn"
          [class.active]="vistaActual === 'nuevo'"
          (click)="cambiarVista('nuevo')"
        >
          ✍️ Nuevo Mensaje
        </button>
        <button 
          class="nav-btn"
          [class.active]="vistaActual === 'enviados'"
          (click)="cambiarVista('enviados')"
        >
          📤 Mensajes Enviados
        </button>
        <button 
          class="nav-btn"
          [class.active]="vistaActual === 'plantillas'"
          (click)="cambiarVista('plantillas')"
        >
          📋 Plantillas
        </button>
      </div>

      <!-- Vista Nuevo Mensaje -->
      <div class="vista-contenido" *ngIf="vistaActual === 'nuevo'">
        <form class="mensaje-form" (ngSubmit)="enviarMensaje()" #mensajeForm="ngForm">
          <div class="form-row">
            <div class="form-group">
              <label for="categoria">Categoría *</label>
              <select 
                id="categoria"
                [(ngModel)]="nuevoMensaje.categoria"
                name="categoria"
                class="form-select"
                required
              >
                <option value="">Selecciona una categoría</option>
                <option value="bug">🐛 Reporte de Error</option>
                <option value="sugerencia">💡 Sugerencia</option>
                <option value="consulta">❓ Consulta General</option>
                <option value="feedback">⭐ Feedback</option>
                <option value="otro">📝 Otro</option>
              </select>
            </div>

            <div class="form-group">
              <label for="prioridad">Prioridad *</label>
              <select 
                id="prioridad"
                [(ngModel)]="nuevoMensaje.prioridad"
                name="prioridad"
                class="form-select"
                required
              >
                <option value="">Selecciona prioridad</option>
                <option value="baja">🟢 Baja</option>
                <option value="media">🟡 Media</option>
                <option value="alta">🟠 Alta</option>
                <option value="urgente">🔴 Urgente</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="asunto">Asunto *</label>
            <input 
              type="text"
              id="asunto"
              [(ngModel)]="nuevoMensaje.asunto"
              name="asunto"
              class="form-input"
              placeholder="Describe brevemente tu mensaje"
              required
              maxlength="100"
            >
            <small class="char-count">{{ 100 - nuevoMensaje.asunto.length }} caracteres restantes</small>
          </div>

          <div class="form-group">
            <label for="mensaje">Mensaje *</label>
            <textarea 
              id="mensaje"
              [(ngModel)]="nuevoMensaje.mensaje"
              name="mensaje"
              class="form-textarea"
              placeholder="Describe detalladamente tu consulta, sugerencia o problema..."
              required
              maxlength="1000"
              rows="8"
            ></textarea>
            <small class="char-count">{{ 1000 - nuevoMensaje.mensaje.length }} caracteres restantes</small>
          </div>

          <div class="form-actions">
            <button 
              type="button"
              class="btn-secundario"
              (click)="limpiarFormulario()"
            >
              🗑️ Limpiar
            </button>
            <button 
              type="submit"
              class="btn-primario"
              [disabled]="!mensajeForm.form.valid || enviandoMensaje"
            >
              <span *ngIf="!enviandoMensaje">📤 Enviar Mensaje</span>
              <span *ngIf="enviandoMensaje">⏳ Enviando...</span>
            </button>
          </div>
        </form>

        <!-- Consejos para escribir mensajes -->
        <div class="consejos-mensaje">
          <h4>💡 Consejos para un mensaje efectivo:</h4>
          <ul>
            <li><strong>Sé específico:</strong> Describe claramente el problema o consulta</li>
            <li><strong>Incluye detalles:</strong> Navegador, dispositivo, pasos para reproducir errores</li>
            <li><strong>Usa un asunto claro:</strong> Ayuda a priorizar tu mensaje</li>
            <li><strong>Sé respetuoso:</strong> Un tono cordial facilita la comunicación</li>
          </ul>
        </div>
      </div>

      <!-- Vista Mensajes Enviados -->
      <div class="vista-contenido" *ngIf="vistaActual === 'enviados'">
        <div class="mensajes-stats">
          <div class="stat-card">
            <span class="stat-icon">📊</span>
            <div class="stat-info">
              <span class="stat-value">{{ estadisticas.totalEnviados }}</span>
              <span class="stat-label">Total Enviados</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">⏳</span>
            <div class="stat-info">
              <span class="stat-value">{{ estadisticas.pendientes }}</span>
              <span class="stat-label">Pendientes</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">✅</span>
            <div class="stat-info">
              <span class="stat-value">{{ estadisticas.respondidos }}</span>
              <span class="stat-label">Respondidos</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">⏱️</span>
            <div class="stat-info">
              <span class="stat-value">{{ estadisticas.tiempoRespuestaPromedio }}h</span>
              <span class="stat-label">Tiempo Promedio</span>
            </div>
          </div>
        </div>

        <div class="mensajes-lista">
          <div 
            class="mensaje-item"
            *ngFor="let mensaje of mensajesEnviados"
            [class]="'estado-' + mensaje.estado"
          >
            <div class="mensaje-header">
              <div class="mensaje-info">
                <h4>{{ mensaje.asunto }}</h4>
                <div class="mensaje-meta">
                  <span class="categoria-badge" [attr.data-categoria]="mensaje.categoria">
                    {{ getCategoriaTexto(mensaje.categoria) }}
                  </span>
                  <span class="prioridad-badge" [attr.data-prioridad]="mensaje.prioridad">
                    {{ getPrioridadTexto(mensaje.prioridad) }}
                  </span>
                  <span class="fecha">{{ mensaje.timestamp | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
              </div>
              <div class="estado-badge" [attr.data-estado]="mensaje.estado">
                {{ getEstadoTexto(mensaje.estado) }}
              </div>
            </div>

            <div class="mensaje-contenido">
              <p>{{ mensaje.mensaje }}</p>
            </div>

            <div class="mensaje-respuesta" *ngIf="mensaje.respuesta">
              <div class="respuesta-header">
                <span class="respuesta-icon">💬</span>
                <strong>Respuesta del Administrador:</strong>
                <span class="respuesta-fecha">{{ mensaje.fechaRespuesta | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <p class="respuesta-contenido">{{ mensaje.respuesta }}</p>
            </div>
          </div>

          <div class="no-mensajes" *ngIf="mensajesEnviados.length === 0">
            <div class="empty-state">
              <span class="empty-icon">📭</span>
              <h4>No has enviado mensajes aún</h4>
              <p>Cuando envíes tu primer mensaje, aparecerá aquí con su estado y respuesta.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista Plantillas -->
      <div class="vista-contenido" *ngIf="vistaActual === 'plantillas'">
        <div class="plantillas-info">
          <h4>📋 Plantillas de Mensajes</h4>
          <p>Usa estas plantillas como punto de partida para tus mensajes. Puedes copiar y personalizar según tu necesidad.</p>
        </div>

        <div class="plantillas-lista">
          <div 
            class="plantilla-item"
            *ngFor="let plantilla of plantillasDisponibles | keyvalue"
          >
            <div class="plantilla-header">
              <h5>{{ getPlantillaTitulo(plantilla.key) }}</h5>
              <button 
                class="btn-usar-plantilla"
                (click)="usarPlantilla(plantilla.key, plantilla.value)"
              >
                📋 Usar Plantilla
              </button>
            </div>
            <div class="plantilla-preview">
              <p>{{ plantilla.value.substring(0, 150) }}{{ plantilla.value.length > 150 ? '...' : '' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mensajeria-container {
      height: 600px;
      background: var(--color-fondo-oscuro);
      border-radius: 12px;
      border: 2px solid var(--color-acento);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .mensajeria-header {
      background: linear-gradient(90deg, var(--color-acento), #ff8c69);
      padding: var(--espaciado-sm);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--color-acento);
    }

    .mensajeria-header h3 {
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
      color: var(--color-texto-claro);
      margin: 0;
      font-family: var(--fuente-titulo);
    }

    .mensajeria-icon {
      font-size: 1.5rem;
    }

    .header-stats {
      display: flex;
      gap: var(--espaciado-md);
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
      color: var(--color-texto-claro);
      font-size: 0.9rem;
    }

    .stat-icon {
      font-size: 1.1rem;
    }

    .mensajeria-nav {
      background: var(--color-fondo-medio);
      padding: var(--espaciado-sm);
      display: flex;
      gap: var(--espaciado-xs);
      border-bottom: 1px solid var(--color-acento);
    }

    .nav-btn {
      padding: var(--espaciado-xs) var(--espaciado-sm);
      background: transparent;
      border: 1px solid var(--color-acento);
      color: var(--color-acento);
      border-radius: 6px;
      cursor: pointer;
      transition: all var(--transicion-rapida);
      font-size: 0.9rem;
      white-space: nowrap;
    }

    .nav-btn:hover,
    .nav-btn.active {
      background: var(--color-acento);
      color: var(--color-texto-claro);
    }

    .vista-contenido {
      flex: 1;
      padding: var(--espaciado-md);
      overflow-y: auto;
    }

    .mensaje-form {
      background: var(--color-fondo-medio);
      padding: var(--espaciado-md);
      border-radius: 8px;
      border: 1px solid var(--color-acento);
      margin-bottom: var(--espaciado-md);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--espaciado-md);
      margin-bottom: var(--espaciado-md);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--espaciado-xs);
      margin-bottom: var(--espaciado-md);
    }

    .form-group label {
      color: var(--color-acento);
      font-weight: 600;
      font-size: 0.9rem;
    }

    .form-input,
    .form-select,
    .form-textarea {
      padding: var(--espaciado-sm);
      background: var(--color-fondo-oscuro);
      border: 1px solid rgba(245, 245, 245, 0.3);
      border-radius: 6px;
      color: var(--color-texto-claro);
      font-size: 0.9rem;
      transition: border-color var(--transicion-rapida);
    }

    .form-input:focus,
    .form-select:focus,
    .form-textarea:focus {
      outline: none;
      border-color: var(--color-acento);
      box-shadow: 0 0 5px rgba(255, 107, 53, 0.3);
    }

    .form-textarea {
      resize: vertical;
      min-height: 120px;
      font-family: inherit;
    }

    .char-count {
      color: rgba(245, 245, 245, 0.6);
      font-size: 0.8rem;
      text-align: right;
    }

    .form-actions {
      display: flex;
      gap: var(--espaciado-sm);
      justify-content: flex-end;
      margin-top: var(--espaciado-md);
    }

    .btn-primario,
    .btn-secundario {
      padding: var(--espaciado-sm) var(--espaciado-md);
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transicion-rapida);
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
    }

    .btn-primario {
      background: var(--color-acento);
      color: var(--color-texto-claro);
    }

    .btn-primario:hover:not(:disabled) {
      background: #ff8c69;
      transform: translateY(-1px);
    }

    .btn-primario:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secundario {
      background: transparent;
      color: var(--color-acento);
      border: 1px solid var(--color-acento);
    }

    .btn-secundario:hover {
      background: rgba(255, 107, 53, 0.1);
    }

    .consejos-mensaje {
      background: rgba(74, 93, 35, 0.1);
      padding: var(--espaciado-md);
      border-radius: 8px;
      border: 1px solid var(--color-supervivencia);
    }

    .consejos-mensaje h4 {
      color: var(--color-supervivencia);
      margin-bottom: var(--espaciado-sm);
    }

    .consejos-mensaje ul {
      list-style: none;
      padding: 0;
    }

    .consejos-mensaje li {
      color: rgba(245, 245, 245, 0.8);
      margin-bottom: var(--espaciado-xs);
      padding-left: 20px;
      position: relative;
    }

    .consejos-mensaje li::before {
      content: '💡';
      position: absolute;
      left: 0;
    }

    .mensajes-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--espaciado-sm);
      margin-bottom: var(--espaciado-md);
    }

    .stat-card {
      background: var(--color-fondo-medio);
      padding: var(--espaciado-sm);
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: var(--espaciado-sm);
      border: 1px solid var(--color-acento);
    }

    .stat-card .stat-icon {
      font-size: 2rem;
    }

    .stat-value {
      display: block;
      color: var(--color-acento);
      font-weight: 700;
      font-size: 1.5rem;
      font-family: var(--fuente-titulo);
    }

    .stat-label {
      display: block;
      color: rgba(245, 245, 245, 0.7);
      font-size: 0.8rem;
    }

    .mensajes-lista {
      display: flex;
      flex-direction: column;
      gap: var(--espaciado-md);
    }

    .mensaje-item {
      background: var(--color-fondo-medio);
      border-radius: 8px;
      padding: var(--espaciado-md);
      border-left: 4px solid var(--color-acento);
    }

    .mensaje-item.estado-respondido {
      border-left-color: var(--color-supervivencia);
    }

    .mensaje-item.estado-leido {
      border-left-color: var(--color-secundario);
    }

    .mensaje-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--espaciado-sm);
    }

    .mensaje-info h4 {
      color: var(--color-texto-claro);
      margin: 0 0 var(--espaciado-xs) 0;
      font-size: 1.1rem;
    }

    .mensaje-meta {
      display: flex;
      gap: var(--espaciado-sm);
      flex-wrap: wrap;
      align-items: center;
    }

    .categoria-badge,
    .prioridad-badge,
    .estado-badge {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .categoria-badge[data-categoria="bug"] {
      background: rgba(178, 34, 34, 0.2);
      color: var(--color-peligro);
    }

    .categoria-badge[data-categoria="sugerencia"] {
      background: rgba(255, 107, 53, 0.2);
      color: var(--color-acento);
    }

    .categoria-badge[data-categoria="consulta"] {
      background: rgba(74, 93, 35, 0.2);
      color: var(--color-supervivencia);
    }

    .categoria-badge[data-categoria="feedback"] {
      background: rgba(139, 69, 19, 0.2);
      color: var(--color-secundario);
    }

    .prioridad-badge[data-prioridad="urgente"] {
      background: rgba(178, 34, 34, 0.2);
      color: var(--color-peligro);
    }

    .prioridad-badge[data-prioridad="alta"] {
      background: rgba(255, 107, 53, 0.2);
      color: var(--color-acento);
    }

    .prioridad-badge[data-prioridad="media"] {
      background: rgba(255, 215, 0, 0.2);
      color: #ffd700;
    }

    .prioridad-badge[data-prioridad="baja"] {
      background: rgba(74, 93, 35, 0.2);
      color: var(--color-supervivencia);
    }

    .estado-badge[data-estado="enviado"] {
      background: rgba(255, 107, 53, 0.2);
      color: var(--color-acento);
    }

    .estado-badge[data-estado="leido"] {
      background: rgba(139, 69, 19, 0.2);
      color: var(--color-secundario);
    }

    .estado-badge[data-estado="respondido"] {
      background: rgba(74, 93, 35, 0.2);
      color: var(--color-supervivencia);
    }

    .fecha {
      color: rgba(245, 245, 245, 0.6);
      font-size: 0.8rem;
    }

    .mensaje-contenido {
      color: rgba(245, 245, 245, 0.8);
      line-height: 1.5;
      margin-bottom: var(--espaciado-sm);
    }

    .mensaje-respuesta {
      background: rgba(74, 93, 35, 0.1);
      padding: var(--espaciado-sm);
      border-radius: 6px;
      border: 1px solid var(--color-supervivencia);
      margin-top: var(--espaciado-sm);
    }

    .respuesta-header {
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
      margin-bottom: var(--espaciado-xs);
      color: var(--color-supervivencia);
      font-size: 0.9rem;
    }

    .respuesta-fecha {
      margin-left: auto;
      color: rgba(245, 245, 245, 0.6);
      font-size: 0.8rem;
    }

    .respuesta-contenido {
      color: rgba(245, 245, 245, 0.9);
      line-height: 1.5;
      margin: 0;
    }

    .no-mensajes {
      text-align: center;
      padding: var(--espaciado-xl);
    }

    .empty-state {
      color: rgba(245, 245, 245, 0.6);
    }

    .empty-icon {
      font-size: 4rem;
      display: block;
      margin-bottom: var(--espaciado-md);
    }

    .empty-state h4 {
      color: var(--color-acento);
      margin-bottom: var(--espaciado-sm);
    }

    .plantillas-info {
      background: rgba(255, 107, 53, 0.1);
      padding: var(--espaciado-md);
      border-radius: 8px;
      border: 1px solid var(--color-acento);
      margin-bottom: var(--espaciado-md);
    }

    .plantillas-info h4 {
      color: var(--color-acento);
      margin-bottom: var(--espaciado-xs);
    }

    .plantillas-info p {
      color: rgba(245, 245, 245, 0.8);
      margin: 0;
    }

    .plantillas-lista {
      display: flex;
      flex-direction: column;
      gap: var(--espaciado-md);
    }

    .plantilla-item {
      background: var(--color-fondo-medio);
      padding: var(--espaciado-md);
      border-radius: 8px;
      border: 1px solid var(--color-acento);
    }

    .plantilla-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--espaciado-sm);
    }

    .plantilla-header h5 {
      color: var(--color-texto-claro);
      margin: 0;
    }

    .btn-usar-plantilla {
      background: var(--color-supervivencia);
      color: var(--color-texto-claro);
      border: none;
      padding: var(--espaciado-xs) var(--espaciado-sm);
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all var(--transicion-rapida);
    }

    .btn-usar-plantilla:hover {
      background: #6b8e23;
      transform: translateY(-1px);
    }

    .plantilla-preview {
      color: rgba(245, 245, 245, 0.7);
      font-size: 0.9rem;
      line-height: 1.4;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .mensajeria-container {
        height: 500px;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 0;
      }

      .mensajeria-nav {
        flex-wrap: wrap;
      }

      .nav-btn {
        flex: 1;
        min-width: 120px;
      }

      .header-stats {
        flex-direction: column;
        gap: var(--espaciado-xs);
      }

      .mensaje-meta {
        flex-direction: column;
        align-items: flex-start;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn-primario,
      .btn-secundario {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class MensajeriaPremiumComponent implements OnInit {
  vistaActual: 'nuevo' | 'enviados' | 'plantillas' = 'nuevo';
  mensajesEnviados: MensajeAdmin[] = [];
  estadisticas: EstadisticasMensajeria = {
    totalEnviados: 0,
    pendientes: 0,
    respondidos: 0,
    tiempoRespuestaPromedio: 24
  };
  
  nuevoMensaje = {
    asunto: '',
    mensaje: '',
    categoria: '' as 'bug' | 'sugerencia' | 'consulta' | 'feedback' | 'otro' | '',
    prioridad: '' as 'baja' | 'media' | 'alta' | 'urgente' | ''
  };

  enviandoMensaje = false;
  plantillasDisponibles: { [key: string]: string } = {};

  constructor(private mensajeriaService: MensajeriaService) {}

  ngOnInit() {
    this.cargarMensajes();
    this.cargarEstadisticas();
    this.cargarPlantillas();
  }

  /**
   * Carga los mensajes del usuario
   */
  private cargarMensajes() {
    this.mensajeriaService.obtenerMensajesUsuario().subscribe(mensajes => {
      this.mensajesEnviados = mensajes.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });
  }

  /**
   * Carga las estadísticas
   */
  private cargarEstadisticas() {
    this.mensajeriaService.estadisticas$.subscribe(estadisticas => {
      this.estadisticas = estadisticas;
    });
  }

  /**
   * Carga las plantillas disponibles
   */
  private cargarPlantillas() {
    this.plantillasDisponibles = this.mensajeriaService.obtenerPlantillasMensajes();
  }

  /**
   * Cambia la vista actual
   */
  cambiarVista(vista: 'nuevo' | 'enviados' | 'plantillas') {
    this.vistaActual = vista;
  }

  /**
   * Envía un nuevo mensaje
   */
  enviarMensaje() {
    if (!this.nuevoMensaje.asunto.trim() || !this.nuevoMensaje.mensaje.trim() || 
        !this.nuevoMensaje.categoria || !this.nuevoMensaje.prioridad) {
      return;
    }

    this.enviandoMensaje = true;

    this.mensajeriaService.enviarMensaje({
      asunto: this.nuevoMensaje.asunto,
      mensaje: this.nuevoMensaje.mensaje,
      categoria: this.nuevoMensaje.categoria,
      prioridad: this.nuevoMensaje.prioridad
    }).subscribe(success => {
      this.enviandoMensaje = false;
      
      if (success) {
        this.limpiarFormulario();
        this.cargarMensajes();
        this.vistaActual = 'enviados';
        
        // Mostrar mensaje de confirmación
        alert('¡Mensaje enviado correctamente! Recibirás una respuesta pronto.');
      } else {
        alert('Error al enviar el mensaje. Por favor, inténtalo de nuevo.');
      }
    });
  }

  /**
   * Limpia el formulario
   */
  limpiarFormulario() {
    this.nuevoMensaje = {
      asunto: '',
      mensaje: '',
      categoria: '',
      prioridad: ''
    };
  }

  /**
   * Usa una plantilla predefinida
   */
  usarPlantilla(key: string, contenido: string) {
    this.nuevoMensaje.mensaje = contenido;
    
    // Configurar categoría y asunto según la plantilla
    switch (key) {
      case 'bug_reporte':
        this.nuevoMensaje.categoria = 'bug';
        this.nuevoMensaje.asunto = 'Reporte de Error en la Aplicación';
        this.nuevoMensaje.prioridad = 'alta';
        break;
      case 'sugerencia_mejora':
        this.nuevoMensaje.categoria = 'sugerencia';
        this.nuevoMensaje.asunto = 'Sugerencia de Mejora';
        this.nuevoMensaje.prioridad = 'media';
        break;
      case 'consulta_general':
        this.nuevoMensaje.categoria = 'consulta';
        this.nuevoMensaje.asunto = 'Consulta General';
        this.nuevoMensaje.prioridad = 'media';
        break;
      case 'feedback_positivo':
        this.nuevoMensaje.categoria = 'feedback';
        this.nuevoMensaje.asunto = 'Feedback Positivo';
        this.nuevoMensaje.prioridad = 'baja';
        break;
      case 'problema_tecnico':
        this.nuevoMensaje.categoria = 'bug';
        this.nuevoMensaje.asunto = 'Problema Técnico';
        this.nuevoMensaje.prioridad = 'alta';
        break;
    }

    this.vistaActual = 'nuevo';
  }

  /**
   * Obtiene el texto de categoría
   */
  getCategoriaTexto(categoria: string): string {
    const categorias: { [key: string]: string } = {
      'bug': 'Error',
      'sugerencia': 'Sugerencia',
      'consulta': 'Consulta',
      'feedback': 'Feedback',
      'otro': 'Otro'
    };
    return categorias[categoria] || categoria;
  }

  /**
   * Obtiene el texto de prioridad
   */
  getPrioridadTexto(prioridad: string): string {
    const prioridades: { [key: string]: string } = {
      'baja': 'Baja',
      'media': 'Media',
      'alta': 'Alta',
      'urgente': 'Urgente'
    };
    return prioridades[prioridad] || prioridad;
  }

  /**
   * Obtiene el texto de estado
   */
  getEstadoTexto(estado: string): string {
    const estados: { [key: string]: string } = {
      'enviado': 'Enviado',
      'leido': 'Leído',
      'respondido': 'Respondido',
      'cerrado': 'Cerrado'
    };
    return estados[estado] || estado;
  }

  /**
   * Obtiene el título de la plantilla
   */
  getPlantillaTitulo(key: string): string {
    const titulos: { [key: string]: string } = {
      'bug_reporte': '🐛 Reporte de Error',
      'sugerencia_mejora': '💡 Sugerencia de Mejora',
      'consulta_general': '❓ Consulta General',
      'feedback_positivo': '⭐ Feedback Positivo',
      'problema_tecnico': '🔧 Problema Técnico'
    };
    return titulos[key] || key;
  }
}