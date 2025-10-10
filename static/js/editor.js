// Mini Image Editor - JavaScript Functions

// ===== VARIABLES GLOBALES =====
let currentImage = null;
let currentFilters = {
    globalBrightness: 100,
    redBrightness: 100,
    greenBrightness: 100,
    blueBrightness: 100,
    logContrast: 0,
    expContrast: 0,
    grayscale: false,
    negative: false,
    binary: false,
    threshold: 128
};

let fusionImages = {
    image1: null,
    image2: null
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Mini Image Editor initialized');
    console.log('🔧 Inicializando editor...');
    
    // Test básico
    console.log('🧪 Test básico - verificando elementos...');
    const testSlider = document.getElementById('globalBrightnessSlider');
    console.log('🧪 Slider encontrado:', testSlider);
    
    if (testSlider) {
        console.log('🧪 Slider existe, agregando test listener...');
        testSlider.addEventListener('input', function() {
            console.log('🧪 TEST: Slider movido a:', this.value);
        });
    }
    
    initializeEditor();
    console.log('🎯 Configurando event listeners...');
    setupEventListeners();
    
    // Verificar si hay una imagen cargada
    console.log('🖼️ Verificando imagen cargada...');
    checkForLoadedImage();
    
    console.log('✅ Editor completamente inicializado');
});

// ===== INICIALIZAR EDITOR =====
function initializeEditor() {
    // Configurar sliders
    setupSliders();
    
    // Configurar tabs
    setupTabs();
    
    // Configurar botones
    setupButtons();
}

     // ===== CONFIGURAR SLIDERS =====
     function setupSliders() {
         console.log('🎚️ Configurando sliders...');
         
         // Global Brightness
         const globalBrightnessSlider = document.getElementById('globalBrightnessSlider');
         const globalBrightnessValue = document.getElementById('globalBrightnessValue');
         
         console.log('🔍 Buscando slider de brillo global...');
         console.log('Slider encontrado:', globalBrightnessSlider);
         console.log('Value encontrado:', globalBrightnessValue);
         
         if (globalBrightnessSlider && globalBrightnessValue) {
             console.log('✅ Slider de brillo global encontrado y configurado');
             globalBrightnessSlider.addEventListener('input', function() {
                 const value = this.value;
                 console.log('🎚️ Slider movido a:', value);
                 globalBrightnessValue.textContent = value + '%';
                 currentFilters.globalBrightness = parseInt(value);
                 
                 // Aplicar todos los filtros sobre imagen original
                 console.log('🔧 Aplicando todos los filtros...');
                 applyAllFilters();
             });
         } else {
             console.error('❌ No se encontró el slider de brillo global');
             console.error('Slider:', globalBrightnessSlider);
             console.error('Value:', globalBrightnessValue);
         }
    
    // Channel Brightness
    const redBrightnessSlider = document.getElementById('redBrightnessSlider');
    const redBrightnessValue = document.getElementById('redBrightnessValue');
    
    if (redBrightnessSlider && redBrightnessValue) {
             redBrightnessSlider.addEventListener('input', function() {
                 const value = this.value;
                 redBrightnessValue.textContent = value + '%';
                 currentFilters.redBrightness = parseInt(value);
                 applyAllFilters();
             });
    }
    
    const greenBrightnessSlider = document.getElementById('greenBrightnessSlider');
    const greenBrightnessValue = document.getElementById('greenBrightnessValue');
    
    if (greenBrightnessSlider && greenBrightnessValue) {
        greenBrightnessSlider.addEventListener('input', function() {
            const value = this.value;
            greenBrightnessValue.textContent = value + '%';
            currentFilters.greenBrightness = parseInt(value);
                 applyAllFilters();
        });
    }
    
    const blueBrightnessSlider = document.getElementById('blueBrightnessSlider');
    const blueBrightnessValue = document.getElementById('blueBrightnessValue');
    
    if (blueBrightnessSlider && blueBrightnessValue) {
        blueBrightnessSlider.addEventListener('input', function() {
            const value = this.value;
            blueBrightnessValue.textContent = value + '%';
            currentFilters.blueBrightness = parseInt(value);
                 applyAllFilters();
        });
    }
    
    // Contrast Sliders
    const logContrastSlider = document.getElementById('logContrastSlider');
    const logContrastValue = document.getElementById('logContrastValue');
    
    if (logContrastSlider && logContrastValue) {
        logContrastSlider.addEventListener('input', function() {
            const value = this.value;
            logContrastValue.textContent = value + '%';
            currentFilters.logContrast = parseInt(value);
                 applyAllFilters();
        });
    }
    
    const expContrastSlider = document.getElementById('expContrastSlider');
    const expContrastValue = document.getElementById('expContrastValue');
    
    if (expContrastSlider && expContrastValue) {
        expContrastSlider.addEventListener('input', function() {
            const value = this.value;
            expContrastValue.textContent = value + '%';
            currentFilters.expContrast = parseInt(value);
                 applyAllFilters();
        });
    }
    
    // Threshold slider
    const thresholdSlider = document.getElementById('thresholdSlider');
    const thresholdValue = document.getElementById('thresholdValue');
    
    if (thresholdSlider && thresholdValue) {
        thresholdSlider.addEventListener('input', function() {
            const value = this.value;
            thresholdValue.textContent = value;
            currentFilters.threshold = parseInt(value);
                 if (currentFilters.binary) {
                     applyAllFilters();
                 }
        });
    }
    
    // Zoom slider
    const zoomSlider = document.getElementById('zoomSlider');
    const zoomValue = document.getElementById('zoomValue');
    
    if (zoomSlider && zoomValue) {
        zoomSlider.addEventListener('input', function() {
            const value = parseFloat(this.value);
            zoomValue.textContent = value.toFixed(1) + 'x';
        });
    }
    
    // Rotation slider
    const rotationSlider = document.getElementById('rotationSlider');
    const rotationValue = document.getElementById('rotationValue');
    
    if (rotationSlider && rotationValue) {
        rotationSlider.addEventListener('input', function() {
            const value = this.value;
            rotationValue.textContent = value + '°';
        });
    }
}

// ===== CONFIGURAR TABS =====
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remover clase active de todos los botones
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Remover clase active de todos los paneles
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Agregar clase active al botón clickeado
            this.classList.add('active');
            
            // Mostrar el panel correspondiente
            const targetPanel = document.getElementById(targetTab);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

// ===== CONFIGURAR BOTONES =====
function setupButtons() {
    // New Image button
    const newImageBtn = document.getElementById('newImageBtn');
    const fileInput = document.getElementById('fileInput');
    
    if (newImageBtn && fileInput) {
        newImageBtn.addEventListener('click', function() {
            fileInput.click();
        });
    }
    
    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                uploadImage(this.files[0]);
            }
        });
    }
    
    // Download button
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            downloadImage();
        });
    }
    
    // Effect checkboxes
    const grayscaleCheck = document.getElementById('grayscaleCheck');
    if (grayscaleCheck) {
        grayscaleCheck.addEventListener('change', function() {
            currentFilters.grayscale = this.checked;
                 if (this.checked) {
                     applyAllFilters();
                 }
        });
    }
    
    const negativeCheck = document.getElementById('negativeCheck');
    if (negativeCheck) {
        negativeCheck.addEventListener('change', function() {
            currentFilters.negative = this.checked;
                 if (this.checked) {
                     applyAllFilters();
                 }
        });
    }
    
    const binaryCheck = document.getElementById('binaryCheck');
    const binaryControls = document.getElementById('binaryControls');
    if (binaryCheck && binaryControls) {
        binaryCheck.addEventListener('change', function() {
            currentFilters.binary = this.checked;
            binaryControls.style.display = this.checked ? 'block' : 'none';
                 if (this.checked) {
                     applyAllFilters();
                 }
        });
    }
    
    // Apply buttons
    const applyCropBtn = document.getElementById('applyCropBtn');
    if (applyCropBtn) {
        applyCropBtn.addEventListener('click', function() {
            applyCrop();
        });
    }
    
    const applyZoomBtn = document.getElementById('applyZoomBtn');
    if (applyZoomBtn) {
        applyZoomBtn.addEventListener('click', function() {
            applyZoom();
        });
    }
    
    const applyRotationBtn = document.getElementById('applyRotationBtn');
    if (applyRotationBtn) {
        applyRotationBtn.addEventListener('click', function() {
            applyRotation();
        });
    }
    
    // Layer extraction buttons
    const extractRedBtn = document.getElementById('extractRedBtn');
    if (extractRedBtn) {
        extractRedBtn.addEventListener('click', function() {
            extractLayer('red');
        });
    }
    
    const extractGreenBtn = document.getElementById('extractGreenBtn');
    if (extractGreenBtn) {
        extractGreenBtn.addEventListener('click', function() {
            extractLayer('green');
        });
    }
    
    const extractBlueBtn = document.getElementById('extractBlueBtn');
    if (extractBlueBtn) {
        extractBlueBtn.addEventListener('click', function() {
            extractLayer('blue');
        });
    }
    
    const extractCyanBtn = document.getElementById('extractCyanBtn');
    if (extractCyanBtn) {
        extractCyanBtn.addEventListener('click', function() {
            extractLayer('cyan');
        });
    }
    
    const extractMagentaBtn = document.getElementById('extractMagentaBtn');
    if (extractMagentaBtn) {
        extractMagentaBtn.addEventListener('click', function() {
            extractLayer('magenta');
        });
    }
    
    const extractYellowBtn = document.getElementById('extractYellowBtn');
    if (extractYellowBtn) {
        extractYellowBtn.addEventListener('click', function() {
            extractLayer('yellow');
        });
    }
    
    const extractBlackBtn = document.getElementById('extractBlackBtn');
    if (extractBlackBtn) {
        extractBlackBtn.addEventListener('click', function() {
            extractLayer('black');
        });
    }
    
    // Fusion buttons
    const normalFusionBtn = document.getElementById('normalFusionBtn');
    if (normalFusionBtn) {
        normalFusionBtn.addEventListener('click', function() {
            applyFusion('normal');
        });
    }
    
    const equalizedFusionBtn = document.getElementById('equalizedFusionBtn');
    if (equalizedFusionBtn) {
        equalizedFusionBtn.addEventListener('click', function() {
            applyFusion('equalized');
        });
    }
    
    // Histogram button
    const showHistogramBtn = document.getElementById('showHistogramBtn');
    if (showHistogramBtn) {
        showHistogramBtn.addEventListener('click', function() {
            showHistogram();
        });
    }
    
    // Fusion image inputs
    const image1Input = document.getElementById('image1Input');
    const image2Input = document.getElementById('image2Input');
    
    if (image1Input) {
        image1Input.addEventListener('change', function() {
            if (this.files.length > 0) {
                loadFusionImage(1, this.files[0]);
            }
        });
    }
    
    if (image2Input) {
        image2Input.addEventListener('change', function() {
            if (this.files.length > 0) {
                loadFusionImage(2, this.files[0]);
            }
        });
    }
    
    // Reset button
    const resetBtn = document.getElementById('resetAllBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            resetAllFilters();
        });
    }
}

// ===== SUBIR IMAGEN =====
function uploadImage(file) {
    if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB
        alert('El archivo es demasiado grande. Máximo 10MB');
        return;
    }
    
    // Crear URL temporal para la imagen
    const imageUrl = URL.createObjectURL(file);
    
    // Mostrar la imagen en el canvas
    displayImage(imageUrl);
    
    // Simular subida al servidor
    const formData = new FormData();
    formData.append('image', file);
    
    fetch('/upload/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': getCSRFToken()
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Imagen subida exitosamente');
        } else {
            console.error('Error al subir imagen:', data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// ===== MOSTRAR IMAGEN =====
function displayImage(imageUrl) {
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.innerHTML = `
            <img src="${imageUrl}" alt="Imagen cargada" style="max-width: 100%; max-height: 100%; object-fit: contain;">
        `;
        currentImage = imageUrl;
    }
}

// ===== VERIFICAR IMAGEN CARGADA =====
function checkForLoadedImage() {
    const imagePreview = document.getElementById('imagePreview');
    const img = imagePreview.querySelector('img');
    
    if (img && img.src) {
        currentImage = img.src;
        console.log('Imagen cargada desde el servidor:', img.src);
    } else {
        console.log('No hay imagen cargada');
    }
}

// ===== APLICAR FILTROS =====
function applyFilters() {
    // Aplicar filtros usando las funciones de Python
    applyBrilloGlobal();
}

     // ===== APLICAR TODOS LOS FILTROS =====
     function applyAllFilters() {
         console.log('Aplicando todos los filtros sobre imagen original...');
         
         fetch('/apply-multiple-filters/', {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
                 'X-CSRFToken': getCSRFToken()
             },
             body: JSON.stringify({
                 global_brightness: currentFilters.globalBrightness,
                 red_brightness: currentFilters.redBrightness,
                 green_brightness: currentFilters.greenBrightness,
                 blue_brightness: currentFilters.blueBrightness,
                 log_contrast: currentFilters.logContrast,
                 exp_contrast: currentFilters.expContrast,
                 grayscale: currentFilters.grayscale,
                 negative: currentFilters.negative,
                 binary: currentFilters.binary,
                 threshold: currentFilters.threshold
             })
         })
         .then(response => response.json())
         .then(data => {
             if (data.success) {
                 console.log('Filtros aplicados exitosamente');
                 updateImagePreview(data.filtered_image_url);
             } else {
                 console.error('Error al aplicar filtros:', data.error);
                 alert('Error al aplicar filtros: ' + data.error);
             }
         })
         .catch(error => {
             console.error('Error:', error);
             alert('Error de conexión al aplicar filtros');
         });
     }

// ===== APLICAR BRILLO POR CANAL =====
function applyBrilloCanal() {
    const delta_r = currentFilters.redBrightness - 100;
    const delta_g = currentFilters.greenBrightness - 100;
    const delta_b = currentFilters.blueBrightness - 100;
    
    fetch('/apply-filter/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            filter_type: 'brillo_canal',
            delta_r: delta_r,
            delta_g: delta_g,
            delta_b: delta_b
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateImagePreview(data.filtered_image_url);
        } else {
            console.error('Error al aplicar brillo por canal:', data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// ===== APLICAR CONTRASTE LOGARÍTMICO =====
function applyContrasteLog() {
    const c = currentFilters.logContrast / 100.0;
    
    fetch('/apply-filter/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            filter_type: 'contraste_log',
            c: c
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateImagePreview(data.filtered_image_url);
        } else {
            console.error('Error al aplicar contraste logarítmico:', data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// ===== APLICAR CONTRASTE EXPONENCIAL =====
function applyContrasteExp() {
    const k = currentFilters.expContrast / 100.0 * 0.1; // Escalar a rango 0-0.1
    
    fetch('/apply-filter/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            filter_type: 'contraste_exp',
            k: k
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateImagePreview(data.filtered_image_url);
        } else {
            console.error('Error al aplicar contraste exponencial:', data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// ===== APLICAR EFECTOS =====
function applyEfectos() {
    if (currentFilters.grayscale) {
        applyGrayscale();
    } else if (currentFilters.negative) {
        applyNegative();
    } else                  if (currentFilters.binary) {
                     applyAllFilters();
                 }
}

function applyGrayscale() {
    fetch('/apply-filter/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            filter_type: 'grises'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateImagePreview(data.filtered_image_url);
        } else {
            console.error('Error al aplicar escala de grises:', data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function applyNegative() {
    fetch('/apply-filter/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            filter_type: 'negativo'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateImagePreview(data.filtered_image_url);
        } else {
            console.error('Error al aplicar negativo:', data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function applyBinary() {
    fetch('/apply-filter/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            filter_type: 'binario',
            umbral: currentFilters.threshold
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateImagePreview(data.filtered_image_url);
        } else {
            console.error('Error al aplicar binarización:', data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// ===== ACTUALIZAR PREVIEW DE IMAGEN =====
function updateImagePreview(imageUrl) {
    const imagePreview = document.getElementById('imagePreview');
    const img = imagePreview.querySelector('img');
    
    if (img) {
        img.src = imageUrl;
        currentImage = imageUrl;
    }
}

// ===== ROTAR IMAGEN =====
function rotateImage(degrees) {
    const imagePreview = document.getElementById('imagePreview');
    const img = imagePreview.querySelector('img');
    
    if (img) {
        const currentRotation = getCurrentRotation(img);
        const newRotation = currentRotation + degrees;
        img.style.transform = `rotate(${newRotation}deg)`;
    }
}

// ===== VOLTEAR IMAGEN =====
function flipImage(direction) {
    const imagePreview = document.getElementById('imagePreview');
    const img = imagePreview.querySelector('img');
    
    if (img) {
        const currentScale = getCurrentScale(img);
        let newScaleX = currentScale.x;
        let newScaleY = currentScale.y;
        
        if (direction === 'horizontal') {
            newScaleX *= -1;
        } else if (direction === 'vertical') {
            newScaleY *= -1;
        }
        
        img.style.transform = `scale(${newScaleX}, ${newScaleY})`;
    }
}

// ===== RESETEAR FILTROS =====
function resetAllFilters() {
    // Resetear valores de sliders
    document.getElementById('brightnessSlider').value = 100;
    document.getElementById('contrastSlider').value = 100;
    document.getElementById('grayscaleSlider').value = 0;
    document.getElementById('sepiaSlider').value = 0;
    
    // Resetear valores mostrados
    document.getElementById('brightnessValue').textContent = '100%';
    document.getElementById('contrastValue').textContent = '100%';
    document.getElementById('grayscaleValue').textContent = '0%';
    document.getElementById('sepiaValue').textContent = '0%';
    
    // Resetear filtros aplicados
    currentFilters = {
        brightness: 100,
        contrast: 100,
        grayscale: 0,
        sepia: 0
    };
    
    // Aplicar cambios
    applyFilters();
}

// ===== DESCARGAR IMAGEN =====
function downloadImage() {
    const imagePreview = document.getElementById('imagePreview');
    const img = imagePreview.querySelector('img');
    
    if (img) {
        // Crear canvas para capturar la imagen con filtros
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        // Aplicar filtros en el canvas
        ctx.filter = img.style.filter;
        ctx.drawImage(img, 0, 0);
        
        // Descargar
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'edited-image.jpg';
            a.click();
            URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.9);
    } else {
        alert('No hay imagen para descargar');
    }
}

// ===== FUNCIONES AUXILIARES =====
function getCSRFToken() {
    const tokenElement = document.querySelector('[name=csrfmiddlewaretoken]');
    if (tokenElement) {
        return tokenElement.value;
    } else {
        console.error('❌ No se encontró el token CSRF');
        return '';
    }
}

function getCurrentRotation(element) {
    const transform = element.style.transform;
    const match = transform.match(/rotate\((-?\d+)deg\)/);
    return match ? parseInt(match[1]) : 0;
}

function getCurrentScale(element) {
    const transform = element.style.transform;
    const match = transform.match(/scale\(([^,]+),\s*([^)]+)\)/);
    if (match) {
        return {
            x: parseFloat(match[1]),
            y: parseFloat(match[2])
        };
    }
    return { x: 1, y: 1 };
}

// ===== CONFIGURAR EVENT LISTENERS =====
function setupEventListeners() {
    console.log('🎯 Configurando event listeners...');
    
    // Drag and drop
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        console.log('🖼️ Configurando drag and drop...');
        imagePreview.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        imagePreview.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
        });
        
        imagePreview.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                uploadImage(files[0]);
            }
        });
    }
    
    // Configurar sliders adicionales
    console.log('🎚️ Configurando sliders adicionales...');
    setupSliders();
}

// ===== NUEVAS FUNCIONES DE TRANSFORMACIÓN =====

// Aplicar recorte
function applyCrop() {
    const x = parseInt(document.getElementById('cropX').value);
    const y = parseInt(document.getElementById('cropY').value);
    const width = parseInt(document.getElementById('cropWidth').value);
    const height = parseInt(document.getElementById('cropHeight').value);
    
    console.log(`Aplicando recorte: x=${x}, y=${y}, w=${width}, h=${height}`);
    // TODO: Implementar recorte real con Python
    alert('Función de recorte preparada para implementación con Python');
}

// Aplicar zoom
function applyZoom() {
    const zoomFactor = parseFloat(document.getElementById('zoomSlider').value);
    console.log(`Aplicando zoom: factor=${zoomFactor}x`);
    // TODO: Implementar zoom real con Python
    alert('Función de zoom preparada para implementación con Python');
}

// Aplicar rotación
function applyRotation() {
    const angle = parseInt(document.getElementById('rotationSlider').value);
    console.log(`Aplicando rotación: ángulo=${angle}°`);
    // TODO: Implementar rotación real con Python
    alert('Función de rotación preparada para implementación con Python');
}

// Extraer capa
function extractLayer(layerType) {
    console.log(`Extrayendo capa: ${layerType}`);
    // TODO: Implementar extracción de capas con Python
    alert(`Función de extracción de capa ${layerType} preparada para implementación con Python`);
}

// Aplicar fusión
function applyFusion(fusionType) {
    if (!fusionImages.image1 || !fusionImages.image2) {
        alert('Por favor selecciona ambas imágenes para la fusión');
        return;
    }
    
    console.log(`Aplicando fusión ${fusionType}`);
    // TODO: Implementar fusión real con Python
    alert(`Función de fusión ${fusionType} preparada para implementación con Python`);
}

// Cargar imagen para fusión
function loadFusionImage(imageNumber, file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById(`image${imageNumber}Preview`);
        if (preview) {
            preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
        }
        
        fusionImages[`image${imageNumber}`] = e.target.result;
        console.log(`Imagen ${imageNumber} cargada para fusión`);
    };
    reader.readAsDataURL(file);
}

// Mostrar histograma
function showHistogram() {
    const container = document.getElementById('histogramContainer');
    if (container) {
        container.style.display = container.style.display === 'none' ? 'block' : 'none';
        
        if (container.style.display === 'block') {
            // TODO: Implementar histograma real con Python
            console.log('Mostrando histograma');
            alert('Función de histograma preparada para implementación con Python');
        }
    }
}

// ===== FUNCIONES DE TRANSFORMACIÓN LEGACY =====
function rotateImage(degrees) {
    const imagePreview = document.getElementById('imagePreview');
    const img = imagePreview.querySelector('img');
    
    if (img) {
        const currentRotation = getCurrentRotation(img);
        const newRotation = currentRotation + degrees;
        img.style.transform = `rotate(${newRotation}deg)`;
    }
}

function flipImage(direction) {
    const imagePreview = document.getElementById('imagePreview');
    const img = imagePreview.querySelector('img');
    
    if (img) {
        const currentScale = getCurrentScale(img);
        let newScaleX = currentScale.x;
        let newScaleY = currentScale.y;
        
        if (direction === 'horizontal') {
            newScaleX *= -1;
        } else if (direction === 'vertical') {
            newScaleY *= -1;
        }
        
        img.style.transform = `scale(${newScaleX}, ${newScaleY})`;
    }
}

// ===== RESETEAR FILTROS ACTUALIZADO =====
function resetAllFilters() {
    // Resetear valores de sliders
    document.getElementById('globalBrightnessSlider').value = 100;
    document.getElementById('redBrightnessSlider').value = 100;
    document.getElementById('greenBrightnessSlider').value = 100;
    document.getElementById('blueBrightnessSlider').value = 100;
    document.getElementById('logContrastSlider').value = 0;
    document.getElementById('expContrastSlider').value = 0;
    document.getElementById('thresholdSlider').value = 128;
    document.getElementById('zoomSlider').value = 1;
    document.getElementById('rotationSlider').value = 0;
    
    // Resetear valores mostrados
    document.getElementById('globalBrightnessValue').textContent = '100%';
    document.getElementById('redBrightnessValue').textContent = '100%';
    document.getElementById('greenBrightnessValue').textContent = '100%';
    document.getElementById('blueBrightnessValue').textContent = '100%';
    document.getElementById('logContrastValue').textContent = '0%';
    document.getElementById('expContrastValue').textContent = '0%';
    document.getElementById('thresholdValue').textContent = '128';
    document.getElementById('zoomValue').textContent = '1.0x';
    document.getElementById('rotationValue').textContent = '0°';
    
    // Resetear checkboxes
    document.getElementById('grayscaleCheck').checked = false;
    document.getElementById('negativeCheck').checked = false;
    document.getElementById('binaryCheck').checked = false;
    document.getElementById('binaryControls').style.display = 'none';
    
    // Resetear filtros aplicados
    currentFilters = {
        globalBrightness: 100,
        redBrightness: 100,
        greenBrightness: 100,
        blueBrightness: 100,
        logContrast: 0,
        expContrast: 0,
        grayscale: false,
        negative: false,
        binary: false,
        threshold: 128
    };
    
    // Aplicar cambios
    applyFilters();
}

// ===== EXPORTAR FUNCIONES =====
window.uploadImage = uploadImage;
window.downloadImage = downloadImage;
window.applyFilters = applyFilters;
window.resetAllFilters = resetAllFilters;
window.applyCrop = applyCrop;
window.applyZoom = applyZoom;
window.applyRotation = applyRotation;
window.extractLayer = extractLayer;
window.applyFusion = applyFusion;
window.showHistogram = showHistogram;
