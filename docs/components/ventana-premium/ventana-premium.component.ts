/**
 * Componente Ventana Premium
 * Contenido exclusivo para usuarios autenticados con chat, mapa y mensajería
 */

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService, Usuario } from '../../services/auth.service';
import { ChatPremiumComponent } from '../chat-premium/chat-premium.component';
import { MapaPremiumComponent } from '../mapa-premium/mapa-premium.component';
import { MensajeriaPremiumComponent } from '../mensajeria-premium/mensajeria-premium.component';

interface ContenidoPremium {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'video' | 'imagen' | 'audio' | 'documento';
  url: string;
  videoUrl?: string; // Nueva propiedad para el enlace de YouTube
  fechaLanzamiento: Date;
  exclusivo: boolean;
}

@Component({
  selector: 'app-ventana-premium',
  standalone: true,
  imports: [CommonModule, ChatPremiumComponent, MapaPremiumComponent, MensajeriaPremiumComponent],
  template: `
    <div class="premium-overlay" [class.visible]="mostrarVentana" (click)="cerrarVentanaPremium($event)">
      <div class="premium-container">
        <!-- Encabezado Premium -->
        <div class="premium-header">
          <div class="premium-badge">
            <span class="badge-icon">👑</span>
            <span class="badge-text">CONTENIDO PREMIUM</span>
          </div>
          <button class="btn-cerrar-premium" (click)="cerrarVentanaPremium()">
            ×
          </button>
        </div>

        <!-- Bienvenida personalizada -->
        <div class="welcome-section" *ngIf="usuario">
          <h2 class="welcome-title">
            ¡Bienvenido, {{ usuario.nombre }}!
          </h2>
          <p class="welcome-subtitle">
            Accede a contenido exclusivo de The Last of Us que solo los supervivientes registrados pueden ver.
          </p>
        </div>

        <!-- Navegación de contenido premium -->
        <div class="premium-nav">
          <button 
            class="nav-tab"
            [class.active]="seccionActiva === 'chat'"
            (click)="cambiarSeccion('chat')"
          >
            💬 Chat de Supervivientes
          </button>
          <button 
            class="nav-tab"
            [class.active]="seccionActiva === 'mapa'"
            (click)="cambiarSeccion('mapa')"
          >
            🗺️ Mapa y Consejos
          </button>
          <button 
            class="nav-tab"
            [class.active]="seccionActiva === 'mensajeria'"
            (click)="cambiarSeccion('mensajeria')"
          >
            📧 Mensajes Admin
          </button>
          <button 
            class="nav-tab"
            [class.active]="seccionActiva === 'exclusivos'"
            (click)="cambiarSeccion('exclusivos')"
          >
            🎬 Videos Exclusivos
          </button>
          <button 
            class="nav-tab"
            [class.active]="seccionActiva === 'behind'"
            (click)="cambiarSeccion('behind')"
          >
            🎭 Behind the Scenes
          </button>
        </div>

        <!-- Contenido por secciones -->
        <div class="premium-content">
          
          <!-- Chat de Supervivientes -->
          <div class="content-section" *ngIf="seccionActiva === 'chat'">
            <div class="section-intro">
              <h3 class="section-title">💬 Chat de Supervivientes</h3>
              <p class="section-description">
                Conecta con otros supervivientes, comparte estrategias y mantente informado sobre las últimas amenazas en tiempo real.
              </p>
            </div>
            <app-chat-premium></app-chat-premium>
          </div>

          <!-- Mapa y Consejos -->
          <div class="content-section" *ngIf="seccionActiva === 'mapa'">
            <div class="section-intro">
              <h3 class="section-title">🗺️ Mapa de Supervivencia</h3>
              <p class="section-description">
                Explora ubicaciones secretas, encuentra tesoros ocultos y aprende consejos de supervivencia de expertos.
              </p>
            </div>
            <app-mapa-premium></app-mapa-premium>
          </div>

          <!-- Mensajería con Admin -->
          <div class="content-section" *ngIf="seccionActiva === 'mensajeria'">
            <div class="section-intro">
              <h3 class="section-title">📧 Centro de Mensajería</h3>
              <p class="section-description">
                Envía comentarios, reporta problemas o solicita ayuda directamente al equipo de administración.
              </p>
            </div>
            <app-mensajeria-premium></app-mensajeria-premium>
          </div>

          <!-- Videos Exclusivos -->
          <div class="content-section" *ngIf="seccionActiva === 'exclusivos'">
            <h3 class="section-title">Videos Exclusivos</h3>
            <div class="content-grid">
              <div class="premium-item" *ngFor="let item of videosExclusivos" (click)="abrirVideo(item)">
                <div class="item-thumbnail">
                  <img [src]="item.url" [alt]="item.titulo">
                  <div class="play-overlay">
                    <span class="play-btn">▶️</span>
                  </div>
                  <div class="exclusive-badge">EXCLUSIVO</div>
                </div>
                <div class="item-info">
                  <h4>{{ item.titulo }}</h4>
                  <p>{{ item.descripcion }}</p>
                  <span class="release-date">{{ item.fechaLanzamiento | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Behind the Scenes -->
          <div class="content-section" *ngIf="seccionActiva === 'behind'">
            <h3 class="section-title">Behind the Scenes</h3>
            <div class="behind-content">
              <div class="behind-item">
                <img src="https://static1.thegamerimages.com/wordpress/wp-content/uploads/2023/01/the-last-of-us-part-2-abby-and-lev-on-a-horse.jpg" alt="Making of The Last of Us">
                <div class="behind-info">
                  <h4>El Proceso de Creación</h4>
                  <p>Descubre cómo se crearon las escenas más emotivas de la serie, desde la conceptualización hasta la grabación final.</p>
                  <button class="btn-premium">Ver Documental</button>
                </div>
              </div>
              <div class="behind-item">
                <img src="https://i.ytimg.com/vi/CRdj02QuoXI/maxresdefault.jpg" alt="Actores de The Last of Us">
                <div class="behind-info">
                  <h4>Entrevistas con el Reparto</h4>
                  <p>Conversaciones íntimas con los actores sobre sus personajes y las emociones que experimentaron durante el rodaje.</p>
                  <button class="btn-premium">Ver Entrevistas</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Estadísticas del usuario -->
        <div class="user-stats">
          <h4>Tu Progreso como Superviviente</h4>
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-icon">📅</span>
              <div class="stat-info">
                <span class="stat-value">{{ diasRegistrado }}</span>
                <span class="stat-label">Días como superviviente</span>
              </div>
            </div>
            <div class="stat-card">
              <span class="stat-icon">💬</span>
              <div class="stat-info">
                <span class="stat-value">{{ mensajesEnviados }}</span>
                <span class="stat-label">Mensajes en chat</span>
              </div>
            </div>
            <div class="stat-card">
              <span class="stat-icon">🗺️</span>
              <div class="stat-info">
                <span class="stat-value">{{ ubicacionesExploradas }}</span>
                <span class="stat-label">Ubicaciones exploradas</span>
              </div>
            </div>
            <div class="stat-card">
              <span class="stat-icon">🏆</span>
              <div class="stat-info">
                <span class="stat-value">{{ nivelSuperviviencia }}</span>
                <span class="stat-label">Nivel de supervivencia</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensaje especial -->
        <div class="special-message">
          <div class="message-icon">🧟‍♂️</div>
          <h4>Mensaje Especial</h4>
          <p>
            Como superviviente registrado, tienes acceso a este contenido que no está disponible para visitantes casuales. 
            ¡Disfruta de esta experiencia única en el mundo post-apocalíptico!
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .premium-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      backdrop-filter: blur(10px);
      z-index: 5000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: all var(--transicion-media);
      padding: var(--espaciado-sm);
    }

    .premium-overlay.visible {
      opacity: 1;
      visibility: visible;
    }

    .premium-container {
      background: linear-gradient(135deg, var(--color-fondo-medio), var(--color-fondo-oscuro));
      border-radius: 20px;
      width: 100%;
      max-width: 1200px;
      max-height: 90vh;
      overflow-y: auto;
      border: 3px solid var(--color-acento);
      box-shadow: 0 0 50px rgba(255, 107, 53, 0.3);
      animation: premiumSlideIn 0.5s ease-out;
      position: relative;
    }

    .premium-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--espaciado-md);
      border-bottom: 2px solid var(--color-acento);
      background: linear-gradient(90deg, var(--color-acento), #ff8c69);
    }

    .premium-badge {
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
      color: var(--color-texto-claro);
      font-family: var(--fuente-titulo);
      font-weight: 900;
    }

    .badge-icon {
      font-size: 1.5rem;
      animation: pulso 2s ease-in-out infinite;
    }

    .badge-text {
      font-size: 1.2rem;
      letter-spacing: 2px;
    }

    .btn-cerrar-premium {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid var(--color-texto-claro);
      border-radius: 50%;
      color: var(--color-texto-claro);
      font-size: 1.5rem;
      cursor: pointer;
      transition: all var(--transicion-rapida);
    }

    .btn-cerrar-premium:hover {
      background: var(--color-peligro);
      transform: scale(1.1);
    }

    .welcome-section {
      text-align: center;
      padding: var(--espaciado-lg) var(--espaciado-md);
      background: rgba(255, 107, 53, 0.1);
    }

    .welcome-title {
      color: var(--color-acento);
      font-size: 2rem;
      margin-bottom: var(--espaciado-sm);
      font-family: var(--fuente-titulo);
    }

    .welcome-subtitle {
      color: rgba(245, 245, 245, 0.9);
      font-size: 1.1rem;
      line-height: 1.6;
    }

    .premium-nav {
      display: flex;
      justify-content: center;
      gap: var(--espaciado-xs);
      padding: var(--espaciado-md);
      flex-wrap: wrap;
      background: var(--color-fondo-oscuro);
      border-bottom: 1px solid var(--color-acento);
    }

    .nav-tab {
      padding: var(--espaciado-xs) var(--espaciado-sm);
      background: transparent;
      border: 2px solid var(--color-supervivencia);
      color: var(--color-supervivencia);
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transicion-media);
      white-space: nowrap;
      font-size: 0.9rem;
    }

    .nav-tab:hover,
    .nav-tab.active {
      background: var(--color-supervivencia);
      color: var(--color-texto-claro);
      transform: translateY(-2px);
    }

    .premium-content {
      padding: var(--espaciado-md);
      min-height: 400px;
    }

    .content-section {
      animation: fadeInUp 0.5s ease-out;
    }

    .section-intro {
      margin-bottom: var(--espaciado-md);
      text-align: center;
    }

    .section-title {
      color: var(--color-acento);
      font-family: var(--fuente-titulo);
      font-size: 1.5rem;
      margin-bottom: var(--espaciado-sm);
    }

    .section-description {
      color: rgba(245, 245, 245, 0.8);
      line-height: 1.6;
      max-width: 600px;
      margin: 0 auto;
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--espaciado-md);
    }

    .premium-item {
      background: var(--color-fondo-oscuro);
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--color-acento);
      transition: all var(--transicion-media);
      cursor: pointer;
    }

    .premium-item:hover {
      transform: translateY(-5px);
      box-shadow: var(--sombra-fuerte);
    }

    .item-thumbnail {
      position: relative;
      height: 150px;
      overflow: hidden;
    }

    .item-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .play-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity var(--transicion-media);
    }

    .premium-item:hover .play-overlay {
      opacity: 1;
    }

    .play-btn {
      font-size: 2rem;
      color: var(--color-acento);
    }

    .exclusive-badge {
      position: absolute;
      top: var(--espaciado-xs);
      right: var(--espaciado-xs);
      background: var(--color-acento);
      color: var(--color-texto-claro);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .item-info {
      padding: var(--espaciado-sm);
    }

    .item-info h4 {
      color: var(--color-texto-claro);
      margin-bottom: var(--espaciado-xs);
    }

    .item-info p {
      color: rgba(245, 245, 245, 0.8);
      font-size: 0.9rem;
      margin-bottom: var(--espaciado-xs);
    }

    .release-date {
      color: var(--color-acento);
      font-size: 0.8rem;
      font-weight: 600;
    }

    .behind-content {
      display: flex;
      flex-direction: column;
      gap: var(--espaciado-md);
    }

    .behind-item {
      display: flex;
      gap: var(--espaciado-md);
      background: var(--color-fondo-oscuro);
      border-radius: 12px;
      padding: var(--espaciado-md);
      border: 1px solid var(--color-supervivencia);
    }

    .behind-item img {
      width: 150px;
      height: 100px;
      object-fit: cover;
      border-radius: 8px;
    }

    .behind-info {
      flex: 1;
    }

    .behind-info h4 {
      color: var(--color-texto-claro);
      margin-bottom: var(--espaciado-xs);
    }

    .behind-info p {
      color: rgba(245, 245, 245, 0.8);
      margin-bottom: var(--espaciado-sm);
    }

    .btn-premium {
      background: var(--color-supervivencia);
      color: var(--color-texto-claro);
      border: none;
      padding: var(--espaciado-xs) var(--espaciado-sm);
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transicion-rapida);
    }

    .btn-premium:hover {
      background: #6b8e23;
      transform: translateY(-2px);
    }

    .user-stats {
      margin: var(--espaciado-lg) var(--espaciado-md) var(--espaciado-md);
      padding: var(--espaciado-md);
      background: rgba(74, 93, 35, 0.1);
      border-radius: 12px;
      border: 1px solid var(--color-supervivencia);
    }

    .user-stats h4 {
      color: var(--color-supervivencia);
      text-align: center;
      margin-bottom: var(--espaciado-md);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--espaciado-sm);
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--espaciado-sm);
      padding: var(--espaciado-sm);
      background: var(--color-fondo-oscuro);
      border-radius: 8px;
    }

    .stat-icon {
      font-size: 1.5rem;
    }

    .stat-value {
      display: block;
      color: var(--color-supervivencia);
      font-weight: 700;
      font-size: 1.2rem;
    }

    .stat-label {
      display: block;
      color: rgba(245, 245, 245, 0.7);
      font-size: 0.8rem;
    }

    .special-message {
      margin: var(--espaciado-md);
      padding: var(--espaciado-lg);
      background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(74, 93, 35, 0.1));
      border-radius: 12px;
      border: 2px solid var(--color-acento);
      text-align: center;
    }

    .message-icon {
      font-size: 3rem;
      margin-bottom: var(--espaciado-sm);
    }

    .special-message h4 {
      color: var(--color-acento);
      margin-bottom: var(--espaciado-sm);
    }

    .special-message p {
      color: rgba(245, 245, 245, 0.9);
      line-height: 1.6;
    }

    @keyframes premiumSlideIn {
      from {
        transform: scale(0.8) translateY(-50px);
        opacity: 0;
      }
      to {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .premium-container {
        max-width: 95vw;
        max-height: 95vh;
      }

      .premium-nav {
        flex-direction: column;
        align-items: center;
      }

      .nav-tab {
        width: 200px;
        text-align: center;
      }

      .behind-item {
        flex-direction: column;
        text-align: center;
      }

      .behind-item img {
        width: 100%;
        height: 150px;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .welcome-title {
        font-size: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .premium-nav {
        padding: var(--espaciado-sm);
      }

      .nav-tab {
        width: 100%;
        font-size: 0.8rem;
      }
    }
  `]
})
export class VentanaPremiumComponent implements OnInit, OnDestroy, OnChanges {
  @Input() mostrarManualmente = false;
  @Output() cerrarVentana = new EventEmitter<void>();

  mostrarVentana = false;
  usuario: Usuario | null = null;
  seccionActiva = 'chat';
  
  // Datos del usuario
  diasRegistrado = 0;
  mensajesEnviados = 0;
  ubicacionesExploradas = 0;
  nivelSuperviviencia = 'Novato';
  
  // Contenido premium
  videosExclusivos: ContenidoPremium[] = [];
  
  private subscription?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.subscription = this.authService.autenticado$.subscribe(autenticado => {
      if (autenticado) {
        this.usuario = this.authService.usuarioActual;
        this.calcularEstadisticas();
        this.cargarContenidoPremium();
        
        // Solo mostrar automáticamente al registrarse, no al hacer login
        if (!this.mostrarManualmente) {
          setTimeout(() => {
            this.mostrarVentana = true;
            document.body.style.overflow = 'hidden';
          }, 1000);
        }
      } else {
        this.mostrarVentana = false;
        document.body.style.overflow = 'auto';
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['mostrarManualmente'] && this.mostrarManualmente && this.authService.estaAutenticado) {
      this.mostrarVentana = true;
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    document.body.style.overflow = 'auto';
  }

  /**
   * Calcula las estadísticas del usuario
   */
  private calcularEstadisticas() {
    if (this.usuario) {
      const fechaRegistro = new Date(this.usuario.fechaRegistro);
      const ahora = new Date();
      this.diasRegistrado = Math.floor((ahora.getTime() - fechaRegistro.getTime()) / (1000 * 60 * 60 * 24));
      
      // Simular estadísticas
      this.mensajesEnviados = Math.floor(Math.random() * 50) + 1;
      this.ubicacionesExploradas = Math.floor(Math.random() * 10) + 1;
      
      if (this.diasRegistrado < 7) {
        this.nivelSuperviviencia = 'Novato';
      } else if (this.diasRegistrado < 30) {
        this.nivelSuperviviencia = 'Superviviente';
      } else {
        this.nivelSuperviviencia = 'Veterano';
      }
    }
  }

  /**
   * Carga el contenido premium exclusivo
   */
  private cargarContenidoPremium() {
    this.videosExclusivos = [
      {
        id: 'video1',
        titulo: 'Escenas Eliminadas: El Pasado de Joel',
        descripcion: 'Secuencias nunca antes vistas que revelan más sobre el pasado de Joel Miller.',
        tipo: 'video',
        url: 'https://i.f1g.fr/media/cms/1200x630_crop/2025/04/14/75af2cd534a7effa4d0d76d782de9448436cdd2625a3fbe0a489e33583f839a5.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=FnKrLgd60uU',
        fechaLanzamiento: new Date('2027-06-27'),
        exclusivo: true
      },
      {
        id: 'video2',
        titulo: 'Trailer Alternativo: La Venganza de Ellie',
        descripcion: 'Una versión alternativa del trailer oficial con escenas adicionales.',
        tipo: 'video',
        url: 'https://img.odcdn.com.br/wp-content/uploads/2025/04/Design-sem-nome-43-1920x1080.png',
        videoUrl: 'https://www.youtube.com/watch?v=YwpOrsT457A',
        fechaLanzamiento: new Date('2027-06-27'),
        exclusivo: true
      },
      {
        id: 'video3',
        titulo: 'Documental: La Creación de los Infectados',
        descripcion: 'Proceso completo de diseño y creación de los diferentes tipos de infectados.',
        tipo: 'video',
        url: 'https://uploads.worldanvil.com/uploads/images/2b15c848c6f3e46aba209c5e36443d3a.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=5eT80DRgwzQ',
        fechaLanzamiento: new Date('2027-06-27'),
        exclusivo: true
      }
    ];
  }

  /**
   * Abre un video de YouTube en una nueva pestaña
   */
  abrirVideo(video: ContenidoPremium) {
    if (video.videoUrl) {
      window.open(video.videoUrl, '_blank');
    }
  }

  /**
   * Cambia la sección activa del contenido premium
   */
  cambiarSeccion(seccion: string) {
    this.seccionActiva = seccion;
  }

  /**
   * Cierra la ventana premium
   */
  cerrarVentanaPremium(event?: Event) {
    if (event && event.target !== event.currentTarget) {
      return;
    }
    
    this.mostrarVentana = false;
    document.body.style.overflow = 'auto';
    this.cerrarVentana.emit();
  }
}