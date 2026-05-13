let themeToggle;
let themeIcon;
let FOOD_RECOMMENDATIONS = [];
let nutritionData = [];

// Terapkan tema segera saat skrip dimuat untuk menghindari "flash" cahaya
function applyTheme() {
    const currentTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    return currentTheme;
}
applyTheme();

// 0.1 Create Loader Particles
function createParticles() {
    const container = document.querySelector('.loader-overlay');
    if (!container) return;
    const particleCount = 20;
    const particleContainer = document.createElement('div');
    particleContainer.className = 'loader-particles';
    
    for(let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 100 + '%';
        p.style.setProperty('--tw', (Math.random() - 0.5) * 200 + 'px');
        p.style.setProperty('--th', (Math.random() - 0.5) * 200 + 'px');
        p.style.animationDelay = Math.random() * 3 + 's';
        particleContainer.appendChild(p);
    }
    container.appendChild(particleContainer);
}

// 1. Loading sequence
window.addEventListener("DOMContentLoaded", () => {
    // Pastikan referensi tema diinisialisasi di semua halaman (Home, Nutrisi, Makanan)
    themeToggle = document.getElementById("theme-toggle");
    themeIcon = document.querySelector(".theme-icon");
    setupTheme();

    const loader = document.getElementById("loader");
    const appContainer = document.getElementById("app");

    // Fungsi untuk memunculkan konten aplikasi dengan efek fade-in
    const revealApp = () => {
        if (appContainer && appContainer.classList.contains('hidden')) {
            appContainer.classList.remove("hidden");
            setTimeout(() => appContainer.classList.remove("fade-init"), 50);
        }
    };

    // Cek apakah user sudah melihat loader di sesi ini
    const hasVisited = sessionStorage.getItem("nutrilife_visited");

    if (!loader || hasVisited) {
        if (loader) loader.style.display = "none";
        revealApp();
    } else {
        const loadingMsg = document.querySelector(".loading-msg");
        createParticles();

        const messages = [
            "Menganalisis profil kesehatan...",
            "Mengecek riwayat medis...",
            "Menghitung kebutuhan nutrisi...",
            "Menyesuaikan menu harian..."
        ];

        let step = 0;
        const msgInterval = setInterval(() => {
            if (loadingMsg && step < messages.length) loadingMsg.innerText = messages[step++];
        }, 700);

        setTimeout(() => {
            clearInterval(msgInterval);
            loader.classList.add("fade-out");
            sessionStorage.setItem("nutrilife_visited", "true");
            
            setTimeout(() => {
                loader.style.display = "none";
                revealApp();
            }, 800); 
        }, 3000);
    }
});

// 2. Theme Logic
function setupTheme() {
    const currentTheme = applyTheme();
    
    if(themeToggle) themeToggle.checked = currentTheme === "dark";
    if(themeIcon) themeIcon.textContent = currentTheme === "dark" ? "🌙" : "☀️";

    themeToggle?.addEventListener("change", () => {
        const theme = themeToggle.checked ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        if(themeIcon) themeIcon.textContent = theme === "dark" ? "🌙" : "☀️";
    });
}

// Sinkronisasi tema secara real-time saat berpindah halaman atau tab
window.addEventListener('storage', (e) => {
    if (e.key === 'theme') {
        applyTheme();
        if(themeToggle) themeToggle.checked = e.newValue === "dark";
        if(themeIcon) themeIcon.textContent = e.newValue === "dark" ? "🌙" : "☀️";
    }
});

// 3. Dynamic Nutrition Logic
const STORAGE_KEY = 'nutrilife_data';
const DATE_KEY = 'nutrilife_last_reset';

function getInitialData() {
    const today = new Date().toLocaleDateString();
    const lastReset = localStorage.getItem(DATE_KEY);
    const savedData = localStorage.getItem(STORAGE_KEY);

    // Jika hari ini berbeda dengan hari terakhir reset, maka reset semua ke 0
    if (lastReset !== today) {
        const freshData = [
            { type: 'Karbohidrat', value: 0, color: '#FFB347' },
            { type: 'Protein', value: 0, color: '#38AA8B' },
            { type: 'Lemak', value: 0, color: '#FF6961' },
            { type: 'Air', value: 0, color: '#438AA8' },
            { type: 'Mineral', value: 0, color: '#ADEE8E' },
            { type: 'Vitamin', value: 0, color: '#FFD700' }
        ];
        localStorage.setItem(DATE_KEY, today);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(freshData));
        return freshData;
    }

    return savedData ? JSON.parse(savedData) : [];
}

// Initialize nutrition data
nutritionData = getInitialData();

const nutriColors = {
    'Karbohidrat': '#FFB347',
    'Protein': '#38AA8B',
    'Lemak': '#FF6961',
    'Air': '#438AA8',
    'Mineral': '#ADEE8E',
    'Vitamin': '#FFD700'
};

// Target Nutrisi berdasarkan 2500 kkal
const NUTRITION_TARGETS = {
    'Karbohidrat': (2500 * 0.5) / 4,  // 312.5g
    'Protein': (2500 * 0.15) / 4,     // 93.75g
    'Lemak': (2500 * 0.25) / 9,        // 69.44g
    'Air': 2000,                       // 2000ml (Standard 2L)
    'Mineral': 30,                     // 30g (Target Serat/Mineral AKG)
    'Vitamin': 100                      // Target nominal 100 unit/g
};

function saveNutritionData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nutritionData));
}


// Fungsi untuk menganimasi angka
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        obj.innerHTML = current;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = end;
        }
    };
    window.requestAnimationFrame(step);
}

let previousValues = {}; // Untuk menyimpan nilai lama agar bisa di-animate

function renderNutrition() {
    const gaugeContainer = document.getElementById('gauge-container');
    const legendContainer = document.getElementById('legend-container');
    
    if(!gaugeContainer || !legendContainer) return;

    gaugeContainer.innerHTML = '';
    legendContainer.innerHTML = '';

    nutritionData.forEach((item, index) => {
        // Hitung persentase terhadap target untuk lebar grafik batang
        const target = NUTRITION_TARGETS[item.type] || 100;
        const percentage = Math.min((item.value / target) * 100, 100);

        // Update Gauge
        const gauge = document.createElement('div');
        gauge.className = 'stacked-gauge';
        if (percentage >= 100) gauge.classList.add('reached-goal');
        gauge.style.cssText = `--p: ${percentage}; --c: ${item.color};`;
        gauge.style.animationDelay = `${index * 0.1}s`;

        // Tambahkan label teks di dalam gauge
        const label = document.createElement('span');
        label.className = 'gauge-label';
        label.innerText = item.type;
        gauge.appendChild(label);

        gaugeContainer.appendChild(gauge);

        // Update Legend
        const legend = document.createElement('div');
        legend.className = 'legend-item';
        legend.style.setProperty('--comp-color', item.color);
        legend.style.animationDelay = `${index * 0.1 + 0.3}s`;
        
        const displayTarget = Math.round(target);
        legend.innerHTML = `${item.type} = <span class="val-${item.type}">0</span>g / ${displayTarget}g`;
        legendContainer.appendChild(legend);

        // Jalankan animasi angka
        const valSpan = legend.querySelector(`.val-${item.type}`);
        const startVal = previousValues[item.type] || 0;
        animateValue(valSpan, startVal, item.value, 1500);
        previousValues[item.type] = item.value;
    });
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function renderRecommendations(filter = "Rekomendasi Makanan", query = "") {
    const listContainer = document.querySelector('.recommendations-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    
    let filteredData;

    if (query && query.trim() !== "") {
        // Filter berdasarkan kata kunci riwayat kesehatan pada semua jenis data
        const q = query.toLowerCase();
        filteredData = FOOD_RECOMMENDATIONS.filter(item => 
            (item.healing.toLowerCase().includes(q) || item.name.toLowerCase().includes(q))
        );
        
        if (filteredData.length === 0) {
            listContainer.innerHTML = `
                <div class="no-results-state" style="text-align: center; padding: 40px 20px; animation: fadeInScale 0.5s ease-out forwards;">
                    <span style="font-size: 3rem; display: block; margin-bottom: 10px;">🔍</span>
                    <p class="loading-msg">Ops! Tidak ditemukan menu yang sesuai untuk "<b>${query}</b>".<br>Coba kata kunci lain seperti 'jantung' atau 'vitamin'.</p>
                </div>
            `;
            return;
        }
    } else if (filter === "Rekomendasi Makanan") {
        // Tab utama hanya menampilkan masakan siap saji (Menu)
        const pool = FOOD_RECOMMENDATIONS.filter(item => item.jenis.toLowerCase() === "menu makanan");
        const shuffled = shuffleArray(pool);
        const count = Math.min(shuffled.length, Math.floor(Math.random() * 6) + 5); 
        filteredData = shuffled.slice(0, count);
    } else {
        // Tab nutrisi (Karbo, Lemak, dll) hanya menampilkan sumber mentah (Bahan)
        filteredData = FOOD_RECOMMENDATIONS.filter(item => item.type === filter && item.jenis.toLowerCase() === "bahan makanan");
    }

    if (!filteredData || filteredData.length === 0) {
        listContainer.innerHTML = `
            <div class="no-results-state" style="text-align: center; padding: 40px 20px;">
                <span style="font-size: 3rem; display: block; margin-bottom: 10px;">🔍</span>
                <p style="color: var(--text-sub)">Ops! Tidak ditemukan hasil untuk "<b>${query || filter}</b>".</p>
            </div>
        `;
        return;
    }

    const nutriIcons = {
        'karbo': '🌾',
        'protein': '🥩',
        'lemak': '🥑',
        'air': '💧',
        'kkal': '🔥'
    };

    filteredData.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="card-content-wrapper">
                <div class="card-image">
                    <img src="${item.image || 'https://via.placeholder.com/150'}" alt="${item.name}">
                </div>
                <div class="card-info">
                    <span class="card-type-tag" style="--tag-color: ${nutriColors[item.type] || 'var(--primary)'}">${item.type}</span>
                    <h3 class="card-title">${item.name}</h3>
                    <div class="card-details">
                        <div class="nutri-badge" style="--badge-clr: ${nutriColors['Karbohidrat']}"><span>${nutriIcons.karbo}</span> ${item.nutrition.karbo}</div>
                        <div class="nutri-badge" style="--badge-clr: ${nutriColors['Protein']}"><span>${nutriIcons.protein}</span> ${item.nutrition.protein}</div>
                        <div class="nutri-badge" style="--badge-clr: ${nutriColors['Lemak']}"><span>${nutriIcons.lemak}</span> ${item.nutrition.lemak}</div>
                        <div class="nutri-badge" style="--badge-clr: ${nutriColors['Air']}"><span>${nutriIcons.air}</span> ${item.nutrition.air}</div>
                        <div class="nutri-badge" style="--badge-clr: #FF6B6B"><span>${nutriIcons.kkal}</span> ${item.nutrition.kkal} kcal</div>
                    </div>
                    <div class="healing-box">
                        <i style="color: ${nutriColors[item.type] || 'var(--primary)'}">🛡️ MANFAAT KESEHATAN</i>
                        ${item.healing}
                    </div>
                </div>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

// Efek Partikel saat Klik Add
function createBurstEffect(e) {
    const colors = ['#38AA8B', '#ADEE8E', '#FFB347', '#FF6961'];
    for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        p.className = 'burst-particle';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.left = e.clientX + 'px';
        p.style.top = e.clientY + 'px';
        
        const dx = (Math.random() - 0.5) * 100 + 'px';
        const dy = (Math.random() - 0.5) * 100 + 'px';
        p.style.setProperty('--dx', dx);
        p.style.setProperty('--dy', dy);
        
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 600);
    }
}

document.getElementById('add-nutri-btn')?.addEventListener('click', (e) => {
    const type = document.getElementById('nutri-type').value;
    const value = parseInt(document.getElementById('nutri-value').value);

    const nutriInput = document.getElementById('nutri-value');
    if (isNaN(value) || value <= 0) {
        nutriInput?.classList.add('shake');
        setTimeout(() => nutriInput?.classList.remove('shake'), 400);
        return;
    }

    const existingIndex = nutritionData.findIndex(item => item.type === type);
    if (existingIndex !== -1) {
        // Menambahkan nilai baru ke nilai yang sudah ada
        nutritionData[existingIndex].value += value;
    } else {
        nutritionData.push({ type, value: value, color: nutriColors[type] || '#ccc' });
    }

    createBurstEffect(e);
    saveNutritionData();
    renderNutrition();
});

// Health Search Interaction
document.querySelector('#search-health-btn, .search-btn')?.addEventListener('click', () => {
    const query = document.getElementById('health-query').value;
    // Tambahkan efek ripple/burst pada tombol jika diinginkan
    const listContainer = document.querySelector('.recommendations-list');
    if (listContainer) {
        listContainer.style.opacity = '0';
        setTimeout(() => {
            renderRecommendations("Rekomendasi Makanan", query);
            listContainer.style.opacity = '1';
        }, 300);
    }
});

// Filter Chips Interaction
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('chip')) {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        // Di sini Anda bisa menambahkan logika filtering data jika diperlukan nantinya
        renderRecommendations(e.target.innerText);
    }
});

// 4. Bottom Navigation Logic
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        
        const pages = {
            'home': 'home.html',
            'nutrition': 'nutrisi.html',
            'food': 'makanan.html'
        };
        
        // Jangan arahkan ulang jika user sudah berada di halaman tersebut
        let currentPage = window.location.pathname.split('/').pop();
        if (currentPage === "") currentPage = "home.html";

        if (pages[target] && pages[target] !== currentPage) {
            const app = document.getElementById('app');
            if (app) {
                app.classList.add('fade-out-page');
                setTimeout(() => {
                    window.location.href = pages[target];
                }, 500);
            } else {
                window.location.href = pages[target];
            }
        }
    });
});

// Fungsi untuk memuat data JSON
async function loadFoodData() {
    try {
        const response = await fetch('rekomendasi_pemenuhan_nutrisi.json');
        FOOD_RECOMMENDATIONS = await response.json();
        renderRecommendations();
    } catch (error) {
        console.error("Gagal memuat data rekomendasi makanan:", error);
    }
}

// Initial Render
renderNutrition();
loadFoodData();