/**
 * 游戏主类
 */
class Game {
    constructor() {
        this.bottles = [];
        this.selectedBottle = null;
        this.moves = 0;
        this.gameOver = false;
        this.fluidSimulation = new FluidSimulation();
        
        // 初始化游戏
        this.init();
    }
    
    // 初始化游戏
    init() {
        this.createBottles();
        this.renderBottles();
        this.initBottleEvents();
        this.updateMoves();
    }
    
    // 创建瓶子
    createBottles() {
        // 游戏逻辑代码...
    }
    
    // 渲染瓶子
    renderBottles() {
        // 渲染代码...
    }
    
    // 初始化瓶子点击事件
    initBottleEvents() {
        // 清除可能存在的旧事件监听器
        const bottles = document.querySelectorAll('.bottle');
        bottles.forEach(bottle => {
            const newBottle = bottle.cloneNode(true);
            bottle.parentNode.replaceChild(newBottle, bottle);
        });
        
        // 添加新的事件监听器
        document.querySelectorAll('.bottle').forEach(bottle => {
            bottle.addEventListener('click', this.handleBottleClick.bind(this));
        });
    }
    
    // 处理瓶子点击
    handleBottleClick(event) {
        // 如果游戏已经结束或者动画正在进行中，不处理点击
        if (this.gameOver || (this.fluidSimulation && this.fluidSimulation.lockInteraction)) {
            return;
        }
        
        const bottleElement = event.currentTarget;
        const bottleId = parseInt(bottleElement.dataset.id);
        
        // 防止快速连续点击
        if (bottleElement.dataset.processing === 'true') {
            return;
        }
        
        bottleElement.dataset.processing = 'true';
        
        // 延迟一小段时间后重置处理状态
        setTimeout(() => {
            bottleElement.dataset.processing = 'false';
        }, 100);
        
        // 如果没有选中瓶子，则选中当前瓶子
        if (this.selectedBottle === null) {
            // 只有非空瓶子才能被选中
            if (this.bottles[bottleId].layers.length > 0) {
                this.selectedBottle = bottleId;
                bottleElement.classList.add('selected');
            }
        } else {
            // 如果点击的是已选中的瓶子，取消选中
            if (this.selectedBottle === bottleId) {
                bottleElement.classList.remove('selected');
                this.selectedBottle = null;
            } else {
                // 尝试倒水
                const sourceBottle = this.bottles[this.selectedBottle];
                const targetBottle = this.bottles[bottleId];
                
                // 取消选中状态
                document.querySelector(`.bottle[data-id="${this.selectedBottle}"]`).classList.remove('selected');
                this.selectedBottle = null;
                
                // 尝试倒水
                const success = this.fluidSimulation.pourWater(sourceBottle, targetBottle, () => {
                    // 倒水完成后检查游戏是否结束
                    this.checkGameOver();
                    this.updateBottles();
                    
                    // 确保所有瓶子都可以点击
                    document.querySelectorAll('.bottle').forEach(b => {
                        b.style.pointerEvents = 'auto';
                    });
                });
                
                if (success) {
                    // 播放倒水音效
                    this.playSound('pour');
                    
                    // 更新移动次数
                    this.moves++;
                    this.updateMoves();
                } else {
                    // 播放错误音效
                    this.playSound('error');
                }
            }
        }
    }
    
    // 更新瓶子显示
    updateBottles() {
        for (let i = 0; i < this.bottles.length; i++) {
            const bottle = this.bottles[i];
            const bottleElement = document.getElementById(`bottle-${i}`);
            
            if (!bottleElement) continue;
            
            // 清除旧的液体层
            const bottleInner = bottleElement.querySelector('.bottle-inner');
            while (bottleInner.firstChild) {
                bottleInner.removeChild(bottleInner.firstChild);
            }
            
            // 添加新的液体层
            for (let j = 0; j < bottle.layers.length; j++) {
                const liquidLayer = document.createElement('div');
                liquidLayer.className = 'liquid-layer';
                liquidLayer.style.backgroundColor = bottle.layers[j];
                liquidLayer.style.height = '25%';
                liquidLayer.style.bottom = `${j * 25}%`;
                bottleInner.appendChild(liquidLayer);
            }
            
            // 确保瓶子可见且可交互
            bottleElement.style.visibility = 'visible';
            bottleElement.style.opacity = '1';
            bottleElement.style.pointerEvents = 'auto';
            bottleElement.removeAttribute('data-hidden');
            bottleElement.style.transform = 'rotate(0deg)'; // 确保瓶子没有旋转
        }
        
        // 清除所有可能存在的动画元素
        document.querySelectorAll('.pouring, .water-stream').forEach(el => {
            if (el.parentNode) el.remove();
        });
    }
    
    // 检查游戏是否结束
    checkGameOver() {
        // 游戏结束逻辑...
    }
    
    // 更新移动次数显示
    updateMoves() {
        // 更新UI...
    }
    
    // 播放音效
    playSound(type) {
        // 音效播放逻辑...
    }
}

// 修改游戏初始化代码，确保DOM已完全加载
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM已加载完成，初始化游戏...");
    try {
        window.game = new Game();
        console.log("游戏初始化成功");
    } catch (error) {
        console.error("游戏初始化失败:", error);
    }
});