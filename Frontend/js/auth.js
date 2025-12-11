// Manejo de autenticación
class AuthHandler {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthState();
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Password recovery form
        const recoveryForm = document.getElementById('recoveryForm');
        if (recoveryForm) {
            recoveryForm.addEventListener('submit', (e) => this.handlePasswordRecovery(e));
        }

        // Password visibility toggle
        const togglePasswordBtns = document.querySelectorAll('.toggle-password');
        togglePasswordBtns.forEach(btn => {
            btn.addEventListener('click', () => this.togglePasswordVisibility(btn));
        });
    }

    checkAuthState() {
        const token = localStorage.getItem('token');
        const currentPage = window.location.pathname;
        
        // Páginas que requieren autenticación
        const protectedPages = [
            'B04_Perfil_Usuario.html',
            'B05_Direcciones.html',
            'B06_Historial_Pedidos.html',
            'B10_Carrito_de_Compras.html',
            'B11_Checkout.html'
        ];
        
        const isProtectedPage = protectedPages.some(page => currentPage.includes(page));
        
        if (isProtectedPage && !token) {
            window.location.href = 'B01_Inicio_Sesion.html';
            return;
        }
        
        // Si ya está autenticado y está en login/register, redirigir al perfil
        if (token && (currentPage.includes('B01_') || currentPage.includes('B02_'))) {
            window.location.href = 'B04_Perfil_Usuario.html';
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        // Validación
        if (!email || !password) {
            Utils.showToast('Por favor completa todos los campos', 'error');
            return;
        }
        
        if (!Utils.validateEmail(email)) {
            Utils.showToast('Ingresa un email válido', 'error');
            return;
        }
        
        // Mostrar loading
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Ingresando...';
        submitBtn.disabled = true;
        
        try {
            const result = await auth.login(email, password);
            
            if (result.token) {
                localStorage.setItem('token', result.token);
                setTimeout(() => {
                    window.location.href = 'B04_Perfil_Usuario.html';
                }, 1000);
            }
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            phone: formData.get('phone'),
            address: formData.get('address')
        };
        
        // Validación
        const errors = this.validateRegisterData(userData);
        if (errors.length > 0) {
            errors.forEach(error => Utils.showToast(error, 'error'));
            return;
        }
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Registrando...';
        submitBtn.disabled = true;
        
        try {
            // Remover confirmPassword antes de enviar
            delete userData.confirmPassword;
            
            const result = await auth.register(userData);
            
            if (result.token) {
                localStorage.setItem('token', result.token);
                setTimeout(() => {
                    window.location.href = 'B04_Perfil_Usuario.html';
                }, 1000);
            }
        } catch (error) {
            console.error('Register error:', error);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    validateRegisterData(data) {
        const errors = [];
        
        if (!data.name || data.name.length < 3) {
            errors.push('El nombre debe tener al menos 3 caracteres');
        }
        
        if (!Utils.validateEmail(data.email)) {
            errors.push('Ingresa un email válido');
        }
        
        if (!data.password || data.password.length < 6) {
            errors.push('La contraseña debe tener al menos 6 caracteres');
        }
        
        if (data.password !== data.confirmPassword) {
            errors.push('Las contraseñas no coinciden');
        }
        
        return errors;
    }

    async handlePasswordRecovery(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        
        if (!Utils.validateEmail(email)) {
            Utils.showToast('Ingresa un email válido', 'error');
            return;
        }
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
        
        try {
            // Simular envío de email
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            Utils.showToast('Se ha enviado un enlace de recuperación a tu email', 'success');
            
            // Limpiar formulario
            e.target.reset();
            
            // Redirigir después de 2 segundos
            setTimeout(() => {
                window.location.href = 'B01_Inicio_Sesion.html';
            }, 2000);
            
        } catch (error) {
            Utils.showToast('Error al enviar el email de recuperación', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    togglePasswordVisibility(button) {
        const input = button.previousElementSibling;
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new AuthHandler();
});