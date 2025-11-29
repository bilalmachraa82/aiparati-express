// AutoFund AI - Frontend JavaScript

// Global variables
let currentJobId = null;
let websocket = null;

// DOM elements
const uploadSection = document.getElementById('uploadSection');
const contextSection = document.getElementById('contextSection');
const processingSection = document.getElementById('processingSection');
const resultsSection = document.getElementById('resultsSection');
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const companyContext = document.getElementById('companyContext');

// File handling
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    // Validate file
    if (file.type !== 'application/pdf') {
        alert('Por favor, selecione um ficheiro PDF.');
        return;
    }

    if (file.size > 50 * 1024 * 1024) {
        alert('O ficheiro é muito grande. Tamanho máximo: 50MB');
        return;
    }

    // Store file for upload
    window.selectedFile = file;

    // Show context section
    contextSection.style.display = 'block';
    contextSection.classList.add('fade-in');

    // Update UI
    uploadArea.innerHTML = `
        <i class="fas fa-file-pdf" style="color: #27ae60;"></i>
        <p style="color: #27ae60; font-weight: bold;">${file.name}</p>
        <p style="color: #666;">${formatFileSize(file.size)}</p>
        <button class="btn btn-secondary" onclick="clearFile()">
            <i class="fas fa-times"></i> Limpar
        </button>
    `;
}

function clearFile() {
    window.selectedFile = null;
    fileInput.value = '';
    contextSection.style.display = 'none';
    uploadArea.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <p>Arraste o ficheiro IES PDF aqui ou</p>
        <input type="file" id="fileInput" accept=".pdf" style="display: none;" onchange="handleFileSelect(event)">
        <button class="btn btn-primary" onclick="document.getElementById('fileInput').click()">
            Selecionar Ficheiro
        </button>
        <p class="upload-hint">Formato: PDF (Máx: 50MB)</p>
    `;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Upload and processing
async function uploadFile() {
    if (!window.selectedFile) {
        alert('Por favor, selecione um ficheiro primeiro.');
        return;
    }

    const formData = new FormData();
    formData.append('file', window.selectedFile);
    formData.append('company_context', companyContext.value);

    try {
        // Start upload
        const response = await fetch('/api/v1/upload/ies', {
            method: 'POST',
            body: formData,
            headers: {
                // Add auth header if needed
                // 'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const result = await response.json();
        currentJobId = result.job_id;

        // Show processing section
        showProcessingSection();

        // Connect WebSocket for real-time updates
        connectWebSocket();

    } catch (error) {
        console.error('Error uploading file:', error);
        alert('Erro ao fazer upload do ficheiro. Por favor, tente novamente.');
    }
}

function showProcessingSection() {
    uploadSection.style.display = 'none';
    processingSection.style.display = 'block';
    processingSection.classList.add('fade-in');
}

// WebSocket connection
function connectWebSocket() {
    const wsUrl = `ws://localhost:8000/ws/${currentJobId}`;
    websocket = new WebSocket(wsUrl);

    websocket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };

    websocket.onerror = function(error) {
        console.error('WebSocket error:', error);
        // Fallback to polling
        startPolling();
    };

    websocket.onclose = function() {
        console.log('WebSocket connection closed');
    };
}

// Handle WebSocket messages
function handleWebSocketMessage(data) {
    if (data.type === 'heartbeat') {
        return;
    }

    // Update progress
    if (data.progress !== undefined) {
        updateProgress(data.progress);
    }

    // Update status message
    if (data.message) {
        updateStatusMessage(data.message);
    }

    // Update stage
    if (data.stage) {
        updateStage(data.stage);
    }

    // Handle completion
    if (data.status === 'completed') {
        showResults(data.results);
    } else if (data.status === 'failed') {
        showError(data.error);
    }
}

// Progress and status updates
function updateProgress(progress) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${progress}%`;
}

function updateStatusMessage(message) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <span>${message}</span>
    `;
}

function updateStage(stage) {
    // Reset all steps
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active', 'completed');
    });

    // Mark steps based on current stage
    const stages = ['extracting', 'analyzing', 'generating', 'completed'];
    const currentStageIndex = stages.indexOf(stage);

    stages.forEach((s, index) => {
        const stepElement = document.getElementById(`step${index + 1}`);
        if (index < currentStageIndex) {
            stepElement.classList.add('completed');
        } else if (index === currentStageIndex) {
            stepElement.classList.add('active');
        }
    });

    // Final update
    if (stage === 'completed') {
        updateStatusMessage('<i class="fas fa-check-circle" style="color: #27ae60;"></i> <span>Análise concluída com sucesso!</span>');
    }
}

// Polling fallback
function startPolling() {
    const pollInterval = setInterval(async () => {
        try {
            const response = await fetch(`/api/v1/upload/status/${currentJobId}`);
            const data = await response.json();

            updateProgress(data.progress);
            updateStatusMessage(data.message);

            if (data.status === 'completed') {
                clearInterval(pollInterval);
                showResults();
            } else if (data.status === 'failed') {
                clearInterval(pollInterval);
                showError();
            }
        } catch (error) {
            console.error('Polling error:', error);
        }
    }, 2000);
}

// Show results
function showResults(results) {
    processingSection.style.display = 'none';
    resultsSection.style.display = 'block';
    resultsSection.classList.add('fade-in');

    // Populate results (mock data for demo)
    populateFinancialMetrics();
    populateEligibilityScore();
    populateRecommendations();
}

function populateFinancialMetrics() {
    const metricsContainer = document.getElementById('financialMetrics');
    metricsContainer.innerHTML = `
        <div class="metric">
            <div class="metric-value">56.9%</div>
            <div class="metric-label">Autonomia Financeira</div>
        </div>
        <div class="metric">
            <div class="metric-value">2.49</div>
            <div class="metric-label">Liquidez Geral</div>
        </div>
        <div class="metric">
            <div class="metric-value">30%</div>
            <div class="metric-label">Margem EBITDA</div>
        </div>
        <div class="metric">
            <div class="metric-value">15.2%</div>
            <div class="metric-label">Rentabilidade Ativos</div>
        </div>
    `;
}

function populateEligibilityScore() {
    const scoreContainer = document.getElementById('eligibilityScore');
    scoreContainer.innerHTML = `
        <div class="score-circle score-high">85</div>
        <h4 style="color: #27ae60;">Alta Elegibilidade</h4>
        <p>A empresa cumpre todos os critérios principais para candidatura Portugal 2030</p>
    `;
}

function populateRecommendations() {
    const recommendationsContainer = document.getElementById('recommendations');
    recommendationsContainer.innerHTML = `
        <ul>
            <li>Automatizar processos de produção para aumentar eficiência</li>
            <li>Investir em equipamentos mais sustentáveis e energeticamente eficientes</li>
            <li>Diversificar mercados de exportação para reduzir dependências</li>
            <li>Capacitar equipas em competências digitais e de gestão</li>
        </ul>
        <p style="margin-top: 1rem; color: #27ae60;">
            <strong>Incentivo estimado:</strong> €126.000 (70% do investimento)
        </p>
    `;
}

// Error handling
function showError(error) {
    processingSection.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e74c3c;"></i>
            <h3 style="color: #e74c3c; margin: 1rem 0;">Erro no Processamento</h3>
            <p>${error || 'Ocorreu um erro ao processar o ficheiro. Por favor, tente novamente.'}</p>
            <button class="btn btn-primary" onclick="location.reload()">
                <i class="fas fa-redo"></i> Tentar Novamente
            </button>
        </div>
    `;
}

// Download functions
function downloadExcel() {
    // Simulate download
    const link = document.createElement('a');
    link.href = `/api/v1/results/${currentJobId}/excel`;
    link.download = `autofund_analysis_${currentJobId}.xlsx`;
    link.click();
}

function downloadPDF() {
    // Simulate download
    const link = document.createElement('a');
    link.href = `/api/v1/results/${currentJobId}/pdf`;
    link.download = `autofund_report_${currentJobId}.pdf`;
    link.click();
}

// Login modal (placeholder)
function showLogin() {
    alert('Funcionalidade de login em desenvolvimento');
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('AutoFund AI initialized');
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (websocket) {
        websocket.close();
    }
});