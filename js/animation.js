/**
 * 动画控制
 */

// 更新瓶子视图
function updateBottleView(bottleElement, bottleData) {
    // 清除现有的液体层
    const bottleInner = bottleElement.querySelector('.bottle-inner');
    const liquidLayers = bottleInner.querySelectorAll('.liquid-layer');
    liquidLayers.forEach(layer => layer.remove());
    
    // 添加新的液体层
    bottleData.layers.forEach((color, index) => {
        const liquidLayer = document.createElement('div');
        liquidLayer.className = 'liquid-layer';
        liquidLayer.style.backgroundColor = color;
        liquidLayer.style.height = '25%';
        liquidLayer.style.bottom = `${index * 25}%`;
        bottleInner.appendChild(liquidLayer);
    });
}

// 创建瓶子元素
function createBottleElement(bottleData) {
    const bottleElement = document.createElement('div');
    bottleElement.className = 'bottle';
    bottleElement.id = `bottle-${bottleData.id}`;
    
    const bottleInner = document.createElement('div');
    bottleInner.className = 'bottle-inner';
    bottleElement.appendChild(bottleInner);
    
    const bottleNeck = document.createElement('div');
    bottleNeck.className = 'bottle-neck';
    bottleElement.appendChild(bottleNeck);
    
    // 添加液体层
    bottleData.layers.forEach((color, index) => {
        const liquidLayer = document.createElement('div');
        liquidLayer.className = 'liquid-layer';
        liquidLayer.style.backgroundColor = color;
        liquidLayer.style.height = '25%';
        liquidLayer.style.bottom = `${index * 25}%`;
        bottleInner.appendChild(liquidLayer);
    });
    
    return bottleElement;
}

// 显示关卡完成动画
function showLevelCompleteAnimation(onComplete) {
    // 创建烟花效果
    const bottlesContainer = document.querySelector('.bottles-container');
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const x = Math.random() * bottlesContainer.offsetWidth;
            const y = Math.random() * bottlesContainer.offsetHeight;
            createFirework(bottlesContainer, x, y);
        }, i * 100);
    }
    
    // 显示星星评价
    setTimeout(() => {
        showScreen('victory-screen');
        if (onComplete) onComplete();
    }, 2000);
}

// 创建烟花效果
function createFirework(container, x, y) {
    const colors = [
        '#e76f51', '#f4a261', '#e9c46a', '#2a9d8f', 
        '#264653', '#6a4c93', '#ff758f', '#4ecdc4'
    ];
    
    const firework = document.createElement('div');
    firework.className = 'firework';
    firework.style.position = 'absolute';
    firework.style.left = `${x}px`;
    firework.style.top = `${y}px`;
    firework.style.zIndex = '200';
    container.appendChild(firework);
    
    // 创建粒子
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.position = 'absolute';
        particle.style.width = '6px';
        particle.style.height = '6px';
        particle.style.borderRadius = '50%';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        const distance = 20 + Math.random() * 50;
        
        gsap.to(particle, {
            duration: 0.8 + Math.random() * 0.6,
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            opacity: 0,
            scale: 0.1,
            ease: 'power2.out',
            onComplete: () => particle.remove()
        });
        
        firework.appendChild(particle);
    }
    
    // 自动移除烟花元素
    setTimeout(() => {
        firework.remove();
    }, 1500);
}

// 显示关卡介绍动画
function showLevelIntro(levelNumber) {
    const introElement = document.createElement('div');
    introElement.className = 'level-intro';
    introElement.style.position = 'absolute';
    introElement.style.top = '50%';
    introElement.style.left = '50%';
    introElement.style.transform = 'translate(-50%, -50%)';
    introElement.style.fontSize = '3rem';
    introElement.style.color = '#4ecdc4';
    introElement.style.textShadow = '0 2px 10px rgba(78, 205, 196, 0.5)';
    introElement.style.zIndex = '300';
    introElement.style.opacity = '0';
    introElement.textContent = `关卡 ${levelNumber}`;
    
    document.querySelector('.game-container').appendChild(introElement);
    
    gsap.to(introElement, {
        duration: 0.5,
        opacity: 1,
        scale: 1.2,
        ease: 'power2.out',
        onComplete: () => {
            gsap.to(introElement, {
                duration: 0.5,
                opacity: 0,
                scale: 0.8,
                delay: 1,
                ease: 'power2.in',
                onComplete: () => introElement.remove()
            });
        }
    });
}