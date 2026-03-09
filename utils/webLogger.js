import DatabaseLogger from './databaseLogger.js';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import path from 'path';

class WebLogger {
  constructor(port = 3000) {
    this.port = port;
    this.databaseLogger = new DatabaseLogger();
    this.server = null;
  }

  async start() {
    this.server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url, `http://localhost:${this.port}`);
        
        if (url.pathname === '/') {
          await this.serveHomePage(res);
        } else if (url.pathname === '/api/logs') {
          await this.serveLogsAPI(res, url.searchParams);
        } else if (url.pathname === '/api/failed') {
          await this.serveFailedLogsAPI(res, url.searchParams);
        } else if (url.pathname === '/api/passed') {
          await this.servePassedLogsAPI(res, url.searchParams);
        } else {
          res.writeHead(404);
          res.end('Not Found');
        }
      } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    });

    this.server.listen(this.port, () => {
      console.log(`🌐 Web logger dostupný na: http://localhost:${this.port}`);
    });
  }

  async serveHomePage(res) {
    const html = `
<!DOCTYPE html>
<html lang="sk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playwright Test Logy</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .controls {
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.3s;
        }
        .btn-primary { background-color: #007bff; color: white; }
        .btn-success { background-color: #28a745; color: white; }
        .btn-danger { background-color: #dc3545; color: white; }
        .btn:hover { opacity: 0.8; }
        .content {
            padding: 20px;
        }
        .log-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .log-table th, .log-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .log-table th {
            background-color: #f8f9fa;
            font-weight: 600;
        }
        .status-passed { color: #28a745; font-weight: bold; }
        .status-failed { color: #dc3545; font-weight: bold; }
        .status-running { color: #ffc107; font-weight: bold; }
        .error-message {
            color: #dc3545;
            font-size: 12px;
            margin-top: 5px;
        }
        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        .refresh-time {
            text-align: right;
            color: #666;
            font-size: 12px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Playwright Test Logy</h1>
            <p>Statické zobrazenie testov z databázy</p>
        </div>
        
        <div class="controls">
            <button class="btn btn-primary" onclick="loadAllLogs()">📋 Všetky logy</button>
            <button class="btn btn-success" onclick="loadPassedLogs()">✅ Úspešné testy</button>
            <button class="btn btn-danger" onclick="loadFailedLogs()">❌ Zlyhané testy</button>
            <button class="btn btn-primary" onclick="refreshLogs()">🔄 Obnoviť</button>
        </div>
        
        <div class="content">
            <div id="loading" class="loading">Načítavam logy...</div>
            <div id="content"></div>
            <div id="refresh-time" class="refresh-time"></div>
        </div>
    </div>

    <script>
        async function loadLogs(endpoint) {
            const loading = document.getElementById('loading');
            const content = document.getElementById('content');
            const refreshTime = document.getElementById('refresh-time');
            
            loading.style.display = 'block';
            content.innerHTML = '';
            
            try {
                const response = await fetch(endpoint);
                const logs = await response.json();
                
                if (logs.length === 0) {
                    content.innerHTML = '<p>📭 Žiadne logy neboli nájdené.</p>';
                    return;
                }
                
                const table = createLogTable(logs);
                content.innerHTML = table;
                
                refreshTime.textContent = 'Posledné obnovenie: ' + new Date().toLocaleString('sk-SK');
            } catch (error) {
                content.innerHTML = '<p style="color: red;">❌ Chyba pri načítaní logov: ' + error.message + '</p>';
            } finally {
                loading.style.display = 'none';
            }
        }
        
        function createLogTable(logs) {
            let table = '<table class="log-table"><thead><tr><th>Test</th><th>Stav</th><th>Trvanie</th><th>Čas spustenia</th><th>Chyba</th></tr></thead><tbody>';
            
            logs.forEach(log => {
                const statusClass = 'status-' + log.status;
                const statusIcon = getStatusIcon(log.status);
                const duration = log.duration ? log.duration + 's' : 'N/A';
                const errorCell = log.error_message ? 
                    '<div class="error-message">' + log.error_message + '</div>' : '';
                
                table += \`
                    <tr>
                        <td>\${log.test_name}</td>
                        <td class="\${statusClass}">\${statusIcon} \${log.status}</td>
                        <td>\${duration}</td>
                        <td>\${new Date(log.start_time).toLocaleString('sk-SK')}</td>
                        <td>\${errorCell}</td>
                    </tr>
                \`;
            });
            
            table += '</tbody></table>';
            return table;
        }
        
        function getStatusIcon(status) {
            switch (status) {
                case 'passed': return '✅';
                case 'failed': return '❌';
                case 'running': return '🔄';
                case 'skipped': return '⏭️';
                case 'timedOut': return '⏰';
                default: return '❓';
            }
        }
        
        function loadAllLogs() {
            loadLogs('/api/logs');
        }
        
        function loadPassedLogs() {
            loadLogs('/api/passed');
        }
        
        function loadFailedLogs() {
            loadLogs('/api/failed');
        }
        
        function refreshLogs() {
            loadAllLogs();
        }
        
        // Načítame všetky logy pri načítaní stránky
        window.onload = loadAllLogs;
    </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }

  async serveLogsAPI(res, params) {
    const limit = parseInt(params.get('limit')) || 50;
    const logs = await this.databaseLogger.getTestLogs(limit);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(logs));
  }

  async serveFailedLogsAPI(res, params) {
    const limit = parseInt(params.get('limit')) || 20;
    const logs = await this.databaseLogger.getTestLogsByStatus('failed', limit);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(logs));
  }

  async servePassedLogsAPI(res, params) {
    const limit = parseInt(params.get('limit')) || 20;
    const logs = await this.databaseLogger.getTestLogsByStatus('passed', limit);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(logs));
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log('🔒 Web logger zastavený');
    }
  }
}

export default WebLogger; 