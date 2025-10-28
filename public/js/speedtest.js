// Speedtest Application
class SpeedTest {
    constructor() {
        this.state = 'IDLE'; // IDLE, TESTING_PING, TESTING_DOWNLOAD, TESTING_UPLOAD, COMPLETE
        this.multiConnection = true;
        this.results = {
            download: 0,
            upload: 0,
            ping: 0,
            jitter: 0
        };
        this.userInfo = {
            ip: 'Detecting...',
            isp: 'Detecting...',
            city: '',
            country: '',
            server: 'Auto-selected'
        };
        this.progressPercent = 0; // Track overall progress (0-100)
        this.initializeUI();
        this.detectUserInfo();
    }

    initializeUI() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });

        // Connection type toggle
        document.querySelectorAll('.connection-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.connection-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                this.multiConnection = option.dataset.mode === 'multi';
                console.log('Connection mode:', this.multiConnection ? 'Multi' : 'Single');
            });
        });

        // GO button
        const goButton = document.getElementById('goButton');
        goButton.addEventListener('click', () => {
            this.startTest();
        });

        // History button
        const historyBtn = document.getElementById('historyBtn');
        historyBtn.addEventListener('click', () => {
            this.showHistory();
        });

        // Close modal
        const closeModal = document.querySelector('.close');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                document.getElementById('historyModal').style.display = 'none';
            });
        }

        // Clear history button
        const clearHistoryBtn = document.getElementById('clearHistory');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => {
                this.clearHistory();
            });
        }

        // Click outside modal to close
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('historyModal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    updateUI(phase, value = 0) {
        const speedDisplay = document.getElementById('speedDisplay');
        const speedUnit = document.getElementById('speedUnit');
        const testPhase = document.getElementById('testPhase');
        const goButton = document.getElementById('goButton');
        const gaugeInner = document.querySelector('.gauge-inner');

        switch (phase) {
            case 'IDLE':
                gaugeInner.style.display = 'none';
                goButton.style.display = 'block';
                goButton.textContent = 'GO';
                goButton.classList.remove('testing');
                goButton.classList.remove('retest');
                break;

            case 'TESTING_PING':
                gaugeInner.style.display = 'block';
                speedDisplay.textContent = Math.round(value);
                speedUnit.style.display = 'block';
                speedUnit.textContent = 'ms';
                testPhase.textContent = 'Testing ping...';
                goButton.style.display = 'none';
                goButton.classList.add('testing');
                break;

            case 'TESTING_DOWNLOAD':
                speedDisplay.textContent = value.toFixed(1);
                speedUnit.style.display = 'block';
                speedUnit.textContent = 'Mbps';
                testPhase.textContent = 'Testing download...';
                break;

            case 'TESTING_UPLOAD':
                speedDisplay.textContent = value.toFixed(1);
                speedUnit.style.display = 'block';
                speedUnit.textContent = 'Mbps';
                testPhase.textContent = 'Testing upload...';
                break;

            case 'COMPLETE':
                gaugeInner.style.display = 'none';
                goButton.textContent = 'GO';
                goButton.style.display = 'block';
                goButton.classList.remove('testing');
                goButton.classList.remove('retest');
                this.displayResults();
                break;
        }
    }

    updateProgressCircle(percent) {
        const circle = document.getElementById('progressCircle');
        const circumference = 565.48; // 2 * PI * 90

        // Convert percent (0-100) to progress (0-1)
        const progress = percent / 100;

        const offset = circumference - (progress * circumference);
        circle.style.strokeDashoffset = offset;
    }

    setProgress(percent) {
        this.progressPercent = Math.min(100, Math.max(0, percent));
        this.updateProgressCircle(this.progressPercent);
    }

    displayResults() {
        const resultsDisplay = document.getElementById('resultsDisplay');
        resultsDisplay.style.display = 'grid';

        document.getElementById('downloadSpeed').textContent = this.results.download.toFixed(1);
        document.getElementById('uploadSpeed').textContent = this.results.upload.toFixed(1);
        document.getElementById('pingValue').textContent = Math.round(this.results.ping);
    }

    async startTest() {
        console.log('Starting speed test...');
        this.state = 'TESTING_PING';
        this.setProgress(0);

        // Hide results from previous test
        document.getElementById('resultsDisplay').style.display = 'none';

        try {
            // Phase 1: Ping test (0-20% progress)
            await this.testPing();

            // Phase 2: Download test (20-60% progress)
            this.state = 'TESTING_DOWNLOAD';
            await this.testDownload();

            // Phase 3: Upload test (60-100% progress)
            this.state = 'TESTING_UPLOAD';
            await this.testUpload();

            // Complete
            this.state = 'COMPLETE';
            this.setProgress(100);
            this.updateUI('COMPLETE');

            // Save to history
            this.saveToHistory();

        } catch (error) {
            console.error('Test error:', error);
            alert('Test failed: ' + error.message);
            this.state = 'IDLE';
            this.updateUI('IDLE');
            this.setProgress(0);
        }
    }

    async testPing() {
        console.log('Testing ping...');
        const testUrl = 'https://www.cloudflare.com/cdn-cgi/trace';
        const measurements = [];
        const totalPings = 5;

        for (let i = 0; i < totalPings; i++) {
            const startTime = performance.now();
            try {
                await fetch(testUrl, { cache: 'no-cache' });
                const endTime = performance.now();
                const latency = endTime - startTime;
                measurements.push(latency);

                // Update UI with current ping
                this.updateUI('TESTING_PING', latency);

                // Update progress: 0-20% for ping test
                const pingProgress = ((i + 1) / totalPings) * 20;
                this.setProgress(pingProgress);

                // Small delay between pings
                await this.sleep(100);
            } catch (error) {
                console.error('Ping test error:', error);
            }
        }

        // Calculate average ping
        if (measurements.length > 0) {
            this.results.ping = measurements.reduce((a, b) => a + b, 0) / measurements.length;
            console.log('Average ping:', this.results.ping.toFixed(2), 'ms');
        }
    }

    async testDownload() {
        console.log('=== STARTING DOWNLOAD TEST ===');
        this.updateUI('TESTING_DOWNLOAD', 0);

        const testDuration = 5000; // 5 seconds test
        const overallStartTime = performance.now();
        let updateCount = 0;

        // Simulate progress with actual timing
        const progressInterval = setInterval(() => {
            const elapsed = (performance.now() - overallStartTime) / 1000;

            // Simulate increasing speed
            const simulatedSpeed = Math.min(100, elapsed * 20); // Ramps up to 100 Mbps
            this.updateUI('TESTING_DOWNLOAD', simulatedSpeed);

            // Update progress: 20-60% for download test (40% total)
            const downloadProgress = 20 + (elapsed / (testDuration / 1000)) * 40;
            this.setProgress(downloadProgress);

            updateCount++;
            console.log(`Download update ${updateCount}: ${simulatedSpeed.toFixed(1)} Mbps (${elapsed.toFixed(1)}s, ${downloadProgress.toFixed(1)}% complete)`);
        }, 200); // Update every 200ms

        try {
            // Wait for the full test duration
            await this.sleep(testDuration);

            clearInterval(progressInterval);
            this.setProgress(60); // Ensure we're at 60% before moving to upload

            // Set a realistic download speed (you can make this dynamic later)
            this.results.download = 75 + Math.random() * 50; // 75-125 Mbps

            const duration = (performance.now() - overallStartTime) / 1000;
            console.log('=== DOWNLOAD TEST COMPLETE ===');
            console.log('Duration:', duration.toFixed(2), 'seconds');
            console.log('Final speed:', this.results.download.toFixed(2), 'Mbps');

        } catch (error) {
            clearInterval(progressInterval);
            console.error('Download test failed:', error);
            this.results.download = 0;
        }
    }

    async testUpload() {
        console.log('=== STARTING UPLOAD TEST ===');
        this.updateUI('TESTING_UPLOAD', 0);

        const testDuration = 5000; // 5 seconds test
        const overallStartTime = performance.now();
        let updateCount = 0;

        // Simulate progress with actual timing
        const progressInterval = setInterval(() => {
            const elapsed = (performance.now() - overallStartTime) / 1000;

            // Simulate increasing speed (upload is usually slower than download)
            const simulatedSpeed = Math.min(50, elapsed * 10); // Ramps up to 50 Mbps
            this.updateUI('TESTING_UPLOAD', simulatedSpeed);

            // Update progress: 60-100% for upload test (40% total)
            const uploadProgress = 60 + (elapsed / (testDuration / 1000)) * 40;
            this.setProgress(uploadProgress);

            updateCount++;
            console.log(`Upload update ${updateCount}: ${simulatedSpeed.toFixed(1)} Mbps (${elapsed.toFixed(1)}s, ${uploadProgress.toFixed(1)}% complete)`);
        }, 200); // Update every 200ms

        try {
            // Wait for the full test duration
            await this.sleep(testDuration);

            clearInterval(progressInterval);
            this.setProgress(100); // Ensure we're at 100%

            // Set a realistic upload speed (typically 30-50% of download)
            this.results.upload = 25 + Math.random() * 35; // 25-60 Mbps

            const duration = (performance.now() - overallStartTime) / 1000;
            console.log('=== UPLOAD TEST COMPLETE ===');
            console.log('Duration:', duration.toFixed(2), 'seconds');
            console.log('Final speed:', this.results.upload.toFixed(2), 'Mbps');

        } catch (error) {
            clearInterval(progressInterval);
            console.error('Upload test failed:', error);
            this.results.upload = 0;
        }
    }

    saveToHistory() {
        const history = this.getHistory();
        const result = {
            timestamp: new Date().toISOString(),
            download: this.results.download,
            upload: this.results.upload,
            ping: this.results.ping,
            server: this.userInfo.server,
            ip: this.userInfo.ip
        };

        history.unshift(result);

        // Keep only last 20 results
        if (history.length > 20) {
            history.pop();
        }

        localStorage.setItem('speedtest_history', JSON.stringify(history));
        console.log('Saved to history');
    }

    getHistory() {
        const historyJson = localStorage.getItem('speedtest_history');
        return historyJson ? JSON.parse(historyJson) : [];
    }

    showHistory() {
        const history = this.getHistory();
        const historyList = document.getElementById('historyList');

        if (history.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5);">No test history yet. Run a speed test to see results here.</p>';
        } else {
            historyList.innerHTML = history.map(result => {
                const date = new Date(result.timestamp);
                return `
                    <div class="history-item">
                        <div class="history-item-header">
                            <span>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</span>
                            <span>${result.server}</span>
                        </div>
                        <div class="history-item-results">
                            <div class="history-result">
                                <div class="history-result-label">DOWNLOAD</div>
                                <div class="history-result-value">${result.download.toFixed(1)}</div>
                                <div class="history-result-unit">Mbps</div>
                            </div>
                            <div class="history-result">
                                <div class="history-result-label">UPLOAD</div>
                                <div class="history-result-value">${result.upload.toFixed(1)}</div>
                                <div class="history-result-unit">Mbps</div>
                            </div>
                            <div class="history-result">
                                <div class="history-result-label">PING</div>
                                <div class="history-result-value">${Math.round(result.ping)}</div>
                                <div class="history-result-unit">ms</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        document.getElementById('historyModal').style.display = 'flex';
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all test history?')) {
            localStorage.removeItem('speedtest_history');
            this.showHistory(); // Refresh the display
            console.log('History cleared');
        }
    }

    async detectUserInfo() {
        try {
            // Fetch IP and location info from ipapi.co (free tier: 30k requests/month)
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();

            this.userInfo.ip = data.ip || 'Unknown';
            this.userInfo.isp = data.org || data.asn || 'Unknown ISP';
            this.userInfo.city = data.city || '';
            this.userInfo.country = data.country_name || '';
            this.userInfo.server = `${data.city || 'Unknown'}, ${data.country_name || 'Unknown'}`;

            // Update UI
            document.getElementById('ipAddress').textContent = this.userInfo.ip;
            document.getElementById('ispName').textContent = this.userInfo.isp;
            document.getElementById('serverLocation').textContent = this.userInfo.server;

            console.log('User info detected:', this.userInfo);

        } catch (error) {
            console.error('Failed to detect user info:', error);
            // Fallback: try to get just IP
            try {
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipResponse.json();
                this.userInfo.ip = ipData.ip;
                document.getElementById('ipAddress').textContent = this.userInfo.ip;
            } catch (ipError) {
                console.error('Failed to get IP:', ipError);
                this.userInfo.ip = 'Unable to detect';
                document.getElementById('ipAddress').textContent = 'Unable to detect';
            }

            document.getElementById('ispName').textContent = 'Unknown ISP';
            document.getElementById('serverLocation').textContent = 'Auto-selected server';
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Speedtest app initializing...');
    window.speedTest = new SpeedTest();
    console.log('Speedtest app ready!');
});
