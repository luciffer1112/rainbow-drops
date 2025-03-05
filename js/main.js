/**
 * 游戏主逻辑
 */

// 游戏状态
// 检查全局作用域中是否已存在gameState
if (typeof window.gameState === 'undefined') {
    window.gameState = {
        currentLevel: 1,
        bottles: [],
        selectedBottle: null,
        moveHistory: [],
        isGameActive: false,
        soundManager: null,
        fluidSimulation: null
    };
}

// 初始化游戏
function initGame() {
    try {
        console.log("开始初始化游戏...");
        
        // 初始化音效管理器
        gameState.soundManager = new SoundManager();
        console.log("音效管理器初始化完成");
        
        // 初始化流体模拟
        gameState.fluidSimulation = new FluidSimulation();
        console.log("流体模拟初始化完成");
        
        // 加载游戏进度
        const progress = loadGameProgress();
        gameState.currentLevel = progress.currentLevel;
        console.log("游戏进度加载完成，当前关卡:", gameState.currentLevel);
        
        // 设置事件监听器
        setupEventListeners();
        console.log("事件监听器设置完成");
        
        // 显示开始界面
        showScreen('start-screen');
        console.log("显示开始界面");
        
        // 初始化设置界面
        initSettingsScreen();
        console.log("设置界面初始化完成");
        
        // 延迟播放背景音乐，确保音频已加载
        setTimeout(() => {
            try {
                gameState.soundManager.playMusic();
                console.log("背景音乐开始播放");
            } catch (e) {
                console.error("播放背景音乐失败:", e);
            }
        }, 1000);
        
        console.log("游戏初始化完成");
    } catch (error) {
        console.error("游戏初始化失败:", error);
    }
}
// 设置事件监听器
function setupEventListeners() {
    // 开始按钮
    document.getElementById('start-button').addEventListener('click', () => {
        gameState.soundManager.play('click');
        startLevel(gameState.currentLevel);
    });
    
    // 关卡选择按钮
    document.getElementById('levels-button').addEventListener('click', () => {
        gameState.soundManager.play('click');
        showLevelsScreen();
    });
    
    // 设置按钮
    document.getElementById('settings-button').addEventListener('click', () => {
        gameState.soundManager.play('click');
        showScreen('settings-screen');
    });
    
    // 返回按钮（从关卡选择界面）
    document.getElementById('back-from-levels').addEventListener('click', () => {
        gameState.soundManager.play('click');
        showScreen('start-screen');
    });
    
    // 返回按钮（从设置界面）
    document.getElementById('back-from-settings').addEventListener('click', () => {
        gameState.soundManager.play('click');
        showScreen('start-screen');
    });
    
    // 重置按钮
    document.getElementById('reset-button').addEventListener('click', () => {
        gameState.soundManager.play('click');
        resetLevel();
    });
    
    // 提示按钮
    document.getElementById('hint-button').addEventListener('click', () => {
        gameState.soundManager.play('click');
        showHint();
    });
    
    // 返回菜单按钮
    document.getElementById('back-to-menu').addEventListener('click', () => {
        gameState.soundManager.play('click');
        showScreen('start-screen');
    });
    
    // 撤销按钮
    document.getElementById('undo-button').addEventListener('click', () => {
        gameState.soundManager.play('click');
        undoMove();
    });
    
    // 下一关按钮
    document.getElementById('next-level').addEventListener('click', () => {
        gameState.soundManager.play('click');
        startLevel(gameState.currentLevel + 1);
    });
    
    // 胜利界面按钮
    document.getElementById('replay-button').addEventListener('click', () => {
        gameState.soundManager.play('click');
        startLevel(gameState.currentLevel);
    });
    
    document.getElementById('next-level-victory').addEventListener('click', () => {
        gameState.soundManager.play('click');
        startLevel(gameState.currentLevel + 1);
    });
    
    document.getElementById('menu-button').addEventListener('click', () => {
        gameState.soundManager.play('click');
        showScreen('start-screen');
    });
    
    // 设置选项
    document.getElementById('sound-toggle').addEventListener('change', (e) => {
        gameState.soundManager.toggleSound(e.target.checked);
    });
    
    document.getElementById('music-toggle').addEventListener('change', (e) => {
        gameState.soundManager.toggleMusic(e.target.checked);
    });
    
    document.getElementById('vibration-toggle').addEventListener('change', (e) => {
        localStorage.setItem('vibrationEnabled', e.target.checked);
    });
}

// 显示关卡选择界面
function showLevelsScreen() {
    // 获取已完成的关卡
    const progress = loadGameProgress();
    const completedLevels = progress.completedLevels || [];
    
    // 清空关卡网格
    const levelsGrid = document.getElementById('levels-grid');
    levelsGrid.innerHTML = '';
    
    // 添加关卡按钮
    for (let i = 0; i < LEVELS.length; i++) {
        const levelNumber = i + 1;
        const levelItem = document.createElement('div');
        levelItem.className = 'level-item';
        
        // 设置关卡状态
        if (completedLevels.includes(levelNumber)) {
            levelItem.classList.add('completed');
        } else if (levelNumber > progress.currentLevel) {
            levelItem.classList.add('locked');
        }
        
        levelItem.textContent = levelNumber;
        
        // 添加点击事件（仅对未锁定的关卡）
        if (!levelItem.classList.contains('locked')) {
            levelItem.addEventListener('click', () => {
                gameState.soundManager.play('click');
                startLevel(levelNumber);
            });
        }
        
        levelsGrid.appendChild(levelItem);
    }
    
    showScreen('levels-screen');
}

// 开始关卡
function startLevel(levelNumber) {
    // 检查关卡是否有效
    if (levelNumber < 1 || levelNumber > LEVELS.length) {
        console.error('无效的关卡编号:', levelNumber);
        return;
    }
    
    // 更新当前关卡
    gameState.currentLevel = levelNumber;
    
    // 生成关卡数据
    gameState.bottles = generateLevelData(levelNumber - 1);
    
    // 重置游戏状态
    gameState.selectedBottle = null;
    gameState.moveHistory = [];
    gameState.isGameActive = true;
    
    // 更新UI
    document.getElementById('current-level').textContent = levelNumber;
    
    // 清空瓶子容器
    const bottlesContainer = document.getElementById('bottles-container');
    bottlesContainer.innerHTML = '';
    
    // 创建瓶子元素
    gameState.bottles.forEach(bottle => {
        const bottleElement = createBottleElement(bottle);
        
        // 添加点击事件
        bottleElement.addEventListener('click', () => {
            handleBottleClick(bottle);
        });
        
        bottlesContainer.appendChild(bottleElement);
    });
    
    // 隐藏下一关按钮
    document.getElementById('next-level').classList.add('hidden');
    
    // 显示游戏界面
    showScreen('game-screen');
    
    // 显示关卡介绍动画
    showLevelIntro(levelNumber);
    
    // 保存游戏进度
    saveGameProgress(levelNumber, {}, loadGameProgress().completedLevels || []);
}

// 处理瓶子点击
function handleBottleClick(bottle) {
    // 如果游戏不活跃，忽略点击
    if (!gameState.isGameActive) return;
    
    // 获取瓶子元素
    const bottleElement = document.getElementById(`bottle-${bottle.id}`);
    
    // 如果没有选中瓶子，选中当前瓶子
    if (gameState.selectedBottle === null) {
        // 如果瓶子是空的，不做任何操作
        if (bottle.layers.length === 0) {
            gameState.soundManager.play('error');
            bottleElement.classList.add('shake');
            setTimeout(() => {
                bottleElement.classList.remove('shake');
            }, 300);
            return;
        }
        
        // 选中瓶子
        gameState.selectedBottle = bottle;
        bottleElement.classList.add('selected');
        gameState.soundManager.play('click');
    } 
    // 如果已经选中了瓶子
    else {
        // 如果点击的是同一个瓶子，取消选中
        if (gameState.selectedBottle.id === bottle.id) {
            bottleElement.classList.remove('selected');
            gameState.selectedBottle = null;
            gameState.soundManager.play('click');
            return;
        }
        
        // 尝试倒水
        const sourceBottle = gameState.selectedBottle;
        const targetBottle = bottle;
        
        // 取消选中状态
        document.getElementById(`bottle-${sourceBottle.id}`).classList.remove('selected');
        gameState.selectedBottle = null;
        
        // 执行倒水操作
        const success = gameState.fluidSimulation.pourWater(sourceBottle, targetBottle, () => {
            // 更新瓶子视图
            updateBottleView(document.getElementById(`bottle-${sourceBottle.id}`), sourceBottle);
            updateBottleView(document.getElementById(`bottle-${targetBottle.id}`), targetBottle);
            
            // 记录移动历史（修复变量引用错误）
            const sourceColor = sourceBottle.layers.length > 0 ? 
                sourceBottle.layers[sourceBottle.layers.length - 1] : null;
                
            gameState.moveHistory.push({
                sourceId: sourceBottle.id,
                targetId: targetBottle.id,
                sourceBefore: [...sourceBottle.layers],
                targetBefore: [...targetBottle.layers]
            });
            
            // 检查是否完成关卡
            checkLevelComplete();
        });
        
        if (success) {
            gameState.soundManager.play('pour');
        } else {
            gameState.soundManager.play('error');
            bottleElement.classList.add('shake');
            setTimeout(() => {
                bottleElement.classList.remove('shake');
            }, 300);
        }
    }
}

// 检查关卡是否完成
function checkLevelComplete() {
    if (isLevelComplete(gameState.bottles)) {
        // 设置游戏为非活跃状态
        gameState.isGameActive = false;
        
        // 播放完成音效
        gameState.soundManager.play('complete');
        
        // 显示关卡完成动画
        showLevelCompleteAnimation(() => {
            // 更新已完成关卡
            const progress = loadGameProgress();
            const completedLevels = progress.completedLevels || [];
            if (!completedLevels.includes(gameState.currentLevel)) {
                completedLevels.push(gameState.currentLevel);
            }
            
            // 如果是最后一关，不更新当前关卡
            let nextLevel = gameState.currentLevel;
            if (gameState.currentLevel < LEVELS.length) {
                nextLevel = gameState.currentLevel + 1;
            }
            
            // 保存游戏进度
            saveGameProgress(nextLevel, progress.stars, completedLevels);
            
            // 播放星星音效
            setTimeout(() => {
                gameState.soundManager.play('star');
            }, 200);
            setTimeout(() => {
                gameState.soundManager.play('star');
            }, 400);
            setTimeout(() => {
                gameState.soundManager.play('star');
            }, 600);
        });
    }
}

// 重置关卡
function resetLevel() {
    startLevel(gameState.currentLevel);
}

// 撤销移动
function undoMove() {
    if (gameState.moveHistory.length === 0 || !gameState.isGameActive) return;
    
    // 获取最后一次移动
    const lastMove = gameState.moveHistory.pop();
    
    // 获取源瓶子和目标瓶子
    const sourceBottle = gameState.bottles.find(bottle => bottle.id === lastMove.sourceId);
    const targetBottle = gameState.bottles.find(bottle => bottle.id === lastMove.targetId);
    
    // 恢复瓶子状态
    sourceBottle.layers = lastMove.sourceBefore;
    targetBottle.layers = lastMove.targetBefore;
    
    // 更新瓶子视图
    updateBottleView(document.getElementById(`bottle-${sourceBottle.id}`), sourceBottle);
    updateBottleView(document.getElementById(`bottle-${targetBottle.id}`), targetBottle);
    
    // 播放音效
    gameState.soundManager.play('click');
}

// 显示提示
function showHint() {
    // 简单的提示：随机选择一个有液体的瓶子
    const bottlesWithLiquid = gameState.bottles.filter(bottle => bottle.layers.length > 0);
    
    if (bottlesWithLiquid.length > 0) {
        const randomBottle = bottlesWithLiquid[Math.floor(Math.random() * bottlesWithLiquid.length)];
        const bottleElement = document.getElementById(`bottle-${randomBottle.id}`);
        
        // 添加脉冲动画
        bottleElement.classList.add('pulse');
        setTimeout(() => {
            bottleElement.classList.remove('pulse');
        }, 1000);
        
        // 播放音效
        gameState.soundManager.play('click');
    }
}

// 初始化设置界面
function initSettingsScreen() {
    // 设置开关状态
    document.getElementById('sound-toggle').checked = 
        localStorage.getItem('soundEnabled') !== 'false';
    
    document.getElementById('music-toggle').checked = 
        localStorage.getItem('musicEnabled') !== 'false';
    
    document.getElementById('vibration-toggle').checked = 
        localStorage.getItem('vibrationEnabled') !== 'false';
}

// 当页面加载完成时初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    initGame();
    initSettingsScreen();
});