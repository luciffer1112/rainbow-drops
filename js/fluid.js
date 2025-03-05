/**
 * 流体物理模拟
 */

class FluidSimulation {
    constructor() {
        this.isPouring = false;
        this.animationInProgress = false;
        this.currentAnimation = null;
        this.lockInteraction = false; // 添加一个全局交互锁
        this.pendingAnimations = []; // 添加一个队列来存储待执行的动画
        // 添加一个全局动画ID计数器，用于标识每个动画
        this.animationIdCounter = 0;
        
        // 添加一个清理函数，确保在页面加载时清理所有可能的残留元素
        this.cleanupAllAnimationElements();
    }
    
    // 在FluidSimulation类中添加安全检查
    cleanupAllAnimationElements() {
        try {
            // 移除所有动画瓶子和水流元素
            document.querySelectorAll('.pouring, .water-stream, .splash, .bubble').forEach(el => {
                if (el && el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            });
            
            // 重置所有瓶子的样式
            document.querySelectorAll('.bottle').forEach(bottle => {
                if (bottle) {
                    bottle.style.visibility = 'visible';
                    bottle.style.opacity = '1';
                    bottle.style.pointerEvents = 'auto';
                    bottle.removeAttribute('data-hidden');
                    bottle.style.transform = 'rotate(0deg)';
                }
            });
            
            // 重置所有状态
            this.isPouring = false;
            this.animationInProgress = false;
            this.currentAnimation = null;
            this.lockInteraction = false;
            this.pendingAnimations = [];
        } catch (error) {
            console.error("清理动画元素时出错:", error);
        }
    }
    
    // 倒水操作
    pourWater(sourceBottle, targetBottle, onComplete) {
        // 如果交互被锁定，将操作加入队列并返回
        if (this.lockInteraction) {
            console.log("交互被锁定，将操作加入队列");
            this.pendingAnimations.push(() => {
                this.pourWater(sourceBottle, targetBottle, onComplete);
            });
            return false;
        }
        
        // 如果已经在倒水，则不执行
        if (this.isPouring) {
            console.log("已经在倒水中，忽略此次操作");
            return false;
        }
        
        // 检查是否可以倒水
        if (!this.canPour(sourceBottle, targetBottle)) {
            return false;
        }
        
        // 锁定交互，防止用户在动画过程中点击
        this.lockInteraction = true;
        this.isPouring = true;
        
        // 获取源瓶子的顶层颜色
        const sourceColor = sourceBottle.layers[sourceBottle.layers.length - 1];
        
        // 计算可以倒多少层（相同颜色的连续层）
        let pourCount = 1;
        for (let i = sourceBottle.layers.length - 2; i >= 0; i--) {
            if (sourceBottle.layers[i] === sourceColor) {
                pourCount++;
            } else {
                break;
            }
        }
        
        // 计算目标瓶子可以接收多少层
        const targetEmptySpace = 4 - targetBottle.layers.length;
        pourCount = Math.min(pourCount, targetEmptySpace);
        
        // 执行倒水动画
        this.animatePour(sourceBottle, targetBottle, sourceColor, pourCount, () => {
            // 动画完成后，更新瓶子数据
            for (let i = 0; i < pourCount; i++) {
                sourceBottle.layers.pop();
                targetBottle.layers.push(sourceColor);
            }
            
            this.isPouring = false;
            this.animationInProgress = false;
            this.currentAnimation = null;
            
            // 解锁交互
            this.lockInteraction = false;
            
            // 检查是否有待执行的动画
            if (this.pendingAnimations.length > 0) {
                // 延迟执行下一个动画，确保DOM有时间更新
                setTimeout(() => {
                    const nextAnimation = this.pendingAnimations.shift();
                    if (nextAnimation) nextAnimation();
                }, 100);
            }
            
            if (onComplete) {
                onComplete();
            }
        });
        
        return true;
    }
    
    // 检查是否可以倒水
    canPour(sourceBottle, targetBottle) {
        // 源瓶子必须有液体
        if (sourceBottle.layers.length === 0) {
            return false;
        }
        
        // 目标瓶子不能已满
        if (targetBottle.layers.length === 4) {
            return false;
        }
        
        // 如果目标瓶子为空，可以倒入
        if (targetBottle.layers.length === 0) {
            return true;
        }
        
        // 目标瓶子的顶层颜色必须与源瓶子的顶层颜色相同
        const sourceColor = sourceBottle.layers[sourceBottle.layers.length - 1];
        const targetColor = targetBottle.layers[targetBottle.layers.length - 1];
        
        return sourceColor === targetColor;
    }
    
    // 倒水动画
    animatePour(sourceBottle, targetBottle, color, count, onComplete) {
        // 如果已经有动画在进行中，取消它
        if (this.animationInProgress) {
            console.log("已有动画正在进行，取消旧动画");
            if (this.currentAnimation && typeof this.currentAnimation.stop === 'function') {
                this.currentAnimation.stop();
            }
        }
        
        this.animationInProgress = true;
        
        // 获取DOM元素
        const sourceElement = document.getElementById(`bottle-${sourceBottle.id}`);
        const targetElement = document.getElementById(`bottle-${targetBottle.id}`);
        
        if (!sourceElement || !targetElement) {
            this.animationInProgress = false;
            this.lockInteraction = false; // 确保解锁交互
            if (onComplete) onComplete();
            return;
        }
        
        // 清除所有可能存在的旧动画元素
        const oldElements = document.querySelectorAll('.pouring, .water-stream');
        oldElements.forEach(el => el.remove());
        
        // 使用多种方式确保原始瓶子隐藏
        sourceElement.style.visibility = 'hidden';
        sourceElement.style.opacity = '0';
        sourceElement.style.pointerEvents = 'none';
        sourceElement.setAttribute('data-hidden', 'true');

        // 创建源瓶子的副本用于动画
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        
        const animationContainer = document.querySelector('.bottles-container');
        const pourElement = document.createElement('div');
        pourElement.className = 'bottle pouring';
        pourElement.id = `pouring-bottle-${Date.now()}`; // 使用时间戳创建唯一ID
        pourElement.style.position = 'absolute';
        pourElement.style.left = `${sourceRect.left - animationContainer.getBoundingClientRect().left}px`;
        pourElement.style.top = `${sourceRect.top - animationContainer.getBoundingClientRect().top}px`;
        pourElement.style.width = `${sourceRect.width}px`;
        pourElement.style.height = `${sourceRect.height}px`;
        pourElement.style.zIndex = '100';
        pourElement.style.transform = 'rotate(0deg)'; // 确保初始旋转为0
        
        // 创建瓶子内部
        const pourInner = document.createElement('div');
        pourInner.className = 'bottle-inner';
        pourElement.appendChild(pourInner);
        
        // 创建瓶颈
        const pourNeck = document.createElement('div');
        pourNeck.className = 'bottle-neck';
        pourElement.appendChild(pourNeck);
        
        // 添加液体层
        for (let i = 0; i < sourceBottle.layers.length; i++) {
            const liquidLayer = document.createElement('div');
            liquidLayer.className = 'liquid-layer';
            liquidLayer.style.backgroundColor = sourceBottle.layers[i];
            liquidLayer.style.height = '25%';
            liquidLayer.style.bottom = `${i * 25}%`;
            pourInner.appendChild(liquidLayer);
        }
        
        animationContainer.appendChild(pourElement);
        
         // 创建水流元素 - 使用纯CSS而不是SVG
         const streamElement = document.createElement('div');
         streamElement.className = 'water-stream';
         streamElement.id = `water-stream-${Date.now()}`;
         streamElement.style.position = 'absolute';
         streamElement.style.opacity = '0';
         streamElement.style.zIndex = '99';
         
         // 创建水流本体 - 使用div而不是SVG
         const waterBody = document.createElement('div');
         waterBody.className = 'water-body';
         waterBody.style.position = 'absolute';
         waterBody.style.backgroundColor = color;
         waterBody.style.width = '15px'; // 水流宽度
         waterBody.style.borderRadius = '8px';
         waterBody.style.transformOrigin = 'top center';
         streamElement.appendChild(waterBody);
         
         // 添加到容器
         animationContainer.appendChild(streamElement);
         
         // 添加水流样式
         if (!document.getElementById('water-stream-style')) {
             const styleElement = document.createElement('style');
             styleElement.id = 'water-stream-style';
             styleElement.textContent = `
                 @keyframes flowAnimation {
                     0% { background-position: 0 0; }
                     100% { background-position: 0 200%; }
                 }
                 
                 .water-body {
                     background: linear-gradient(to bottom, 
                         rgba(255,255,255,0.3) 0%, 
                         rgba(255,255,255,0) 20%, 
                         rgba(255,255,255,0) 80%, 
                         rgba(255,255,255,0.3) 100%);
                     background-size: 100% 50%;
                     animation: flowAnimation 1s linear infinite;
                 }
                 
                 .water-drop {
                     position: absolute;
                     background-color: inherit;
                     border-radius: 50%;
                     transform-origin: center;
                     animation: dropFall var(--drop-duration) ease-in forwards;
                 }
                 
                 @keyframes dropFall {
                     0% { transform: translate(0, 0) scale(1); opacity: 0.9; }
                     100% { transform: translate(var(--drop-x), var(--drop-y)) scale(0.5); opacity: 0; }
                 }
             `;
             document.head.appendChild(styleElement);
         }
         
         // 创建水滴容器
         const dropsContainer = document.createElement('div');
         dropsContainer.className = 'drops-container';
         dropsContainer.style.position = 'absolute';
         dropsContainer.style.width = '100%';
         dropsContainer.style.height = '100%';
         dropsContainer.style.overflow = 'visible';
         streamElement.appendChild(dropsContainer);
        
        animationContainer.appendChild(streamElement);
        
        if (document.getElementById('liquid-animation-style')) {
            document.getElementById('liquid-animation-style').remove();
        }
        
        const styleElement = document.createElement('style');
        styleElement.id = 'liquid-animation-style';
        styleElement.textContent = `
            @keyframes dropFall {
                0% { transform: translate(0, 0) scale(1); opacity: 0.9; }
                100% { transform: translate(var(--drop-x), var(--drop-y)) scale(0.5); opacity: 0; }
            }
            
            @keyframes streamFlow {
                0% { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: 3000; }
            }
            
            .water-drop {
                position: absolute;
                background-color: inherit;
                border-radius: 50%;
                transform-origin: center;
                animation: dropFall var(--drop-duration) ease-in forwards;
            }
            
            .stream-path {
                /* 使用更长的实线和更短的间隙，并添加!important确保样式应用 */
                stroke-dasharray: 2000, 3 !important;
                animation: streamFlow 0.8s linear infinite !important;
            }
        `;
        document.head.appendChild(styleElement);
        
        // 添加水滴效果
        const dropEffect = document.createElement('div');
        dropEffect.className = 'drop-effect';
        dropEffect.style.position = 'absolute';
        dropEffect.style.bottom = '-15px';
        dropEffect.style.left = '0';
        dropEffect.style.width = '100%';
        dropEffect.style.height = '15px';
        dropEffect.style.borderRadius = '0 0 50% 50%';
        dropEffect.style.backgroundColor = color;
        streamElement.appendChild(dropEffect);
        
        animationContainer.appendChild(streamElement);

        // 添加流动动画的CSS
        if (!document.getElementById('flowing-animation-style')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'flowing-animation-style';
            styleElement.textContent = `
                @keyframes flowAnimation {
                    0% { background-position: 0 0; }
                    100% { background-position: 0 200%; }
                }
            `;
            document.head.appendChild(styleElement);
        }

        // 修正目标位置计算方式
        const animContainerRect = animationContainer.getBoundingClientRect();
        const targetX = targetRect.left - animContainerRect.left + (targetRect.width - sourceRect.width) / 2 + sourceRect.width * 2.5;
        const targetY = targetRect.top - animContainerRect.top - sourceRect.height * 0.1;
        
        const startX = parseFloat(pourElement.style.left) || 0;
        const startY = parseFloat(pourElement.style.top) || 0;
        
        // 创建一个更强大的动画控制器
        const animationController = {
            isRunning: true,
            currentStep: 0,
            animationFrameIds: [],
            timeoutIds: [],
            
            addFrameId(id) {
                this.animationFrameIds.push(id);
                return id;
            },
            
            addTimeoutId(id) {
                this.timeoutIds.push(id);
                return id;
            },
            
            stop() {
                this.isRunning = false;
                
                this.animationFrameIds.forEach(id => cancelAnimationFrame(id));
                this.timeoutIds.forEach(id => clearTimeout(id));
                
                if (pourElement.parentNode) pourElement.remove();
                if (streamElement.parentNode) streamElement.remove();
                
                sourceElement.style.visibility = 'visible';
                sourceElement.style.opacity = '1';
                sourceElement.style.pointerEvents = 'auto';
                sourceElement.removeAttribute('data-hidden');
            }
        };
        
        // 保存当前动画引用
        this.currentAnimation = animationController;
        
        // 使用一个简单的状态机来管理动画步骤
        let currentState = 'idle';
        
        // 定义动画步骤
        const moveToTarget = () => {
            if (!animationController.isRunning || currentState !== 'idle') return;
            currentState = 'moving';
            
            const duration = 600;
            const startTime = Date.now();
            
            function moveStep() {
                if (!animationController.isRunning) return;
                
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 2);
                
                pourElement.style.left = `${startX + (targetX - startX) * easeProgress}px`;
                pourElement.style.top = `${startY + (targetY - startY) * easeProgress}px`;
                
                if (progress < 1) {
                    animationController.addFrameId(requestAnimationFrame(moveStep));
                } else {
                    currentState = 'positioned';
                    rotate();
                }
            }
            
            animationController.addFrameId(requestAnimationFrame(moveStep));
        };
        
        const rotate = () => {
            if (!animationController.isRunning || currentState !== 'positioned') return;
            currentState = 'rotating';
            
            const duration = 100;
            const startTime = Date.now();
            pourElement.style.transformOrigin = 'bottom center';
            
            function rotateStep() {
                if (!animationController.isRunning) return;
                
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 2);
                
                const rotation = -45 * easeProgress;
                pourElement.style.transform = `rotate(${rotation}deg)`;
                
                if (progress < 1) {
                    animationController.addFrameId(requestAnimationFrame(rotateStep));
                } else {
                    currentState = 'rotated';
                    showStream();
                }
            }
            
            animationController.addFrameId(requestAnimationFrame(rotateStep));
        };
        
        const showStream = () => {
            if (!animationController.isRunning || currentState !== 'rotated') return;
            currentState = 'streaming';
            
            const pourRect = pourElement.getBoundingClientRect();
            const containerRect = animationContainer.getBoundingClientRect();
            
            // 计算水流起点和终点
            const startX = pourRect.width * 0.8 - pourRect.width * 0.7;
            const startY = pourRect.height * 0.85 + pourRect.height * 0.06;
            
            // 计算目标位置（瓶口）
            const targetX = targetRect.left - pourRect.left + targetRect.width/2;
            const targetY = targetRect.top - pourRect.top;
            
            // 设置水流起始位置
            streamElement.style.left = `${pourRect.left + startX - containerRect.left}px`;
            streamElement.style.top = `${pourRect.top + startY - containerRect.top}px`;
            
            // 计算水流长度和角度
            const dx = targetX - startX;
            const dy = targetY - startY;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);

            // 计算目标瓶子的空余空间高度
            const targetEmptySpace = 4 - targetBottle.layers.length;
            const emptySpaceHeight = targetEmptySpace * 25; // 每层高度为25%
            const targetBottleHeight = targetRect.height;
            const additionalLength = (emptySpaceHeight / 100) * targetBottleHeight;
            
            // 设置水流长度和角度
            const waterBody = streamElement.querySelector('.water-body');
            waterBody.style.height = `${length + additionalLength*0.95 + 25}px`; // 设置水流长度 = 距离 + 目标瓶空余空间高度
            waterBody.style.width = '10px'; // 设置水流宽度
            const fixedAngle = 2;
            waterBody.style.transform = `rotate(${fixedAngle}deg)`; // 设置固定角度
            waterBody.style.backgroundColor = color;

            // 高级水流效果 - 使用多层渐变和动画
            waterBody.style.background = `
                linear-gradient(to right, rgba(255,255,255,0.05), rgba(255,255,255,0.2) 30%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.2) 70%, rgba(255,255,255,0.05)),
                linear-gradient(to bottom, ${color}AA, ${color}EE 20%, ${color} 40%, ${color} 60%, ${color}EE 80%, ${color}AA)
            `;
            waterBody.style.backgroundSize = '20px 100%, 100% 40px';
            waterBody.style.animation = 'flowAnimation 0.8s linear infinite';
            waterBody.style.borderRadius = '8px';
            waterBody.style.boxShadow = `0 0 6px ${color}99, inset 0 0 3px rgba(255,255,255,0.3)`;
            
            // 添加水流变细效果 - 使用更自然的喇叭形状
            waterBody.style.clipPath = `polygon(
                45% 0%,    // 顶部最细，左侧点
                55% 0%,    // 顶部最细，右侧点
                60% 10%,   // 轻微扩张
                65% 20%,   // 继续扩张
                70% 35%,   // 中部扩张
                75% 50%,   // 中下部扩张
                80% 65%,   // 下部扩张
                85% 80%,   // 接近底部快速扩张
                92% 100%,  // 底部最粗，右侧点
                8% 100%,   // 底部最粗，左侧点
                15% 80%,   // 接近底部快速扩张
                20% 65%,   // 下部扩张
                25% 50%,   // 中下部扩张
                30% 35%,   // 中部扩张
                35% 20%,   // 继续扩张
                40% 10%    // 轻微扩张
            )`;
            
            // 添加波动效果
            if (!document.getElementById('water-flow-animation')) {
                const styleElement = document.createElement('style');
                styleElement.id = 'water-flow-animation';
                styleElement.textContent = `
                    @keyframes flowAnimation {
                        0% { background-position: 0 0; }
                        100% { background-position: 0 200%; }
                    }
                    
                    @keyframes waterWave {
                        0% { clip-path: polygon(
                            45% 0%, 55% 0%, 60% 10%, 65% 20%, 70% 35%, 75% 50%, 80% 65%, 85% 80%, 92% 100%, 8% 100%, 15% 80%, 20% 65%, 25% 50%, 30% 35%, 35% 20%, 40% 10%
                        ); }
                        50% { clip-path: polygon(
                            46% 0%, 54% 0%, 59% 10%, 64% 20%, 69% 35%, 74% 50%, 79% 65%, 84% 80%, 90% 100%, 10% 100%, 16% 80%, 21% 65%, 26% 50%, 31% 35%, 36% 20%, 41% 10%
                        ); }
                        100% { clip-path: polygon(
                            45% 0%, 55% 0%, 60% 10%, 65% 20%, 70% 35%, 75% 50%, 80% 65%, 85% 80%, 92% 100%, 8% 100%, 15% 80%, 20% 65%, 25% 50%, 30% 35%, 35% 20%, 40% 10%
                        ); }
                    }
                `;
                document.head.appendChild(styleElement);
            }
            
            // 添加波动动画
            waterBody.style.animation = 'flowAnimation 0.8s linear infinite, waterWave 2s ease-in-out infinite';
            
            // 创建水滴效果函数
            const createDrops = () => {
                if (!animationController.isRunning || currentState !== 'streaming' && currentState !== 'pouring') return;
                
                // 创建多个水滴，形成更自然的水流效果
                const dropCount = 2 + Math.floor(Math.random() * 3); // 随机创建2-4个水滴，增加数量
                
                for (let i = 0; i < dropCount; i++) {
                    const drop = document.createElement('div');
                    drop.className = 'water-drop';
                    drop.style.backgroundColor = color;
                    
                    // 增大水滴尺寸，使其更明显
                    const size = 5 + Math.random() * 8;
                    drop.style.width = `${size}px`;
                    drop.style.height = `${size}px`;
                    
                    // 修正：计算水柱末端的准确位置
                    // 获取水柱的实际高度
                    const waterBodyHeight = parseFloat(waterBody.style.height);
                    // 水滴应该在水柱末端生成，即水柱的底部
                    // 随机位置，集中在水流末端
                    const posOffset = Math.random() * 14 - 7; // 增加水平分散范围
                    drop.style.left = `${posOffset}px`;
                    // 修正：使用水柱的实际高度来定位水滴，确保它们在末端
                    drop.style.top = `${waterBodyHeight - 20 - Math.random() * 10}px`;
                    
                    // 增强水滴内部光泽
                    drop.style.background = `radial-gradient(circle at 30% 30%, 
                        rgba(255,255,255,0.6) 0%, 
                        rgba(255,255,255,0.3) 30%,
                        ${color} 70%)`;
                    drop.style.boxShadow = `0 0 3px ${color}, 0 0 5px rgba(255,255,255,0.3)`;
                    
                    // 计算水滴落点的随机偏移和物理特性 - 增加飞溅范围
                    const dropX = 25 * (Math.random() - 0.5); // 增加水平飞溅范围
                    const dropY = 25 + Math.random() * 35;    // 增加垂直飞溅范围
                    const dropSpeed = 0.5 + Math.random() * 0.7; // 稍微增加速度
                    
                    drop.style.setProperty('--drop-x', `${dropX}px`);
                    drop.style.setProperty('--drop-y', `${dropY}px`);
                    drop.style.setProperty('--drop-duration', `${dropSpeed}s`);
                    drop.style.setProperty('--drop-delay', `${i * 0.05}s`); // 错开水滴出现时间
                    
                    waterBody.appendChild(drop);
                    
                    // 水滴动画结束后创建飞溅效果
                    setTimeout(() => {
                        if (drop.parentNode) {
                            // 创建飞溅效果
                            createSplashEffect(drop, dropX, dropY, color);
                            drop.remove();
                        }
                    }, dropSpeed * 1000);
                }
                
                // 继续创建水滴，减少间隔使效果更密集
                if (animationController.isRunning && (currentState === 'streaming' || currentState === 'pouring')) {
                    animationController.addTimeoutId(setTimeout(createDrops, 40 + Math.random() * 80));
                }
            };
            
            // 创建水滴飞溅效果
            const createSplashEffect = (drop, dropX, dropY, color) => {
                // 获取水滴当前位置
                const rect = drop.getBoundingClientRect();
                const containerRect = animationContainer.getBoundingClientRect();
                
                // 创建飞溅容器
                const splash = document.createElement('div');
                splash.className = 'water-splash';
                splash.style.position = 'absolute';
                splash.style.left = `${rect.left - containerRect.left + parseFloat(dropX)}px`;
                splash.style.top = `${rect.top - containerRect.top + parseFloat(dropY)}px`;
                splash.style.width = '0';
                splash.style.height = '0';
                splash.style.zIndex = '102';
                animationContainer.appendChild(splash);
                
                // 创建多个飞溅粒子
                const particleCount = 4 + Math.floor(Math.random() * 4);
                for (let i = 0; i < particleCount; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'splash-particle';
                    
                    // 随机大小
                    const size = 2 + Math.random() * 4;
                    particle.style.width = `${size}px`;
                    particle.style.height = `${size}px`;
                    particle.style.borderRadius = '50%';
                    
                    // 设置颜色和光泽
                    particle.style.background = `radial-gradient(circle at 30% 30%, 
                        rgba(255,255,255,0.8) 0%, 
                        ${color} 70%)`;
                    particle.style.boxShadow = `0 0 2px ${color}`;
                    
                    // 设置初始位置
                    particle.style.position = 'absolute';
                    particle.style.left = '0px';
                    particle.style.top = '0px';
                    
                    // 计算随机飞溅方向和距离
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 5 + Math.random() * 15;
                    const splashX = Math.cos(angle) * distance;
                    const splashY = Math.sin(angle) * distance - (Math.random() * 5); // 向上偏移
                    
                    particle.style.setProperty('--splash-x', `${splashX}px`);
                    particle.style.setProperty('--splash-y', `${splashY}px`);
                    particle.style.setProperty('--splash-duration', `${0.3 + Math.random() * 0.3}s`);
                    
                    // 添加到飞溅容器
                    splash.appendChild(particle);
                }
                
                // 添加飞溅动画样式
                if (!document.getElementById('splash-animation')) {
                    const styleElement = document.createElement('style');
                    styleElement.id = 'splash-animation';
                    styleElement.textContent = `
                        .splash-particle {
                            opacity: 0.9;
                            animation: splashParticle var(--splash-duration) ease-out forwards;
                        }
                        
                        @keyframes splashParticle {
                            0% { 
                                transform: translate(0, 0) scale(1); 
                                opacity: 0.9; 
                            }
                            20% { 
                                transform: translate(calc(var(--splash-x) * 0.3), calc(var(--splash-y) * 0.3)) scale(1.2); 
                                opacity: 1; 
                            }
                            100% { 
                                transform: translate(var(--splash-x), var(--splash-y)) scale(0.5); 
                                opacity: 0; 
                            }
                        }
                    `;
                    document.head.appendChild(styleElement);
                }
                
                // 动画结束后移除飞溅效果
                setTimeout(() => {
                    if (splash.parentNode) splash.remove();
                }, 600);
            };
            
            // 添加增强的水滴动画样式
            if (!document.getElementById('enhanced-water-effects')) {
                const styleElement = document.createElement('style');
                styleElement.id = 'enhanced-water-effects';
                styleElement.textContent = `
                    .water-drop {
                        position: absolute;
                        border-radius: 50%;
                        transform-origin: center;
                        opacity: 0.9;
                        animation: dropFall var(--drop-duration) ease-in var(--drop-delay) forwards;
                        z-index: 101;
                    }
                    
                    @keyframes dropFall {
                        0% { 
                            transform: translate(0, 0) scale(1); 
                            opacity: 0.9; 
                        }
                        20% { 
                            transform: translate(calc(var(--drop-x) * 0.3), calc(var(--drop-y) * 0.1)) scale(1.1); 
                            opacity: 0.95; 
                        }
                        100% { 
                            transform: translate(var(--drop-x), var(--drop-y)) scale(0.8); 
                            opacity: 0.9; 
                        }
                    }
                `;
                document.head.appendChild(styleElement);
            }
            
            // 淡入水流
            const duration = 200;
            const startTime = Date.now();
            
            function fadeInStep() {
                if (!animationController.isRunning) return;
                
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                streamElement.style.opacity = progress;
                
                if (progress < 1) {
                    animationController.addFrameId(requestAnimationFrame(fadeInStep));
                } else {
                    currentState = 'pouring';
                    // 开始创建水滴效果
                    createDrops();
                    pour();
                }
            }
            
            animationController.addFrameId(requestAnimationFrame(fadeInStep));
        };
        
        const pour = () => {
            if (!animationController.isRunning || currentState !== 'pouring') return;
            
            // 创建目标瓶子中的液体上升效果
            const targetInner = targetElement.querySelector('.bottle-inner');
            const fillLayer = document.createElement('div');
            fillLayer.className = 'filling-layer';
            fillLayer.style.position = 'absolute';
            fillLayer.style.bottom = `${targetBottle.layers.length * 25}%`;
            fillLayer.style.left = '0';
            fillLayer.style.width = '100%';
            fillLayer.style.height = '0%';
            fillLayer.style.backgroundColor = color;
            fillLayer.style.transition = 'height 0.5s ease-out';
            targetInner.appendChild(fillLayer);

            // 添加液体波纹效果
            fillLayer.style.overflow = 'hidden';
            
            // 创建波纹容器
            const waveContainer = document.createElement('div');
            waveContainer.className = 'wave-container';
            waveContainer.style.position = 'absolute';
            waveContainer.style.left = '0';
            waveContainer.style.top = '0';
            waveContainer.style.width = '100%';
            waveContainer.style.height = '20%'; // 波纹高度
            waveContainer.style.zIndex = '2';
            fillLayer.appendChild(waveContainer);
            
            // 创建波纹元素
            for (let i = 0; i < 2; i++) {
                const wave = document.createElement('div');
                wave.className = 'liquid-wave';
                wave.style.position = 'absolute';
                wave.style.top = '0';
                wave.style.left = '0';
                wave.style.width = '200%';
                wave.style.height = '100%';
                wave.style.opacity = i === 0 ? '0.7' : '0.5';
                wave.style.background = `linear-gradient(to bottom, 
                    rgba(255,255,255,0.3) 0%, 
                    rgba(255,255,255,0.1) 50%, 
                    transparent 100%)`;
                wave.style.borderRadius = '40% 60% 70% 40% / 40% 50% 30% 50%';
                wave.style.animation = `waveAnimation${i+1} ${3 + i}s linear infinite`;
                wave.style.transformOrigin = 'center top';
                waveContainer.appendChild(wave);
            }
            
            // 添加波纹动画样式
            if (!document.getElementById('liquid-wave-animation')) {
                const styleElement = document.createElement('style');
                styleElement.id = 'liquid-wave-animation';
                styleElement.textContent = `
                    @keyframes waveAnimation1 {
                        0% { transform: translateX(0) rotate(0); }
                        50% { transform: translateX(-25%) rotate(2deg); }
                        100% { transform: translateX(-50%) rotate(0); }
                    }
                    
                    @keyframes waveAnimation2 {
                        0% { transform: translateX(-50%) rotate(1deg); }
                        50% { transform: translateX(-25%) rotate(-1deg); }
                        100% { transform: translateX(0) rotate(1deg); }
                    }
                    
                    @keyframes liquidRipple {
                        0% { transform: scale(0); opacity: 0.7; }
                        100% { transform: scale(2); opacity: 0; }
                    }
                `;
                document.head.appendChild(styleElement);
            }
            
            targetInner.appendChild(fillLayer);            
            
            // 根据倒入的液体量计算高度
            const heightPerLayer = 25; // 每层高度为25%
            const totalHeight = heightPerLayer * count; // 总高度根据倒入的层数计算
            
            // 获取源瓶中需要减少的液体层
            const pourInner = pourElement.querySelector('.bottle-inner');
            const sourceLayers = pourInner.querySelectorAll('.liquid-layer');
            const layersToAnimate = [];
            
            // 创建一个覆盖所有要消失的层的元素
            const emptyingLayer = document.createElement('div');
            emptyingLayer.className = 'emptying-layer';
            emptyingLayer.style.position = 'absolute';
            emptyingLayer.style.left = '0';
            emptyingLayer.style.width = '100%';
            emptyingLayer.style.backgroundColor = color;
            emptyingLayer.style.transition = 'height 0.5s ease-out, bottom 0.5s ease-out';
            
            // 计算初始高度和位置
            const totalLayerHeight = Math.min(count, sourceLayers.length) * 25; // 总高度百分比
            const bottomPosition = (sourceLayers.length - Math.min(count, sourceLayers.length)) * 25; // 底部位置百分比
            
            emptyingLayer.style.height = `${totalLayerHeight}%`;
            emptyingLayer.style.bottom = `${bottomPosition}%`;
            
            // 添加到瓶子内部
            pourInner.appendChild(emptyingLayer);
            
            // 隐藏原始层，避免重叠
            for (let i = sourceLayers.length - 1; i >= Math.max(0, sourceLayers.length - count); i--) {
                sourceLayers[i].style.opacity = '0';
            }
            
            // 延迟一帧后开始填充动画
            requestAnimationFrame(() => {
                // 目标瓶水位上升
                fillLayer.style.height = `${totalHeight}%`;
                
                // 开始动画 - 高度逐渐减少到0
                emptyingLayer.style.height = '0%';
                // 保持底部位置不变，这样就会从上到下消失
                // 添加液体落入涟漪效果
                const createRipple = () => {
                    if (!animationController.isRunning || currentState !== 'pouring') return;
                    
                    const ripple = document.createElement('div');
                    ripple.className = 'liquid-ripple';
                    ripple.style.position = 'absolute';
                    ripple.style.width = '20px';
                    ripple.style.height = '20px';
                    ripple.style.borderRadius = '50%';
                    ripple.style.backgroundColor = 'rgba(255,255,255,0.3)';
                    ripple.style.top = '10%';
                    ripple.style.left = `${30 + Math.random() * 40}%`;
                    ripple.style.transform = 'scale(0)';
                    ripple.style.animation = 'liquidRipple 0.6s ease-out forwards';
                    
                    waveContainer.appendChild(ripple);
                    
                    // 涟漪动画结束后移除
                    setTimeout(() => {
                        if (ripple.parentNode) ripple.remove();
                    }, 600);
                    
                    // 继续创建涟漪
                    if (animationController.isRunning && currentState === 'pouring') {
                        animationController.addTimeoutId(setTimeout(createRipple, 100 + Math.random() * 200));
                    }
                };
                
                // 开始创建涟漪
                createRipple();
            });
            
            // 添加气泡效果
            const addBubbles = () => {
                if (!animationController.isRunning || currentState !== 'pouring') return;
                
                const bubble = document.createElement('div');
                bubble.className = 'bubble';
                bubble.style.position = 'absolute';
                bubble.style.width = `${2 + Math.random() * 4}px`;
                bubble.style.height = bubble.style.width;
                bubble.style.borderRadius = '50%';
                bubble.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
                bubble.style.bottom = '0';
                bubble.style.left = `${10 + Math.random() * 80}%`;
                bubble.style.animation = `bubbleRise ${0.5 + Math.random() * 1}s ease-out forwards`;
                
                fillLayer.appendChild(bubble);
                
                // 气泡上升后移除
                setTimeout(() => {
                    if (bubble.parentNode) bubble.remove();
                }, 1500);
                
                // 继续添加气泡
                if (animationController.isRunning && currentState === 'pouring') {
                    animationController.addTimeoutId(setTimeout(addBubbles, 200 + Math.random() * 300));
                }
            };
            
            // 开始添加气泡
            addBubbles();
            
            // 倒水完成后
            animationController.addTimeoutId(setTimeout(() => {
                currentState = 'poured';
                hideStream();
                
                // 不立即移除填充层，而是在动画完全结束后再移除
                // 这样可以避免闪烁问题
            }, 20 * count));
        };
        
        const hideStream = () => {
            if (!animationController.isRunning || currentState !== 'poured') return;
            currentState = 'hiding';
            
            const duration = 200;
            const startTime = Date.now();
            
            function fadeOutStep() {
                if (!animationController.isRunning) return;
                
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                streamElement.style.opacity = 1 - progress;
                
                if (progress < 1) {
                    animationController.addFrameId(requestAnimationFrame(fadeOutStep));
                } else {
                    currentState = 'hidden';
                    rotateBack();
                }
            }
            
            animationController.addFrameId(requestAnimationFrame(fadeOutStep));
        };
        
        const rotateBack = () => {
            if (!animationController.isRunning || currentState !== 'hidden') return;
            currentState = 'rotating-back';
            
            const duration = 500;
            const startTime = Date.now();
            
            function rotateBackStep() {
                if (!animationController.isRunning) return;
                
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 2);
                
                const rotation = -45 * (1 - easeProgress);
                pourElement.style.transform = `rotate(${rotation}deg)`;
                
                if (progress < 1) {
                    animationController.addFrameId(requestAnimationFrame(rotateBackStep));
                } else {
                    currentState = 'straight';
                    moveBack();
                }
            }
            
            animationController.addFrameId(requestAnimationFrame(rotateBackStep));
        };
        
        const moveBack = () => {
            if (!animationController.isRunning || currentState !== 'straight') return;
            currentState = 'moving-back';
            
            const duration = 600;
            const startTime = Date.now();
            const currentLeft = parseFloat(pourElement.style.left);
            const currentTop = parseFloat(pourElement.style.top);
            
            function moveBackStep() {
                if (!animationController.isRunning) return;
                
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 2);
                
                pourElement.style.left = `${currentLeft + (startX - currentLeft) * easeProgress}px`;
                pourElement.style.top = `${currentTop + (startY - currentTop) * easeProgress}px`;
                
                if (progress < 1) {
                    animationController.addFrameId(requestAnimationFrame(moveBackStep));
                } else {
                    currentState = 'finished';
                    finish();
                }
            }
            
            animationController.addFrameId(requestAnimationFrame(moveBackStep));
        };
        
        const finish = () => {
            if (!animationController.isRunning || currentState !== 'finished') return;
            
            // 移除动画元素
            pourElement.remove();
            streamElement.remove();
            
            // 移除所有填充层
            const fillLayers = targetElement.querySelectorAll('.filling-layer');
            fillLayers.forEach(layer => {
                if (layer.parentNode) layer.remove();
            });
            
            // 恢复原始源瓶子显示
            sourceElement.style.visibility = 'visible';
            sourceElement.style.opacity = '1';
            sourceElement.style.pointerEvents = 'auto';
            sourceElement.removeAttribute('data-hidden');
            
            // 创建水花效果
            this.createSplash(targetElement, targetRect.width / 2, 0);
            
            // 创建气泡效果
            this.createBubbles(targetElement.querySelector('.bottle-inner'), 5);
            
            // 振动设备
            this.vibrateDevice(50);
            
            if (onComplete) onComplete();
        };
        
        // 开始动画序列
        moveToTarget();
        
        // 返回动画控制器，以便外部可以停止动画
        return animationController;
    }
    
    // 创建水花效果
    createSplash(element, x, y) {
        const splash = document.createElement('div');
        splash.className = 'splash';
        splash.style.position = 'absolute';
        splash.style.left = `${x - 15}px`;
        splash.style.top = `${y - 5}px`;
        splash.style.width = '30px';
        splash.style.height = '30px';
        splash.style.zIndex = '50';
        
        element.appendChild(splash);
        
        // 创建水花粒子
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'splash-particle';
            const angle = (i / 8) * Math.PI * 2;
            const distance = 5 + Math.random() * 10;
            
            particle.style.position = 'absolute';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.borderRadius = '50%';
            particle.style.backgroundColor = '#88ccff';
            particle.style.left = '13px';
            particle.style.top = '13px';
            particle.style.opacity = '0.8';
            
            splash.appendChild(particle);
            
            // 粒子动画
            const duration = 0.5 + Math.random() * 0.3;
            const startTime = Date.now();
            
            function animateParticle() {
                const elapsed = (Date.now() - startTime) / 1000; // 转换为秒
                const progress = Math.min(elapsed / duration, 1);
                
                const x = Math.cos(angle) * distance * progress;
                const y = Math.sin(angle) * distance * progress - 10 * progress;
                const opacity = 0.8 * (1 - progress);
                
                particle.style.transform = `translate(${x}px, ${y}px)`;
                particle.style.opacity = opacity;
                
                if (progress < 1) {
                    requestAnimationFrame(animateParticle);
                } else if (i === 7) {
                    // 最后一个粒子完成后移除整个水花
                    setTimeout(() => {
                        if (splash.parentNode) {
                            splash.remove();
                        }
                    }, 100);
                }
            }
            
            requestAnimationFrame(animateParticle);
        }
    }
    
    // 创建气泡效果
    createBubbles(container, count) {
        if (!container) return;
        
        for (let i = 0; i < count; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            
            const size = 3 + Math.random() * 5;
            const startX = Math.random() * 80;
            const startDelay = Math.random() * 0.5;
            
            bubble.style.position = 'absolute';
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.borderRadius = '50%';
            bubble.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
            bubble.style.left = `${startX}%`;
            bubble.style.bottom = '0';
            bubble.style.opacity = '0';
            
            container.appendChild(bubble);
            
            // 气泡上升动画
            const duration = 1 + Math.random() * 1;
            const startTime = Date.now();
            
            function animateBubble() {
                const elapsed = (Date.now() - startTime) / 1000; // 转换为秒
                const progress = Math.min(elapsed / duration, 1);
                
                const bottom = 100 * progress;
                const opacity = progress < 0.2 ? progress * 4 : 0.8 * (1 - (progress - 0.2) / 0.8);
                
                bubble.style.bottom = `${bottom}%`;
                bubble.style.opacity = opacity;
                
                if (progress < 1) {
                    requestAnimationFrame(animateBubble);
                } else {
                    if (bubble.parentNode) {
                        bubble.remove();
                    }
                }
            }
            
            setTimeout(() => {
                requestAnimationFrame(animateBubble);
            }, startDelay * 1000);
        }
    }
    
    // 振动设备（如果支持）
    vibrateDevice(duration) {
        if (navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }
}