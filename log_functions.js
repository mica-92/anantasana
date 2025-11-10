// ====================================================
// FUNCIONALIDAD ESPECÍFICA PARA LA BITÁCORA (DAINANDINĪ)
// ====================================================

function showDailyAsana() {
    // Filtrar solo asanas de aṣṭāṅga
    const ashtangaAsanas = asanaData.filter(asana => 
        asana.YogaSeries && asana.YogaSeries.trim() !== ''
    );
    
    if (ashtangaAsanas.length === 0) {
        console.log('No se encontraron asanas de Aṣṭāṅga');
        return;
    }
    
    // Seleccionar una random
    const randomIndex = Math.floor(Math.random() * ashtangaAsanas.length);
    const dailyAsana = ashtangaAsanas[randomIndex];
    
    // Actualizar la card del daily asana
    const dailyImage = document.getElementById('daily-asana-image');
    const dailyDetails = document.getElementById('daily-asana-details');
    
    // Configurar imagen
    dailyImage.src = `images/${dailyAsana.Name}.png`;
    dailyImage.alt = dailyAsana.Name;
    dailyImage.style.display = 'block';
    
    // Crear o actualizar el círculo de serie
    let seriesCircle = document.getElementById('daily-asana-series-circle');
    if (!seriesCircle) {
        seriesCircle = document.createElement('div');
        seriesCircle.id = 'daily-asana-series-circle';
        seriesCircle.className = 'series-circle';
        dailyImage.parentNode.appendChild(seriesCircle);
    }
    
    // Mapeo de iconos para cada serie
    const seriesIcons = {
        'ādhāra': '<i class="fa-solid fa-f"></i>',
        'yoga cikitsā': '<i class="fa-solid fa-1"></i>',
        'nāḍī śodhana': '<i class="fa-solid fa-2"></i>',
        'tṛtīya śreṇī': '<i class="fa-solid fa-3"></i>',
        'pṛṣṭhavakrāsana': '<i class="fa-solid fa-b"></i>',
        'samāpana': '<i class="fa-solid fa-c"></i>'
    };
    
    // Configurar el círculo según la serie
    if (dailyAsana.YogaSeries && seriesIcons[dailyAsana.YogaSeries]) {
        seriesCircle.innerHTML = seriesIcons[dailyAsana.YogaSeries];
        seriesCircle.style.display = 'flex';
        seriesCircle.title = seriesMapping[dailyAsana.YogaSeries] || dailyAsana.YogaSeries;
    } else {
        seriesCircle.style.display = 'none';
    }
    
    // Manejar imágenes faltantes
    dailyImage.onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQ291cmllciBOZXcsIG1vbm9zcGFjZSIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+Tk8gSU1BR0UgQVZBSUxBQkxFPC90ZXh0Pjwvc3ZnPg==';
        this.alt = 'IMAGE NOT AVAILABLE';
        this.style.filter = '';
        // Ocultar círculo si no hay imagen
        seriesCircle.style.display = 'none';
    };
    
    // Crear contenido de detalles
    let detailsHTML = '';
    
    // Nombre en Sandhi
    if (dailyAsana.Sandhi) {
        detailsHTML += `
            <div class="detail-row">${dailyAsana.Sandhi}</div>`;
    }
    
    dailyDetails.innerHTML = detailsHTML || '<p>No hay información disponible para esta āsana</p>';
    
    console.log('Āsana del día mostrada:', dailyAsana.Name);
}

// Variables globales para la bitácora
let currentLogEntry = {
    date: new Date(),
    practiced: false,
    moods: [],
    notes: "",
    tags: [],
    asanas: []
};

let logHistory = [];
let selectedMoods = [];
let currentTags = [];
let currentAsanas = [];

// Fecha de inicio para estadísticas (1/11/2025)
const startDate = new Date(2025, 10, 1); // Noviembre es 10 (0-indexed)

// Inicializar la sección de bitácora (solo historial ahora)
function initializeLogSection() {
    // Solo cargar historial y estadísticas
    loadLogHistory();
}

// Nueva función para inicializar el pop-up
function initializePracticePopup() {
    // Establecer fecha actual en el pop-up
    const now = new Date();
    document.getElementById('popup-practice-date').valueAsDate = now;
    
    // Inicializar mood board del pop-up
    initializePopupMoodBoard();
    
    // Inicializar búsqueda de asanas en el pop-up
    initializePopupAsanaSearch();
    
    // Configurar event listeners del pop-up
    setupPopupEventListeners();
}

// Inicializar mood board del pop-up
function initializePopupMoodBoard() {
    const moodBoard = document.getElementById('popup-mood-board');
    moodBoard.innerHTML = '';
    
    moodOptions.forEach((mood, index) => {
        const moodItem = document.createElement('div');
        moodItem.className = 'mood-item';
        moodItem.innerHTML = mood.emoji;
        moodItem.title = mood.label;
        moodItem.dataset.index = index;
        moodItem.style.backgroundColor = mood.color;
        
        moodItem.addEventListener('click', function() {
            togglePopupMoodSelection(index);
        });
        
        moodBoard.appendChild(moodItem);
    });
}

// Alternar selección de mood en el pop-up
function togglePopupMoodSelection(index) {
    const moodItem = document.querySelector(`#popup-mood-board .mood-item[data-index="${index}"]`);
    
    if (selectedMoods.includes(index)) {
        selectedMoods = selectedMoods.filter(i => i !== index);
        moodItem.classList.remove('selected');
    } else {
        selectedMoods.push(index);
        moodItem.classList.add('selected');
    }
    
    currentLogEntry.moods = selectedMoods.map(i => moodOptions[i]);
}

// Inicializar búsqueda de asanas en el pop-up
function initializePopupAsanaSearch() {
    const searchInput = document.getElementById('popup-asana-search-input');
    const searchResults = document.getElementById('popup-asana-search-results');
    const addAsanaBtn = document.getElementById('popup-add-asana-btn');
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        
        const filteredAsanas = asanaData.filter(asana => 
            (asana.Name && asana.Name.toLowerCase().includes(query)) ||
            (asana.Sandhi && asana.Sandhi.toLowerCase().includes(query)) ||
            (asana.English && asana.English.toLowerCase().includes(query)) ||
            (asana.ID && asana.ID.toLowerCase().includes(query))
        );
        
        displayPopupAsanaSearchResults(filteredAsanas, searchResults);
    });
    
    addAsanaBtn.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query) {
            const foundAsana = findAsanaByName(query);
            if (foundAsana) {
                addAsanaToPopupLog(foundAsana);
                searchInput.value = '';
                searchResults.style.display = 'none';
            } else {
                const customAsana = {
                    id: 'custom_' + Date.now(),
                    name: query,
                    sanskrit: '',
                    english: ''
                };
                addAsanaToPopupLog(customAsana);
                searchInput.value = '';
                searchResults.style.display = 'none';
            }
        }
    });
    
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

// Mostrar resultados de búsqueda en el pop-up
function displayPopupAsanaSearchResults(asanas, container) {
    if (asanas.length === 0) {
        container.innerHTML = '<div class="asana-search-result">No se encontraron āsanas</div>';
        container.style.display = 'block';
        return;
    }
    
    container.innerHTML = '';
    
    asanas.forEach(asana => {
        const result = document.createElement('div');
        result.className = 'asana-search-result';
        result.innerHTML = `
            <strong>${asana.Sandhi || asana.Name}</strong> 
            ${asana.English ? `(${asana.English})` : ''}<br>
            <small>${asana.YogaSeries ? 'Aṣṭāṅga: ' + asana.YogaSeries : ''} 
            ${asana.SeriesHot ? 'Vinyāsa: ' + asana.SeriesHot : ''}</small>
        `;
        
        result.addEventListener('click', function() {
            addAsanaToPopupLog(asana);
            document.getElementById('popup-asana-search-input').value = '';
            container.style.display = 'none';
        });
        
        container.appendChild(result);
    });
    
    container.style.display = 'block';
}

// Añadir asana al log del pop-up
function addAsanaToPopupLog(asana) {
    const logAsana = {
        id: asana.ID || asana.id || 'custom_' + Date.now(),
        name: asana.Sandhi || asana.Name,
        sanskrit: asana.Devanagari || asana.sanskrit || '',
        english: asana.English || asana.english || '',
        series: asana.YogaSeries || '',
        type: asana.SeriesHot || ''
    };
    
    if (!currentAsanas.some(a => a.id === logAsana.id)) {
        currentAsanas.push(logAsana);
        updatePopupAsanasDisplay();
    }
}

// Actualizar visualización de asanas en el pop-up
function updatePopupAsanasDisplay() {
    const asanasList = document.getElementById('popup-asanas-list');
    asanasList.innerHTML = '';
    
    currentAsanas.forEach((asana, index) => {
        const asanaElement = document.createElement('span');
        asanaElement.className = 'asana-tag';
        asanaElement.textContent = asana.name;
        
        const removeBtn = document.createElement('span');
        removeBtn.innerHTML = ' &times;';
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.marginLeft = '5px';
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            currentAsanas.splice(index, 1);
            updatePopupAsanasDisplay();
        });
        
        asanaElement.appendChild(removeBtn);
        asanasList.appendChild(asanaElement);
    });
}

// Configurar event listeners del pop-up
function setupPopupEventListeners() {
    // Toggle de práctica en el pop-up
    document.getElementById('popup-practice-button').addEventListener('click', function() {
        this.classList.toggle('yes');
        const practiceState = this.querySelector('.practice-state');
        currentLogEntry.practiced = this.classList.contains('yes');
        practiceState.textContent = currentLogEntry.practiced ? 'SÍ' : 'NO';
    });

    // Añadir tag en el pop-up
    document.getElementById('popup-add-tag-btn').addEventListener('click', function() {
        const tagInput = document.getElementById('popup-tag-input');
        const tagText = tagInput.value.trim();
        
        if (tagText && !currentTags.includes(tagText)) {
            currentTags.push(tagText);
            updatePopupTagsDisplay();
            tagInput.value = '';
        }
    });

    // Guardar entrada desde el pop-up
    document.getElementById('popup-save-log-btn').addEventListener('click', function() {
        saveLogEntry();
    });

    // Limpiar entrada actual en el pop-up
    document.getElementById('popup-clear-log-btn').addEventListener('click', function() {
        clearPopupEntry();
    });

    // Abrir pop-up
    document.getElementById('new-practice-btn').addEventListener('click', function() {
        openPracticePopup();
    });

    // Cerrar pop-up
    document.getElementById('close-popup-btn').addEventListener('click', function() {
        closePracticePopup();
    });

    // Cerrar pop-up al hacer click fuera
    document.getElementById('practice-popup').addEventListener('click', function(e) {
        if (e.target === this) {
            closePracticePopup();
        }
    });
}

// Abrir pop-up
function openPracticePopup() {
    const popup = document.getElementById('practice-popup');
    popup.style.display = 'flex';
    // Inicializar el pop-up con datos frescos
    initializePracticePopup();
}

// Cerrar pop-up
function closePracticePopup() {
    const popup = document.getElementById('practice-popup');
    popup.style.display = 'none';
    // Limpiar la entrada actual al cerrar
    clearPopupEntry();
}

// Limpiar entrada del pop-up
function clearPopupEntry() {
    // Restablecer práctica
    document.getElementById('popup-practice-button').classList.remove('yes');
    document.querySelector('#popup-practice-button .practice-state').textContent = 'NO';
    currentLogEntry.practiced = false;

    // Limpiar moods
    selectedMoods = [];
    document.querySelectorAll('#popup-mood-board .mood-item').forEach(item => {
        item.classList.remove('selected');
    });
    currentLogEntry.moods = [];

    // Limpiar fecha (establecer a hoy)
    const now = new Date();
    document.getElementById('popup-practice-date').valueAsDate = now;

    // Limpiar notas
    document.getElementById('popup-practice-notes').value = '';
    currentLogEntry.notes = '';

    // Limpiar tags
    currentTags = [];
    updatePopupTagsDisplay();
    currentLogEntry.tags = [];

    // Limpiar asanas
    currentAsanas = [];
    updatePopupAsanasDisplay();
    currentLogEntry.asanas = [];
}

// Actualizar visualización de tags en el pop-up
function updatePopupTagsDisplay() {
    const tagsList = document.getElementById('popup-tags-list');
    tagsList.innerHTML = '';
    
    currentTags.forEach((tag, index) => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        
        const removeBtn = document.createElement('span');
        removeBtn.innerHTML = ' &times;';
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.marginLeft = '5px';
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            currentTags.splice(index, 1);
            updatePopupTagsDisplay();
        });
        
        tagElement.appendChild(removeBtn);
        tagsList.appendChild(tagElement);
    });
}


// ====================================================
// FUNCIONALIDAD PARA HEAT MAP SIMPLIFICADO
// ====================================================

function generateHeatMap() {
    const heatMapContainer = document.getElementById('heatmap-container');
    if (!heatMapContainer) return;
    
    // Obtener prácticas desde noviembre 2025
    const startDate = new Date(2025, 10, 1); // 1 de noviembre 2025
    const today = new Date();
    
    // Agrupar prácticas por mes y semana
    const monthlyData = groupPracticesByMonth(logHistory, startDate, today);
    
    // Generar HTML del heat map con TÍTULO EN NEGRITA
    let heatMapHTML = `
        <div class="heatmap-section">
            <div class="heatmap-title" style="font-weight: bold;">Frecuencia de Práctica</div>
            <div class="heatmap-container">
    `;
    
    // Generar cada mes
    monthlyData.forEach(monthData => {
        heatMapHTML += generateMonthHeatMap(monthData);
    });
    
    heatMapHTML += `
            </div>
        </div>
    `;
    
    heatMapContainer.innerHTML = heatMapHTML;
}

function groupPracticesByMonth(logHistory, startDate, endDate) {
    const monthlyData = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        
        // Obtener prácticas de este mes
        const monthPractices = logHistory.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getFullYear() === year && 
                   entryDate.getMonth() === month && 
                   entry.practiced;
        });
        
        // Agrupar por semana (6 días: lunes a sábado)
        const weeklyData = groupPracticesByWeek(monthPractices, year, month);
        
        monthlyData.push({
            year,
            month,
            monthName,
            practices: monthPractices,
            weeklyData,
            totalDays: monthPractices.length
        });
        
        // Siguiente mes
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return monthlyData;
}

function groupPracticesByWeek(practices, year, month) {
    const weeklyData = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    let currentWeek = 1;
    let weekDays = Array(7).fill(null); // Usar null para días fuera del mes
    
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const dayOfWeek = currentDate.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
        
        // Ajustar índice para lunes=0 a domingo=6
        const weekIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        
        // Verificar si este día tuvo práctica
        const hadPractice = practices.some(practice => {
            const practiceDate = new Date(practice.date);
            return practiceDate.getDate() === day && 
                   practiceDate.getMonth() === month && 
                   practiceDate.getFullYear() === year;
        });
        
        weekDays[weekIndex] = hadPractice ? 1 : 0; // 1 = práctica, 0 = sin práctica
        
        // Si es domingo o último día del mes, guardar semana
        if (dayOfWeek === 0 || day === daysInMonth) {
            weeklyData.push({
                week: currentWeek,
                days: [...weekDays],
                total: weekDays.filter(day => day === 1).length
            });
            
            // Reiniciar para la siguiente semana
            weekDays = Array(7).fill(null);
            currentWeek++;
        }
    }
    
    return weeklyData;
}
// En la función generateMonthHeatMap, CORREGIR esta parte:
function generateMonthHeatMap(monthData) {
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === monthData.year && today.getMonth() === monthData.month;
    
    // Calcular días de práctica para este mes específicamente
    const monthPractices = logHistory.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === monthData.year && 
               entryDate.getMonth() === monthData.month && 
               entry.practiced;
    }).length;
    
    return `
        <div class="heatmap-month">
            <div class="heatmap-month-header">
                <div class="heatmap-month-name">${monthData.monthName}</div>
                <div class="heatmap-month-stats">${monthPractices} prácticas</div>
            </div>
            <div class="heatmap-weeks">
                ${monthData.weeklyData.map(week => generateWeekHeatMap(week, monthData, isCurrentMonth)).join('')}
            </div>
        </div>
    `;
}

function generateWeekHeatMap(weekData, monthData, isCurrentMonth) {
    const today = new Date();
    
    return `
        <div class="heatmap-week">
            <div class="heatmap-days">
                ${weekData.days.map((dayCount, dayIndex) => {
                    const dayDate = getDayDate(weekData.week, dayIndex, monthData.month, monthData.year);
                    const isToday = isCurrentMonth && dayDate === today.getDate();
                    
                    const levelClass = getHeatMapLevelClass(dayCount);
                    const title = getDayTitle(dayCount, dayIndex);
                    
                    return `<div class="heatmap-day ${levelClass} ${isToday ? 'today' : ''}" title="${title}"></div>`;
                }).join('')}
            </div>
        </div>
    `;
}

function getHeatMapLevelClass(dayCount) {
    if (dayCount === null) return 'empty';    // Fuera del mes - transparente
    if (dayCount === 0) return 'no-practice'; // Dentro del mes sin práctica - rojo
    return 'practice';                        // Dentro del mes con práctica - verde
}

function getDayTitle(dayCount, dayIndex) {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const dayName = days[dayIndex];
    
    if (dayCount === null) return `${dayName}: Fuera del mes`;
    if (dayCount === 0) return `${dayName}: Sin práctica`;
    return `${dayName}: Con práctica`;
}
function getDayDate(week, dayIndex, month, year) {
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay() || 7;
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    // Calcular offset
    let offset;
    if (firstDayOfWeek === 1) {
        offset = (week - 1) * 7 + dayIndex;
    } else {
        offset = (week - 1) * 7 + dayIndex + (8 - firstDayOfWeek);
    }
    
    // Si el offset está fuera del rango del mes, retornar null
    if (offset < 1 || offset > lastDay) {
        return null;
    }
    
    return offset;
}


function generateHeatMapLegend() {
    return `
        <div class="heatmap-legend">
            <div class="heatmap-legend-item">
                <div class="heatmap-legend-color level-0"></div>
                <div class="heatmap-legend-label">0 días</div>
            </div>
            <div class="heatmap-legend-item">
                <div class="heatmap-legend-color level-1"></div>
                <div class="heatmap-legend-label">1 día</div>
            </div>
            <div class="heatmap-legend-item">
                <div class="heatmap-legend-color level-2"></div>
                <div class="heatmap-legend-label">2 días</div>
            </div>
            <div class="heatmap-legend-item">
                <div class="heatmap-legend-color level-3"></div>
                <div class="heatmap-legend-label">3 días</div>
            </div>
            <div class="heatmap-legend-item">
                <div class="heatmap-legend-color level-4"></div>
                <div class="heatmap-legend-label">4 días</div>
            </div>
            <div class="heatmap-legend-item">
                <div class="heatmap-legend-color level-5"></div>
                <div class="heatmap-legend-label">5 días</div>
            </div>
        </div>
    `;
}

function debugHeatMap() {
    console.log("=== DEBUG HEATMAP ===");
    
    // Verificar datos del historial
    console.log("Total entradas en historial:", logHistory.length);
    console.log("Entradas con práctica:", logHistory.filter(entry => entry.practiced).length);
    
    // Verificar datos del heatmap
    const startDate = new Date(2025, 10, 1);
    const today = new Date();
    const monthlyData = groupPracticesByMonth(logHistory, startDate, today);
    
    console.log("Meses generados:", monthlyData.length);
    monthlyData.forEach(month => {
        console.log(`${month.monthName}: ${month.practices.length} prácticas`);
        month.weeklyData.forEach(week => {
            console.log(`  Semana ${week.week}:`, week.days);
        });
    });
    
    // Verificar elementos HTML generados
    const heatMapContainer = document.getElementById('heatmap-container');
    if (heatMapContainer) {
        console.log("Elementos heatmap-day encontrados:", heatMapContainer.querySelectorAll('.heatmap-day').length);
        heatMapContainer.querySelectorAll('.heatmap-day').forEach(day => {
            console.log("Clases del día:", day.className, "Title:", day.title);
        });
    }
}

// Mostrar historial de entradas
function displayLogHistory() {
    const logHistoryContainer = document.getElementById('log-history');
    
    // Mostrar todas las entradas (sin filtros)
    let filteredHistory = [...logHistory];
    
    // Generar HTML para las entradas
    if (filteredHistory.length === 0) {
        logHistoryContainer.innerHTML = '<p style="text-align: center; padding: 20px;">No hay entradas en el historial</p>';
        return;
    }
    
    let historyHTML = '<h3>Bitácora de Prácticas</h3>';
    
    filteredHistory.forEach(entry => {
        // Formatear fecha como DD.MM.YYYY
        const formattedDate = entry.date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '.');
        
        // Botón SÍ/NO
        const practiceButtonHTML = `
            <div class="log-entry-practice ${entry.practiced ? 'yes' : ''}">
                <div class="practice-state">${entry.practiced ? 'SÍ' : 'NO'}</div>
            </div>
        `;
        
        // Moods seleccionados
        const moodsHTML = entry.moods.map(mood => 
            `<div class="log-entry-mood" style="background-color: ${mood.color}" title="${mood.label}">${mood.emoji}</div>`
        ).join('');
        
        const tagsHTML = entry.tags.map(tag => 
            `<span class="log-entry-tag">${tag}</span>`
        ).join('');
        
        const asanasHTML = entry.asanas.map(asana => 
            `<span class="log-entry-tag">${asana.name}</span>`
        ).join('');
        
// En la parte donde generas el HTML del historial, cambia esto:
historyHTML += `
    <div class="log-entry" data-id="${entry.id}">
        <div class="log-entry-header">
            <div class="log-entry-top-row">
                <div class="log-entry-date">${formattedDate}</div>
                <div class="log-entry-toggle"></div>
            </div>
            <div class="log-entry-bottom-row">
                ${practiceButtonHTML}
                <div class="log-entry-moods">
                    ${moodsHTML}
                </div>
            </div>
        </div>
        <div class="log-entry-content" style="display: none;">
            ${tagsHTML ? `<div class="log-entry-tags">${tagsHTML}</div>` : ''}
            ${asanasHTML ? `<div class="log-entry-tags">${asanasHTML}</div>` : ''}
            ${entry.notes ? `<div class="log-entry-notes">${entry.notes}</div>` : ''}
            <button class="delete-entry-btn" data-id="${entry.id}">Eliminar</button>
        </div>
    </div>
`;
    });
    
    logHistoryContainer.innerHTML = historyHTML;
    
    // Añadir event listeners para expandir/contraer
    document.querySelectorAll('.log-entry-header').forEach(header => {
        header.addEventListener('click', function() {
            const entry = this.parentElement;
            const content = this.nextElementSibling;
            
            if (entry.classList.contains('expanded')) {
                // Contraer
                entry.classList.remove('expanded');
                content.style.display = 'none';
            } else {
                // Expandir
                entry.classList.add('expanded');
                content.style.display = 'block';
            }
        });
    });
    
    // Añadir event listeners para los botones de eliminar
    document.querySelectorAll('.delete-entry-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar que se expanda/contraiga al hacer click en eliminar
            const entryId = this.getAttribute('data-id');
            if (confirm('¿Estás seguro de que quieres eliminar esta entrada?')) {
                deleteEntryById(entryId);
            }
        });
    });
}

// Eliminar entrada por ID
async function deleteEntryById(entryId) {
    try {
        // Eliminar de Supabase
        const { error } = await supabase
            .from('log_entries')
            .delete()
            .eq('id', entryId);

        if (error) throw error;
        
        // Eliminar del historial local
        logHistory = logHistory.filter(entry => entry.id !== entryId);
        
        // Actualizar visualización
        displayLogHistory();
        updateStatistics();
        
        alert('Entrada eliminada correctamente');
        
    } catch (error) {
        console.error('Error al eliminar en Supabase:', error);
        alert('Error al eliminar: ' + error.message);
    }
}

// Guardar entrada de bitácora
async function saveLogEntry() {
    // Obtener fecha del campo del pop-up
    const dateInput = document.getElementById('popup-practice-date').value;
    let entryDate;

    if (dateInput) {
        const [year, month, day] = dateInput.split('-');
        entryDate = new Date(year, month - 1, day);
    } else {
        const now = new Date();
        entryDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Actualizar datos de la entrada actual desde el pop-up
    currentLogEntry.date = entryDate;
    currentLogEntry.notes = document.getElementById('popup-practice-notes').value;
    currentLogEntry.tags = [...currentTags];
    currentLogEntry.asanas = [...currentAsanas];

    // Guardar en Supabase
    try {
        const entryData = {
            date: currentLogEntry.date.toISOString(),
            practiced: currentLogEntry.practiced,
            moods: currentLogEntry.moods,
            notes: currentLogEntry.notes,
            tags: currentLogEntry.tags,
            asanas: currentLogEntry.asanas
        };

        const { data, error } = await supabase
            .from('log_entries')
            .upsert([entryData]);

        if (error) throw error;

        console.log('Entrada guardada en Supabase:', data);

        const newEntry = {
            id: Date.now().toString(),
            ...currentLogEntry
        };
        logHistory.unshift(newEntry);

        // Actualizar visualización y cerrar pop-up
        displayLogHistory();
        updateStatistics();
        clearPopupEntry();
        closePracticePopup();

        alert('Entrada guardada correctamente');

    } catch (error) {
        console.error('Error al guardar en Supabase:', error);
        alert('Error al guardar: ' + error.message);
    }
}

// Cargar historial desde Supabase
async function loadLogHistory() {
    try {
        // Verificar que supabase esté inicializado
        if (!supabase) {
            console.error('Supabase no está inicializado');
            return;
        }

        const { data, error } = await supabase
            .from('log_entries')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('Error de Supabase:', error);
            throw error;
        }

        console.log('Datos cargados de Supabase:', data);

        if (data && data.length > 0) {
            logHistory = data.map(entry => {
                // Crear fecha sin problemas de huso horario
                const dateFromDB = new Date(entry.date);
                const normalizedDate = new Date(
                    dateFromDB.getFullYear(),
                    dateFromDB.getMonth(),
                    dateFromDB.getDate()
                );
                
                return {
                    ...entry,
                    date: normalizedDate
                };
            });
            displayLogHistory();
            updateStatistics();
        } else {
            console.log('No hay datos en Supabase');
            logHistory = [];
            displayLogHistory();
            updateStatistics();
        }
    } catch (error) {
        console.error('Error al cargar desde Supabase:', error);
        // Inicializar con array vacío en caso de error
        logHistory = [];
        displayLogHistory();
        updateStatistics();
    }
}

// Actualizar estadísticas
function updateStatistics() {
    const today = new Date();
    const statsSummary = document.getElementById('stats-summary');
    const statsChart = document.getElementById('stats-chart');

    // Normalizar fecha de hoy a medianoche para comparaciones
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Filtrar entradas desde el 1/11/2025 que sean días laborables (lunes a viernes)
    const filteredEntries = logHistory.filter(entry => {
        const dayOfWeek = entry.date.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5; // lunes a viernes
        return entry.date >= startDate && entry.practiced && isWeekday;
    });

    // Calcular días laborables desde el 1/11/2025 hasta hoy
    let weekdaysSinceStart = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= normalizedToday) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // lunes a viernes
            weekdaysSinceStart++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calcular estadísticas
    const practiceCount = filteredEntries.length;
    const practiceRatio = weekdaysSinceStart > 0 ? (practiceCount / weekdaysSinceStart) * 100 : 0;

    // Actualizar resumen
    statsSummary.innerHTML = `
        <strong>${practiceCount}/${weekdaysSinceStart} días de práctica - ${practiceRatio.toFixed(1)}%</strong>
        <br><i><div style="font-size: 0.8rem; color: #333;">desde 1/11/2025 (solo días laborables)</div>
    `;

    // Generar datos para el gráfico (frecuencia de moods)
    const moodFrequencyData = getMoodFrequencyData();

    // Limpiar gráfico
    statsChart.innerHTML = '';

    // Crear barras del gráfico
    moodFrequencyData.forEach(data => {
        const maxFrequency = Math.max(...moodFrequencyData.map(d => d.count));
        const barHeight = maxFrequency > 0 ? (data.count / maxFrequency) * 100 : 0;

        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = `${barHeight}%`;
        bar.style.backgroundColor = data.color;

        const value = document.createElement('div');
        value.className = 'chart-value';
        value.textContent = data.count;

        const label = document.createElement('div');
        label.className = 'chart-label';

        // Crear el círculo con el emoji y color de fondo
        const moodCircle = document.createElement('div');
        moodCircle.className = 'chart-mood-circle';
        moodCircle.innerHTML = data.emoji;
        moodCircle.style.backgroundColor = data.color;
        moodCircle.title = data.label;

        label.appendChild(moodCircle);
        bar.appendChild(value);
        bar.appendChild(label);
        statsChart.appendChild(bar);
    });

        generateHeatMap();
}

// Obtener frecuencia de moods
function getMoodFrequencyData() {
    const moodCounts = {};
    
    // Inicializar contadores para todos los moods
    moodOptions.forEach(mood => {
        moodCounts[mood.name] = {
            label: mood.label,
            count: 0,
            color: mood.color,
            emoji: mood.emoji
        };
    });
    
    // Contar frecuencia de cada mood en todas las entradas
    logHistory.forEach(entry => {
        if (entry.moods && Array.isArray(entry.moods)) {
            entry.moods.forEach(mood => {
                if (moodCounts[mood.name]) {
                    moodCounts[mood.name].count++;
                }
            });
        }
    });
    
    // Convertir a array y ordenar por frecuencia (mayor a menor)
    const moodFrequencyData = Object.values(moodCounts)
        .filter(mood => mood.count > 0)
        .sort((a, b) => b.count - a.count);
    
    return moodFrequencyData;
}

