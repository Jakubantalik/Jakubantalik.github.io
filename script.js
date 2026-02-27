// Theme Manager
class ThemeManager {
    constructor() {
        this.initializeTheme();
        this.bindThemeEvents();
    }

    initializeTheme() {
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.getElementById('themeIcon');
        
        // Check for saved theme or default to system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        this.currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        this.applyTheme(this.currentTheme);
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.currentTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(this.currentTheme);
            }
        });
    }

    bindThemeEvents() {
        this.themeToggle.addEventListener('click', () => {
            this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            this.applyTheme(this.currentTheme);
            localStorage.setItem('theme', this.currentTheme);
        });
    }

    applyTheme(theme) {
        console.log('Applying theme:', theme);
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeIcon(theme);
        this.updateTwitterTheme(theme);
        
        // Force refresh any text customizations to respect new theme
        if (window.customizationPanelInstance) {
            window.customizationPanelInstance.applyTextColor();
            window.customizationPanelInstance.applyBackgroundStyle();
        }
    }

    updateTwitterTheme(theme) {
        // Update Twitter timeline theme
        const twitterTimeline = document.querySelector('.twitter-timeline');
        if (twitterTimeline) {
            twitterTimeline.setAttribute('data-theme', theme);
            // Reload Twitter widgets to apply theme change
            if (window.twttr && window.twttr.widgets) {
                window.twttr.widgets.load();
            }
        }
    }

    updateThemeIcon(theme) {
        this.themeIcon.classList.add('morph-out');
        
        setTimeout(() => {
            if (theme === 'light') {
                this.themeIcon.innerHTML = '<path d="M6.04458 1.60806C6.1589 1.35528 6.10472 1.05812 5.90855 0.861947C5.71237 0.665775 5.41522 0.611597 5.16244 0.725914C2.51258 1.92428 0.666626 4.59176 0.666626 7.69181C0.666626 11.9121 4.08786 15.3334 8.30817 15.3334C11.4082 15.3334 14.0757 13.4874 15.2741 10.8375C15.3884 10.5848 15.3342 10.2876 15.138 10.0914C14.9419 9.89526 14.6447 9.84108 14.3919 9.9554C13.6009 10.3131 12.7225 10.5126 11.7956 10.5126C8.31168 10.5126 5.4874 7.6883 5.4874 4.20438C5.4874 3.27752 5.68686 2.39905 6.04458 1.60806Z" fill="currentColor"/>';
            } else {
                this.themeIcon.innerHTML = '<path d="M8.66663 1.33333C8.66663 0.965143 8.36815 0.666666 7.99996 0.666666C7.63177 0.666666 7.33329 0.965143 7.33329 1.33333V2.66667C7.33329 3.03486 7.63177 3.33333 7.99996 3.33333C8.36815 3.33333 8.66663 3.03486 8.66663 2.66667V1.33333Z" fill="currentColor"/><path d="M8.66663 13.3333C8.66663 12.9651 8.36815 12.6667 7.99996 12.6667C7.63177 12.6667 7.33329 12.9651 7.33329 13.3333V14.6667C7.33329 15.0349 7.63177 15.3333 7.99996 15.3333C8.36815 15.3333 8.66663 15.0349 8.66663 14.6667V13.3333Z" fill="currentColor"/><path d="M0.666626 8C0.666626 7.63181 0.965103 7.33333 1.33329 7.33333H2.66663C3.03482 7.33333 3.33329 7.63181 3.33329 8C3.33329 8.36819 3.03482 8.66667 2.66663 8.66667H1.33329C0.965103 8.66667 0.666626 8.36819 0.666626 8Z" fill="currentColor"/><path d="M3.73797 2.7952C3.47762 2.53485 3.05551 2.53485 2.79516 2.7952C2.53481 3.05555 2.53481 3.47766 2.79516 3.73801L3.73797 4.68081C3.99831 4.94116 4.42042 4.94116 4.68077 4.68081C4.94112 4.42046 4.94112 3.99836 4.68077 3.73801L3.73797 2.7952Z" fill="currentColor"/><path d="M13.2048 2.7952C13.4651 3.05555 13.4651 3.47766 13.2048 3.73801L12.262 4.68081C12.0016 4.94116 11.5795 4.94116 11.3192 4.68081C11.0588 4.42046 11.0588 3.99836 11.3192 3.73801L12.262 2.7952C12.5223 2.53485 12.9444 2.53485 13.2048 2.7952Z" fill="currentColor"/><path d="M4.68077 12.2647C4.94112 12.0043 4.94112 11.5822 4.68077 11.3219C4.42042 11.0615 3.99831 11.0615 3.73797 11.3219L2.79516 12.2647C2.53481 12.525 2.53481 12.9472 2.79516 13.2075C3.05551 13.4679 3.47762 13.4679 3.73797 13.2075L4.68077 12.2647Z" fill="currentColor"/><path d="M11.3192 11.3219C11.5795 11.0615 12.0016 11.0615 12.262 11.3219L13.2048 12.2647C13.4651 12.525 13.4651 12.9472 13.2048 13.2075C12.9444 13.4679 12.5223 13.4679 12.262 13.2075L11.3192 12.2647C11.0588 12.0043 11.0588 11.5822 11.3192 11.3219Z" fill="currentColor"/><path d="M13.3333 7.33333C12.9651 7.33333 12.6666 7.63181 12.6666 8C12.6666 8.36819 12.9651 8.66667 13.3333 8.66667H14.6666C15.0348 8.66667 15.3333 8.36819 15.3333 8C15.3333 7.63181 15.0348 7.33333 14.6666 7.33333H13.3333Z" fill="currentColor"/><path d="M7.99996 4C5.79082 4 3.99996 5.79086 3.99996 8C3.99996 10.2091 5.79082 12 7.99996 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 7.99996 4Z" fill="currentColor"/>';
            }
            this.themeIcon.classList.remove('morph-out');
        }, 250);
    }
}

// Color utility functions
class ColorUtils {
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    static getLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    static getContrastRatio(color1, color2) {
        const lum1 = this.getLuminance(color1.r, color1.g, color1.b);
        const lum2 = this.getLuminance(color2.r, color2.g, color2.b);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    }

    static adjustForTheme(hex, isDark) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return hex;

        if (isDark) {
            // For dark theme, make colors lighter and more vibrant
            const factor = 1.5;
            const adjusted = {
                r: Math.min(255, Math.round(rgb.r * factor)),
                g: Math.min(255, Math.round(rgb.g * factor)),
                b: Math.min(255, Math.round(rgb.b * factor))
            };
            return this.rgbToHex(adjusted.r, adjusted.g, adjusted.b);
        } else {
            // For light theme, ensure colors are not too light
            const minIntensity = 80;
            const adjusted = {
                r: Math.max(minIntensity, rgb.r),
                g: Math.max(minIntensity, rgb.g),
                b: Math.max(minIntensity, rgb.b)
            };
            return this.rgbToHex(adjusted.r, adjusted.g, adjusted.b);
        }
    }

    static blendColors(color, target, amount) {
        // Blend `color` toward `target` by `amount` (0–1)
        return {
            r: Math.round(color.r + (target.r - color.r) * amount),
            g: Math.round(color.g + (target.g - color.g) * amount),
            b: Math.round(color.b + (target.b - color.b) * amount)
        };
    }

    static ensureContrast(textColor, bgColor, minRatio = 4.5) {
        const textRgb = this.hexToRgb(textColor);
        const bgRgb = this.hexToRgb(bgColor);
        
        if (!textRgb || !bgRgb) return textColor;

        const currentRatio = this.getContrastRatio(textRgb, bgRgb);
        if (currentRatio >= minRatio) return textColor;

        // Iteratively darken or lighten while preserving the hue
        const bgLum = this.getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
        const shouldLighten = bgLum < 0.5;

        let adjusted = { ...textRgb };
        for (let step = 0; step < 25; step++) {
            const t = (step + 1) * 0.04; // 4% steps
            const target = shouldLighten
                ? { r: 255, g: 255, b: 255 }
                : { r: 0, g: 0, b: 0 };
            adjusted = this.blendColors(textRgb, target, t);
            const ratio = this.getContrastRatio(adjusted, bgRgb);
            if (ratio >= minRatio) break;
        }

        return this.rgbToHex(adjusted.r, adjusted.g, adjusted.b);
    }

    static adaptGradientForTheme(gradientName, isDark) {
        const bg = isDark ? 'var(--bg-color)' : 'var(--bg-color)';
        const gradientMappings = {
            'gradient-sunset': {
                light: `radial-gradient(ellipse 80% 50% at 20% 0%, rgba(255, 120, 100, 0.22) 0%, transparent 70%), radial-gradient(ellipse 60% 45% at 80% 5%, rgba(255, 180, 150, 0.18) 0%, transparent 65%), radial-gradient(ellipse 90% 40% at 50% 10%, rgba(254, 207, 200, 0.12) 0%, transparent 60%), ${bg}`,
                dark: `radial-gradient(ellipse 80% 50% at 20% 0%, rgba(220, 80, 60, 0.14) 0%, transparent 70%), radial-gradient(ellipse 60% 45% at 80% 5%, rgba(200, 100, 70, 0.1) 0%, transparent 65%), radial-gradient(ellipse 90% 40% at 50% 10%, rgba(180, 80, 60, 0.06) 0%, transparent 60%), ${bg}`
            },
            'gradient-ocean': {
                light: `radial-gradient(ellipse 70% 50% at 75% 0%, rgba(100, 130, 240, 0.22) 0%, transparent 70%), radial-gradient(ellipse 65% 45% at 25% 8%, rgba(130, 90, 200, 0.16) 0%, transparent 65%), radial-gradient(ellipse 85% 35% at 55% 15%, rgba(110, 100, 220, 0.08) 0%, transparent 55%), ${bg}`,
                dark: `radial-gradient(ellipse 70% 50% at 75% 0%, rgba(70, 100, 220, 0.14) 0%, transparent 70%), radial-gradient(ellipse 65% 45% at 25% 8%, rgba(90, 65, 180, 0.1) 0%, transparent 65%), radial-gradient(ellipse 85% 35% at 55% 15%, rgba(80, 80, 200, 0.06) 0%, transparent 55%), ${bg}`
            },
            'gradient-forest': {
                light: `radial-gradient(ellipse 75% 50% at 30% 0%, rgba(100, 210, 180, 0.2) 0%, transparent 70%), radial-gradient(ellipse 55% 40% at 75% 10%, rgba(160, 230, 200, 0.16) 0%, transparent 60%), radial-gradient(ellipse 80% 35% at 50% 5%, rgba(200, 235, 220, 0.1) 0%, transparent 55%), ${bg}`,
                dark: `radial-gradient(ellipse 75% 50% at 30% 0%, rgba(34, 180, 90, 0.12) 0%, transparent 70%), radial-gradient(ellipse 55% 40% at 75% 10%, rgba(40, 160, 100, 0.08) 0%, transparent 60%), radial-gradient(ellipse 80% 35% at 50% 5%, rgba(30, 140, 80, 0.05) 0%, transparent 55%), ${bg}`
            },
            'gradient-lavender': {
                light: `radial-gradient(ellipse 65% 50% at 65% 0%, rgba(170, 120, 210, 0.2) 0%, transparent 70%), radial-gradient(ellipse 70% 40% at 20% 5%, rgba(200, 150, 220, 0.15) 0%, transparent 65%), radial-gradient(ellipse 80% 35% at 50% 12%, rgba(220, 190, 240, 0.08) 0%, transparent 55%), ${bg}`,
                dark: `radial-gradient(ellipse 65% 50% at 65% 0%, rgba(140, 100, 200, 0.12) 0%, transparent 70%), radial-gradient(ellipse 70% 40% at 20% 5%, rgba(130, 90, 190, 0.08) 0%, transparent 65%), radial-gradient(ellipse 80% 35% at 50% 12%, rgba(120, 100, 180, 0.05) 0%, transparent 55%), ${bg}`
            }
        };

        const theme = isDark ? 'dark' : 'light';
        
        if (gradientMappings[gradientName]) {
            return gradientMappings[gradientName][theme];
        }
        
        return null;
    }
}

// Text Customizer Functionality
class CustomizationPanel {
    constructor() {
        this.defaultSettings = {
            fontFamily: 'system',
            textColor: '#000000',
            textColorChanged: false,
            backgroundStyle: 'default',
            cornerRadius: 16,
            logoSize: 14,
            isBold: false,
            isItalic: false
        };
        
        this.settings = { ...this.defaultSettings };
        
        this.textElements = document.querySelectorAll('h1, h2, h3, p, span, a');
        
        this.initializeElements();
        this.setDefaultPanelState();
        this.bindEvents();
        this.loadSettings();
        this.makeDraggable();
        this.updateResetButtonState();
    }

    initializeElements() {
        this.panel = document.getElementById('customizationPanel');
        this.panelHeader = document.getElementById('panelHeader');
        this.panelContent = document.getElementById('panelContent');
        this.panelArrow = document.getElementById('panelArrow');
        
        // Custom selects
        this.fontSelect = document.getElementById('fontSelect');
        this.textColorSelect = document.getElementById('textColorSelect');
        this.colorPreview = document.getElementById('colorPreview');
        this.colorSelectValue = document.getElementById('colorSelectValue');
        this.backgroundSelect = document.getElementById('backgroundSelect');
        
        // Logo size slider
        this.logoSizeSlider = document.getElementById('logoSizeSlider');
        this.logoSizeValue = document.getElementById('logoSizeValue');
        this.logoSizeLabel = document.getElementById('logoSizeLabel');
        this.logoElement = document.querySelector('.name');
        
        // Radius slider
        this.radiusSlider = document.getElementById('radiusSlider');
        this.radiusValue = document.getElementById('radiusValue');
        
        // Buttons
        this.boldButton = document.getElementById('boldButton');
        this.italicButton = document.getElementById('italicButton');
        this.resetButton = document.getElementById('resetButton');
        
        // Mobile sheet
        this.mobileCustomizeBtn = document.getElementById('mobileCustomizeBtn');
        this.sheetOverlay = document.getElementById('sheetOverlay');

        // Wrap initial slider values in digit spans
        this.setValueInstant(this.radiusValue, this.radiusValue.textContent.trim());
        this.setValueInstant(this.logoSizeValue, this.logoSizeValue.textContent.trim());

        // Update mobile-specific labels
        this.updateMobileLabels();

        // Mobile: create nested submenu elements
        this.panelTitle = this.panel.querySelector('.panel-title');

        this.sheetSubmenu = document.createElement('div');
        this.sheetSubmenu.className = 'sheet-submenu';
        this.panel.appendChild(this.sheetSubmenu);

        this.sheetBackBtn = document.createElement('button');
        this.sheetBackBtn.className = 'sheet-back-btn';
        this.sheetBackBtn.setAttribute('aria-label', 'Back');
        this.sheetBackBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        this.panelHeader.appendChild(this.sheetBackBtn);

        this.sheetBackBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeSubmenu();
        });
    }

    setDefaultPanelState() {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // On mobile, close the sheet if open
            this.panel.classList.remove('sheet-open');
            if (this.sheetOverlay) this.sheetOverlay.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            // On desktop, expanded by default
            this.panelContent.classList.remove('collapsed');
            this.panel.classList.remove('sheet-open');
            if (this.sheetOverlay) this.sheetOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    bindEvents() {
        // Arrow click toggles panel (desktop: expand/collapse, mobile: close sheet)
        this.panelArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePanel();
        });
        
        // Mobile: customize button opens bottom sheet
        if (this.mobileCustomizeBtn) {
            this.mobileCustomizeBtn.addEventListener('click', () => this.openSheet());
        }
        
        // Mobile: overlay click closes bottom sheet
        if (this.sheetOverlay) {
            this.sheetOverlay.addEventListener('click', () => this.closeSheet());
        }
        
        // Escape key closes sheet
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.panel.classList.contains('sheet-open')) {
                this.closeSheet();
            }
        });
        
        // Custom select handlers
        this.initializeCustomSelect(this.fontSelect, (value) => {
            this.settings.fontFamily = value;
            this.applyFontFamily();
            this.saveSettings();
        });
        
        this.initializeColorSelect();
        
        this.initializeCustomSelect(this.backgroundSelect, (value) => {
            this.settings.backgroundStyle = value;
            this.applyBackgroundStyle();
            this.saveSettings();
        });
        
        // Logo size slider
        this.logoSizeSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            this.settings.logoSize = val;
            this.animateValue(this.logoSizeValue, val);
            this.applyLogoSize();
            this.saveSettings();
        });
        
        // Radius slider
        this.radiusSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            this.settings.cornerRadius = val;
            this.animateValue(this.radiusValue, val);
            this.applyCornerRadius();
            this.saveSettings();
        });
        
        // Style buttons
        this.boldButton.addEventListener('click', () => {
            this.settings.isBold = !this.settings.isBold;
            this.boldButton.classList.toggle('active', this.settings.isBold);
            this.applyTextStyle();
            this.saveSettings();
        });
        
        this.italicButton.addEventListener('click', () => {
            this.settings.isItalic = !this.settings.isItalic;
            this.italicButton.classList.toggle('active', this.settings.isItalic);
            this.applyTextStyle();
            this.saveSettings();
        });
        
        // Reset button
        this.resetButton.addEventListener('click', () => this.resetAll());
        
        // Handle window resize for responsive panel state
        window.addEventListener('resize', () => {
            this.setDefaultPanelState();
            this.updateMobileLabels();
        });

        // Swipe-to-dismiss gesture on mobile sheet
        this.initSheetSwipeDismiss();
    }

    initializeCustomSelect(selectElement, callback) {
        const selectValue = selectElement.querySelector('.select-value');
        const selectOptions = selectElement.querySelector('.select-options');
        const options = selectOptions.querySelectorAll('.select-option');
        
        if (options.length > 0) {
            options[0].classList.add('selected');
        }
        
        selectElement.addEventListener('click', (e) => {
            e.stopPropagation();

            if (window.innerWidth <= 768) {
                const label = selectElement.closest('.control-section')?.querySelector('.control-label')?.textContent || '';
                const currentText = selectValue.textContent;
                this.openSubmenu(label, options, currentText, (value, text) => {
                    options.forEach(o => o.classList.remove('selected'));
                    const selected = [...options].find(o => o.dataset.value === value);
                    if (selected) selected.classList.add('selected');
                    selectValue.textContent = text;
                    callback(value);
                    this.closeSubmenu();
                });
                return;
            }

            const isCurrentlyOpen = selectElement.classList.contains('open');
            
            this.closeAllSelects();
            
            if (!isCurrentlyOpen) {
                this.positionDropdown(selectElement, selectOptions);
                selectElement.classList.add('open');
                requestAnimationFrame(() => this.updateScrollIndicators(selectOptions));
            }
        });

        selectOptions.addEventListener('scroll', () => {
            this.updateScrollIndicators(selectOptions);
        });
        
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = option.dataset.value;
                const text = option.textContent;
                
                options.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                
                selectValue.textContent = text;
                selectElement.classList.remove('open');
                
                callback(value);
            });
        });
        
        document.addEventListener('click', () => {
            selectElement.classList.remove('open');
        });
    }

    positionDropdown(selectEl, optionsEl) {
        optionsEl.classList.remove('flip-up');
        optionsEl.style.removeProperty('transform-origin');

        const triggerRect = selectEl.getBoundingClientRect();
        const optionsHeight = Math.min(optionsEl.scrollHeight, 200) + 10;
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - triggerRect.bottom - 4;
        const spaceAbove = triggerRect.top - 4;

        if (spaceBelow < optionsHeight && spaceAbove > spaceBelow) {
            optionsEl.classList.add('flip-up');
            optionsEl.style.transformOrigin = 'bottom center';
        } else {
            optionsEl.style.transformOrigin = 'top center';
        }
    }

    initializeColorSelect() {
        const selectEl = this.textColorSelect;
        const panel = document.getElementById('colorPickerPanel');
        const spectrum = document.getElementById('cpSpectrum');
        const spectrumWrap = spectrum.parentElement;
        const cursor = document.getElementById('cpCursor');
        const hueCanvas = document.getElementById('cpHue');
        const hueWrap = hueCanvas.parentElement;
        const hueCursor = document.getElementById('cpHueCursor');
        const hexInput = document.getElementById('cpHexInput');
        const presets = panel.querySelectorAll('.cp-preset');

        // Internal state
        this.cp = { hue: 0, sat: 1, val: 0, spectrumDragging: false, hueDragging: false };

        // --- Canvas drawing ---
        const drawSpectrum = () => {
            const ctx = spectrum.getContext('2d');
            const w = spectrum.width, h = spectrum.height;
            // Base hue fill
            ctx.fillStyle = `hsl(${this.cp.hue}, 100%, 50%)`;
            ctx.fillRect(0, 0, w, h);
            // White gradient (left → right)
            const white = ctx.createLinearGradient(0, 0, w, 0);
            white.addColorStop(0, 'rgba(255,255,255,1)');
            white.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = white;
            ctx.fillRect(0, 0, w, h);
            // Black gradient (top → bottom)
            const black = ctx.createLinearGradient(0, 0, 0, h);
            black.addColorStop(0, 'rgba(0,0,0,0)');
            black.addColorStop(1, 'rgba(0,0,0,1)');
            ctx.fillStyle = black;
            ctx.fillRect(0, 0, w, h);
        };

        const drawHue = () => {
            const ctx = hueCanvas.getContext('2d');
            const w = hueCanvas.width, h = hueCanvas.height;
            const grad = ctx.createLinearGradient(0, 0, w, 0);
            for (let i = 0; i <= 6; i++) {
                grad.addColorStop(i / 6, `hsl(${i * 60}, 100%, 50%)`);
            }
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        };

        // --- HSV to hex ---
        const hsvToRgb = (h, s, v) => {
            let r, g, b;
            const i = Math.floor(h / 60) % 6;
            const f = h / 60 - Math.floor(h / 60);
            const p = v * (1 - s);
            const q = v * (1 - f * s);
            const t = v * (1 - (1 - f) * s);
            switch (i) {
                case 0: r = v; g = t; b = p; break;
                case 1: r = q; g = v; b = p; break;
                case 2: r = p; g = v; b = t; break;
                case 3: r = p; g = q; b = v; break;
                case 4: r = t; g = p; b = v; break;
                case 5: r = v; g = p; b = q; break;
            }
            return {
                r: Math.round(r * 255),
                g: Math.round(g * 255),
                b: Math.round(b * 255)
            };
        };

        const rgbToHsv = (r, g, b) => {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            const d = max - min;
            let h = 0, s = max === 0 ? 0 : d / max, v = max;
            if (d !== 0) {
                switch (max) {
                    case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
                    case g: h = ((b - r) / d + 2) * 60; break;
                    case b: h = ((r - g) / d + 4) * 60; break;
                }
            }
            return { h, s, v };
        };

        const currentHex = () => {
            const rgb = hsvToRgb(this.cp.hue, this.cp.sat, this.cp.val);
            return ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b);
        };

        // --- Update positions ---
        const updateCursors = () => {
            const sw = spectrumWrap.clientWidth, sh = spectrumWrap.clientHeight;
            cursor.style.left = `${this.cp.sat * sw}px`;
            cursor.style.top = `${(1 - this.cp.val) * sh}px`;

            const hw = hueWrap.clientWidth;
            hueCursor.style.left = `${(this.cp.hue / 360) * hw}px`;
        };

        // --- Apply color ---
        const applyColor = (closePanel = false) => {
            const hex = currentHex();
            hexInput.value = hex.replace('#', '').toUpperCase();

            this.settings.textColor = hex;
            this.settings.textColorChanged = true;
            this.colorPreview.style.background = hex;
            this.colorPreview.classList.remove('swatch-default');
            this.colorSelectValue.textContent = hex.toUpperCase();

            // Highlight matching preset
            presets.forEach(p => p.classList.toggle('active',
                p.dataset.color !== 'default' && p.dataset.color.toLowerCase() === hex.toLowerCase()
            ));

            this.applyTextColor();
            this.saveSettings();
            if (closePanel) selectEl.classList.remove('open');
        };

        // --- Spectrum interaction ---
        const spectrumPick = (e) => {
            const rect = spectrumWrap.getBoundingClientRect();
            this.cp.sat = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            this.cp.val = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
            updateCursors();
            applyColor();
        };

        spectrumWrap.addEventListener('mousedown', (e) => {
            e.preventDefault(); e.stopPropagation();
            this.cp.spectrumDragging = true;
            spectrumPick(e);
        });

        // --- Hue interaction ---
        const huePick = (e) => {
            const rect = hueWrap.getBoundingClientRect();
            this.cp.hue = Math.max(0, Math.min(360, (e.clientX - rect.left) / rect.width * 360));
            drawSpectrum();
            updateCursors();
            applyColor();
        };

        hueWrap.addEventListener('mousedown', (e) => {
            e.preventDefault(); e.stopPropagation();
            this.cp.hueDragging = true;
            huePick(e);
        });

        // Shared mousemove/mouseup
        document.addEventListener('mousemove', (e) => {
            if (this.cp.spectrumDragging) spectrumPick(e);
            if (this.cp.hueDragging) huePick(e);
        });
        document.addEventListener('mouseup', () => {
            this.cp.spectrumDragging = false;
            this.cp.hueDragging = false;
        });

        // --- Touch support ---
        spectrumWrap.addEventListener('touchstart', (e) => {
            e.preventDefault(); e.stopPropagation();
            this.cp.spectrumDragging = true;
            spectrumPick(e.touches[0]);
        }, { passive: false });

        hueWrap.addEventListener('touchstart', (e) => {
            e.preventDefault(); e.stopPropagation();
            this.cp.hueDragging = true;
            huePick(e.touches[0]);
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (this.cp.spectrumDragging) spectrumPick(e.touches[0]);
            if (this.cp.hueDragging) huePick(e.touches[0]);
        }, { passive: false });
        document.addEventListener('touchend', () => {
            this.cp.spectrumDragging = false;
            this.cp.hueDragging = false;
        });

        // --- Hex input ---
        hexInput.addEventListener('input', (e) => {
            let v = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
            e.target.value = v.toUpperCase();
            if (v.length === 6) {
                const rgb = ColorUtils.hexToRgb('#' + v);
                if (rgb) {
                    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
                    this.cp.hue = hsv.h; this.cp.sat = hsv.s; this.cp.val = hsv.v;
                    drawSpectrum();
                    updateCursors();
                    applyColor();
                }
            }
        });
        hexInput.addEventListener('click', (e) => e.stopPropagation());
        hexInput.addEventListener('mousedown', (e) => e.stopPropagation());

        // --- Presets ---
        presets.forEach(p => {
            p.addEventListener('click', (e) => {
                e.stopPropagation();
                const color = p.dataset.color;
                if (color === 'default') {
                    this.settings.textColor = '#000000';
                    this.settings.textColorChanged = false;
                    this.colorPreview.style.background = '';
                    this.colorPreview.classList.add('swatch-default');
                    this.colorSelectValue.textContent = 'Default';
                    presets.forEach(pp => pp.classList.remove('active'));
                    p.classList.add('active');
                    this.applyTextColor();
                    this.saveSettings();
                    selectEl.classList.remove('open');
                } else {
                    const rgb = ColorUtils.hexToRgb(color);
                    if (rgb) {
                        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
                        this.cp.hue = hsv.h; this.cp.sat = hsv.s; this.cp.val = hsv.v;
                        drawSpectrum();
                        updateCursors();
                        applyColor();
                    }
                }
            });
        });

        // --- Panel stop-propagation (prevent closing when interacting) ---
        panel.addEventListener('click', (e) => e.stopPropagation());
        panel.addEventListener('mousedown', (e) => e.stopPropagation());

        // --- Toggle dropdown ---
        selectEl.addEventListener('click', (e) => {
            e.stopPropagation();

            if (window.innerWidth <= 768) {
                const label = selectEl.closest('.control-section')?.querySelector('.control-label')?.textContent || 'Text color';
                this._colorPickerOriginalParent = selectEl;
                this._originalTitle = this.panelTitle.textContent;
                this.panelTitle.textContent = label;
                this._submenuCallback = null;
                this.sheetSubmenu.innerHTML = '';
                this.sheetSubmenu.appendChild(panel);
                this.panel.classList.add('submenu-open');
                requestAnimationFrame(() => {
                    spectrum.width = spectrum.parentElement.clientWidth;
                    spectrum.height = spectrum.parentElement.clientHeight;
                    hueCanvas.width = hueCanvas.parentElement.clientWidth;
                    hueCanvas.height = hueCanvas.parentElement.clientHeight;
                    drawSpectrum();
                    drawHue();
                    updateCursors();
                });
                return;
            }

            const isCurrentlyOpen = selectEl.classList.contains('open');
            this.closeAllSelects();
            if (!isCurrentlyOpen) {
                selectEl.classList.add('open');
                requestAnimationFrame(() => {
                    drawSpectrum();
                    drawHue();
                    updateCursors();
                });
            }
        });

        // Close on outside click
        document.addEventListener('click', () => {
            selectEl.classList.remove('open');
        });

        // Store helpers for updateColorSelectUI
        this._cpHelpers = { rgbToHsv, drawSpectrum, updateCursors, hsvToRgb, presets, hexInput };
    }

    setValueInstant(el, val) {
        el.textContent = '';
        el._prevVal = parseInt(val);
        const span = document.createElement('span');
        span.className = 'radius-value-digit';
        span.textContent = val;
        el.appendChild(span);
    }

    animateValue(el, newVal) {
        const oldVal = el._prevVal;
        if (oldVal === newVal) return;

        const goingUp = oldVal !== undefined && newVal > oldVal;
        el._prevVal = newVal;

        // Cancel any pending animation frame
        if (el._raf) cancelAnimationFrame(el._raf);

        // Clear all children instantly
        el.textContent = '';

        const digit = document.createElement('span');
        digit.className = 'radius-value-digit';
        digit.classList.add(goingUp ? 'enter-from-below' : 'enter-from-above');
        digit.textContent = newVal;
        el.appendChild(digit);

        el._raf = requestAnimationFrame(() => {
            digit.classList.remove('enter-from-below', 'enter-from-above');
            digit.classList.add('settle');
            el._raf = null;
        });
    }

    updateScrollIndicators(el) {
        const threshold = 2;
        const canScrollUp = el.scrollTop > threshold;
        const canScrollDown = el.scrollTop + el.clientHeight < el.scrollHeight - threshold;
        el.classList.toggle('scroll-top', canScrollUp);
        el.classList.toggle('scroll-bottom', canScrollDown);
    }

    closeAllSelects() {
        document.querySelectorAll('.custom-select.open').forEach(select => {
            select.classList.remove('open');
            const opts = select.querySelector('.select-options');
            if (opts) {
                const cleanup = () => {
                    opts.classList.remove('flip-up');
                    opts.style.removeProperty('transform-origin');
                    opts.removeEventListener('transitionend', cleanup);
                };
                opts.addEventListener('transitionend', cleanup, { once: true });
            }
        });
    }

    togglePanel() {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // On mobile, close the bottom sheet
            if (this.panel.classList.contains('sheet-open')) {
                this.closeSheet();
            }
            return;
        }
        
        // Desktop: toggle expand/collapse
        const isCollapsed = this.panelContent.classList.contains('collapsed');
        if (isCollapsed) {
            this.panelContent.classList.remove('collapsed');
            this.panelArrow.classList.remove('up');
        } else {
            this.panelContent.classList.add('collapsed');
            this.panelArrow.classList.add('up');
        }
    }

    openSheet() {
        this.panelContent.classList.remove('collapsed');
        this.panel.classList.add('sheet-open');
        if (this.sheetOverlay) this.sheetOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.updateResetButtonState();
    }

    closeSheet() {
        this.closeSubmenu();
        this.panel.classList.remove('sheet-open');
        if (this.sheetOverlay) this.sheetOverlay.classList.remove('active');
        document.body.style.overflow = '';
        this.closeAllSelects();
    }

    openSubmenu(title, options, currentValue, onSelect) {
        if (!this.sheetSubmenu || !this.sheetBackBtn) return;

        this._submenuCallback = onSelect;
        this._originalTitle = this.panelTitle.textContent;
        this.panelTitle.textContent = title;

        this.sheetSubmenu.innerHTML = '';
        options.forEach(option => {
            const item = document.createElement('div');
            item.className = 'sheet-submenu-option';
            item.textContent = option.textContent;
            item.dataset.value = option.dataset.value;
            if (option.classList.contains('selected')) {
                item.classList.add('selected');
            }
            item.addEventListener('click', () => {
                if (this._submenuCallback) {
                    this._submenuCallback(option.dataset.value, option.textContent);
                }
            });
            this.sheetSubmenu.appendChild(item);
        });

        this.panel.classList.add('submenu-open');
    }

    closeSubmenu() {
        if (!this.panel.classList.contains('submenu-open')) return;

        if (this._colorPickerOriginalParent) {
            const pickerPanel = this.sheetSubmenu.querySelector('.color-picker-panel');
            if (pickerPanel) {
                this._colorPickerOriginalParent.appendChild(pickerPanel);
            }
            this._colorPickerOriginalParent = null;
        }

        this.panel.classList.remove('submenu-open');
        if (this._originalTitle && this.panelTitle) {
            this.panelTitle.textContent = this._originalTitle;
            this._originalTitle = null;
        }
    }

    updateMobileLabels() {
        const isMobile = window.innerWidth <= 768;
        if (this.logoSizeLabel) {
            this.logoSizeLabel.textContent = isMobile ? 'Text scale' : 'Logo size';
        }
    }

    initSheetSwipeDismiss() {
        let startY = 0;
        let currentY = 0;
        let isDragging = false;

        const sheetHandle = this.panel.querySelector('.sheet-handle');
        const panelHeader = this.panelHeader;

        const onTouchStart = (e) => {
            if (window.innerWidth > 768) return;
            if (!this.panel.classList.contains('sheet-open')) return;
            if (this.panel.classList.contains('submenu-open')) return;
            isDragging = true;
            startY = e.touches[0].clientY;
            currentY = startY;
            this.panel.style.transition = 'none';
        };

        const onTouchMove = (e) => {
            if (!isDragging) return;
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            if (deltaY > 0) {
                this.panel.style.transform = `translateY(${deltaY}px)`;
                const progress = Math.min(deltaY / 300, 1);
                if (this.sheetOverlay) {
                    this.sheetOverlay.style.opacity = 1 - progress;
                }
            }
        };

        const onTouchEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            const deltaY = currentY - startY;
            this.panel.style.transition = '';
            if (this.sheetOverlay) this.sheetOverlay.style.opacity = '';

            if (deltaY > 100) {
                this.closeSheet();
            } else {
                this.panel.style.transform = '';
                requestAnimationFrame(() => {
                    this.panel.classList.add('sheet-open');
                });
            }
        };

        if (sheetHandle) {
            sheetHandle.addEventListener('touchstart', onTouchStart, { passive: true });
        }
        panelHeader.addEventListener('touchstart', onTouchStart, { passive: true });
        document.addEventListener('touchmove', onTouchMove, { passive: true });
        document.addEventListener('touchend', onTouchEnd);
    }

    applyFontFamily() {
        const fontClasses = [
            'custom-font-system', 'custom-font-serif', 'custom-font-sans-serif',
            'custom-font-monospace', 'custom-font-Georgia', 'custom-font-Times',
            'custom-font-Arial', 'custom-font-Helvetica', 'custom-font-Courier',
            'custom-font-Comic', 'custom-font-Impact', 'custom-font-Suisse'
        ];
        
        // Remove all font classes from body (applies to everything including toolbar)
        document.body.classList.remove(...fontClasses);
        
        // Also clean up any legacy per-element classes
        this.textElements.forEach(element => {
            element.classList.remove(...fontClasses);
            element.style.fontFamily = '';
        });

        // Apply new font class to body so it cascades to all elements
        if (this.settings.fontFamily !== 'system') {
            const fontClass = `custom-font-${this.settings.fontFamily.replace(' ', '')}`;
            document.body.classList.add(fontClass);
        }
    }

    applyTextColor() {
        const root = document.documentElement;
        const hex = this.settings.textColor;
        const isDark = root.getAttribute('data-theme') === 'dark';

        if (!this.settings.textColorChanged) {
            root.style.removeProperty('--text-color');
            root.style.removeProperty('--text-secondary');
            root.style.removeProperty('--text-muted');
            if (this.panel) this.panel.style.removeProperty('--toolbar-text');
            this.textElements.forEach(el => { el.style.color = ''; });
            return;
        }

        const rgb = ColorUtils.hexToRgb(hex);
        if (!rgb) return;

        const pageBgHex = isDark ? '#0f0f0f' : '#ffffff';
        const pageBg = ColorUtils.hexToRgb(pageBgHex);

        const safeHex = ColorUtils.ensureContrast(hex, pageBgHex, 4.5);
        const safeRgb = ColorUtils.hexToRgb(safeHex);

        const secondaryBlend = ColorUtils.blendColors(safeRgb, pageBg, 0.35);
        const secondaryHex = ColorUtils.rgbToHex(secondaryBlend.r, secondaryBlend.g, secondaryBlend.b);
        const safeSecondary = ColorUtils.ensureContrast(secondaryHex, pageBgHex, 3.0);

        const mutedBlend = ColorUtils.blendColors(safeRgb, pageBg, 0.55);
        const mutedHex = ColorUtils.rgbToHex(mutedBlend.r, mutedBlend.g, mutedBlend.b);
        const safeMuted = ColorUtils.ensureContrast(mutedHex, pageBgHex, 2.5);

        root.style.setProperty('--text-color', safeHex);
        root.style.setProperty('--text-secondary', safeSecondary);
        root.style.setProperty('--text-muted', safeMuted);

        const toolbarBgHex = isDark ? '#000000' : '#ffffff';
        const toolbarSafeColor = ColorUtils.ensureContrast(hex, toolbarBgHex, 4.5);
        if (this.panel) this.panel.style.setProperty('--toolbar-text', toolbarSafeColor);

        this.textElements.forEach(el => { el.style.color = ''; });
    }

    applyBackgroundStyle() {
        // Remove existing background classes
        document.body.classList.remove(
            'bg-gradient-sunset', 'bg-gradient-ocean', 'bg-gradient-forest', 'bg-gradient-lavender',
            'bg-pattern-dots', 'bg-pattern-grid', 'bg-pattern-waves', 'bg-pattern-noise'
        );

        // Apply new background
        if (this.settings.backgroundStyle !== 'default') {
            document.body.classList.add(`bg-${this.settings.backgroundStyle}`);
        }
    }

    applyCornerRadius() {
        const r = this.settings.cornerRadius;
        const inner = Math.max(0, Math.round(r * 0.5));

        // Video items
        document.querySelectorAll('.video-item').forEach(item => {
            item.style.borderRadius = `${r}px`;
            item.style.setProperty('--custom-radius', `${r}px`);
            const media = item.querySelector('video, img');
            if (media) media.style.borderRadius = `${r}px`;
        });

        // Customization panel outer shell (desktop only — mobile uses sheet border-radius)
        if (window.innerWidth > 768) {
            this.panel.style.borderRadius = `${r}px`;
        }

        // Select-options dropdowns (match inner control radius)
        document.querySelectorAll('.select-options').forEach(el => {
            el.style.borderRadius = `${inner}px`;
        });

        // Inner controls
        const innerEls = this.panel.querySelectorAll(
            '.custom-select, .select-option, .style-button, .reset-button, .radius-slider-wrapper'
        );
        innerEls.forEach(el => {
            el.style.borderRadius = `${inner}px`;
        });
    }

    applyLogoSize() {
        if (!this.logoElement) return;
        this.logoElement.style.fontSize = `${this.settings.logoSize}px`;

        if (this._logoBounceTimer) clearTimeout(this._logoBounceTimer);
        this._logoBounceTimer = setTimeout(() => {
            this.logoElement.classList.remove('size-bounce');
            void this.logoElement.offsetWidth;
            this.logoElement.classList.add('size-bounce');
            setTimeout(() => this.logoElement.classList.remove('size-bounce'), 350);
        }, 150);
    }

    applyTextStyle() {
        this.textElements.forEach(element => {
            element.style.fontWeight = this.settings.isBold ? 'bold' : '';
            element.style.fontStyle = this.settings.isItalic ? 'italic' : '';
        });
    }

    isCustomized() {
        return this.settings.fontFamily !== this.defaultSettings.fontFamily ||
               this.settings.textColorChanged !== this.defaultSettings.textColorChanged ||
               this.settings.backgroundStyle !== this.defaultSettings.backgroundStyle ||
               this.settings.cornerRadius !== this.defaultSettings.cornerRadius ||
               this.settings.logoSize !== this.defaultSettings.logoSize ||
               this.settings.isBold !== this.defaultSettings.isBold ||
               this.settings.isItalic !== this.defaultSettings.isItalic;
    }

    updateResetButtonState() {
        if (this.resetButton) {
            this.resetButton.disabled = !this.isCustomized();
        }
    }

    resetAll() {
        // Trigger reset animation — bounce + cross-blur
        this.panel.classList.add('resetting');
        
        // Reset settings to defaults
        this.settings = { ...this.defaultSettings };

        // Reset UI
        this.fontSelect.querySelector('.select-value').textContent = 'Inter';
        this.updateColorSelectUI();
        this.backgroundSelect.querySelector('.select-value').textContent = 'Default';
        this.logoSizeSlider.value = 14;
        this.animateValue(this.logoSizeValue, 14);
        this.radiusSlider.value = 16;
        this.animateValue(this.radiusValue, 16);
        
        this.boldButton.classList.remove('active');
        this.italicButton.classList.remove('active');

        // Apply reset settings
        this.applyFontFamily();
        this.applyTextColor();
        this.applyBackgroundStyle();
        this.applyLogoSize();
        this.applyCornerRadius();
        this.applyTextStyle();
        
        this.saveSettings();
        
        // Remove animation class after it completes
        setTimeout(() => {
            this.panel.classList.remove('resetting');
        }, 450);
    }

    saveSettings() {
        localStorage.setItem('customizationPanelSettings', JSON.stringify(this.settings));
        this.updateResetButtonState();
    }

    loadSettings() {
        const saved = localStorage.getItem('customizationPanelSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
            
            // Apply loaded settings
            this.applyFontFamily();
            this.applyTextColor();
            this.applyBackgroundStyle();
            this.applyLogoSize();
            this.applyCornerRadius();
            this.applyTextStyle();
            
            // Update UI to reflect loaded settings
            this.updateUIFromSettings();
        }
        this.updateResetButtonState();
    }

    updateUIFromSettings() {
        // Update font dropdown
        const fontOption = this.fontSelect.querySelector(`[data-value="${this.settings.fontFamily}"]`);
        if (fontOption) {
            this.fontSelect.querySelector('.select-value').textContent = fontOption.textContent;
            this.markSelectedOption(this.fontSelect, this.settings.fontFamily);
        }
        
        // Update text color dropdown
        this.updateColorSelectUI();
        
        // Update background dropdown
        const bgOption = this.backgroundSelect.querySelector(`[data-value="${this.settings.backgroundStyle}"]`);
        if (bgOption) {
            this.backgroundSelect.querySelector('.select-value').textContent = bgOption.textContent;
            this.markSelectedOption(this.backgroundSelect, this.settings.backgroundStyle);
        }
        
        // Update logo size slider
        this.logoSizeSlider.value = this.settings.logoSize;
        this.setValueInstant(this.logoSizeValue, this.settings.logoSize);
        
        // Update radius slider
        this.radiusSlider.value = this.settings.cornerRadius;
        this.setValueInstant(this.radiusValue, this.settings.cornerRadius);
        
        // Update style buttons
        this.boldButton.classList.toggle('active', this.settings.isBold);
        this.italicButton.classList.toggle('active', this.settings.isItalic);
    }

    markSelectedOption(selectElement, value) {
        const options = selectElement.querySelectorAll('.select-option');
        options.forEach(o => {
            o.classList.toggle('selected', o.dataset.value === value);
        });
    }

    updateColorSelectUI() {
        if (!this.settings.textColorChanged) {
            this.colorSelectValue.textContent = 'Default';
            this.colorPreview.style.background = '';
            this.colorPreview.classList.add('swatch-default');
            if (this._cpHelpers) {
                this._cpHelpers.presets.forEach(p => p.classList.toggle('active', p.dataset.color === 'default'));
                this._cpHelpers.hexInput.value = '000000';
            }
            if (this.cp) {
                this.cp.hue = 0; this.cp.sat = 0; this.cp.val = 0;
            }
        } else {
            const hex = this.settings.textColor;
            this.colorSelectValue.textContent = hex.toUpperCase();
            this.colorPreview.style.background = hex;
            this.colorPreview.classList.remove('swatch-default');
            if (this._cpHelpers) {
                this._cpHelpers.hexInput.value = hex.replace('#', '').toUpperCase();
                const rgb = ColorUtils.hexToRgb(hex);
                if (rgb && this.cp) {
                    const hsv = this._cpHelpers.rgbToHsv(rgb.r, rgb.g, rgb.b);
                    this.cp.hue = hsv.h; this.cp.sat = hsv.s; this.cp.val = hsv.v;
                }
                this._cpHelpers.presets.forEach(p => p.classList.toggle('active',
                    p.dataset.color !== 'default' && p.dataset.color.toLowerCase() === hex.toLowerCase()
                ));
            }
        }
    }

    makeDraggable() {
        // Only enable dragging on desktop
        if (window.innerWidth <= 768) {
            return;
        }
        
        let isDragging = false;
        let dragStartX, dragStartY, elementStartX, elementStartY;

        const startDrag = (e) => {
            // Only allow dragging from header, not from dropdowns, buttons, arrow, or color picker
            if (e.target.closest('.custom-select') || e.target.closest('.style-button') || e.target.closest('.reset-button') || e.target.closest('.panel-arrow')) {
                return;
            }

            isDragging = true;
            this.panel.classList.add('dragging');
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            dragStartX = clientX;
            dragStartY = clientY;
            
            const rect = this.panel.getBoundingClientRect();
            elementStartX = rect.left;
            elementStartY = rect.top;
            
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
            document.addEventListener('touchmove', drag);
            document.addEventListener('touchend', stopDrag);
            
            e.preventDefault();
        };

        const drag = (e) => {
            if (!isDragging) return;
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            const deltaX = clientX - dragStartX;
            const deltaY = clientY - dragStartY;
            
            const newX = elementStartX + deltaX;
            const newY = elementStartY + deltaY;
            
            // Keep panel within viewport bounds
            const maxX = window.innerWidth - this.panel.offsetWidth;
            const maxY = window.innerHeight - this.panel.offsetHeight;
            
            const constrainedX = Math.max(0, Math.min(newX, maxX));
            const constrainedY = Math.max(0, Math.min(newY, maxY));
            
            this.updatePosition(constrainedX, constrainedY);
        };

        const stopDrag = () => {
            if (!isDragging) return;
            
            isDragging = false;
            this.panel.classList.remove('dragging');
            
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchmove', drag);
            document.removeEventListener('touchend', stopDrag);
            
        };

        this.panelHeader.addEventListener('mousedown', startDrag);
        this.panelHeader.addEventListener('touchstart', startDrag);
    }

    updatePosition(x, y) {
        this.panel.style.left = `${x}px`;
        this.panel.style.top = `${y}px`;
        this.panel.style.right = 'auto';
    }

    savePosition(x, y) {
        localStorage.setItem('customizationPanelPosition', JSON.stringify({ x, y }));
    }

    loadPosition() {
        const saved = localStorage.getItem('customizationPanelPosition');
        if (saved) {
            const { x, y } = JSON.parse(saved);
            // Validate the saved position is still within viewport
            const maxX = window.innerWidth - (this.panel.offsetWidth || 172);
            const maxY = window.innerHeight - 52;
            const safeX = Math.max(0, Math.min(x, maxX));
            const safeY = Math.max(0, Math.min(y, maxY));
            this.updatePosition(safeX, safeY);
        }
        // If no saved position, CSS default (top-right) applies
    }
}

class TextCustomizer {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
        this.initializeDragging();
    }

    initializeElements() {
        this.customizer = document.getElementById('textCustomizer');
        this.toggleBtn = document.getElementById('toggleCustomizer');
        this.content = document.getElementById('customizerContent');
        this.fontFamilySelect = document.getElementById('fontFamily');
        this.textColorInput = document.getElementById('textColor');
        this.backgroundStyleSelect = document.getElementById('backgroundStyle');
        this.boldBtn = document.getElementById('boldBtn');
        this.italicBtn = document.getElementById('italicBtn');
        this.resetBtn = document.getElementById('resetBtn');

        this.textElements = document.querySelectorAll('h1, h2, h3, p, span, a, label');
        
        this.settings = {
            fontFamily: 'system',
            textColor: '',  // Empty string means use CSS variables
            textColorLight: '', // Light theme version
            textColorDark: '', // Dark theme version
            backgroundStyle: 'default',
            isBold: false,
            isItalic: false
        };

        // Dragging state
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
    }

    bindEvents() {
        // Toggle panel visibility
        this.toggleBtn.addEventListener('click', () => this.togglePanel());
        
        // Font family change
        this.fontFamilySelect.addEventListener('change', (e) => {
            this.settings.fontFamily = e.target.value;
            this.applyFontFamily();
            this.saveSettings();
        });

        // Text color change
        this.textColorInput.addEventListener('input', (e) => {
            const inputColor = e.target.value;
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const isDark = currentTheme === 'dark';
            
            // Store the original color
            this.settings.textColor = inputColor;
            
            // Create theme-specific versions
            this.settings.textColorLight = ColorUtils.adjustForTheme(inputColor, false);
            this.settings.textColorDark = ColorUtils.adjustForTheme(inputColor, true);
            
            this.applyTextColor();
            this.saveSettings();
        });

        // Background style change
        this.backgroundStyleSelect.addEventListener('change', (e) => {
            this.settings.backgroundStyle = e.target.value;
            this.applyBackgroundStyle();
            this.saveSettings();
        });

        // Bold toggle
        this.boldBtn.addEventListener('click', () => {
            this.settings.isBold = !this.settings.isBold;
            this.toggleBold();
            this.saveSettings();
        });

        // Italic toggle
        this.italicBtn.addEventListener('click', () => {
            this.settings.isItalic = !this.settings.isItalic;
            this.toggleItalic();
            this.saveSettings();
        });

        // Reset all settings
        this.resetBtn.addEventListener('click', () => this.resetAll());
    }

    togglePanel() {
        const isCollapsed = this.content.classList.contains('collapsed');
        if (isCollapsed) {
            this.content.classList.remove('collapsed');
            this.toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        } else {
            this.content.classList.add('collapsed');
            this.toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
        }
    }

    applyFontFamily() {
        console.log('Applying font family:', this.settings.fontFamily);
        
        // Remove all existing font classes
        this.textElements.forEach(element => {
            element.classList.remove(
                'custom-font-system', 'custom-font-serif', 'custom-font-sans-serif',
                'custom-font-monospace', 'custom-font-Georgia', 'custom-font-Times',
                'custom-font-Arial', 'custom-font-Helvetica', 'custom-font-Courier',
                'custom-font-Comic', 'custom-font-Impact', 'custom-font-Suisse'
            );
            
            // Clear any inline font-family styles to let CSS take over
            if (this.settings.fontFamily === 'system') {
                element.style.fontFamily = '';
            }
        });

        // Apply new font class
        if (this.settings.fontFamily !== 'system') {
            const fontClass = `custom-font-${this.settings.fontFamily.replace(' ', '')}`;
            console.log('Applying font class:', fontClass);
            this.textElements.forEach(element => {
                element.classList.add(fontClass);
            });
        } else {
            console.log('Using system default font (Inter)');
        }
    }

    applyTextColor() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const isDark = currentTheme === 'dark';
        
        let colorToApply = '';
        
        if (this.settings.textColor) {
            // Use theme-specific color if available, otherwise adjust the base color
            if (isDark && this.settings.textColorDark) {
                colorToApply = this.settings.textColorDark;
            } else if (!isDark && this.settings.textColorLight) {
                colorToApply = this.settings.textColorLight;
            } else {
                // Fallback: adjust the base color for current theme
                colorToApply = ColorUtils.adjustForTheme(this.settings.textColor, isDark);
            }
        }
        
        console.log('Applying text color for', currentTheme, 'theme:', colorToApply);
        
        this.textElements.forEach(element => {
            if (colorToApply) {
                element.style.color = colorToApply;
                console.log('Applied theme-aware color to', element.tagName, colorToApply);
            } else {
                // Remove inline color to allow CSS variables to work
                element.style.color = '';
                console.log('Cleared inline color for', element.tagName);
            }
        });
        
        // Show feedback when theme-aware color is applied
        if (colorToApply && this.settings.textColor) {
            const themeLabel = currentTheme === 'dark' ? 'dark' : 'light';
            this.showBriefFeedback(`Color adapted for ${themeLabel} theme`);
        }
    }

    applyBackgroundStyle() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const isDark = currentTheme === 'dark';
        
        console.log('Applying background style:', this.settings.backgroundStyle, 'for theme:', currentTheme);
        
        // Remove all existing background classes
        const bgClasses = [
            'bg-gradient-sunset', 'bg-gradient-ocean', 'bg-gradient-forest', 'bg-gradient-lavender',
            'bg-pattern-dots', 'bg-pattern-grid', 'bg-pattern-waves', 'bg-pattern-noise'
        ];
        
        document.body.classList.remove(...bgClasses);
        
        // Apply new background class if not default
        if (this.settings.backgroundStyle !== 'default') {
            const bgClass = `bg-${this.settings.backgroundStyle}`;
            document.body.classList.add(bgClass);
            console.log('Applied background class:', bgClass);
            
            // Show feedback for gradient adaptations
            if (this.settings.backgroundStyle.includes('gradient')) {
                const gradientName = this.settings.backgroundStyle;
                const themeLabel = isDark ? 'dark' : 'light';
                this.showBriefFeedback(`${gradientName.replace('gradient-', '').charAt(0).toUpperCase() + gradientName.replace('gradient-', '').slice(1)} gradient adapted for ${themeLabel} theme`);
            }
        } else {
            console.log('Using default background');
        }
    }

    toggleBold() {
        this.boldBtn.classList.toggle('active', this.settings.isBold);
        
        this.textElements.forEach(element => {
            if (this.settings.isBold) {
                element.style.fontWeight = 'bold';
            } else {
                element.style.fontWeight = '';
            }
        });
    }

    toggleItalic() {
        this.italicBtn.classList.toggle('active', this.settings.isItalic);
        
        this.textElements.forEach(element => {
            if (this.settings.isItalic) {
                element.style.fontStyle = 'italic';
            } else {
                element.style.fontStyle = '';
            }
        });
    }

    resetAll() {
        // Reset settings
        this.settings = {
            fontFamily: 'system',
            textColor: '',
            textColorLight: '',
            textColorDark: '',
            backgroundStyle: 'default',
            isBold: false,
            isItalic: false
        };

        // Reset UI controls
        this.fontFamilySelect.value = 'system';
        this.textColorInput.value = '#333333';
        this.backgroundStyleSelect.value = 'default';
        this.boldBtn.classList.remove('active');
        this.italicBtn.classList.remove('active');

        // Reset all text elements
        this.textElements.forEach(element => {
            // Remove all custom font classes
            element.classList.remove(
                'custom-font-system', 'custom-font-serif', 'custom-font-sans-serif',
                'custom-font-monospace', 'custom-font-Georgia', 'custom-font-Times',
                'custom-font-Arial', 'custom-font-Helvetica', 'custom-font-Courier',
                'custom-font-Comic', 'custom-font-Impact', 'custom-font-Suisse'
            );
            
            // Reset inline styles
            element.style.color = '';
            element.style.fontWeight = '';
            element.style.fontStyle = '';
        });

        // Reset background
        this.applyBackgroundStyle();

        this.saveSettings();
        
        // Show feedback
        this.showFeedback('All settings reset!');
    }

    initializeDragging() {
        let startX, startY, initialX, initialY;

        // Mouse events
        this.customizer.addEventListener('mousedown', (e) => {
            if (e.target.closest('.customizer-content')) return; // Don't drag when clicking controls
            
            this.isDragging = true;
            this.customizer.classList.add('dragging');
            
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = this.customizer.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            
            this.dragOffset.x = startX - initialX;
            this.dragOffset.y = startY - initialY;
            
            document.addEventListener('mousemove', this.handleMouseMove.bind(this));
            document.addEventListener('mouseup', this.handleMouseUp.bind(this));
            
            e.preventDefault();
        });

        // Touch events for mobile
        this.customizer.addEventListener('touchstart', (e) => {
            if (e.target.closest('.customizer-content')) return;
            
            this.isDragging = true;
            this.customizer.classList.add('dragging');
            
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            
            const rect = this.customizer.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            
            this.dragOffset.x = startX - initialX;
            this.dragOffset.y = startY - initialY;
            
            document.addEventListener('touchmove', this.handleTouchMove.bind(this));
            document.addEventListener('touchend', this.handleTouchEnd.bind(this));
            
            e.preventDefault();
        });
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        const newX = e.clientX - this.dragOffset.x;
        const newY = e.clientY - this.dragOffset.y;
        
        this.updatePosition(newX, newY);
    }

    handleTouchMove(e) {
        if (!this.isDragging) return;
        
        const touch = e.touches[0];
        const newX = touch.clientX - this.dragOffset.x;
        const newY = touch.clientY - this.dragOffset.y;
        
        this.updatePosition(newX, newY);
        e.preventDefault();
    }

    handleMouseUp() {
        this.finishDragging();
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    handleTouchEnd() {
        this.finishDragging();
        document.removeEventListener('touchmove', this.handleTouchMove.bind(this));
        document.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    updatePosition(x, y) {
        // Constrain to viewport
        const maxX = window.innerWidth - this.customizer.offsetWidth;
        const maxY = window.innerHeight - this.customizer.offsetHeight;
        
        const constrainedX = Math.max(0, Math.min(x, maxX));
        const constrainedY = Math.max(0, Math.min(y, maxY));
        
        this.customizer.style.left = constrainedX + 'px';
        this.customizer.style.top = constrainedY + 'px';
        this.customizer.style.right = 'auto';
        this.customizer.style.bottom = 'auto';
    }

    finishDragging() {
        this.isDragging = false;
        this.customizer.classList.remove('dragging');
        
        // Save position
        const rect = this.customizer.getBoundingClientRect();
        this.savePosition(rect.left, rect.top);
    }

    savePosition(x, y) {
        localStorage.setItem('textCustomizerPosition', JSON.stringify({ x, y }));
    }

    loadPosition() {
        const saved = localStorage.getItem('textCustomizerPosition');
        if (saved) {
            const { x, y } = JSON.parse(saved);
            this.updatePosition(x, y);
        }
    }

    saveSettings() {
        localStorage.setItem('textCustomizerSettings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('textCustomizerSettings');
        if (saved) {
            const savedSettings = JSON.parse(saved);
            
            // If saved settings have old black color, reset them
            if (savedSettings.textColor === '#000000') {
                localStorage.removeItem('textCustomizerSettings');
                return; // Don't apply old settings
            }
            
            this.settings = { ...this.settings, ...savedSettings };
            
            // Apply saved settings
            this.fontFamilySelect.value = this.settings.fontFamily;
            this.textColorInput.value = this.settings.textColor || '#333333';
            this.backgroundStyleSelect.value = this.settings.backgroundStyle || 'default';
            
            this.applyFontFamily();
            this.applyTextColor();
            this.applyBackgroundStyle();
            
            if (this.settings.isBold) {
                this.toggleBold();
            }
            
            if (this.settings.isItalic) {
                this.toggleItalic();
            }
        }
        
        // Load saved position
        this.loadPosition();
    }

    showFeedback(message) {
        // Create temporary feedback element
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #667eea;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        feedback.textContent = message;
        
        document.body.appendChild(feedback);
        
        // Remove after 2 seconds
        setTimeout(() => {
            feedback.remove();
        }, 2000);
    }

    showBriefFeedback(message) {
        // Create temporary brief feedback element
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: rgba(102, 126, 234, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 400;
            z-index: 1001;
            animation: slideIn 0.2s ease;
            backdrop-filter: blur(10px);
        `;
        feedback.textContent = message;
        
        document.body.appendChild(feedback);
        
        // Remove after 1 second
        setTimeout(() => {
            feedback.style.animation = 'slideOut 0.2s ease';
            setTimeout(() => feedback.remove(), 200);
        }, 1000);
    }
}

// Add CSS animation for feedback
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Video Gallery Handler
class VideoHandler {
    constructor() {
        this.initializeVideos();
        this.setupIntersectionObserver();
    }

    initializeVideos() {
        const videos = document.querySelectorAll('.video-item video');
        
        videos.forEach(video => {
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            
            video.addEventListener('error', (e) => {
                console.log('Video failed to load:', video.src);
                const videoItem = video.closest('.video-item');
                if (videoItem) {
                    videoItem.style.display = 'none';
                }
            });

            video.addEventListener('loadeddata', () => {
                video.style.opacity = '0';
                video.style.transition = 'opacity 0.5s ease';
                const videoItem = video.closest('.video-item');
                if (videoItem) videoItem.classList.add('loaded');
                setTimeout(() => {
                    video.style.opacity = '1';
                }, 100);
            });
        });

        const images = document.querySelectorAll('.video-item img');
        images.forEach(img => {
            const fadeIn = () => {
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.5s ease';
                const videoItem = img.closest('.video-item');
                if (videoItem) videoItem.classList.add('loaded');
                setTimeout(() => { img.style.opacity = '1'; }, 100);
            };
            if (img.complete) {
                fadeIn();
            } else {
                img.addEventListener('load', fadeIn);
            }
            img.addEventListener('error', () => {
                const videoItem = img.closest('.video-item');
                if (videoItem) videoItem.style.display = 'none';
            });
        });
    }

    setupIntersectionObserver() {
        // Pause videos when not visible to save bandwidth
        const options = {
            threshold: 0.5,
            rootMargin: '50px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target.querySelector('video');
                if (video) {
                    if (entry.isIntersecting) {
                        video.play().catch(e => {
                            console.log('Video autoplay prevented:', e);
                        });
                    } else {
                        video.pause();
                    }
                }
            });
        }, options);

        // Observe all video items
        document.querySelectorAll('.video-item').forEach(item => {
            observer.observe(item);
        });
    }
}


// Debug function to clear all localStorage
window.clearAllSettings = function() {
    localStorage.clear();
    location.reload();
};

// Debug function to test blur effect
window.testBlur = function() {
    const panel = document.getElementById('customizationPanel');
    if (panel) {
        panel.classList.add('dragging');
        console.log('Blur test: dragging class added');
        setTimeout(() => {
            panel.classList.remove('dragging');
            console.log('Blur test: dragging class removed');
        }, 3000);
    }
};

// Debug function to test positioning
window.testPosition = function() {
    const panel = document.getElementById('customizationPanel');
    if (panel) {
        console.log('Current position:', panel.style.left, panel.style.top);
        panel.style.left = '100px';
        panel.style.top = '100px';
        console.log('Set position to 100px, 100px');
    }
};

// Debug function to force Inter font
window.forceInterFont = function() {
    console.log('Forcing Inter font...');
    
    // Clear any saved font settings
    const settings = JSON.parse(localStorage.getItem('textCustomizerSettings') || '{}');
    console.log('Current saved settings:', settings);
    settings.fontFamily = 'system';
    localStorage.setItem('textCustomizerSettings', JSON.stringify(settings));
    
    // Clear all font classes and inline styles
    const textElements = document.querySelectorAll('h1, h2, h3, p, span, a, label, div, body, *');
    textElements.forEach(element => {
        // Remove all custom font classes
        element.className = element.className.replace(/custom-font-[\w-]+/g, '');
        // Clear inline font styles
        element.style.fontFamily = '';
    });
    
    // Force body to use Inter
    document.body.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif";
    
    // Update the customizer UI
    const fontSelect = document.getElementById('fontFamily');
    if (fontSelect) {
        fontSelect.value = 'system';
        console.log('Font select updated to:', fontSelect.value);
    }
    
    // Force apply the settings
    if (window.textCustomizerInstance) {
        window.textCustomizerInstance.settings.fontFamily = 'system';
        window.textCustomizerInstance.applyFontFamily();
    }
    
    console.log('Forced Inter font reset complete');
};

// Font loading check
function checkInterFont() {
    // Check if Inter font is loaded
    if (document.fonts && document.fonts.check) {
        const interLoaded = document.fonts.check('16px Inter');
        console.log('Inter font loaded:', interLoaded);
        
        if (!interLoaded) {
            console.warn('Inter font not loaded, forcing font refresh');
            // Force font refresh
            document.fonts.load('16px Inter').then(() => {
                console.log('Inter font loaded successfully');
                // Force apply Inter after loading
                document.body.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif";
            }).catch(e => {
                console.error('Failed to load Inter font:', e);
                // Fallback: still try to apply Inter
                document.body.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif";
            });
        } else {
            // Font is loaded, ensure it's applied
            document.body.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif";
        }
    } else {
        // Fallback for browsers without font loading API
        document.body.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif";
    }
    
    // Double check what font is actually computed
    setTimeout(() => {
        const computedStyle = window.getComputedStyle(document.body);
        console.log('Computed font-family:', computedStyle.fontFamily);
    }, 500);
}

// Particle Easter Egg on Logo Click
class ParticleEasterEgg {
    constructor(logoElement) {
        this.logo = logoElement;
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animating = false;
        this.bindEvents();
    }

    bindEvents() {
        this.logo.style.cursor = 'pointer';
        this.logo.addEventListener('click', () => {
            // Play click scale animation
            this.logo.classList.remove('clicked');
            void this.logo.offsetWidth; // force reflow to restart animation
            this.logo.classList.add('clicked');
            this.trigger();
        });
    }

    trigger() {
        if (this.animating) return;
        this.animating = true;

        // Create full-screen canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 99999;
        `;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // Spawn particles from top
        this.particles = [];
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const count = 60;

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: -Math.random() * 80 - 10,
                vx: (Math.random() - 0.5) * 0.8,
                vy: Math.random() * 1.5 + 0.8,
                size: Math.random() * 3 + 1.5,
                opacity: Math.random() * 0.5 + 0.15,
                color: isDark ? '255, 255, 255' : '0, 0, 0',
                delay: Math.random() * 800,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.03,
            });
        }

        this.startTime = performance.now();
        this.duration = 3500;
        this.animate();
    }

    animate() {
        const now = performance.now();
        const elapsed = now - this.startTime;

        if (elapsed > this.duration) {
            // Fade out canvas
            this.canvas.style.transition = 'opacity 0.6s ease';
            this.canvas.style.opacity = '0';
            setTimeout(() => {
                this.canvas.remove();
                this.canvas = null;
                this.ctx = null;
                this.particles = [];
                this.animating = false;
            }, 600);
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Global fade-out in the last 800ms
        const fadeStart = this.duration - 800;
        const globalAlpha = elapsed > fadeStart ? 1 - (elapsed - fadeStart) / 800 : 1;

        this.particles.forEach(p => {
            if (elapsed < p.delay) return;

            // Update physics
            p.vy += 0.02; // subtle gravity
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;

            // Slight horizontal drift (wind)
            p.vx += (Math.random() - 0.5) * 0.02;

            const alpha = p.opacity * globalAlpha;
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            this.ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
            this.ctx.beginPath();

            // Mix of circles and tiny rectangles for organic feel
            if (p.size > 2.5) {
                this.ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6);
            } else {
                this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            }

            this.ctx.restore();
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    window.customizationPanelInstance = new CustomizationPanel();
    new VideoHandler();

    // Easter egg: particles on logo click
    const logo = document.querySelector('.name');
    if (logo) new ParticleEasterEgg(logo);
    
    // Check font loading
    setTimeout(checkInterFont, 100);
});

// Add some fun easter eggs
document.addEventListener('keydown', (e) => {
    // Konami code: ↑↑↓↓←→←→BA
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    
    if (!window.konamiProgress) window.konamiProgress = 0;
    
    if (e.code === konamiCode[window.konamiProgress]) {
        window.konamiProgress++;
        if (window.konamiProgress === konamiCode.length) {
            // Easter egg: Apply rainbow colors temporarily
            const textElements = document.querySelectorAll('h1, h2, h3, p, span, a');
            const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];
            
            textElements.forEach((element, index) => {
                element.style.color = colors[index % colors.length];
                element.style.transition = 'color 0.5s ease';
            });
            
            // Reset after 3 seconds to restore theme colors
            setTimeout(() => {
                textElements.forEach(element => {
                    element.style.color = '';
                    element.style.transition = '';
                });
            }, 3000);
            
            window.konamiProgress = 0;
            
            // Show special message
            const customizer = new TextCustomizer();
            customizer.showFeedback('🌈 Rainbow mode activated!');
        }
    } else {
        window.konamiProgress = 0;
    }
});
