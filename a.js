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
    { name: 'inconclusa', label: 'Práctica Inconmpleta', emoji: '<i class="fa-solid fa-xmark"></i>', color: '#bc6c25' },
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

// Variables globales
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

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeLogSection();
    setupEventListeners();
    loadLogHistory();
    setupNavigation();
});

// Inicializar la sección de bitácora
function initializeLogSection() {
    // Establecer fecha actual
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    document.getElementById('current-date').textContent = `${formattedDate}`;
    
    // Establecer fecha actual como valor por defecto en el campo de fecha
    document.getElementById('practice-date').valueAsDate = now;
    
    // Inicializar mood board
    initializeMoodBoard();
    
    // Inicializar búsqueda de asanas
    initializeAsanaSearch();
}

// Inicializar mood board
function initializeMoodBoard() {
    const moodBoard = document.getElementById('mood-board');
    moodBoard.innerHTML = '';
    
    moodOptions.forEach((mood, index) => {
        const moodItem = document.createElement('div');
        moodItem.className = 'mood-item';
        moodItem.innerHTML = mood.emoji;
        moodItem.title = mood.label;
        moodItem.dataset.index = index;
        moodItem.style.backgroundColor = mood.color;
        
        moodItem.addEventListener('click', function() {
            toggleMoodSelection(index);
        });
        
        moodBoard.appendChild(moodItem);
    });
}

// Alternar selección de mood
function toggleMoodSelection(index) {
    const moodItem = document.querySelector(`.mood-item[data-index="${index}"]`);
    
    if (selectedMoods.includes(index)) {
        // Deseleccionar
        selectedMoods = selectedMoods.filter(i => i !== index);
        moodItem.classList.remove('selected');
    } else {
        // Seleccionar
        selectedMoods.push(index);
        moodItem.classList.add('selected');
    }
    
    // Actualizar entrada actual
    currentLogEntry.moods = selectedMoods.map(i => moodOptions[i]);
}

// Inicializar búsqueda de asanas
function initializeAsanaSearch() {
    const searchInput = document.getElementById('asana-search-input');
    const searchResults = document.getElementById('asana-search-results');
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        
        // Filtrar asanas
        const filteredAsanas = sampleAsanas.filter(asana => 
            asana.name.toLowerCase().includes(query) ||
            asana.sanskrit.toLowerCase().includes(query) ||
            asana.english.toLowerCase().includes(query) ||
            asana.id.toLowerCase().includes(query)
        );
        
        // Mostrar resultados
        displayAsanaSearchResults(filteredAsanas, searchResults);
    });
}

// Mostrar resultados de búsqueda de asanas
function displayAsanaSearchResults(asanas, container) {
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
            <strong>${asana.name}</strong> (${asana.sanskrit})<br>
            <small>${asana.english} - ID: ${asana.id}</small>
        `;
        
        result.addEventListener('click', function() {
            addAsanaToLog(asana);
            document.getElementById('asana-search-input').value = '';
            container.style.display = 'none';
        });
        
        container.appendChild(result);
    });
    
    container.style.display = 'block';
}

// Añadir asana a la entrada actual
function addAsanaToLog(asana) {
    if (!currentAsanas.some(a => a.id === asana.id)) {
        currentAsanas.push(asana);
        updateAsanasDisplay();
    }
}

// Actualizar visualización de asanas
function updateAsanasDisplay() {
    const asanasList = document.getElementById('asanas-list');
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
            updateAsanasDisplay();
        });
        
        asanaElement.appendChild(removeBtn);
        asanasList.appendChild(asanaElement);
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Toggle de práctica
    document.getElementById('practice-button').addEventListener('click', function() {
        this.classList.toggle('yes');
        const practiceState = this.querySelector('.practice-state');
        currentLogEntry.practiced = this.classList.contains('yes');
        practiceState.textContent = currentLogEntry.practiced ? 'SÍ' : 'NO';
    });

    // Añadir tag
    document.getElementById('add-tag-btn').addEventListener('click', function() {
        const tagInput = document.getElementById('tag-input');
        const tagText = tagInput.value.trim();
        
        if (tagText && !currentTags.includes(tagText)) {
            currentTags.push(tagText);
            updateTagsDisplay();
            tagInput.value = '';
        }
    });

    // Añadir asana manualmente
    document.getElementById('add-asana-btn').addEventListener('click', function() {
        const asanaInput = document.getElementById('asana-search-input');
        const asanaText = asanaInput.value.trim();
        
        if (asanaText) {
            const customAsana = {
                id: 'custom_' + Date.now(),
                name: asanaText,
                sanskrit: '',
                english: ''
            };
            
            addAsanaToLog(customAsana);
            asanaInput.value = '';
        }
    });

    // Guardar entrada
    document.getElementById('save-log-btn').addEventListener('click', function() {
        saveLogEntry();
    });

    // Limpiar entrada actual
    document.getElementById('clear-log-btn').addEventListener('click', function() {
        clearCurrentEntry();
    });
}

// Configurar navegación
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Actualizar botones activos
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar sección correspondiente
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(targetSection).classList.add('active');
        });
    });
}


// Mostrar historial de entradas
function displayLogHistory() {
    const logHistoryContainer = document.getElementById('log-history');
    
    // Mostrar todas las entradas (sin filtros)
    let filteredHistory = [...logHistory];
    
    // Generar HTML para las entradas
    if (filteredHistory.length === 0) {
        logHistoryContainer.innerHTML = '<p style="text-align: center;">No hay entradas en el historial</p>';
        return;
    }
    
    let historyHTML = '<h3>HISTORIAL de prácticas</h3>';
    
    filteredHistory.forEach(entry => {
        // Formatear fecha completa
        const formattedDate = entry.date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
        });
        
        // Botón SÍ/NO como un mood más
        const practiceButtonHTML = `
            <div class="log-entry-practice ${entry.practiced ? 'yes' : ''}">
                <div class="practice-state">${entry.practiced ? 'SÍ' : 'NO'}</div>
            </div>
        `;
        
        // Moods seleccionados
        const moodsHTML = entry.moods.map(mood => 
            `<div class="log-entry-mood" style="background-color: ${mood.color}">${mood.emoji}</div>`
        ).join('');
        
        const tagsHTML = entry.tags.map(tag => 
            `<span class="log-entry-tag">${tag}</span>`
        ).join('');
        
        const asanasHTML = entry.asanas.map(asana => 
            `<span class="log-entry-tag">${asana.name}</span>`
        ).join('');
        
        historyHTML += `
            <div class="log-entry" data-id="${entry.id}">
                <div class="log-entry-header">
                    <div class="log-entry-date">${formattedDate}</div>
                    <div class="log-entry-moods">
                        ${practiceButtonHTML}
                        ${moodsHTML}
                    </div>
                </div>
                ${tagsHTML ? `<div class="log-entry-tags">${tagsHTML}</div>` : ''}
                ${asanasHTML ? `<div class="log-entry-tags">${asanasHTML}</div>` : ''}
                ${entry.notes ? `<div class="log-entry-notes">${entry.notes}</div>` : ''}
                <button class="delete-entry-btn" data-id="${entry.id}">Eliminar</button>
            </div>
        `;
    });
    
    logHistoryContainer.innerHTML = historyHTML;
    
    // Añadir event listeners para los botones de eliminar
    document.querySelectorAll('.delete-entry-btn').forEach(button => {
        button.addEventListener('click', function() {
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
// Obtener fecha del campo de entrada o usar la actual
const dateInput = document.getElementById('practice-date').value;
let entryDate;

if (dateInput) {
// Crear fecha sin problemas de huso horario
const [year, month, day] = dateInput.split('-');
entryDate = new Date(year, month - 1, day); // month - 1 porque los meses en JS son 0-indexed
} else {
// Usar fecha actual, pero normalizada a medianoche para evitar problemas
const now = new Date();
entryDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// Actualizar datos de la entrada actual
currentLogEntry.date = entryDate;
currentLogEntry.notes = document.getElementById('practice-notes').value;
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

// Crear nueva entrada
const newEntry = {
    id: Date.now().toString(),
    ...currentLogEntry
};
logHistory.unshift(newEntry);

// Actualizar visualización
displayLogHistory();
updateStatistics();
clearCurrentEntry();

alert('Entrada guardada correctamente');

} catch (error) {
console.error('Error al guardar en Supabase:', error);
alert('Error al guardar: ' + error.message);
}
}

// Cargar historial desde Supabase
async function loadLogHistory() {
try {
const { data, error } = await supabase
    .from('log_entries')
    .select('*')
    .order('date', { ascending: false });

if (error) throw error;

if (data) {
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
}
} catch (error) {
console.error('Error al cargar desde Supabase:', error);
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
}

// Limpiar entrada actual
function clearCurrentEntry() {
// Restablecer práctica
document.getElementById('practice-button').classList.remove('yes');
document.querySelector('.practice-state').textContent = 'NO';
currentLogEntry.practiced = false;

// Limpiar moods
selectedMoods = [];
document.querySelectorAll('.mood-item').forEach(item => {
item.classList.remove('selected');
});
currentLogEntry.moods = [];

// Limpiar fecha (establecer a hoy) - normalizada
const now = new Date();
const normalizedNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
document.getElementById('practice-date').valueAsDate = normalizedNow;

// Limpiar notas
document.getElementById('practice-notes').value = '';
currentLogEntry.notes = '';

// Limpiar tags
currentTags = [];
updateTagsDisplay();
currentLogEntry.tags = [];

// Limpiar asanas
currentAsanas = [];
updateAsanasDisplay();
currentLogEntry.asanas = [];

// Restablecer fecha en el header
const formattedDate = normalizedNow.toLocaleDateString('es-ES', {
day: '2-digit',
month: '2-digit',
year: 'numeric'
});
document.getElementById('current-date').textContent = `${formattedDate}`;
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
            emoji: mood.emoji // Añadir el emoji para mostrarlo en el gráfico
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


// Actualizar visualización de tags
function updateTagsDisplay() {
    const tagsList = document.getElementById('tags-list');
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
            updateTagsDisplay();
        });
        
        tagElement.appendChild(removeBtn);
        tagsList.appendChild(tagElement);
    });
}

// Limpiar entrada actual
function clearCurrentEntry() {
    // Restablecer práctica
    document.getElementById('practice-button').classList.remove('yes');
    document.querySelector('.practice-state').textContent = 'NO';
    currentLogEntry.practiced = false;
    
    // Limpiar moods
    selectedMoods = [];
    document.querySelectorAll('.mood-item').forEach(item => {
        item.classList.remove('selected');
    });
    currentLogEntry.moods = [];
    
    // Limpiar fecha (establecer a hoy)
    document.getElementById('practice-date').valueAsDate = new Date();
    
    // Limpiar notas
    document.getElementById('practice-notes').value = '';
    currentLogEntry.notes = '';
    
    // Limpiar tags
    currentTags = [];
    updateTagsDisplay();
    currentLogEntry.tags = [];
    
    // Limpiar asanas
    currentAsanas = [];
    updateAsanasDisplay();
    currentLogEntry.asanas = [];
    
    // Restablecer fecha en el header
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    document.getElementById('current-date').textContent = `${formattedDate}`;
}
