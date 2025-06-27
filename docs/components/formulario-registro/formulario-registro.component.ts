/**
 * Componente Formulario de Registro/Login
 * Modal para registro de nuevos usuarios y login
 */

import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, DatosRegistro, DatosLogin } from '../../services/auth.service';

interface ErroresValidacion {
  nombre?: string;
  apellidos?: string;
  email?: string;
  password?: string;
  pais?: string;
  general?: string;
}

@Component({
  selector: 'app-formulario-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="cerrarModal($event)">
      <div class="modal-container">
        <!-- Encabezado del modal -->
        <div class="modal-header">
          <h2 class="modal-title">
            <span class="title-icon">🧟</span>
            {{ modoActual === 'registro' ? 'Únete a los Supervivientes' : 'Bienvenido de Vuelta' }}
          </h2>
          <button 
            class="btn-cerrar"
            (click)="cerrarModal()"
            aria-label="Cerrar formulario"
          >
            ×
          </button>
        </div>

        <!-- Navegación entre modos -->
        <div class="modo-navegacion">
          <button 
            class="modo-btn"
            [class.active]="modoActual === 'login'"
            (click)="cambiarModo('login')"
          >
            Iniciar Sesión
          </button>
          <button 
            class="modo-btn"
            [class.active]="modoActual === 'registro'"
            (click)="cambiarModo('registro')"
          >
            Registrarse
          </button>
        </div>

        <!-- Contenido del modal -->
        <div class="modal-body">
          <!-- Estado de carga -->
          <div class="loading-state" *ngIf="enviandoFormulario">
            <div class="loading-spinner"></div>
            <p>{{ modoActual === 'registro' ? 'Procesando registro...' : 'Iniciando sesión...' }}</p>
          </div>

          <!-- Mensaje de éxito -->
          <div class="success-message" *ngIf="operacionExitosa">
            <div class="success-icon">✅</div>
            <h3>{{ modoActual === 'registro' ? '¡Bienvenido al mundo post-apocalíptico!' : '¡Bienvenido de vuelta, superviviente!' }}</h3>
            <p>Redirigiendo en {{ tiempoRestante }} segundos...</p>
            <div class="countdown-bar">
              <div class="countdown-progress" [style.width.%]="progresoCountdown"></div>
            </div>
          </div>

          <!-- Error general -->
          <div class="general-error" *ngIf="errores.general && !enviandoFormulario && !operacionExitosa">
            <div class="error-icon">⚠️</div>
            <p>{{ errores.general }}</p>
            <button 
              class="btn btn-secundario btn-small"
              *ngIf="modoActual === 'login'"
              (click)="cambiarModo('registro')"
            >
              Crear cuenta nueva
            </button>
          </div>

          <!-- Formulario de Login -->
          <form 
            class="auth-form"
            *ngIf="!enviandoFormulario && !operacionExitosa && modoActual === 'login'"
            (ngSubmit)="iniciarSesion()"
            #loginForm="ngForm"
          >
            <p class="form-description">
              Ingresa tus credenciales para acceder a tu cuenta de superviviente.
            </p>

            <!-- Campo Email -->
            <div class="form-group">
              <label for="loginEmail" class="form-label">
                Correo Electrónico *
              </label>
              <input
                type="email"
                id="loginEmail"
                name="loginEmail"
                class="form-input"
                [class.error]="errores.email"
                [(ngModel)]="datosLogin.email"
                placeholder="ejemplo@correo.com"
                required
              >
              <div class="error-message" *ngIf="errores.email">
                {{ errores.email }}
              </div>
            </div>

            <!-- Campo Password -->
            <div class="form-group">
              <label for="loginPassword" class="form-label">
                Contraseña *
              </label>
              <div class="password-container">
                <input
                  [type]="mostrarPassword ? 'text' : 'password'"
                  id="loginPassword"
                  name="loginPassword"
                  class="form-input"
                  [class.error]="errores.password"
                  [(ngModel)]="datosLogin.password"
                  placeholder="Tu contraseña"
                  required
                >
                <button 
                  type="button"
                  class="toggle-password"
                  (click)="togglePassword()"
                >
                  {{ mostrarPassword ? '🙈' : '👁️' }}
                </button>
              </div>
              <div class="error-message" *ngIf="errores.password">
                {{ errores.password }}
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="form-actions">
              <button 
                type="button"
                class="btn btn-secundario"
                (click)="cerrarModal()"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                class="btn btn-primario"
                [disabled]="!loginValido()"
              >
                <span class="btn-icon">🚪</span>
                Iniciar Sesión
              </button>
            </div>
          </form>

          <!-- Formulario de Registro -->
          <form 
            class="auth-form"
            *ngIf="!enviandoFormulario && !operacionExitosa && modoActual === 'registro'"
            (ngSubmit)="registrarUsuario()"
            #registroForm="ngForm"
          >
            <p class="form-description">
              Regístrate para acceder a contenido exclusivo del mundo post-apocalíptico de The Last of Us.
            </p>

            <!-- Campo Nombre -->
            <div class="form-group">
              <label for="nombre" class="form-label">
                Nombre Completo *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                class="form-input"
                [class.error]="errores.nombre"
                [(ngModel)]="datosRegistro.nombre"
                placeholder="Ingresa tu nombre"
                required
              >
              <div class="error-message" *ngIf="errores.nombre">
                {{ errores.nombre }}
              </div>
            </div>

            <!-- Campo Apellidos -->
            <div class="form-group">
              <label for="apellidos" class="form-label">
                Apellidos *
              </label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                class="form-input"
                [class.error]="errores.apellidos"
                [(ngModel)]="datosRegistro.apellidos"
                placeholder="Ingresa tus apellidos"
                required
              >
              <div class="error-message" *ngIf="errores.apellidos">
                {{ errores.apellidos }}
              </div>
            </div>

            <!-- Campo Email -->
            <div class="form-group">
              <label for="email" class="form-label">
                Correo Electrónico *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                class="form-input"
                [class.error]="errores.email"
                [(ngModel)]="datosRegistro.email"
                placeholder="ejemplo@correo.com"
                required
              >
              <div class="error-message" *ngIf="errores.email">
                {{ errores.email }}
              </div>
            </div>

            <!-- Campo Password -->
            <div class="form-group">
              <label for="password" class="form-label">
                Contraseña *
              </label>
              <div class="password-container">
                <input
                  [type]="mostrarPassword ? 'text' : 'password'"
                  id="password"
                  name="password"
                  class="form-input"
                  [class.error]="errores.password"
                  [(ngModel)]="datosRegistro.password"
                  placeholder="Crea una contraseña segura"
                  required
                >
                <button 
                  type="button"
                  class="toggle-password"
                  (click)="togglePassword()"
                >
                  {{ mostrarPassword ? '🙈' : '👁️' }}
                </button>
              </div>
              <div class="password-strength" *ngIf="datosRegistro.password">
                <div class="strength-bar">
                  <div 
                    class="strength-fill"
                    [style.width.%]="passwordStrength.porcentaje"
                    [class]="'strength-' + passwordStrength.nivel"
                  ></div>
                </div>
                <span class="strength-text">{{ passwordStrength.texto }}</span>
              </div>
              <div class="error-message" *ngIf="errores.password">
                {{ errores.password }}
              </div>
            </div>

            <!-- Campo País -->
            <div class="form-group">
              <label for="pais" class="form-label">
                País *
              </label>
              <select
                id="pais"
                name="pais"
                class="form-select"
                [class.error]="errores.pais"
                [(ngModel)]="datosRegistro.pais"
                required
              >
                <option value="">Selecciona tu país</option>
                <option 
                  *ngFor="let pais of paises" 
                  [value]="pais"
                >
                  {{ pais }}
                </option>
              </select>
              <div class="error-message" *ngIf="errores.pais">
                {{ errores.pais }}
              </div>
            </div>

            <!-- Debug info (temporal) -->
            <div class="debug-info" style="background: rgba(255,255,255,0.1); padding: 10px; margin: 10px 0; border-radius: 5px; font-size: 12px;">
              <p>Debug - Estado del formulario:</p>
              <p>Nombre: "{{ datosRegistro.nombre }}" ({{ (datosRegistro.nombre || '').length }} chars)</p>
              <p>Apellidos: "{{ datosRegistro.apellidos }}" ({{ (datosRegistro.apellidos || '').length }} chars)</p>
              <p>Email: "{{ datosRegistro.email }}" (válido: {{ validarEmailLocal(datosRegistro.email) }})</p>
              <p>Password: "{{ datosRegistro.password }}" ({{ (datosRegistro.password || '').length }} chars)</p>
              <p>País: "{{ datosRegistro.pais }}"</p>
              <p>Formulario válido: {{ registroValido() }}</p>
            </div>

            <!-- Botones de acción -->
            <div class="form-actions">
              <button 
                type="button"
                class="btn btn-secundario"
                (click)="cerrarModal()"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                class="btn btn-primario"
                [disabled]="!registroValido()"
              >
                <span class="btn-icon">🎮</span>
                Registrarse
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3000;
      padding: var(--espaciado-sm);
      animation: fadeIn 0.3s ease-out;
    }

    .modal-container {
      background: var(--color-fondo-medio);
      border-radius: 16px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      border: 2px solid var(--color-acento);
      box-shadow: var(--sombra-fuerte);
      animation: slideInUp 0.4s ease-out;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--espaciado-md);
      border-bottom: 1px solid var(--color-acento);
      background: linear-gradient(135deg, var(--color-fondo-oscuro), var(--color-fondo-medio));
    }

    .modal-title {
      color: var(--color-texto-claro);
      font-family: var(--fuente-titulo);
      font-size: 1.5rem;
      margin: 0;
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
    }

    .title-icon {
      font-size: 1.8rem;
      animation: pulso 2s ease-in-out infinite;
    }

    .btn-cerrar {
      width: 40px;
      height: 40px;
      background: var(--color-peligro);
      border: none;
      border-radius: 50%;
      color: var(--color-texto-claro);
      font-size: 1.5rem;
      cursor: pointer;
      transition: all var(--transicion-rapida);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-cerrar:hover {
      background: #dc143c;
      transform: scale(1.1);
    }

    .modo-navegacion {
      display: flex;
      background: var(--color-fondo-oscuro);
      border-bottom: 1px solid var(--color-acento);
    }

    .modo-btn {
      flex: 1;
      padding: var(--espaciado-sm);
      background: transparent;
      border: none;
      color: rgba(245, 245, 245, 0.7);
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transicion-rapida);
      border-bottom: 3px solid transparent;
    }

    .modo-btn:hover,
    .modo-btn.active {
      color: var(--color-acento);
      border-bottom-color: var(--color-acento);
      background: rgba(255, 107, 53, 0.1);
    }

    .modal-body {
      padding: var(--espaciado-md);
    }

    .form-description {
      color: rgba(245, 245, 245, 0.8);
      text-align: center;
      margin-bottom: var(--espaciado-md);
      line-height: 1.6;
    }

    .loading-state {
      text-align: center;
      padding: var(--espaciado-lg);
      color: var(--color-texto-claro);
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(255, 107, 53, 0.3);
      border-top: 3px solid var(--color-acento);
      border-radius: 50%;
      animation: girar 1s linear infinite;
      margin: 0 auto var(--espaciado-sm);
    }

    .success-message {
      text-align: center;
      padding: var(--espaciado-lg);
      color: var(--color-texto-claro);
    }

    .success-icon {
      font-size: 3rem;
      margin-bottom: var(--espaciado-sm);
    }

    .success-message h3 {
      color: var(--color-supervivencia);
      margin-bottom: var(--espaciado-sm);
    }

    .countdown-bar {
      width: 100%;
      height: 6px;
      background: rgba(245, 245, 245, 0.2);
      border-radius: 3px;
      overflow: hidden;
      margin-top: var(--espaciado-sm);
    }

    .countdown-progress {
      height: 100%;
      background: linear-gradient(90deg, var(--color-supervivencia), var(--color-acento));
      transition: width 0.1s linear;
    }

    .general-error {
      background: rgba(178, 34, 34, 0.1);
      border: 1px solid var(--color-peligro);
      border-radius: 8px;
      padding: var(--espaciado-md);
      margin-bottom: var(--espaciado-md);
      text-align: center;
      color: var(--color-texto-claro);
    }

    .error-icon {
      font-size: 2rem;
      margin-bottom: var(--espaciado-xs);
    }

    .general-error p {
      margin: var(--espaciado-xs) 0;
      color: #ffcccb;
    }

    .btn-small {
      padding: var(--espaciado-xs) var(--espaciado-sm);
      font-size: 0.9rem;
      margin-top: var(--espaciado-sm);
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: var(--espaciado-md);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--espaciado-xs);
    }

    .form-label {
      color: var(--color-acento);
      font-weight: 600;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .form-input,
    .form-select {
      padding: var(--espaciado-sm);
      background: var(--color-fondo-oscuro);
      border: 2px solid rgba(245, 245, 245, 0.2);
      border-radius: 8px;
      color: var(--color-texto-claro);
      font-size: 1rem;
      transition: all var(--transicion-rapida);
    }

    .form-input:focus,
    .form-select:focus {
      outline: none;
      border-color: var(--color-acento);
      box-shadow: 0 0 10px rgba(255, 107, 53, 0.3);
    }

    .form-input.error,
    .form-select.error {
      border-color: var(--color-peligro);
      box-shadow: 0 0 10px rgba(178, 34, 34, 0.3);
    }

    .password-container {
      position: relative;
    }

    .toggle-password {
      position: absolute;
      right: var(--espaciado-sm);
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: rgba(245, 245, 245, 0.7);
      cursor: pointer;
      font-size: 1.2rem;
      transition: color var(--transicion-rapida);
    }

    .toggle-password:hover {
      color: var(--color-acento);
    }

    .password-strength {
      margin-top: var(--espaciado-xs);
    }

    .strength-bar {
      width: 100%;
      height: 4px;
      background: rgba(245, 245, 245, 0.2);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: var(--espaciado-xs);
    }

    .strength-fill {
      height: 100%;
      transition: all var(--transicion-media);
    }

    .strength-fill.strength-debil {
      background: var(--color-peligro);
    }

    .strength-fill.strength-media {
      background: var(--color-acento);
    }

    .strength-fill.strength-fuerte {
      background: var(--color-supervivencia);
    }

    .strength-text {
      font-size: 0.8rem;
      color: rgba(245, 245, 245, 0.7);
    }

    .form-select {
      cursor: pointer;
    }

    .form-select option {
      background: var(--color-fondo-oscuro);
      color: var(--color-texto-claro);
    }

    .error-message {
      color: var(--color-peligro);
      font-size: 0.8rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
    }

    .error-message::before {
      content: '⚠️';
      font-size: 0.9rem;
    }

    .form-actions {
      display: flex;
      gap: var(--espaciado-sm);
      justify-content: flex-end;
      margin-top: var(--espaciado-md);
    }

    .btn {
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
      padding: var(--espaciado-sm) var(--espaciado-md);
      border-radius: 8px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      cursor: pointer;
      transition: all var(--transicion-media);
      border: 2px solid transparent;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
    }

    .btn-primario {
      background: var(--gradiente-apocaliptico);
      color: var(--color-texto-claro);
      border-color: var(--color-acento);
    }

    .btn-primario:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--sombra-media);
    }

    .btn-secundario {
      background: transparent;
      color: var(--color-texto-claro);
      border-color: rgba(245, 245, 245, 0.3);
    }

    .btn-secundario:hover {
      background: rgba(245, 245, 245, 0.1);
      border-color: var(--color-texto-claro);
    }

    .btn-icon {
      font-size: 1.1rem;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideInUp {
      from {
        transform: translateY(50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes girar {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .modal-container {
        margin: var(--espaciado-sm);
        max-height: 95vh;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .modal-header {
        padding: var(--espaciado-sm);
      }

      .modal-body {
        padding: var(--espaciado-sm);
      }

      .modal-title {
        font-size: 1.2rem;
      }
    }
  `]
})
export class FormularioRegistroComponent implements OnInit {
  @Output() cerrar = new EventEmitter<void>();
  @Output() registroCompletado = new EventEmitter<void>();

  modoActual: 'login' | 'registro' = 'login';
  
  datosRegistro: DatosRegistro = {
    nombre: '',
    apellidos: '',
    email: '',
    pais: '',
    password: ''
  };

  datosLogin: DatosLogin = {
    email: '',
    password: ''
  };

  errores: ErroresValidacion = {};
  enviandoFormulario = false;
  operacionExitosa = false;
  tiempoRestante = 3;
  progresoCountdown = 100;
  paises: string[] = [];
  mostrarPassword = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.paises = this.authService.paises;
  }

  /**
   * Cambia entre modo login y registro
   */
  cambiarModo(modo: 'login' | 'registro') {
    this.modoActual = modo;
    this.limpiarErrores();
  }

  /**
   * Toggle visibilidad de contraseña
   */
  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  /**
   * Calcula la fortaleza de la contraseña
   */
  get passwordStrength() {
    const password = this.datosRegistro.password || '';
    if (!password) return { porcentaje: 0, nivel: 'debil', texto: '' };

    let puntos = 0;
    if (password.length >= 6) puntos += 25;
    if (/[A-Z]/.test(password)) puntos += 25;
    if (/[a-z]/.test(password)) puntos += 25;
    if (/[0-9]/.test(password)) puntos += 25;

    let nivel = 'debil';
    let texto = 'Débil';
    
    if (puntos >= 75) {
      nivel = 'fuerte';
      texto = 'Fuerte';
    } else if (puntos >= 50) {
      nivel = 'media';
      texto = 'Media';
    }

    return { porcentaje: puntos, nivel, texto };
  }

  /**
   * Valida el formulario de login
   */
  loginValido(): boolean {
    const email = (this.datosLogin.email || '').trim();
    const password = (this.datosLogin.password || '').trim();
    
    return !!(
      email &&
      password &&
      this.validarEmailLocal(email)
    );
  }

  /**
   * Valida el formulario de registro
   */
  registroValido(): boolean {
    const nombre = (this.datosRegistro.nombre || '').trim();
    const apellidos = (this.datosRegistro.apellidos || '').trim();
    const email = (this.datosRegistro.email || '').trim();
    const password = (this.datosRegistro.password || '').trim();
    const pais = this.datosRegistro.pais || '';

    // Verificar que todos los campos tengan contenido
    const camposCompletos = nombre.length >= 2 && 
                           apellidos.length >= 2 && 
                           email.length > 0 && 
                           password.length >= 6 && 
                           pais.length > 0;

    // Verificar validaciones específicas
    const emailValido = this.validarEmailLocal(email);
    const passwordValida = password.length >= 6;

    return camposCompletos && emailValido && passwordValida;
  }

  /**
   * Validación local de email
   */
  validarEmailLocal(email: string): boolean {
    if (!email) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Inicia sesión
   */
  iniciarSesion() {
    if (!this.validarLogin()) return;

    this.enviandoFormulario = true;
    this.limpiarErrores();

    this.authService.iniciarSesion(this.datosLogin).subscribe({
      next: (exito) => {
        if (exito) {
          this.enviandoFormulario = false;
          this.operacionExitosa = true;
          this.iniciarCountdown();
        }
      },
      error: (error) => {
        console.error('Error en el login:', error);
        this.enviandoFormulario = false;
        
        if (error === 'Usuario no encontrado') {
          this.errores.general = 'No encontramos una cuenta con este correo electrónico. ¿Necesitas crear una cuenta?';
        } else if (error === 'Contraseña incorrecta') {
          this.errores.password = 'La contraseña ingresada es incorrecta';
        } else {
          this.errores.general = 'Ocurrió un error al iniciar sesión. Por favor, intenta nuevamente.';
        }
      }
    });
  }

  /**
   * Registra un nuevo usuario
   */
  registrarUsuario() {
    if (!this.validarRegistro()) return;

    this.enviandoFormulario = true;
    this.limpiarErrores();

    this.authService.registrarUsuario(this.datosRegistro).subscribe({
      next: (exito) => {
        if (exito) {
          this.enviandoFormulario = false;
          this.operacionExitosa = true;
          this.iniciarCountdown();
        }
      },
      error: (error) => {
        console.error('Error en el registro:', error);
        this.enviandoFormulario = false;
        
        if (error === 'Este email ya está registrado') {
          this.errores.email = 'Este email ya está registrado. Intenta iniciar sesión.';
        } else {
          this.errores.general = 'Ocurrió un error al registrar la cuenta. Por favor, intenta nuevamente.';
        }
      }
    });
  }

  /**
   * Valida los campos del formulario de login
   */
  private validarLogin(): boolean {
    this.errores = {};
    let esValido = true;

    if (!this.datosLogin.email?.trim()) {
      this.errores.email = 'El correo electrónico es obligatorio';
      esValido = false;
    } else if (!this.validarEmailLocal(this.datosLogin.email)) {
      this.errores.email = 'El formato del correo electrónico no es válido';
      esValido = false;
    }

    if (!this.datosLogin.password?.trim()) {
      this.errores.password = 'La contraseña es obligatoria';
      esValido = false;
    }

    return esValido;
  }

  /**
   * Valida los campos del formulario de registro
   */
  private validarRegistro(): boolean {
    this.errores = {};
    let esValido = true;

    // Validar nombre
    const nombre = (this.datosRegistro.nombre || '').trim();
    if (!nombre) {
      this.errores.nombre = 'El nombre es obligatorio';
      esValido = false;
    } else if (nombre.length < 2) {
      this.errores.nombre = 'El nombre debe tener al menos 2 caracteres';
      esValido = false;
    }

    // Validar apellidos
    const apellidos = (this.datosRegistro.apellidos || '').trim();
    if (!apellidos) {
      this.errores.apellidos = 'Los apellidos son obligatorios';
      esValido = false;
    } else if (apellidos.length < 2) {
      this.errores.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
      esValido = false;
    }

    // Validar email
    const email = (this.datosRegistro.email || '').trim();
    if (!email) {
      this.errores.email = 'El correo electrónico es obligatorio';
      esValido = false;
    } else if (!this.validarEmailLocal(email)) {
      this.errores.email = 'El formato del correo electrónico no es válido';
      esValido = false;
    } else if (this.authService.emailEstaRegistrado(email)) {
      this.errores.email = 'Este email ya está registrado';
      esValido = false;
    }

    // Validar contraseña
    const password = (this.datosRegistro.password || '').trim();
    if (!password) {
      this.errores.password = 'La contraseña es obligatoria';
      esValido = false;
    } else if (password.length < 6) {
      this.errores.password = 'La contraseña debe tener al menos 6 caracteres';
      esValido = false;
    }

    // Validar país
    if (!this.datosRegistro.pais) {
      this.errores.pais = 'Debes seleccionar un país';
      esValido = false;
    }

    return esValido;
  }

  /**
   * Inicia el countdown de redirección
   */
  private iniciarCountdown() {
    const intervalo = setInterval(() => {
      this.tiempoRestante--;
      this.progresoCountdown = (this.tiempoRestante / 3) * 100;

      if (this.tiempoRestante <= 0) {
        clearInterval(intervalo);
        this.registroCompletado.emit();
        this.cerrarModal();
      }
    }, 1000);
  }

  /**
   * Limpia los errores
   */
  private limpiarErrores() {
    this.errores = {};
  }

  /**
   * Cierra el modal
   */
  cerrarModal(event?: Event) {
    if (event && event.target !== event.currentTarget) {
      return;
    }
    this.cerrar.emit();
  }
}