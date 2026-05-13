import { GoogleGenerativeAI } from "https://esm.run/@google/generativeai";

// 1. KONFIGURASI AI
const API_KEY = "AIzaSyDCJbDC-0shiOGm_adUmNFyb8PVIF9OZGg";
const genAI = new GoogleGenerativeAI(API_KEY);

// Fungsi untuk mengubah file gambar ke format yang dimengerti Gemini
async function fileToGenerativePart(file) {
    const base64EncodedDataPromise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
}

const imageInput = document.getElementById('imageInput');

if (imageInput) {
    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validasi: pastikan yang diupload adalah gambar
        if (!file.type.startsWith('image/')) {
            alert("Mohon unggah file gambar yang valid.");
            return;
        }

        // Tampilkan Pratinjau Gambar
        const previewContainer = document.getElementById('image-preview-container');
        const previewImg = document.getElementById('preview-img');
        const placeholder = document.getElementById('preview-placeholder');
        
        if (previewImg && previewContainer) {
            previewImg.src = URL.createObjectURL(file);
            previewImg.classList.remove('hidden-section');
            if (placeholder) placeholder.classList.add('hidden-section');
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const imagePart = await fileToGenerativePart(file);
            const prompt = "Sebutkan nama bahan makanan ini dalam 1-2 kata saja (Bahasa Indonesia). Contoh: Pisang Ambon, Jeruk Sunkist.";
            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const namaTerdeteksi = response.text().trim();
            
            await matchWithLocalJSON(namaTerdeteksi);
        } catch (error) {
            console.error("Error API Gemini:", error);
            alert("Gagal mendeteksi gambar. Periksa koneksi internet.");
        }
    });
}

async function matchWithLocalJSON(namaAI) {
    try {
        const res = await fetch('rekomendasi_pemenuhan_nutrisi.json');
        const data = await res.json();
        
        const match = data.find(item => 
            namaAI.toLowerCase().includes(item.name.toLowerCase()) || 
            item.name.toLowerCase().includes(namaAI.toLowerCase())
        );

        if (match) {
            document.getElementById('food-name').innerText = match.name;
            document.getElementById('res-mineral').innerText = match.nutrition.mineral || "-";
            document.getElementById('res-protein').innerText = match.nutrition.protein;
            document.getElementById('res-karbo').innerText = match.nutrition.karbo;
            document.getElementById('res-lemak').innerText = match.nutrition.lemak || "0g";
            document.getElementById('res-vitamin').innerText = match.nutrition.vitamin;
            document.getElementById('res-air').innerText = match.nutrition.air || "-";
            document.getElementById('res-healing').innerText = match.healing;
            document.getElementById('res-summary-text').innerText = "Makanan ini termasuk dalam kategori " + match.type + " yang baik untuk dikonsumsi.";
        } else {
            document.getElementById('food-name').innerText = namaAI + " (Belum Terdaftar)";
            document.getElementById('res-mineral').innerText = "-";
            document.getElementById('res-protein').innerText = "-";
            document.getElementById('res-karbo').innerText = "-";
            document.getElementById('res-lemak').innerText = "-";
            document.getElementById('res-vitamin').innerText = "-";
            document.getElementById('res-air').innerText = "-";
            document.getElementById('res-healing').innerText = "-";
            document.getElementById('res-summary-text').innerText = "Detail nutrisi untuk makanan ini belum tersedia di database lokal.";
        }
    } catch (err) {
        console.error("Gagal membaca JSON:", err);
    }
}