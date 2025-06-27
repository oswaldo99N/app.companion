/**
 * Servicio de autenticación
 * Maneja el registro, login y estado de usuario
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Usuario {
  nombre: string;
  apellidos: string;
  email: string;
  pais: string;
  fechaRegistro: Date;
  password?: string; // Solo para validación, no se almacena
}

export interface DatosRegistro {
  nombre: string;
  apellidos: string;
  email: string;
  pais: string;
  password: string;
}

export interface DatosLogin {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  private autenticadoSubject = new BehaviorSubject<boolean>(false);
  private usuariosRegistrados = new Map<string, Usuario & { password: string }>();

  // Lista de países
  readonly paises = [
    'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica',
    'Cuba', 'Ecuador', 'El Salvador', 'España', 'Guatemala', 'Honduras',
    'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'Puerto Rico',
    'República Dominicana', 'Uruguay', 'Venezuela', 'Estados Unidos',
    'Canadá', 'Francia', 'Alemania', 'Italia', 'Reino Unido', 'Japón',
    'China', 'Corea del Sur', 'Australia', 'Nueva Zelanda', 'Rusia',
    'India', 'Sudáfrica', 'Egipto', 'Marruecos', 'Nigeria', 'Kenia'
  ].sort();

  constructor() {
    // Verificar si hay usuario guardado en localStorage
    this.cargarUsuarioGuardado();
    this.cargarUsuariosRegistrados();
  }

  /**
   * Observable del usuario actual
   */
  get usuario$(): Observable<Usuario | null> {
    return this.usuarioSubject.asObservable();
  }

  /**
   * Observable del estado de autenticación
   */
  get autenticado$(): Observable<boolean> {
    return this.autenticadoSubject.asObservable();
  }

  /**
   * Obtiene el usuario actual
   */
  get usuarioActual(): Usuario | null {
    return this.usuarioSubject.value;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  get estaAutenticado(): boolean {
    return this.autenticadoSubject.value;
  }

  /**
   * Registra un nuevo usuario
   */
  registrarUsuario(datos: DatosRegistro): Observable<boolean> {
    return new Observable(observer => {
      // Verificar si el email ya está registrado
      if (this.usuariosRegistrados.has(datos.email)) {
        observer.error('Este email ya está registrado');
        return;
      }

      // Simular delay de registro
      setTimeout(() => {
        const nuevoUsuario: Usuario & { password: string } = {
          ...datos,
          fechaRegistro: new Date()
        };

        // Guardar en el mapa de usuarios registrados
        this.usuariosRegistrados.set(datos.email, nuevoUsuario);
        this.guardarUsuariosRegistrados();

        // Autenticar automáticamente después del registro
        const usuarioSinPassword: Usuario = {
          nombre: nuevoUsuario.nombre,
          apellidos: nuevoUsuario.apellidos,
          email: nuevoUsuario.email,
          pais: nuevoUsuario.pais,
          fechaRegistro: nuevoUsuario.fechaRegistro
        };

        // Guardar sesión actual
        localStorage.setItem('usuario_tlou', JSON.stringify(usuarioSinPassword));
        
        // Actualizar estado
        this.usuarioSubject.next(usuarioSinPassword);
        this.autenticadoSubject.next(true);

        observer.next(true);
        observer.complete();
      }, 1000);
    });
  }

  /**
   * Inicia sesión con email y contraseña
   */
  iniciarSesion(datos: DatosLogin): Observable<boolean> {
    return new Observable(observer => {
      // Simular delay de login
      setTimeout(() => {
        const usuarioRegistrado = this.usuariosRegistrados.get(datos.email);
        
        if (!usuarioRegistrado) {
          observer.error('Usuario no encontrado');
          return;
        }

        if (usuarioRegistrado.password !== datos.password) {
          observer.error('Contraseña incorrecta');
          return;
        }

        // Login exitoso
        const usuarioSinPassword: Usuario = {
          nombre: usuarioRegistrado.nombre,
          apellidos: usuarioRegistrado.apellidos,
          email: usuarioRegistrado.email,
          pais: usuarioRegistrado.pais,
          fechaRegistro: usuarioRegistrado.fechaRegistro
        };

        // Guardar sesión actual
        localStorage.setItem('usuario_tlou', JSON.stringify(usuarioSinPassword));
        
        // Actualizar estado
        this.usuarioSubject.next(usuarioSinPassword);
        this.autenticadoSubject.next(true);

        observer.next(true);
        observer.complete();
      }, 800);
    });
  }

  /**
   * Cierra la sesión del usuario
   */
  cerrarSesion(): void {
    localStorage.removeItem('usuario_tlou');
    this.usuarioSubject.next(null);
    this.autenticadoSubject.next(false);
  }

  /**
   * Verifica si un email está registrado
   */
  emailEstaRegistrado(email: string): boolean {
    return this.usuariosRegistrados.has(email);
  }

  /**
   * Carga el usuario guardado desde localStorage
   */
  private cargarUsuarioGuardado(): void {
    const usuarioGuardado = localStorage.getItem('usuario_tlou');
    if (usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado);
        // Convertir fecha de string a Date
        usuario.fechaRegistro = new Date(usuario.fechaRegistro);
        this.usuarioSubject.next(usuario);
        this.autenticadoSubject.next(true);
      } catch (error) {
        console.error('Error al cargar usuario guardado:', error);
        localStorage.removeItem('usuario_tlou');
      }
    }
  }

  /**
   * Carga usuarios registrados desde localStorage
   */
  private cargarUsuariosRegistrados(): void {
    const usuariosGuardados = localStorage.getItem('usuarios_registrados_tlou');
    if (usuariosGuardados) {
      try {
        const usuarios = JSON.parse(usuariosGuardados);
        Object.entries(usuarios).forEach(([email, usuario]: [string, any]) => {
          // Convertir fecha de string a Date
          usuario.fechaRegistro = new Date(usuario.fechaRegistro);
          this.usuariosRegistrados.set(email, usuario);
        });
      } catch (error) {
        console.error('Error al cargar usuarios registrados:', error);
        localStorage.removeItem('usuarios_registrados_tlou');
      }
    }
  }

  /**
   * Guarda usuarios registrados en localStorage
   */
  private guardarUsuariosRegistrados(): void {
    try {
      const usuarios: { [key: string]: any } = {};
      this.usuariosRegistrados.forEach((usuario, email) => {
        usuarios[email] = usuario;
      });
      localStorage.setItem('usuarios_registrados_tlou', JSON.stringify(usuarios));
    } catch (error) {
      console.error('Error al guardar usuarios registrados:', error);
    }
  }

  /**
   * Valida formato de email
   */
  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Valida fortaleza de contraseña
   */
  validarPassword(password: string): { valida: boolean; errores: string[] } {
    const errores: string[] = [];
    
    if (password.length < 6) {
      errores.push('Debe tener al menos 6 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errores.push('Debe contener al menos una mayúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errores.push('Debe contener al menos una minúscula');
    }
    
    if (!/[0-9]/.test(password)) {
      errores.push('Debe contener al menos un número');
    }

    return {
      valida: errores.length === 0,
      errores
    };
  }
}