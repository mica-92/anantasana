// Configuración de Supabase
const SUPABASE_URL = 'https://edkumnfbwzpeuifbxubp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVka3VtbmZid3pwZXVpZmJ4dWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDI2NjgsImV4cCI6MjA3Nzc3ODY2OH0.EhiZN_2EVDcQ8LdE-V1T3LknzUDsiya697K3P4kbu5E';

// Inicializar cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const moodOptions = [
    { name: 'feliz', label: 'Mood: YEaYy!!', emoji: '<i class="fa-solid fa-face-laugh-beam"></i>', color: '#2a9d8f' },
    { name: 'enojado', label: 'Mood: Ehhh... hubo días mejores', emoji: '<i class="fa-solid fa-face-meh"></i>', color: '#e9c46a' },
    { name: 'cansancio', label: 'Mood: siesta', emoji: '<i class="fa-solid fa-face-tired"></i>', color: '#bc4749' },
    { name: 'relajado', label: 'Mood: ohmmm', emoji: '<i class="fa-solid fa-heart"></i>', color: '#FF9A76' },
    { name: 'energico', label: 'Mood: estoy para doblete', emoji: '<i class="fa-solid fa-bolt-lightning"></i>', color: '#95E1D3' },
    { name: 'complete', label: 'Práctica Completa', emoji: '<i class="fa-solid fa-check"></i>', color: '#81b29a' },
    { name: 'inconclusa', label: 'Práctica Incompleta', emoji: '<i class="fa-solid fa-xmark"></i>', color: '#bc6c25' },
    { name: 'primera', label: 'Primera Serie', emoji: '<i class="fa-solid fa-1"></i>', color: '#da627d' },
    { name: 'segunda', label: 'Segunda Serie', emoji: '<i class="fa-solid fa-2"></i>', color: '#ffa5ab' },
    { name: 'otro estilo', label: 'vinyasa', emoji: '<i class="fa-solid fa-fire"></i>', color: '#a26769' },
    { name: 'moon day', label: 'Moon Day', emoji: '<i class="fa-solid fa-moon"></i>', color: '#ced4da' },
    { name: 'quote', label: 'quote', emoji: '<i class="fa-solid fa-quote-right"></i>', color: '#6d597a' },
];

// Datos de ejemplo para asanas
const sampleAsanas = [
    { id: 'tadasana', name: 'Tadasana', sanskrit: 'ताडासन', english: 'Mountain Pose' },
    { id: 'adho_mukha_svanasana', name: 'Adho Mukha Svanasana', sanskrit: 'अधो मुख श्वानासन', english: 'Downward-Facing Dog' },
    { id: 'virabhadrasana_i', name: 'Virabhadrasana I', sanskrit: 'वीरभद्रासन I', english: 'Warrior I' },
    { id: 'virabhadrasana_ii', name: 'Virabhadrasana II', sanskrit: 'वीरभद्रासन II', english: 'Warrior II' },
    { id: 'balasana', name: 'Balasana', sanskrit: 'बालासन', english: 'Child\'s Pose' }
];


// Variables globales para la aplicación principal
let asanaData = [];
let filteredAsanas = [];
let currentAsanaIndex = 0;
let activeTags = new Set();
let allTags = [];

// Variables globales para el léxico
let lexiconData = [];
let filteredLexicon = [];
let currentLexiconIndex = 0;

// Mapeo de series
const seriesMapping = {
    'ādhāra': 'ādhāra - <i>foundation</i>',
    'yoga cikitsā': 'yoga cikitsā - <i>primera</i>',
    'nāḍī śodhana': 'nāḍī śodhana - <i>segunda</i>',
    'tṛtīya śreṇī': 'tṛtīya śreṇī - <i>tercera</i>',
    'pṛṣṭhavakrāsana': 'pṛṣṭhavakrāsana - <i>backbends</i>',
    'samāpana': 'samāpana - <i>cierre</i>'
};

// Mapeo de SeriesHot
const seriesHotMapping = {
    'Despertar': 'bodha - <i>awakening</i>',
    'Apertura': 'vikāsa - <i>opening</i>',
    'Vitalidad': 'jīvanaśakti - <i>vitality</i>',
    'Integracion': 'saṃyoga - <i>integration</i>',
    'Equilibrio': 'tulā - <i>balance</i>',
    'Entrega': 'samarpaṇa - <i>surrender</i>',
    'Esfuerzo': 'vīrya - <i>effort</i>',
    'Conexion': 'sambandha - <i>connection</i>'
};

// DOM elements
const studySection = document.getElementById('study');
const listSection = document.getElementById('list');
const cardTitle = document.getElementById('card-title');
const cardImage = document.getElementById('card-image');
const cardDetails = document.getElementById('card-details');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const searchBox = document.getElementById('search');
const listContainer = document.getElementById('list-container');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');

// Elementos DOM del léxico
const lexiconSection = document.getElementById('lexicon');
const lexiconListSection = document.getElementById('lexicon-list');
const lexiconTitle = document.getElementById('lexicon-title');
const lexiconDetails = document.getElementById('lexicon-details');
const lexiconPrevBtn = document.getElementById('lexicon-prev-btn');
const lexiconNextBtn = document.getElementById('lexicon-next-btn');
const lexiconSearchBox = document.getElementById('lexicon-search');
const lexiconListContainer = document.getElementById('lexicon-list-container');

// Menu elements
const burgerBtn = document.getElementById('burger-btn');
const menuContent = document.getElementById('menu-content');
const menuNavButtons = document.querySelectorAll('.menu-nav-btn');
const menuTagFilters = document.getElementById('menu-tag-filters');

// Filter elements
const filterBtn = document.getElementById('filter-btn');
const filterContent = document.getElementById('filter-content');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
            // Inicializar secciones
            initializeLogSection(); // Solo para historial
            initializePracticePopup(); // Para el pop-up
            
            // Mostrar āsana del día
            showDailyAsana();

     loadLogHistory();
    setupNavigation();
    init();
});




// Configurar navegación
function setupNavigation() {
    const navButtons = document.querySelectorAll('.menu-nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Actualizar botones activos
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Actualizar clase del body para cambiar colores
            document.body.className = '';
            document.body.classList.add(targetSection + '-section');
            
            // Mostrar sección correspondiente
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(targetSection).classList.add('active');
        });
    });
}

// ====================================================
// FUNCIONALIDAD PARA LA APLICACIÓN PRINCIPAL
// ====================================================

async function init() {
    try {
        await loadCSVData();
        await loadLexiconData();
        
        console.log('Total asanas cargadas:', asanaData.length);
        console.log('Total términos cargados:', lexiconData.length);
        
        // Inicializar léxico
        filteredLexicon = shuffleArray([...lexiconData]);
        renderLexiconCard();
        renderLexiconList();
        
        populateTagFilters();
        
        // Activar Sākṣāt por defecto
        const saksatBtn = document.querySelector('[data-tag="Sākṣāt"]');
        if (saksatBtn) {
            saksatBtn.classList.add('active');
            activeTags.add('Sākṣāt');
        }
        
        applyFilters();
        
        setupMainEventListeners();
        
        // CAMBIO: Iniciar en la sección log (dainandinī)
        switchSection('log');
        
        // NUEVO: Mostrar asana del día DESPUÉS de cargar los datos
        showDailyAsana();
        
        console.log('Aplicación inicializada correctamente');
    } catch (error) {
        console.error('Error en init:', error);
        showError(`Failed to load data: ${error.message}`);
    }
}

// Función para cargar el léxico CSV
async function loadLexiconData() {
    try {
        const response = await fetch('lexicon.csv');
        if (!response.ok) throw new Error('Lexicon CSV file not found');
        
        const csvText = await response.text();
        
        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    if (results.errors.length > 0) {
                        reject(new Error(results.errors[0].message));
                        return;
                    }
                    
                    lexiconData = results.data.map(row => {
                        const cleanRow = {};
                        for (const key in row) {
                            cleanRow[key] = row[key] ? row[key].trim() : '';
                        }
                        return cleanRow;
                    });
                    
                    resolve(lexiconData);
                },
                error: function(error) {
                    reject(new Error(`Failed to parse lexicon CSV: ${error.message}`));
                }
            });
        });
    } catch (error) {
        throw error;
    }
}



// Renderizar tarjeta del término actual
function renderLexiconCard() {
    if (filteredLexicon.length === 0) {
        lexiconTitle.textContent = "NO TERMS MATCH FILTERS";
        lexiconDetails.innerHTML = "<p>ADJUST FILTERS TO SEE TERMS</p>";
        return;
    }
    
    const term = filteredLexicon[currentLexiconIndex];
    
    lexiconTitle.textContent = term.term ? term.term.toUpperCase() : 'NO TERM';
    
    let detailsHTML = '';
    
    if (term.devanāgarī && term.devanāgarī.trim() !== '') {
        detailsHTML += `
            <div class="detail-row">
                <span class="detail-label">DEVANAGARI:</span>
                <span style="font-size: 1.5rem; font-weight: bold;">${term.devanāgarī}</span>
            </div>`;
    }
    
    if (term.meaning && term.meaning.trim() !== '') {
        detailsHTML += `
            <div class="detail-row">
                <span class="detail-label">MEANING:</span>
                <span style="font-style: italic;">${term.meaning}</span>
            </div>`;
    }
    
    lexiconDetails.innerHTML = detailsHTML || '<p>NO DETAILS AVAILABLE</p>';
}

// Renderizar lista de términos
function renderLexiconList() {
    lexiconListContainer.innerHTML = '';
    
    if (filteredLexicon.length === 0) {
        lexiconListContainer.innerHTML = '<p>NO TERMS MATCH FILTERS</p>';
        return;
    }
    
    // Ordenar alfabéticamente por término
    const sortedTerms = [...filteredLexicon].sort((a, b) => {
        const termA = (a.term || '').toLowerCase();
        const termB = (b.term || '').toLowerCase();
        return termA.localeCompare(termB);
    });
    
    sortedTerms.forEach(term => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.addEventListener('click', () => {
            switchSection('lexicon');
            const index = filteredLexicon.findIndex(t => t.term === term.term);
            if (index !== -1) {
                currentLexiconIndex = index;
                renderLexiconCard();
            }
        });
        
        let itemHTML = `<h3>${term.term.toUpperCase()}</h3>`;
        
        if (term.meaning && term.meaning.trim() !== '') {
            itemHTML += `<p style="font-style: italic; text-align: left; padding-top: 0px">${term.meaning}</p>`;
        }
        
        item.innerHTML = itemHTML;
        lexiconListContainer.appendChild(item);
    });
}

// Función para mejorar la experiencia touch en móviles
function setupTouchImprovements() {
    let touchStartX = 0;
    let touchEndX = 0;
    let lastTouchTime = 0;
    const swipeThreshold = 50; // Mínimo de pixels para considerar un swipe
    const doubleTapThreshold = 300; // Máximo tiempo entre toques para considerar double tap
    
    // Detectar swipe en las secciones de cards
    const cardSections = ['study', 'lexicon', 'about'];    
    cardSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
                const currentTime = new Date().getTime();
                
                // Prevenir double tap zoom
                if (currentTime - lastTouchTime < doubleTapThreshold) {
                    e.preventDefault();
                }
                lastTouchTime = currentTime;
            }, { passive: false });
            
            section.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe(sectionId);
            }, { passive: true });
        }
    });
    
    function handleSwipe(sectionId) {
        const diff = touchStartX - touchEndX;
        
        // Swipe izquierdo (siguiente)
        if (diff > swipeThreshold) {
            navigateNext(sectionId);
        }
        // Swipe derecho (anterior)
        else if (diff < -swipeThreshold) {
            navigatePrev(sectionId);
        }
    }
    
    function navigateNext(sectionId) {
        switch(sectionId) {
            case 'study':
                if (filteredAsanas.length > 0) {
                    currentAsanaIndex = (currentAsanaIndex + 1) % filteredAsanas.length;
                    renderAsanaCard();
                }
                break;
            case 'lexicon':
                if (filteredLexicon.length > 0) {
                    currentLexiconIndex = (currentLexiconIndex + 1) % filteredLexicon.length;
                    renderLexiconCard();
                }
                break;
        }
    }
    
    function navigatePrev(sectionId) {
        switch(sectionId) {
            case 'study':
                if (filteredAsanas.length > 0) {
                    currentAsanaIndex = (currentAsanaIndex - 1 + filteredAsanas.length) % filteredAsanas.length;
                    renderAsanaCard();
                }
                break;
            case 'lexicon':
                if (filteredLexicon.length > 0) {
                    currentLexiconIndex = (currentLexiconIndex - 1 + filteredLexicon.length) % filteredLexicon.length;
                    renderLexiconCard();
                }
                break;
        }
    }
    
    // Mejorar los botones para touch
    const buttons = document.querySelectorAll('.circular-btn, .menu-nav-btn, .menu-tag-btn, .filter-btn, .burger-btn');
    buttons.forEach(button => {
        // Agregar feedback táctil mejorado
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
            this.style.opacity = '0.8';
        }, { passive: true });
        
        button.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
            this.style.opacity = '1';
        }, { passive: true });
        
        button.addEventListener('touchcancel', function() {
            this.style.transform = 'scale(1)';
            this.style.opacity = '1';
        }, { passive: true });
    });
    
    // Mejorar los items de lista para touch
    const listItems = document.querySelectorAll('.list-item, .unified-list-item');
    listItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('touchstart', function() {
            this.style.backgroundColor = '#f8dc3d40';
            this.style.transform = 'scale(0.98)';
        }, { passive: true });
        
        item.addEventListener('touchend', function() {
            this.style.backgroundColor = '';
            this.style.transform = 'scale(1)';
        }, { passive: true });
        
        item.addEventListener('touchcancel', function() {
            this.style.backgroundColor = '';
            this.style.transform = 'scale(1)';
        }, { passive: true });
    });
    
    // Prevenir scroll no deseado en elementos interactivos
    const interactiveElements = document.querySelectorAll('.circular-controls, .menu-content, .filter-content');
    interactiveElements.forEach(element => {
        element.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, { passive: false });
    });
    
    console.log('Mejoras touch inicializadas correctamente');
}

// Función para mezclar array aleatoriamente
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Render asana list - VERSIÓN ORDENADA ALFABÉTICAMENTE
function renderAsanaList() {
    listContainer.innerHTML = '';
    
    if (filteredAsanas.length === 0) {
        listContainer.innerHTML = '<p>NO ASANAS MATCH FILTERS</p>';
        return;
    }
    
    // Ordenar alfabéticamente por Sandhi o Name
    const sortedAsanas = [...filteredAsanas].sort((a, b) => {
        const nameA = (a.Sandhi || a.Name).toLowerCase();
        const nameB = (b.Sandhi || b.Name).toLowerCase();
        return nameA.localeCompare(nameB);
    });
    
    sortedAsanas.forEach(asana => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.addEventListener('click', () => {
            // Switch to study view and show this asana
            switchSection('study');
            const index = filteredAsanas.findIndex(a => a.ID === asana.ID);
            if (index !== -1) {
                currentAsanaIndex = index;
                renderAsanaCard();
            }
        });
        
        const tags = getAsanaTags(asana);
        const tagsHtml = tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        item.innerHTML = `
            <h3>${asana.Sandhi.toUpperCase()} - ${asana.English || 'N/A'}</h3>
            <div class="list-tags">
                ${tagsHtml}
            </div>
        `;
        
        listContainer.appendChild(item);
    });
}

// Función para encontrar asana por nombre - MEJORADA
function findAsanaByName(name) {
    if (!name) return null;
    
    // Limpiar el nombre de búsqueda
    const cleanName = name.trim().toLowerCase();
    
    // Buscar por Name exacto (case insensitive)
    let asana = asanaData.find(a => a.Name.toLowerCase() === cleanName);
    if (asana) return asana;
    
    // Buscar por Sandhi exacto (case insensitive)
    asana = asanaData.find(a => a.Sandhi && a.Sandhi.toLowerCase() === cleanName);
    if (asana) return asana;
    
    // Buscar por coincidencia parcial en Name
    asana = asanaData.find(a => a.Name.toLowerCase().includes(cleanName));
    if (asana) return asana;
    
    // Buscar por coincidencia parcial en Sandhi
    asana = asanaData.find(a => a.Sandhi && a.Sandhi.toLowerCase().includes(cleanName));
    if (asana) return asana;
    
    // Buscar por coincidencia parcial en English name
    asana = asanaData.find(a => a.English && a.English.toLowerCase().includes(cleanName));
    
    return asana || null;
}

// Show error message
function showError(message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Load CSV data
async function loadCSVData() {
    loadingElement.style.display = 'block';
    
    try {
        const response = await fetch('asana.csv');
        if (!response.ok) throw new Error('CSV file not found');
        
        const csvText = await response.text();
        
        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    loadingElement.style.display = 'none';
                    
                    if (results.errors.length > 0) {
                        reject(new Error(results.errors[0].message));
                        return;
                    }
                    
                    asanaData = results.data.map(row => {
                        const cleanRow = {};
                        for (const key in row) {
                            cleanRow[key] = row[key] ? row[key].trim() : '';
                        }
                        return cleanRow;
                    });
                    
                    // Calculate tags AFTER loading data
                    allTags = ['Sākṣāt', 'Cālanī'];
                    
                    resolve(asanaData);
                },
                error: function(error) {
                    loadingElement.style.display = 'none';
                    reject(new Error(`Failed to parse CSV: ${error.message}`));
                }
            });
        });
    } catch (error) {
        loadingElement.style.display = 'none';
        throw error;
    }
}

// Modificar la función populateTagFilters para incluir el filtro Random
function populateTagFilters() {
    menuTagFilters.innerHTML = '';
    
    // Agregar filtro Random primero
    const randomButton = document.createElement('button');
    randomButton.className = 'menu-tag-btn brutalist-btn';
    randomButton.innerHTML = 'Random';
    randomButton.dataset.tag = 'Random';
    randomButton.addEventListener('click', function() {
        applyRandomOrder();
        // Actualizar estado visual de botones
        document.querySelectorAll('.menu-tag-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        this.classList.add('active');
    });
    menuTagFilters.appendChild(randomButton);
    
    // Agregar los otros filtros
    allTags.forEach(tag => {
        const button = document.createElement('button');
        button.className = 'menu-tag-btn brutalist-btn';
        button.innerHTML = tag;
        button.dataset.tag = tag;
        button.addEventListener('click', toggleTagFilter);
        menuTagFilters.appendChild(button);
        
        if (tag === 'Sākṣāt') {
            button.classList.add('active');
            activeTags.add('Sākṣāt');
        }
    });
}    

// Agregar variable global para controlar el orden
let isRandomOrder = false;

// Modificar completamente la función showAdvancedFilters
function showAdvancedFilters() {
    // Create modal for advanced filters
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #f6732f40;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    // Obtener filtros activos actuales para pre-checkear
    const currentAshtanga = activeTags.advancedAshtanga || [];
    const currentVinyasa = activeTags.advancedVinyasa || [];
    const currentNiskriya = activeTags.advancedNiskriya || [];
    
    // Generar el texto de filtros activos
    let filterText = '<strong>Active Filters:</strong><br>';
    
    if (activeTags.has('Sākṣāt')) {
        filterText += '• Sākṣāt (todas las asanas)<br>';
    }
    
    if (isRandomOrder) {
        filterText += '• Orden: Aleatorio<br>';
    } else {
        filterText += '• Orden: Alfabético<br>';
    }
    
    if (activeTags.advancedAshtanga && activeTags.advancedAshtanga.length > 0) {
        filterText += `• Aṣṭāṅga: ${activeTags.advancedAshtanga.map(a => seriesMapping[a]?.split(' - ')[0] || a).join(', ')}<br>`;
    }
    
    if (activeTags.advancedVinyasa && activeTags.advancedVinyasa.length > 0) {
        filterText += `• Vinyāsa: ${activeTags.advancedVinyasa.map(v => seriesHotMapping[v]?.split(' - ')[0] || v).join(', ')}<br>`;
    }
    
    if (activeTags.advancedNiskriya && activeTags.advancedNiskriya.length > 0) {
        filterText += '• Niṣkriya<br>';
    }
    
    // Verificar si hay filtros activos para mostrar
    const hasAdvancedFilters = activeTags.advancedAshtanga?.length > 0 || 
                            activeTags.advancedVinyasa?.length > 0 || 
                            activeTags.advancedNiskriya?.length > 0 ||
                            isRandomOrder;
    
    const hasActiveFilters = hasAdvancedFilters || !activeTags.has('Sākṣāt');

    modal.innerHTML = `
        <div style="background: var(--primary-color); border: 4px solid #333; max-width: 500px; width: 90%; box-shadow: 8px 3px 0 #333; max-height: 80vh; overflow-y: auto;">
            <h3 style="padding: 20px; color: var(--primary-color); margin-bottom: 20px; text-transform: uppercase; background: var(--red-accent); border-bottom: 2px solid #333;">CĀLANĪ - FILTROS AVANZADOS</h3>
            
            <!-- AGREGAR EL TEXTO DE FILTROS ACTIVOS DENTRO DEL MODAL -->
            ${hasActiveFilters ? `
            <div style="margin-bottom: 20px; padding: 10px 20px; background: var(--yellow-accent); border: 2px solid var(--text-dark); margin: 0px 20px 20px 20px;">
                <div style="font-size: 0.9rem; color: var(--text-dark);">
                    ${filterText}
                </div>
            </div>
            ` : ''}
            
            <div style="margin-bottom: 20px; padding: 0px 20px;">
                <h4 style="color: var(--red-accent); margin-bottom: 10px; border-bottom: 2px solid var(--accent-color);">
                <label style="cursor: pointer; font-weight: bold;">
                    <input type="checkbox" id="select-all-ashtanga" style="margin-right: 8px;">
                    AṢṬĀṄGA
                </label></h4>
                <div id="ashtanga-filters" style="display: flex; flex-direction: column; gap: 5px;">
                    ${Object.entries(seriesMapping).map(([key, value]) => `
                        <label style="color: var(--blue-accent); cursor: pointer;">
                            <input type="checkbox" value="${key}" ${currentAshtanga.includes(key) ? 'checked' : ''} style="margin-right: 8px;">
                            ${value}
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 20px; padding: 0px 20px;">
                <h4 style="color: var(--red-accent); margin-bottom: 10px; border-bottom: 2px solid var(--accent-color);">
                <label style="cursor: pointer; font-weight: bold;">
                    <input type="checkbox" id="select-all-vinyasa" style="margin-right: 8px;">
                    VINYĀSA
                </label></h4>
                <div id="vinyasa-filters" style="display: flex; flex-direction: column; gap: 5px;">
                    ${Object.entries(seriesHotMapping).map(([key, value]) => `
                        <label style="color: var(--blue-accent); cursor: pointer;">
                            <input type="checkbox" value="${key}" ${currentVinyasa.includes(key) ? 'checked' : ''} style="margin-right: 8px;">
                            ${value}
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 20px; padding: 0px 20px;">
                <h4 style="color: var(--red-accent); margin-bottom: 10px; border-bottom: 2px solid var(--accent-color);">NIṢKRIYA</h4>
                <div id="niskriya-filters" style="display: flex; flex-direction: column; gap: 5px;">
                    <label style="color: var(--blue-accent); cursor: pointer;">
                        <input type="checkbox" value="niṣkriya" ${currentNiskriya.includes('niṣkriya') ? 'checked' : ''} style="margin-right: 8px;">
                        niṣkriya - <i>yin yoga</i>
                    </label>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end; padding: 0px 20px 20px 20px;">
                <button id="apply-advanced" style="background: var(--accent-color); color: #fff; border: 2px solid #333; padding: 8px 16px; cursor: pointer; text-transform: uppercase;">APLICAR</button>
                <button id="cancel-advanced" style="background: var(--accent-color); color: #fff; border: 2px solid #333; padding: 8px 16px; cursor: pointer; text-transform: uppercase;">CANCELAR</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Funcionalidad para "Seleccionar todos"
    const selectAllAshtanga = document.getElementById('select-all-ashtanga');
    const selectAllVinyasa = document.getElementById('select-all-vinyasa');
    
    // Pre-checkear "Seleccionar todos" si todos los checkboxes de esa categoría están checked
    const ashtangaCheckboxes = document.querySelectorAll('#ashtanga-filters input[type="checkbox"]');
    const allAshtangaChecked = Array.from(ashtangaCheckboxes).every(checkbox => checkbox.checked);
    selectAllAshtanga.checked = allAshtangaChecked;
    
    const vinyasaCheckboxes = document.querySelectorAll('#vinyasa-filters input[type="checkbox"]');
    const allVinyasaChecked = Array.from(vinyasaCheckboxes).every(checkbox => checkbox.checked);
    selectAllVinyasa.checked = allVinyasaChecked;
    
    selectAllAshtanga.addEventListener('change', function() {
        ashtangaCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });
    
    selectAllVinyasa.addEventListener('change', function() {
        vinyasaCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });
    
    // Event listeners for modal
    document.getElementById('apply-advanced').addEventListener('click', function() {
        const selectedAshtanga = Array.from(document.querySelectorAll('#ashtanga-filters input:checked')).map(input => input.value);
        const selectedVinyasa = Array.from(document.querySelectorAll('#vinyasa-filters input:checked')).map(input => input.value);
        const selectedNiskriya = Array.from(document.querySelectorAll('#niskriya-filters input:checked')).map(input => input.value);
        
        // Apply advanced filters
        applyAdvancedFilters(selectedAshtanga, selectedVinyasa, selectedNiskriya);
        document.body.removeChild(modal);
    });
    
    document.getElementById('cancel-advanced').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
}

// MODIFICAR la función showActiveFilters para que NO muestre el recuadro en la esquina
function showActiveFilters() {
    // Remover info anterior si existe (para limpiar cualquier recuadro previo)
    const existingInfo = document.getElementById('active-filters-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    // Esta función ya no crea el recuadro en la esquina
    // Los filtros activos ahora se muestran solo dentro del modal de Cālanī
}

// Función auxiliar para obtener texto de filtros actuales
function getCurrentFiltersText() {
    let text = '';
    
    if (activeTags.advancedAshtanga && activeTags.advancedAshtanga.length > 0) {
        text += `<strong>Aṣṭāṅga:</strong> ${activeTags.advancedAshtanga.map(a => seriesMapping[a] || a).join(', ')}<br>`;
    }
    
    if (activeTags.advancedVinyasa && activeTags.advancedVinyasa.length > 0) {
        text += `<strong>Vinyāsa:</strong> ${activeTags.advancedVinyasa.map(v => seriesHotMapping[v] || v).join(', ')}<br>`;
    }
    
    if (activeTags.advancedNiskriya && activeTags.advancedNiskriya.length > 0) {
        text += `<strong>Niṣkriya:</strong> Yin Yoga<br>`;
    }
    
    return text || 'No hay filtros activos';
}

// MODIFICAR la función applyFilters para que sea más clara
function applyFilters() {
    // Primero filtrar por criterios
    filteredAsanas = asanaData.filter(asana => {
        // Si Sākṣāt está activo, mostrar TODAS las asanas sin otros filtros
        if (activeTags.has('Sākṣāt')) {
            return true;
        }
        
        // Si NO hay Sākṣāt, aplicar filtros avanzados
        let matchesFilter = false;
        
        // Verificar filtros de aṣṭāṅga
        if (activeTags.advancedAshtanga && activeTags.advancedAshtanga.length > 0) {
            if (activeTags.advancedAshtanga.includes(asana.YogaSeries)) {
                matchesFilter = true;
            }
        }
        
        // Verificar filtros de vinyāsa
        if (activeTags.advancedVinyasa && activeTags.advancedVinyasa.length > 0) {
            if (activeTags.advancedVinyasa.includes(asana.SeriesHot)) {
                matchesFilter = true;
            }
        }
        
        // Verificar filtros de niṣkriya
        if (activeTags.advancedNiskriya && activeTags.advancedNiskriya.length > 0) {
            if (asana.Yin && asana.Yin.trim() !== '') {
                matchesFilter = true;
            }
        }
        
        // Si no hay ningún filtro avanzado seleccionado, mostrar todas
        if (!activeTags.advancedAshtanga?.length && 
            !activeTags.advancedVinyasa?.length && 
            !activeTags.advancedNiskriya?.length) {
            return true;
        }
        
        return matchesFilter;
    });
    
    // LUEGO aplicar orden (Random vs Alfabético)
    if (isRandomOrder) {
        filteredAsanas = shuffleArray([...filteredAsanas]);
    } else {
        // Orden alfabético por defecto
        filteredAsanas.sort((a, b) => {
            const nameA = (a.Sandhi || a.Name).toLowerCase();
            const nameB = (b.Sandhi || b.Name).toLowerCase();
            return nameA.localeCompare(nameB);
        });
    }
    
    // Reset current index
    currentAsanaIndex = 0;
    
    renderAsanaCard();
    renderAsanaList();
    showActiveFilters();
}

// MODIFICAR toggleTagFilter para manejar mejor Sākṣāt
function toggleTagFilter(e) {
    const tag = e.target.dataset.tag;
    
    if (tag === 'Random') {
        applyRandomOrder();
        return;
    }
    
    if (tag === 'Sākṣāt') {
        // Cuando se selecciona Sākṣāt, limpiar TODOS los otros filtros
        activeTags.clear();
        isRandomOrder = false; // Resetear random también
        activeTags.advancedAshtanga = [];
        activeTags.advancedVinyasa = [];
        activeTags.advancedNiskriya = [];
        
        // Actualizar estado visual de todos los botones
        document.querySelectorAll('.menu-tag-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tag === 'Random') {
                btn.classList.remove('active'); // Asegurar que Random no esté activo
            }
        });
        
        e.target.classList.add('active');
        activeTags.add('Sākṣāt');
    } else if (tag === 'Cālanī') {
        // Show advanced filters modal
        showAdvancedFilters();
        return;
    } else {
        // Si se selecciona cualquier otro tag, remover Sākṣāt
        if (activeTags.has('Sākṣāt')) {
            activeTags.delete('Sākṣāt');
            document.querySelectorAll('.menu-tag-btn').forEach(btn => {
                if (btn.dataset.tag === 'Sākṣāt') {
                    btn.classList.remove('active');
                }
            });
        }
        
        // Toggle del tag actual
        if (activeTags.has(tag)) {
            activeTags.delete(tag);
            e.target.classList.remove('active');
        } else {
            activeTags.add(tag);
            e.target.classList.add('active');
        }
    }
    
    applyFilters();
}

// MODIFICAR applyRandomOrder para que sea más claro
function applyRandomOrder() {
    isRandomOrder = !isRandomOrder; // Toggle del estado
    
    // Actualizar estado visual del botón Random
    const randomButton = document.querySelector('[data-tag="Random"]');
    if (randomButton) {
        if (isRandomOrder) {
            randomButton.classList.add('active');
        } else {
            randomButton.classList.remove('active');
        }
    }
    
    applyFilters();
}

// MODIFICAR applyAdvancedFilters para resetear Sākṣāt
function applyAdvancedFilters(selectedAshtanga, selectedVinyasa, selectedNiskriya) {
    // Clear Sākṣāt si estaba activo
    if (activeTags.has('Sākṣāt')) {
        activeTags.delete('Sākṣāt');
        document.querySelectorAll('.menu-tag-btn').forEach(btn => {
            if (btn.dataset.tag === 'Sākṣāt') {
                btn.classList.remove('active');
            }
        });
    }
    
    // Store advanced filter selections
    activeTags.advancedAshtanga = selectedAshtanga;
    activeTags.advancedVinyasa = selectedVinyasa;
    activeTags.advancedNiskriya = selectedNiskriya;
    
    applyFilters();
    showActiveFilters();
}

// AGREGAR función para limpiar todos los filtros
function clearAllFilters() {
    activeTags.clear();
    isRandomOrder = false;
    activeTags.advancedAshtanga = [];
    activeTags.advancedVinyasa = [];
    activeTags.advancedNiskriya = [];
    
    document.querySelectorAll('.menu-tag-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activar Sākṣāt por defecto
    const saksatBtn = document.querySelector('[data-tag="Sākṣāt"]');
    if (saksatBtn) {
        saksatBtn.classList.add('active');
        activeTags.add('Sākṣāt');
    }
    
    applyFilters();
}

// Render current asana card
function renderAsanaCard() {
    if (filteredAsanas.length === 0) {
        cardTitle.textContent = "NO ASANAS MATCH FILTERS";
        cardImage.src = "";
        cardDetails.innerHTML = "<p>ADJUST FILTERS TO SEE ASANAS</p>";
        return;
    }
    
    const asana = filteredAsanas[currentAsanaIndex];
    // MOSTRAR EL SANDHI EN EL TÍTULO
    cardTitle.textContent = asana.Sandhi ? asana.Sandhi.toUpperCase() : asana.Name.toUpperCase();
    
    // Set image - using the local image path
    cardImage.src = `images/${asana.Name}.png`;
    cardImage.alt = asana.Name;
    cardImage.style.display = 'block';
    
    // Handle missing images
    cardImage.onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQ291cmllciBOZXcsIG1vbm9zcGFjZSIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+Tk8gSU1BR0UgQVZBSUxBQkxFPC90ZXh0Pjwvc3ZnPg==';
        this.alt = 'IMAGE NOT AVAILABLE';
        this.style.filter = '';
    };
    
    // Función para convertir [[AsanaName]] en enlaces
    function createAsanaLinks(text) {
        if (!text) return 'N/A';
        return text.replace(/\[\[(.*?)\]\]/g, function(match, asanaName) {
            return `<a href="#" class="asana-link" data-asana="${asanaName}">${asanaName}</a>`;
        });
    }

    // HTML básico (siempre visible) - SERIES Y BEFORE/AFTER
    let basicHTML = '';
    
    // AGREGAR HOT SERIES SI EXISTE (MAPEADO) - FUERA DE DETAILS
    if (asana.SeriesHot) {
        const mappedHotSeries = seriesHotMapping[asana.SeriesHot] || asana.SeriesHot;
        basicHTML += `
        <div class="detail-row">
            <span class="detail-label">VINYĀSA Series:</span>
            <span style="font-weight: bold; font-style: italic; color: #f6442fff">${mappedHotSeries}</span>
        </div>`;
    }

    // AGREGAR YOGA SERIES SI EXISTE (MAPEADO) - FUERA DE DETAILS
    if (asana.YogaSeries) {
        const mappedYogaSeries = seriesMapping[asana.YogaSeries] || asana.YogaSeries;
        basicHTML += `
        <div class="detail-row">
            <span class="detail-label">aṣṭāṅga Series:</span>
            <span style="font-weight: bold; font-style: italic; color: #f6442fff">${mappedYogaSeries}</span>
        </div>`;
    }

    // AGREGAR BEFORE SOLO SI EXISTE - FUERA DE DETAILS
    if (asana.Before) {
        const beforeAsana = findAsanaByName(asana.Before);
        const beforeDisplayName = beforeAsana ? (beforeAsana.Sandhi || beforeAsana.Name) : asana.Before;
        
        basicHTML += `
        <div class="detail-row">
            <span class="detail-label">BEFORE:</span>
            <span><a href="#" class="asana-link" data-asana="${asana.Before}">${beforeDisplayName}</a></span>
        </div>`;
    }

    // AGREGAR AFTER SOLO SI EXISTE - FUERA DE DETAILS
    if (asana.After) {
        const afterAsana = findAsanaByName(asana.After);
        const afterDisplayName = afterAsana ? (afterAsana.Sandhi || afterAsana.Name) : asana.After;
        
        basicHTML += `
        <div class="detail-row">
            <span class="detail-label">AFTER:</span>
            <span><a href="#" class="asana-link" data-asana="${asana.After}">${afterDisplayName}</a></span>
        </div>`;
    }

    // Botón de toggle
    basicHTML += `
        <button class="details-toggle brutalist-btn" id="details-toggle">
            DETAILS <i class="fa-solid fa-chevron-right"></i>
        </button>
        
        <div class="details-content" id="details-content">
    `;

    // HTML de detalles expandidos (inicialmente oculto)
    let detailsHTML = '';

    // INFORMACIÓN BÁSICA MOVIDA A DETALLES
    detailsHTML += `
        <div class="basic-details">
            <div class="detail-row">
                <span class="detail-label">DEVANAGARI:</span>
                <span>${asana.Devanagari || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">ENGLISH:</span>
                <span>${asana.English || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">ETYMOLOGY:</span>
                <span>${asana.Etymology || 'N/A'}</span>
            </div>
        </div>
    `;

    // AGREGAR NUEVAS COLUMNAS SI NO ESTÁN VACÍAS
    if (asana.Open && asana.Open.trim() !== '') {
        detailsHTML += `
        <div class="detail-row">
            <span class="detail-label">OPEN:</span>
            <span>${asana.Open}</span>
        </div>`;
    }

    if (asana.OpenAsana && asana.OpenAsana.trim() !== '') {
        detailsHTML += `
        <div class="detail-row">
            <span class="detail-label">OPEN ĀSANA:</span>
            <span>${createAsanaLinks(asana.OpenAsana)}</span>
        </div>`;
    }

    if (asana.Stable && asana.Stable.trim() !== '') {
        detailsHTML += `
        <div class="detail-row">
            <span class="detail-label">STABLE:</span>
            <span>${asana.Stable}</span>
        </div>`;
    }

    if (asana.StableAsana && asana.StableAsana.trim() !== '') {
        detailsHTML += `
        <div class="detail-row">
            <span class="detail-label">STABLE ĀSANA:</span>
            <span>${createAsanaLinks(asana.StableAsana)}</span>
        </div>`;
    }

    if (asana.Preparation && asana.Preparation.trim() !== '') {
        detailsHTML += `
        <div class="detail-row">
            <span class="detail-label">PREPARATION FOR:</span>
            <span>${createAsanaLinks(asana.Preparation)}</span>
        </div>`;
    }

    if (asana.Counterposes && asana.Counterposes.trim() !== '') {
        detailsHTML += `
        <div class="detail-row">
            <span class="detail-label">COUNTER ĀSANA:</span>
            <span>${createAsanaLinks(asana.Counterposes)}</span>
        </div>`;
    }
    
    // Siempre mostrar TAGS
    detailsHTML += `
        <div class="detail-row">
            <span class="detail-label">TAGS:</span>
            <span style="font-style: italic; color: #f6442fff">${getAsanaTags(asana).join(', ') || 'N/A'}</span>
        </div>
    `;

    // Combinar todo el HTML
    const fullHTML = basicHTML + detailsHTML + '</div>';
    cardDetails.innerHTML = fullHTML;

    // Configurar el evento del toggle
    const toggleBtn = document.getElementById('details-toggle');
    const detailsContent = document.getElementById('details-content');
    
    if (toggleBtn && detailsContent) {
        toggleBtn.addEventListener('click', function() {
            const isExpanded = detailsContent.classList.toggle('expanded');
            this.innerHTML = isExpanded ? 'DETAILS <i class="fa-solid fa-chevron-down"></i>' : 'DETAILS <i class="fa-solid fa-chevron-right"></i>';
        });
    }

    // Agregar event listeners para los enlaces de asanas
    cardDetails.querySelectorAll('.asana-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const asanaName = this.dataset.asana;
            const asana = findAsanaByName(asanaName);
            if (asana) {
                // Buscar en filteredAsanas
                const filteredIndex = filteredAsanas.findIndex(a => a.Name === asana.Name);
                if (filteredIndex !== -1) {
                    currentAsanaIndex = filteredIndex;
                    renderAsanaCard();
                } else {
                    // Si no está en los filtros actuales, cambiar a Sākṣāt y buscar
                    activeTags.clear();
                    document.querySelectorAll('.menu-tag-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    const saksatBtn = document.querySelector('[data-tag="Sākṣāt"]');
                    if (saksatBtn) {
                        saksatBtn.classList.add('active');
                        activeTags.add('Sākṣāt');
                    }
                    applyFilters();
                    
                    // Buscar la asana en los nuevos filteredAsanas
                    const newIndex = filteredAsanas.findIndex(a => a.Name === asana.Name);
                    if (newIndex !== -1) {
                        currentAsanaIndex = newIndex;
                        renderAsanaCard();
                    }
                }
            }
        });
    });
}

// Get tags for an asana display
function getAsanaTags(asana) {
    const tags = [];
    if (asana.SeriesHot) {
        const mapped = seriesHotMapping[asana.SeriesHot];
        tags.push(mapped ? mapped.split(' - ')[0] : asana.SeriesHot);
    }
    if (asana.YogaSeries) {
        const mapped = seriesMapping[asana.YogaSeries];
        tags.push(mapped ? mapped.split(' - ')[0] : asana.YogaSeries);
    }
    return tags;
}

function switchSection(sectionId) {
    // Actualizar clases del body para cambiar colores
    document.body.className = '';
    
    // Agregar clase específica para cada sección
    if (sectionId === 'study') {
        document.body.classList.add('study-section');
    } else if (sectionId === 'lexicon') {
        document.body.classList.add('lexicon-section');
    } else if (sectionId === 'lexicon-list') {
        document.body.classList.add('lexicon-list-section');
    } else if (sectionId === 'about') {
        document.body.classList.add('about-section');
    } else if (sectionId === 'log') {
        document.body.classList.add('log-section');
    }
    
    // Update nav buttons
    menuNavButtons.forEach(btn => {
        if (btn.dataset.section === sectionId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Show/hide sections
    document.querySelectorAll('.section').forEach(section => {
        if (section.id === sectionId) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
    
    // Cerrar menús después de seleccionar
    menuContent.classList.remove('active');
    filterContent.classList.remove('active');
}

function setupMainEventListeners() {
    // Menu toggle
    burgerBtn.addEventListener('click', () => {
        menuContent.classList.toggle('active');
        // Cerrar filtros si están abiertos
        filterContent.classList.remove('active');
    });
    
    // Filter toggle
    filterBtn.addEventListener('click', () => {
        filterContent.classList.toggle('active');
        // Cerrar menú principal si está abierto
        menuContent.classList.remove('active');
    });
    
    // Navigation
    menuNavButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchSection(btn.dataset.section);
        });
    });
    
    // Controles de la sección principal
    prevBtn.addEventListener('click', () => {
        if (filteredAsanas.length === 0) return;
        currentAsanaIndex = (currentAsanaIndex - 1 + filteredAsanas.length) % filteredAsanas.length;
        renderAsanaCard();
    });
    
    nextBtn.addEventListener('click', () => {
        if (filteredAsanas.length === 0) return;
        currentAsanaIndex = (currentAsanaIndex + 1) % filteredAsanas.length;
        renderAsanaCard();
    });
    
    // Search
    searchBox.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filteredAsanas = asanaData.filter(asana => 
            asana.Name.toLowerCase().includes(searchTerm) ||
            asana.English.toLowerCase().includes(searchTerm) ||
            asana.Sandhi.toLowerCase().includes(searchTerm)
        );
        filteredAsanas = shuffleArray(filteredAsanas);
        currentAsanaIndex = 0;
        renderAsanaList();
        if (document.getElementById('study').classList.contains('active')) {
            renderAsanaCard();
        }
    });
    
    // Lexicon controls
    lexiconPrevBtn.addEventListener('click', () => {
        if (filteredLexicon.length === 0) return;
        currentLexiconIndex = (currentLexiconIndex - 1 + filteredLexicon.length) % filteredLexicon.length;
        renderLexiconCard();
    });
    
    lexiconNextBtn.addEventListener('click', () => {
        if (filteredLexicon.length === 0) return;
        currentLexiconIndex = (currentLexiconIndex + 1) % filteredLexicon.length;
        renderLexiconCard();
    });
    
    // Lexicon search
    lexiconSearchBox.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        if (searchTerm.trim() === '') {
            filteredLexicon = [...lexiconData];
        } else {
            filteredLexicon = lexiconData.filter(term => {
                return (
                    (term.term && term.term.toLowerCase().includes(searchTerm)) ||
                    (term.devanāgarī && term.devanāgarī.includes(searchTerm)) ||
                    (term.meaning && term.meaning.toLowerCase().includes(searchTerm))
                );
            });
        }
        
        filteredLexicon = shuffleArray(filteredLexicon);
        currentLexiconIndex = 0;
        renderLexiconList();
        if (document.getElementById('lexicon').classList.contains('active')) {
            renderLexiconCard();
        }
    });

    // En setupEventListeners, actualizar la función observerSectionChange
    const observerSectionChange = function() {
        const currentSection = document.querySelector('.section.active').id;
        const floatingFilters = document.querySelector('.floating-filters');
        
        if (currentSection === 'study' || currentSection === 'list') {
            floatingFilters.style.display = 'block';
        } else {
            floatingFilters.style.display = 'none';
        }
    };
    
    // Llamar inicialmente
    observerSectionChange();
    
    // Modificar switchSection para incluir esta funcionalidad
    const originalSwitchSection = switchSection;
    switchSection = function(sectionId) {
        originalSwitchSection(sectionId);
        observerSectionChange();
    };

    // Cerrar menús cuando se hace click fuera
    document.addEventListener('click', (e) => {
        if (!menuContent.contains(e.target) && !burgerBtn.contains(e.target)) {
            menuContent.classList.remove('active');
        }
        if (!filterContent.contains(e.target) && !filterBtn.contains(e.target)) {
            filterContent.classList.remove('active');
        }
    });
    
    // Inicializar mejoras touch
    setupTouchImprovements();
}
