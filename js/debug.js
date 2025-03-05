/**
 * 简易调试工具
 */

// 创建调试面板
function createDebugPanel() {
    const panel = document.createElement('div');
    panel.id = 'simple-debug-panel';
    panel.style.position = 'fixed';
    panel.style.bottom = '10px';
    panel.style.left = '10px';
    panel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    panel.style.color = 'white';
    panel.style.padding = '10px';
    panel.style.borderRadius = '5px';
    panel.style.zIndex = '9999';
    panel.style.maxHeight = '200px';
    panel.style.overflowY = 'auto';
    panel.style.width = '80%';
    panel.style.fontSize = '12px';
    panel.style.fontFamily = 'monospace';
    
    const title = document.createElement('div');
    title.textContent = '调试信息';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '5px';
    
    const logContainer = document.createElement('div');
    logContainer.id = 'simple-debug-log';
    
    panel.appendChild(title);
    panel.appendChild(logContainer);
    document.body.appendChild(panel);
    
    // 重写console方法
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    console.log = (...args) => {
        originalConsoleLog.apply(console, args);
        logMessage('log', args);
    };
    
    console.error = (...args) => {
        originalConsoleError.apply(console, args);
        logMessage('error', args);
    };
    
    console.warn = (...args) => {
        originalConsoleWarn.apply(console, args);
        logMessage('warn', args);
    };
    
    // 添加全局错误处理
    window.addEventListener('error', (event) => {
        logMessage('error', [`${event.message} at ${event.filename}:${event.lineno}`]);
    });
}

// 记录消息
function logMessage(type, args) {
    const logContainer = document.getElementById('simple-debug-log');
    if (!logContainer) return;
    
    const entry = document.createElement('div');
    entry.style.marginBottom = '5px';
    entry.style.borderLeft = '3px solid ' + (type === 'error' ? '#f44336' : type === 'warn' ? '#ff9800' : '#4CAF50');
    entry.style.paddingLeft = '5px';
    
    const timestamp = new Date().toLocaleTimeString();
    const message = args.map(arg => {
        if (typeof arg === 'object') {
            try {
                return JSON.stringify(arg);
            } catch (e) {
                return String(arg);
            }
        }
        return String(arg);
    }).join(' ');
    
    entry.textContent = `[${timestamp}] ${message}`;
    
    logContainer.appendChild(entry);
    
    // 限制日志条目数量
    while (logContainer.children.length > 20) {
        logContainer.removeChild(logContainer.firstChild);
    }
    
    // 自动滚动到底部
    logContainer.scrollTop = logContainer.scrollHeight;
}

// 页面加载完成后创建调试面板
document.addEventListener('DOMContentLoaded', () => {
    createDebugPanel();
    console.log("简易调试面板已初始化");
});