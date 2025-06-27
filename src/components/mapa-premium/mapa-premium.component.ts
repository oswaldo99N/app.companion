/**
 * Componente Mapa Premium
 * Mapa interactivo con consejos y tesoros
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapaService, UbicacionMapa, ConsejoSupervivencia } from '../../services/mapa.service';

@Component({
  selector: 'app-mapa-premium',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mapa-container">
      <!-- Header del mapa -->
      <div class="mapa-header">
        <h3>
          <span class="mapa-icon">🗺️</span>
          Mapa de Supervivencia
        </h3>
        <div class="mapa-controles">
          <button 
            class="control-btn"
            [class.active]="vistaActual === 'mapa'"
            (click)="cambiarVista('mapa')"
          >
            🗺️ Mapa
          </button>
          <button 
            class="control-btn"
            [class.active]="vistaActual === 'consejos'"
            (click)="cambiarVista('consejos')"
          >
            💡 Consejos
          </button>
          <button 
            class="control-btn"
            [class.active]="vistaActual === 'tesoros'"
            (click)="cambiarVista('tesoros')"
          >
            💎 Tesoros
          </button>
        </div>
      </div>

      <!-- Vista del Mapa -->
      <div class="mapa-content" *ngIf="vistaActual === 'mapa'">
        <div class="mapa-interactivo">
          <!-- Fondo del mapa -->
          <div class="mapa-fondo">
            <img src="https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg" alt="Mapa del mundo">
          </div>

          <!-- Marcadores de ubicaciones -->
          <div 
            class="marcador"
            *ngFor="let ubicacion of ubicaciones"
            [style.left.%]="ubicacion.coordenadas.x"
            [style.top.%]="ubicacion.coordenadas.y"
            [class]="'marcador-' + ubicacion.tipo"
            [class.descubierto]="ubicacion.descubierto"
            (click)="seleccionarUbicacion(ubicacion)"
            [title]="ubicacion.nombre"
          >
            <span class="marcador-icon">{{ getIconoTipo(ubicacion.tipo) }}</span>
            <div class="marcador-pulse" *ngIf="!ubicacion.descubierto"></div>
          </div>

          <!-- Panel de información de ubicación -->
          <div class="ubicacion-info" *ngIf="ubicacionSeleccionada" [class.visible]="ubicacionSeleccionada">
            <div class="info-header">
              <h4>{{ ubicacionSeleccionada.nombre }}</h4>
              <button class="cerrar-info" (click)="cerrarInfo()">×</button>
            </div>
            
            <div class="info-content">
              <div class="ubicacion-imagen">
                <img [src]="ubicacionSeleccionada.imagen" [alt]="ubicacionSeleccionada.nombre">
                <div class="dificultad-badge" [attr.data-dificultad]="ubicacionSeleccionada.dificultad">
                  {{ getDificultadTexto(ubicacionSeleccionada.dificultad) }}
                </div>
              </div>

              <p class="ubicacion-descripcion">{{ ubicacionSeleccionada.descripcion }}</p>

              <div class="consejos-ubicacion" *ngIf="ubicacionSeleccionada.consejos.length > 0">
                <h5>💡 Consejos:</h5>
                <ul>
                  <li *ngFor="let consejo of ubicacionSeleccionada.consejos">{{ consejo }}</li>
                </ul>
              </div>

              <div class="recompensas-ubicacion" *ngIf="ubicacionSeleccionada.recompensas?.length">
                <h5>🎁 Recompensas:</h5>
                <div class="recompensas-lista">
                  <span 
                    class="recompensa-item"
                    *ngFor="let recompensa of ubicacionSeleccionada.recompensas"
                  >
                    {{ recompensa }}
                  </span>
                </div>
              </div>

              <div class="ubicacion-acciones">
                <button 
                  class="btn-accion"
                  *ngIf="!ubicacionSeleccionada.descubierto"
                  (click)="descubrirUbicacion(ubicacionSeleccionada.id)"
                >
                  🔍 Explorar Ubicación
                </button>
                <button 
                  class="btn-accion secundario"
                  (click)="marcarComoFavorito(ubicacionSeleccionada.id)"
                >
                  ⭐ Marcar Favorito
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Leyenda del mapa -->
        <div class="mapa-leyenda">
          <h4>Leyenda</h4>
          <div class="leyenda-items">
            <div class="leyenda-item">
              <span class="leyenda-icon refugio">🏠</span>
              <span>Refugios Seguros</span>
            </div>
            <div class="leyenda-item">
              <span class="leyenda-icon peligro">⚠️</span>
              <span>Zonas Peligrosas</span>
            </div>
            <div class="leyenda-item">
              <span class="leyenda-icon tesoro">💎</span>
              <span>Tesoros Ocultos</span>
            </div>
            <div class="leyenda-item">
              <span class="leyenda-icon recurso">🌿</span>
              <span>Recursos</span>
            </div>
            <div class="leyenda-item">
              <span class="leyenda-icon punto_interes">📍</span>
              <span>Puntos de Interés</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista de Consejos -->
      <div class="consejos-content" *ngIf="vistaActual === 'consejos'">
        <div class="consejos-filtros">
          <button 
            class="filtro-btn"
            [class.active]="filtroConsejos === 'todos'"
            (click)="filtrarConsejos('todos')"
          >
            Todos
          </button>
          <button 
            class="filtro-btn"
            [class.active]="filtroConsejos === 'combate'"
            (click)="filtrarConsejos('combate')"
          >
            Combate
          </button>
          <button 
            class="filtro-btn"
            [class.active]="filtroConsejos === 'sigilo'"
            (click)="filtrarConsejos('sigilo')"
          >
            Sigilo
          </button>
          <button 
            class="filtro-btn"
            [class.active]="filtroConsejos === 'recursos'"
            (click)="filtrarConsejos('recursos')"
          >
            Recursos
          </button>
          <button 
            class="filtro-btn"
            [class.active]="filtroConsejos === 'supervivencia'"
            (click)="filtrarConsejos('supervivencia')"
          >
            Supervivencia
          </button>
        </div>

        <div class="consejos-lista">
          <div 
            class="consejo-card"
            *ngFor="let consejo of consejosFiltrados"
            [class]="'importancia-' + consejo.importancia"
          >
            <div class="consejo-header">
              <h4>{{ consejo.titulo }}</h4>
              <span class="consejo-categoria">{{ getCategoriaTexto(consejo.categoria) }}</span>
            </div>
            <p class="consejo-descripcion">{{ consejo.descripcion }}</p>
            <div class="consejo-footer">
              <span class="importancia-badge" [attr.data-importancia]="consejo.importancia">
                {{ getImportanciaTexto(consejo.importancia) }}
              </span>
              <button class="btn-favorito" (click)="toggleFavoritoConsejo(consejo.id)">
                <span *ngIf="!esFavoritoConsejo(consejo.id)">⭐</span>
                <span *ngIf="esFavoritoConsejo(consejo.id)">⭐</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista de Tesoros -->
      <div class="tesoros-content" *ngIf="vistaActual === 'tesoros'">
        <div class="tesoros-stats">
          <div class="stat-card">
            <span class="stat-icon">💎</span>
            <div class="stat-info">
              <span class="stat-value">{{ tesorosDescubiertos }}</span>
              <span class="stat-label">Tesoros Encontrados</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🗺️</span>
            <div class="stat-info">
              <span class="stat-value">{{ ubicacionesDescubiertas }}</span>
              <span class="stat-label">Ubicaciones Exploradas</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🏆</span>
            <div class="stat-info">
              <span class="stat-value">{{ nivelExplorador }}</span>
              <span class="stat-label">Nivel de Explorador</span>
            </div>
          </div>
        </div>

        <div class="tesoros-lista">
          <div 
            class="tesoro-card"
            *ngFor="let tesoro of tesorosDisponibles"
            [class.descubierto]="tesoro.descubierto"
          >
            <div class="tesoro-imagen">
              <img [src]="tesoro.imagen" [alt]="tesoro.nombre">
              <div class="tesoro-overlay" *ngIf="!tesoro.descubierto">
                <span class="tesoro-misterio">?</span>
              </div>
            </div>
            <div class="tesoro-info">
              <h4>{{ tesoro.descubierto ? tesoro.nombre : 'Tesoro Misterioso' }}</h4>
              <p>{{ tesoro.descubierto ? tesoro.descripcion : 'Explora para descubrir este tesoro oculto.' }}</p>
              <div class="tesoro-pistas" *ngIf="!tesoro.descubierto && tesoro.consejos.length > 0">
                <h5>🔍 Pistas:</h5>
                <ul>
                  <li *ngFor="let pista of tesoro.consejos.slice(0, 2)">{{ pista }}</li>
                </ul>
              </div>
              <div class="tesoro-recompensas" *ngIf="tesoro.descubierto && tesoro.recompensas?.length">
                <h5>🎁 Recompensas obtenidas:</h5>
                <div class="recompensas-lista">
                  <span 
                    class="recompensa-item"
                    *ngFor="let recompensa of tesoro.recompensas"
                  >
                    {{ recompensa }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mapa-container {
      height: 600px;
      background: var(--color-fondo-oscuro);
      border-radius: 12px;
      border: 2px solid var(--color-supervivencia);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .mapa-header {
      background: linear-gradient(90deg, var(--color-supervivencia), #6b8e23);
      padding: var(--espaciado-sm);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--color-supervivencia);
    }

    .mapa-header h3 {
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
      color: var(--color-texto-claro);
      margin: 0;
      font-family: var(--fuente-titulo);
    }

    .mapa-icon {
      font-size: 1.5rem;
    }

    .mapa-controles {
      display: flex;
      gap: var(--espaciado-xs);
    }

    .control-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 6px;
      padding: var(--espaciado-xs) var(--espaciado-sm);
      color: var(--color-texto-claro);
      cursor: pointer;
      transition: all var(--transicion-rapida);
      font-size: 0.9rem;
      white-space: nowrap;
    }

    .control-btn:hover,
    .control-btn.active {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }

    .mapa-content {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .mapa-interactivo {
      flex: 1;
      position: relative;
      overflow: hidden;
    }

    .mapa-fondo {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .mapa-fondo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: sepia(20%) saturate(80%) brightness(70%);
    }

    .marcador {
      position: absolute;
      width: 30px;
      height: 30px;
      cursor: pointer;
      transform: translate(-50%, -50%);
      transition: all var(--transicion-media);
      z-index: 10;
    }

    .marcador:hover {
      transform: translate(-50%, -50%) scale(1.2);
    }

    .marcador-icon {
      display: block;
      width: 100%;
      height: 100%;
      background: var(--color-fondo-oscuro);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      border: 2px solid;
      position: relative;
      z-index: 2;
    }

    .marcador-refugio .marcador-icon {
      border-color: var(--color-supervivencia);
      background: rgba(74, 93, 35, 0.9);
    }

    .marcador-peligro .marcador-icon {
      border-color: var(--color-peligro);
      background: rgba(178, 34, 34, 0.9);
    }

    .marcador-tesoro .marcador-icon {
      border-color: #ffd700;
      background: rgba(255, 215, 0, 0.9);
      color: #2c2c2c;
    }

    .marcador-recurso .marcador-icon {
      border-color: var(--color-acento);
      background: rgba(255, 107, 53, 0.9);
    }

    .marcador-punto_interes .marcador-icon {
      border-color: var(--color-secundario);
      background: rgba(139, 69, 19, 0.9);
    }

    .marcador-pulse {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: var(--color-acento);
      transform: translate(-50%, -50%);
      animation: pulse 2s ease-in-out infinite;
      opacity: 0.6;
    }

    .marcador.descubierto .marcador-pulse {
      display: none;
    }

    @keyframes pulse {
      0% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.6;
      }
      50% {
        transform: translate(-50%, -50%) scale(1.5);
        opacity: 0.3;
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.6;
      }
    }

    .ubicacion-info {
      position: absolute;
      top: var(--espaciado-md);
      right: var(--espaciado-md);
      width: 300px;
      background: var(--color-fondo-medio);
      border-radius: 12px;
      border: 2px solid var(--color-supervivencia);
      box-shadow: var(--sombra-fuerte);
      transform: translateX(100%);
      transition: transform var(--transicion-media);
      z-index: 20;
    }

    .ubicacion-info.visible {
      transform: translateX(0);
    }

    .info-header {
      background: var(--color-supervivencia);
      padding: var(--espaciado-sm);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 10px 10px 0 0;
    }

    .info-header h4 {
      color: var(--color-texto-claro);
      margin: 0;
      font-size: 1.1rem;
    }

    .cerrar-info {
      background: none;
      border: none;
      color: var(--color-texto-claro);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 25px;
      height: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .info-content {
      padding: var(--espaciado-sm);
      max-height: 400px;
      overflow-y: auto;
    }

    .ubicacion-imagen {
      position: relative;
      height: 120px;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: var(--espaciado-sm);
    }

    .ubicacion-imagen img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .dificultad-badge {
      position: absolute;
      top: var(--espaciado-xs);
      right: var(--espaciado-xs);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .dificultad-badge[data-dificultad="facil"] {
      background: rgba(74, 93, 35, 0.9);
      color: #90EE90;
    }

    .dificultad-badge[data-dificultad="medio"] {
      background: rgba(255, 107, 53, 0.9);
      color: var(--color-texto-claro);
    }

    .dificultad-badge[data-dificultad="dificil"] {
      background: rgba(178, 34, 34, 0.9);
      color: #FFB6C1;
    }

    .dificultad-badge[data-dificultad="extremo"] {
      background: rgba(139, 0, 139, 0.9);
      color: #DDA0DD;
    }

    .ubicacion-descripcion {
      color: rgba(245, 245, 245, 0.9);
      line-height: 1.5;
      margin-bottom: var(--espaciado-sm);
    }

    .consejos-ubicacion,
    .recompensas-ubicacion {
      margin-bottom: var(--espaciado-sm);
    }

    .consejos-ubicacion h5,
    .recompensas-ubicacion h5 {
      color: var(--color-supervivencia);
      margin-bottom: var(--espaciado-xs);
      font-size: 0.9rem;
    }

    .consejos-ubicacion ul {
      list-style: none;
      padding: 0;
    }

    .consejos-ubicacion li {
      color: rgba(245, 245, 245, 0.8);
      font-size: 0.8rem;
      margin-bottom: var(--espaciado-xs);
      padding-left: 15px;
      position: relative;
    }

    .consejos-ubicacion li::before {
      content: '💡';
      position: absolute;
      left: 0;
      font-size: 0.7rem;
    }

    .recompensas-lista {
      display: flex;
      flex-wrap: wrap;
      gap: var(--espaciado-xs);
    }

    .recompensa-item {
      background: rgba(74, 93, 35, 0.2);
      color: var(--color-supervivencia);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.8rem;
      border: 1px solid var(--color-supervivencia);
    }

    .ubicacion-acciones {
      display: flex;
      gap: var(--espaciado-xs);
      margin-top: var(--espaciado-sm);
    }

    .btn-accion {
      flex: 1;
      padding: var(--espaciado-xs);
      border: none;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transicion-rapida);
    }

    .btn-accion:not(.secundario) {
      background: var(--color-supervivencia);
      color: var(--color-texto-claro);
    }

    .btn-accion.secundario {
      background: transparent;
      color: var(--color-supervivencia);
      border: 1px solid var(--color-supervivencia);
    }

    .btn-accion:hover {
      transform: translateY(-1px);
    }

    .mapa-leyenda {
      width: 200px;
      background: var(--color-fondo-medio);
      border-left: 1px solid var(--color-supervivencia);
      padding: var(--espaciado-sm);
      overflow-y: auto;
    }

    .mapa-leyenda h4 {
      color: var(--color-supervivencia);
      margin-bottom: var(--espaciado-sm);
      font-size: 1rem;
    }

    .leyenda-items {
      display: flex;
      flex-direction: column;
      gap: var(--espaciado-xs);
    }

    .leyenda-item {
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
      color: rgba(245, 245, 245, 0.8);
      font-size: 0.8rem;
    }

    .leyenda-icon {
      font-size: 1.2rem;
      width: 20px;
      text-align: center;
    }

    /* Estilos para vista de consejos */
    .consejos-content {
      flex: 1;
      padding: var(--espaciado-md);
      overflow-y: auto;
    }

    .consejos-filtros {
      display: flex;
      gap: var(--espaciado-xs);
      margin-bottom: var(--espaciado-md);
      flex-wrap: wrap;
    }

    .filtro-btn {
      padding: var(--espaciado-xs) var(--espaciado-sm);
      background: transparent;
      border: 1px solid var(--color-supervivencia);
      color: var(--color-supervivencia);
      border-radius: 20px;
      cursor: pointer;
      transition: all var(--transicion-rapida);
      font-size: 0.8rem;
    }

    .filtro-btn:hover,
    .filtro-btn.active {
      background: var(--color-supervivencia);
      color: var(--color-texto-claro);
    }

    .consejos-lista {
      display: flex;
      flex-direction: column;
      gap: var(--espaciado-sm);
    }

    .consejo-card {
      background: var(--color-fondo-medio);
      border-radius: 8px;
      padding: var(--espaciado-sm);
      border-left: 4px solid var(--color-supervivencia);
    }

    .consejo-card.importancia-alta {
      border-left-color: var(--color-peligro);
    }

    .consejo-card.importancia-media {
      border-left-color: var(--color-acento);
    }

    .consejo-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--espaciado-xs);
    }

    .consejo-header h4 {
      color: var(--color-texto-claro);
      margin: 0;
      font-size: 1rem;
    }

    .consejo-categoria {
      background: var(--color-supervivencia);
      color: var(--color-texto-claro);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.7rem;
      text-transform: uppercase;
    }

    .consejo-descripcion {
      color: rgba(245, 245, 245, 0.8);
      line-height: 1.5;
      margin-bottom: var(--espaciado-sm);
    }

    .consejo-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .importancia-badge {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 600;
    }

    .importancia-badge[data-importancia="alta"] {
      background: rgba(178, 34, 34, 0.2);
      color: var(--color-peligro);
    }

    .importancia-badge[data-importancia="media"] {
      background: rgba(255, 107, 53, 0.2);
      color: var(--color-acento);
    }

    .importancia-badge[data-importancia="baja"] {
      background: rgba(74, 93, 35, 0.2);
      color: var(--color-supervivencia);
    }

    .btn-favorito {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      transition: transform var(--transicion-rapida);
    }

    .btn-favorito:hover {
      transform: scale(1.2);
    }

    /* Estilos para vista de tesoros */
    .tesoros-content {
      flex: 1;
      padding: var(--espaciado-md);
      overflow-y: auto;
    }

    .tesoros-stats {
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
      border: 1px solid var(--color-supervivencia);
    }

    .stat-icon {
      font-size: 2rem;
    }

    .stat-value {
      display: block;
      color: var(--color-supervivencia);
      font-weight: 700;
      font-size: 1.5rem;
      font-family: var(--fuente-titulo);
    }

    .stat-label {
      display: block;
      color: rgba(245, 245, 245, 0.7);
      font-size: 0.8rem;
    }

    .tesoros-lista {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--espaciado-md);
    }

    .tesoro-card {
      background: var(--color-fondo-medio);
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid transparent;
      transition: all var(--transicion-media);
    }

    .tesoro-card:hover {
      border-color: var(--color-supervivencia);
      transform: translateY(-2px);
    }

    .tesoro-card.descubierto {
      border-color: #ffd700;
    }

    .tesoro-imagen {
      position: relative;
      height: 150px;
      overflow: hidden;
    }

    .tesoro-imagen img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .tesoro-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tesoro-misterio {
      font-size: 4rem;
      color: var(--color-acento);
      font-weight: 900;
    }

    .tesoro-info {
      padding: var(--espaciado-sm);
    }

    .tesoro-info h4 {
      color: var(--color-texto-claro);
      margin-bottom: var(--espaciado-xs);
    }

    .tesoro-pistas {
      margin-top: var(--espaciado-sm);
    }

    .tesoro-pistas h5 {
      color: var(--color-acento);
      font-size: 0.9rem;
      margin-bottom: var(--espaciado-xs);
    }

    .tesoro-pistas ul {
      list-style: none;
      padding: 0;
    }

    .tesoro-pistas li {
      color: rgba(245, 245, 245, 0.8);
      font-size: 0.8rem;
      margin-bottom: var(--espaciado-xs);
      padding-left: 15px;
      position: relative;
    }

    .tesoro-pistas li::before {
      content: '🔍';
      position: absolute;
      left: 0;
      font-size: 0.7rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .mapa-container {
        height: 500px;
      }

      .mapa-content {
        flex-direction: column;
      }

      .mapa-leyenda {
        width: 100%;
        height: 120px;
        border-left: none;
        border-top: 1px solid var(--color-supervivencia);
      }

      .leyenda-items {
        flex-direction: row;
        flex-wrap: wrap;
      }

      .ubicacion-info {
        position: static;
        width: 100%;
        transform: none;
        margin-top: var(--espaciado-sm);
      }

      .mapa-controles {
        flex-wrap: wrap;
      }

      .control-btn {
        font-size: 0.8rem;
        padding: var(--espaciado-xs);
      }
    }
  `]
})
export class MapaPremiumComponent implements OnInit {
  ubicaciones: UbicacionMapa[] = [];
  consejos: ConsejoSupervivencia[] = [];
  ubicacionSeleccionada: UbicacionMapa | null = null;
  vistaActual: 'mapa' | 'consejos' | 'tesoros' = 'mapa';
  filtroConsejos = 'todos';
  consejosFiltrados: ConsejoSupervivencia[] = [];
  
  // Estadísticas
  tesorosDescubiertos = 0;
  ubicacionesDescubiertas = 0;
  nivelExplorador = 'Novato';
  
  // Favoritos
  ubicacionesFavoritas: string[] = [];
  consejosFavoritos: string[] = [];

  constructor(private mapaService: MapaService) {}

  ngOnInit() {
    this.cargarDatos();
    this.cargarFavoritos();
  }

  /**
   * Carga todos los datos del mapa
   */
  private cargarDatos() {
    this.mapaService.obtenerUbicaciones().subscribe(ubicaciones => {
      this.ubicaciones = ubicaciones;
      this.calcularEstadisticas();
    });

    this.mapaService.obtenerConsejos().subscribe(consejos => {
      this.consejos = consejos;
      this.consejosFiltrados = consejos;
    });
  }

  /**
   * Calcula estadísticas del jugador
   */
  private calcularEstadisticas() {
    this.ubicacionesDescubiertas = this.ubicaciones.filter(u => u.descubierto).length;
    this.tesorosDescubiertos = this.ubicaciones.filter(u => u.tipo === 'tesoro' && u.descubierto).length;
    
    const porcentajeExplorado = (this.ubicacionesDescubiertas / this.ubicaciones.length) * 100;
    
    if (porcentajeExplorado < 25) {
      this.nivelExplorador = 'Novato';
    } else if (porcentajeExplorado < 50) {
      this.nivelExplorador = 'Explorador';
    } else if (porcentajeExplorado < 75) {
      this.nivelExplorador = 'Veterano';
    } else {
      this.nivelExplorador = 'Maestro';
    }
  }

  /**
   * Cambia la vista actual
   */
  cambiarVista(vista: 'mapa' | 'consejos' | 'tesoros') {
    this.vistaActual = vista;
    this.ubicacionSeleccionada = null;
  }

  /**
   * Selecciona una ubicación en el mapa
   */
  seleccionarUbicacion(ubicacion: UbicacionMapa) {
    this.ubicacionSeleccionada = ubicacion;
  }

  /**
   * Cierra el panel de información
   */
  cerrarInfo() {
    this.ubicacionSeleccionada = null;
  }

  /**
   * Descubre una ubicación
   */
  descubrirUbicacion(id: string) {
    this.mapaService.descubrirUbicacion(id).subscribe(success => {
      if (success) {
        const ubicacion = this.ubicaciones.find(u => u.id === id);
        if (ubicacion) {
          ubicacion.descubierto = true;
          this.calcularEstadisticas();
        }
      }
    });
  }

  /**
   * Marca una ubicación como favorita
   */
  marcarComoFavorito(id: string) {
    const index = this.ubicacionesFavoritas.indexOf(id);
    if (index > -1) {
      this.ubicacionesFavoritas.splice(index, 1);
    } else {
      this.ubicacionesFavoritas.push(id);
    }
    this.guardarFavoritos();
  }

  /**
   * Filtra consejos por categoría
   */
  filtrarConsejos(categoria: string) {
    this.filtroConsejos = categoria;
    
    if (categoria === 'todos') {
      this.consejosFiltrados = this.consejos;
    } else {
      this.consejosFiltrados = this.consejos.filter(c => c.categoria === categoria);
    }
  }

  /**
   * Toggle favorito para consejos
   */
  toggleFavoritoConsejo(id: string) {
    const index = this.consejosFavoritos.indexOf(id);
    if (index > -1) {
      this.consejosFavoritos.splice(index, 1);
    } else {
      this.consejosFavoritos.push(id);
    }
    this.guardarFavoritos();
  }

  /**
   * Verifica si un consejo es favorito
   */
  esFavoritoConsejo(id: string): boolean {
    return this.consejosFavoritos.includes(id);
  }

  /**
   * Obtiene el icono para cada tipo de ubicación
   */
  getIconoTipo(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'refugio': '🏠',
      'peligro': '⚠️',
      'tesoro': '💎',
      'recurso': '🌿',
      'punto_interes': '📍'
    };
    return iconos[tipo] || '📍';
  }

  /**
   * Obtiene el texto de dificultad
   */
  getDificultadTexto(dificultad: string): string {
    const dificultades: { [key: string]: string } = {
      'facil': 'Fácil',
      'medio': 'Medio',
      'dificil': 'Difícil',
      'extremo': 'Extremo'
    };
    return dificultades[dificultad] || dificultad;
  }

  /**
   * Obtiene el texto de categoría
   */
  getCategoriaTexto(categoria: string): string {
    const categorias: { [key: string]: string } = {
      'combate': 'Combate',
      'sigilo': 'Sigilo',
      'recursos': 'Recursos',
      'navegacion': 'Navegación',
      'supervivencia': 'Supervivencia'
    };
    return categorias[categoria] || categoria;
  }

  /**
   * Obtiene el texto de importancia
   */
  getImportanciaTexto(importancia: string): string {
    const importancias: { [key: string]: string } = {
      'alta': 'Crítico',
      'media': 'Importante',
      'baja': 'Útil'
    };
    return importancias[importancia] || importancia;
  }

  /**
   * Obtiene tesoros disponibles
   */
  get tesorosDisponibles(): UbicacionMapa[] {
    return this.ubicaciones.filter(u => u.tipo === 'tesoro');
  }

  /**
   * Guarda favoritos en localStorage
   */
  private guardarFavoritos() {
    const favoritos = {
      ubicaciones: this.ubicacionesFavoritas,
      consejos: this.consejosFavoritos
    };
    localStorage.setItem('favoritos_mapa_tlou', JSON.stringify(favoritos));
  }

  /**
   * Carga favoritos desde localStorage
   */
  private cargarFavoritos() {
    try {
      const favoritosGuardados = localStorage.getItem('favoritos_mapa_tlou');
      if (favoritosGuardados) {
        const favoritos = JSON.parse(favoritosGuardados);
        this.ubicacionesFavoritas = favoritos.ubicaciones || [];
        this.consejosFavoritos = favoritos.consejos || [];
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
    }
  }
}