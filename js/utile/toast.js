class ToastManager {
    constructor() {
        this.container = this.createContainer();
        this.toasts = [];
    }

    createContainer() {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    show(message, type = 'info', duration = 4000) {
        const toast = this.createToast(message, type);
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Auto-remove
        setTimeout(() => this.remove(toast), duration);

        return toast;
    }

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">×</button>
        `;

        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.remove(toast);
        });

        return toast;
    }

    remove(toast) {
        toast.classList.add('removing');
        setTimeout(() => {
            toast.remove();
            this.toasts = this.toasts.filter(t => t !== toast);
        }, 300);
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }
}

// Instance globale
window.toast = new ToastManager();