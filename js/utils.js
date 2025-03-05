/**
 * 工具函数集合
 */

// 生成指定范围内的随机整数
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 洗牌算法，用于随机排列数组
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// 检查两个颜色是否相同
function isSameColor(color1, color2) {
    return color1 === color2;
}

// 保存游戏进度到本地存储
function saveGameProgress(level, stars, completedLevels) {
    const gameProgress = {
        currentLevel: level,
        stars: stars,
        completedLevels: completedLevels
    };
    localStorage.setItem('rainbowDropsProgress', JSON.stringify(gameProgress));
}

// 从本地存储加载游戏进度
function loadGameProgress() {
    const progress = localStorage.getItem('rainbowDropsProgress');
    if (progress) {
        return JSON.parse(progress);
    }
    return {
        currentLevel: 1,
        stars: {},
        completedLevels: []
    };
}

// 切换屏幕显示
function showScreen(screenId) {
    // 隐藏所有屏幕
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // 显示指定屏幕
    document.getElementById(screenId).classList.add('active');
}

// 创建液体层元素
function createLiquidElement(color, height) {
    const liquidElement = document.createElement('div');
    liquidElement.className = 'liquid-layer';
    liquidElement.style.backgroundColor = color;
    liquidElement.style.height = `${height}%`;
    return liquidElement;
}

// 创建气泡效果
function createBubbles(container, count) {
    for (let i = 0; i < count; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.style.left = `${randomInt(20, 80)}%`;
        bubble.style.animationDelay = `${randomInt(0, 15) / 10}s`;
        container.appendChild(bubble);
        
        // 自动移除气泡元素
        setTimeout(() => {
            bubble.remove();
        }, 1500);
    }
}

// 创建水花效果
function createSplash(container, x, y) {
    const splash = document.createElement('div');
    splash.className = 'splash';
    splash.style.left = `${x}px`;
    splash.style.top = `${y}px`;
    container.appendChild(splash);
    
    // 自动移除水花元素
    setTimeout(() => {
        splash.remove();
    }, 500);
}

// 振动设备（如果支持）
function vibrateDevice(duration) {
    if ('vibrate' in navigator && localStorage.getItem('vibrationEnabled') !== 'false') {
        navigator.vibrate(duration);
    }
}

// 检查关卡是否完成
function isLevelComplete(bottles) {
    for (const bottle of bottles) {
        const layers = bottle.layers;
        
        // 如果瓶子是空的，继续检查下一个
        if (layers.length === 0) continue;
        
        // 如果瓶子不是空的，但不是完全填满同一种颜色，则关卡未完成
        if (layers.length !== 4) return false;
        
        // 检查瓶子中的所有层是否为同一颜色
        const firstColor = layers[0];
        for (let i = 1; i < layers.length; i++) {
            if (layers[i] !== firstColor) return false;
        }
    }
    
    return true;
}