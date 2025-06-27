/**
 * Servicio de Mapa
 * Maneja ubicaciones, consejos y tesoros del mundo de TLOU2
 */

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface UbicacionMapa {
  id: string;
  nombre: string;
  tipo: 'refugio' | 'peligro' | 'tesoro' | 'recurso' | 'punto_interes';
  coordenadas: { x: number; y: number };
  descripcion: string;
  consejos: string[];
  recompensas?: string[];
  dificultad: 'facil' | 'medio' | 'dificil' | 'extremo';
  descubierto: boolean;
  imagen: string;
}

export interface ConsejoSupervivencia {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: 'combate' | 'sigilo' | 'recursos' | 'navegacion' | 'supervivencia';
  importancia: 'alta' | 'media' | 'baja';
  ubicacionRelacionada?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MapaService {
  private ubicaciones: UbicacionMapa[] = [
    {
      id: 'jackson_centro',
      nombre: 'Centro de Jackson',
      tipo: 'refugio',
      coordenadas: { x: 25, y: 30 },
      descripcion: 'El corazón de la comunidad de Jackson. Aquí encontrarás seguridad y suministros.',
      consejos: [
        'Siempre reporta tu estado al regresar de patrulla',
        'Revisa el tablón de anuncios para nuevas misiones',
        'Mantén tus armas en buen estado en el taller'
      ],
      recompensas: ['Munición', 'Suministros médicos', 'Información'],
      dificultad: 'facil',
      descubierto: true,
      imagen: 'https://i.f1g.fr/media/cms/1200x630_crop/2025/04/14/75af2cd534a7effa4d0d76d782de9448436cdd2625a3fbe0a489e33583f839a5.jpg'
    },
    {
      id: 'bosque_infectado',
      nombre: 'Bosque de los Infectados',
      tipo: 'peligro',
      coordenadas: { x: 60, y: 45 },
      descripcion: 'Zona altamente peligrosa con alta concentración de infectados. Evitar de noche.',
      consejos: [
        'Usa sigilo, evita el combate directo',
        'Los chasqueadores son ciegos pero tienen oído agudo',
        'Siempre ten una ruta de escape planeada'
      ],
      dificultad: 'extremo',
      descubierto: false,
      imagen: 'https://uploads.worldanvil.com/uploads/images/2b15c848c6f3e46aba209c5e36443d3a.jpg'
    },
    {
      id: 'cache_suministros',
      nombre: 'Caché de Suministros Oculto',
      tipo: 'tesoro',
      coordenadas: { x: 40, y: 20 },
      descripcion: 'Un escondite secreto con valiosos suministros dejado por supervivientes anteriores.',
      consejos: [
        'Busca marcas en los árboles cercanos',
        'El acceso está oculto bajo rocas sueltas',
        'Cuidado con las trampas improvisadas'
      ],
      recompensas: ['Munición especial', 'Medicinas', 'Herramientas', 'Mapa de área'],
      dificultad: 'medio',
      descubierto: false,
      imagen: 'https://img.odcdn.com.br/wp-content/uploads/2025/04/Design-sem-nome-43-1920x1080.png'
    },
    {
      id: 'puesto_observacion',
      nombre: 'Puesto de Observación',
      tipo: 'punto_interes',
      coordenadas: { x: 75, y: 15 },
      descripcion: 'Torre de observación con vista panorámica. Ideal para reconocimiento.',
      consejos: [
        'Usa binoculares para explorar áreas distantes',
        'Marca ubicaciones de interés en tu mapa',
        'Cuidado con francotiradores enemigos'
      ],
      recompensas: ['Información de área', 'Ubicaciones marcadas'],
      dificultad: 'medio',
      descubierto: true,
      imagen: 'https://criticalhits.com.br/wp-content/uploads/2025/04/1744609947856.jpg'
    },
    {
      id: 'rio_recursos',
      nombre: 'Río de los Recursos',
      tipo: 'recurso',
      coordenadas: { x: 15, y: 60 },
      descripcion: 'Fuente de agua limpia y pesca. También hay plantas medicinales en la orilla.',
      consejos: [
        'Purifica el agua antes de beberla',
        'Las plantas medicinales crecen cerca del agua',
        'Cuidado con animales salvajes que vienen a beber'
      ],
      recompensas: ['Agua limpia', 'Plantas medicinales', 'Peces'],
      dificultad: 'facil',
      descubierto: true,
      imagen: 'https://media.vogue.mx/photos/6817f51f4d09999275c41c29/master/w_1600%2Cc_limit/the-last-of-us-2-capitulo-4.jpg'
    },
    {
      id: 'ruinas_hospital',
      nombre: 'Ruinas del Hospital',
      tipo: 'tesoro',
      coordenadas: { x: 80, y: 70 },
      descripcion: 'Antiguo hospital con suministros médicos valiosos, pero infestado de infectados.',
      consejos: [
        'Los suministros médicos están en el sótano',
        'Usa bombas molotov contra grupos de infectados',
        'El ascensor principal está roto, usa las escaleras de emergencia'
      ],
      recompensas: ['Suministros médicos avanzados', 'Antibióticos', 'Equipo quirúrgico'],
      dificultad: 'dificil',
      descubierto: false,
      imagen: 'https://img.europapress.es/fotoweb/fotonoticia_20250415101013_690.jpg'
    }
  ];

  private consejos: ConsejoSupervivencia[] = [
    {
      id: 'consejo_1',
      titulo: 'Sigilo vs Combate',
      descripcion: 'En la mayoría de situaciones, el sigilo es preferible al combate directo. Conserva munición y evita atraer más infectados.',
      categoria: 'combate',
      importancia: 'alta'
    },
    {
      id: 'consejo_2',
      titulo: 'Gestión de Recursos',
      descripcion: 'Siempre mantén un inventario equilibrado: munición, suministros médicos y herramientas de crafteo.',
      categoria: 'recursos',
      importancia: 'alta'
    },
    {
      id: 'consejo_3',
      titulo: 'Navegación Nocturna',
      descripcion: 'Durante la noche, los infectados son más activos. Planifica rutas seguras y evita áreas abiertas.',
      categoria: 'navegacion',
      importancia: 'media'
    },
    {
      id: 'consejo_4',
      titulo: 'Señales de Peligro',
      descripcion: 'Aprende a reconocer los sonidos de diferentes tipos de infectados. Cada uno requiere una estrategia diferente.',
      categoria: 'supervivencia',
      importancia: 'alta'
    },
    {
      id: 'consejo_5',
      titulo: 'Crafteo Eficiente',
      descripcion: 'Prioriza crear objetos que te den ventaja inmediata: bombas molotov para grupos, vendas para heridas.',
      categoria: 'recursos',
      importancia: 'media'
    }
  ];

  /**
   * Obtiene todas las ubicaciones del mapa
   */
  obtenerUbicaciones(): Observable<UbicacionMapa[]> {
    return of(this.ubicaciones);
  }

  /**
   * Obtiene ubicaciones por tipo
   */
  obtenerUbicacionesPorTipo(tipo: string): Observable<UbicacionMapa[]> {
    const ubicacionesFiltradas = this.ubicaciones.filter(u => u.tipo === tipo);
    return of(ubicacionesFiltradas);
  }

  /**
   * Obtiene ubicaciones descubiertas
   */
  obtenerUbicacionesDescubiertas(): Observable<UbicacionMapa[]> {
    const ubicacionesDescubiertas = this.ubicaciones.filter(u => u.descubierto);
    return of(ubicacionesDescubiertas);
  }

  /**
   * Marca una ubicación como descubierta
   */
  descubrirUbicacion(id: string): Observable<boolean> {
    const ubicacion = this.ubicaciones.find(u => u.id === id);
    if (ubicacion) {
      ubicacion.descubierto = true;
      return of(true);
    }
    return of(false);
  }

  /**
   * Obtiene consejos de supervivencia
   */
  obtenerConsejos(): Observable<ConsejoSupervivencia[]> {
    return of(this.consejos);
  }

  /**
   * Obtiene consejos por categoría
   */
  obtenerConsejosPorCategoria(categoria: string): Observable<ConsejoSupervivencia[]> {
    const consejosFiltrados = this.consejos.filter(c => c.categoria === categoria);
    return of(consejosFiltrados);
  }

  /**
   * Obtiene una ubicación específica
   */
  obtenerUbicacion(id: string): Observable<UbicacionMapa | undefined> {
    const ubicacion = this.ubicaciones.find(u => u.id === id);
    return of(ubicacion);
  }

  /**
   * Busca ubicaciones por nombre
   */
  buscarUbicaciones(termino: string): Observable<UbicacionMapa[]> {
    const terminoLower = termino.toLowerCase();
    const ubicacionesEncontradas = this.ubicaciones.filter(u => 
      u.nombre.toLowerCase().includes(terminoLower) ||
      u.descripcion.toLowerCase().includes(terminoLower)
    );
    return of(ubicacionesEncontradas);
  }
}