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
        
        // 创建水流元素
        const streamElement = document.createElement('div');
        streamElement.className = 'water-stream';
        streamElement.id = `water-stream-${Date.now()}`; // 使用时间戳创建唯一ID
        streamElement.style.position = 'absolute';
        streamElement.style.width = '10px';
        streamElement.style.backgroundColor = color;
        streamElement.style.opacity = '0';
        streamElement.style.zIndex = '99';
        animationContainer.appendChild(streamElement);

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
            
            const duration = 500;
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
            streamElement.style.left = `${pourRect.left + pourRect.width / 2 - 5 - animationContainer.getBoundingClientRect().left}px`;
            streamElement.style.top = `${pourRect.top + pourRect.height / 2 - animationContainer.getBoundingClientRect().top}px`;
            streamElement.style.height = `${targetRect.top - pourRect.top - pourRect.height / 2 + 10}px`;
            streamElement.style.transformOrigin = 'top center';
            streamElement.style.transform = 'rotate(45deg)';
            
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
                    pour();
                }
            }
            
            animationController.addFrameId(requestAnimationFrame(fadeInStep));
        };
        
        const pour = () => {
            if (!animationController.isRunning || currentState !== 'pouring') return;
            
            animationController.addTimeoutId(setTimeout(() => {
                currentState = 'poured';
                hideStream();
            }, 100 * count));
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