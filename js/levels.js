/**
 * 游戏关卡设计
 */

// 颜色定义
const COLORS = {
    RED: '#FF5252',       // 亮红色
    ORANGE: '#FF9800',    // 亮橙色
    YELLOW: '#FFEB3B',    // 亮黄色
    GREEN: '#4CAF50',     // 亮绿色
    BLUE: '#2196F3',      // 亮蓝色
    PURPLE: '#9C27B0',    // 亮紫色
    PINK: '#FF4081',      // 亮粉色
    TEAL: '#00BCD4',      // 亮青色
    LIME: '#CDDC39',      // 亮酸橙色
    BROWN: '#795548',     // 棕色
    GRAY: '#9E9E9E',      // 灰色
    NAVY: '#3F51B5',      // 海军蓝
    INDIGO: '#673AB7',    // 靛蓝色
    CYAN: '#00BCD4',      // 青色
    AMBER: '#FFC107',     // 琥珀色
    DEEP_ORANGE: '#FF5722', // 深橙色
    LIGHT_GREEN: '#8BC34A', // 浅绿色
    DEEP_PURPLE: '#673AB7', // 深紫色
    LIGHT_BLUE: '#03A9F4'  // 浅蓝色
};

// 生成关卡配置函数
function generateLevelConfigs() {
    const levels = [];
    
    // 前15关保持原样
    levels.push(
        // 关卡 1 - 简单的2种颜色
        {
            bottles: 4,
            emptyBottles: 2,
            colors: [COLORS.RED, COLORS.BLUE],
            layers: 4
        },
        
        // 关卡 2 - 3种颜色
        {
            bottles: 5,
            emptyBottles: 2,
            colors: [COLORS.RED, COLORS.BLUE, COLORS.GREEN],
            layers: 4
        },
        
        // 关卡 3 - 3种颜色，更多层
        {
            bottles: 5,
            emptyBottles: 1,
            colors: [COLORS.RED, COLORS.BLUE, COLORS.GREEN],
            layers: 4
        },
        
        // 关卡 4 - 4种颜色
        {
            bottles: 6,
            emptyBottles: 1,
            colors: [COLORS.RED, COLORS.BLUE, COLORS.GREEN, COLORS.YELLOW],
            layers: 4
        },
        
        // 关卡 5 - 4种颜色，更多层
        {
            bottles: 6,
            emptyBottles: 1,
            colors: [COLORS.RED, COLORS.BLUE, COLORS.GREEN, COLORS.YELLOW],
            layers: 4
        },
        
        // 关卡 6 - 5种颜色
        {
            bottles: 7,
            emptyBottles: 1,
            colors: [COLORS.RED, COLORS.BLUE, COLORS.GREEN, COLORS.YELLOW, COLORS.PURPLE],
            layers: 4
        },
        
        // 关卡 7 - 5种颜色，更多层
        {
            bottles: 7,
            emptyBottles: 1,
            colors: [COLORS.RED, COLORS.BLUE, COLORS.GREEN, COLORS.YELLOW, COLORS.PURPLE],
            layers: 4
        },
        
        // 关卡 8 - 6种颜色
        {
            bottles: 8,
            emptyBottles: 1,
            colors: [COLORS.RED, COLORS.BLUE, COLORS.GREEN, COLORS.YELLOW, COLORS.PURPLE, COLORS.ORANGE],
            layers: 4
        },
        
        // 关卡 9 - 6种颜色，更多层
        {
            bottles: 8,
            emptyBottles: 1,
            colors: [COLORS.RED, COLORS.BLUE, COLORS.GREEN, COLORS.YELLOW, COLORS.PURPLE, COLORS.ORANGE],
            layers: 4
        },
        
        // 关卡 10 - 7种颜色
        {
            bottles: 10,
            emptyBottles: 2,
            colors: [COLORS.RED, COLORS.BLUE, COLORS.GREEN, COLORS.YELLOW, COLORS.PURPLE, COLORS.ORANGE, COLORS.PINK],
            layers: 4
        },
        
        // 关卡 11 - 7种颜色，更多层
        {
            bottles: 10,
            emptyBottles: 2,
            colors: [COLORS.RED, COLORS.BLUE, COLORS.GREEN, COLORS.YELLOW, COLORS.PURPLE, COLORS.ORANGE, COLORS.PINK],
            layers: 4
        },
        
        // 关卡 12 - 8种颜色
        {
            bottles: 11,
            emptyBottles: 2,
            colors: [COLORS.RED, COLORS.BLUE, COLORS.GREEN, COLORS.YELLOW, COLORS.PURPLE, COLORS.ORANGE, COLORS.PINK, COLORS.TEAL],
            layers: 4
        },
        
        // 关卡 13 - 8种颜色，更多层
        {
            bottles: 11,
            emptyBottles: 2,
            colors: [COLORS.RED, COLORS.BLUE, COLORS.GREEN, COLORS.YELLOW, COLORS.PURPLE, COLORS.ORANGE, COLORS.PINK, COLORS.TEAL],
            layers: 4
        },
        
        // 关卡 14 - 9种颜色
        {
            bottles: 12,
            emptyBottles: 2,
            colors: [COLORS.RED, COLORS.BLUE, COLORS.GREEN, COLORS.YELLOW, COLORS.PURPLE, COLORS.ORANGE, COLORS.PINK, COLORS.TEAL, COLORS.LIME],
            layers: 4
        },
        
        // 关卡 15 - 9种颜色，更多层
        {
            bottles: 12,
            emptyBottles: 2,
            colors: [COLORS.RED, COLORS.BLUE, COLORS.GREEN, COLORS.YELLOW, COLORS.PURPLE, COLORS.ORANGE, COLORS.PINK, COLORS.TEAL, COLORS.LIME],
            layers: 4
        }
    );
    
    // 生成剩余的85关
    // 16-30关：9-10种颜色，2-3个空瓶
    for (let i = 16; i <= 30; i++) {
        const colorCount = 9 + Math.floor((i - 16) / 5);
        const colorSelection = Object.values(COLORS).slice(0, colorCount);
        levels.push({
            bottles: 12 + Math.floor((i - 16) / 5),
            emptyBottles: 2 + Math.floor((i - 16) / 10),
            colors: colorSelection,
            layers: 4
        });
    }
    
    // 31-50关：10-12种颜色，2-3个空瓶，更复杂的布局
    for (let i = 31; i <= 50; i++) {
        const colorCount = 10 + Math.floor((i - 31) / 7);
        const colorSelection = Object.values(COLORS).slice(0, Math.min(colorCount, 15));
        levels.push({
            bottles: 13 + Math.floor((i - 31) / 5),
            emptyBottles: 2 + Math.floor((i - 31) / 10),
            colors: colorSelection,
            layers: 4
        });
    }
    
    // 51-70关：12-14种颜色，3-4个空瓶，更多瓶子
    for (let i = 51; i <= 70; i++) {
        const colorCount = 12 + Math.floor((i - 51) / 10);
        const colorSelection = Object.values(COLORS).slice(0, Math.min(colorCount, 16));
        levels.push({
            bottles: 15 + Math.floor((i - 51) / 5),
            emptyBottles: 3 + Math.floor((i - 51) / 10),
            colors: colorSelection,
            layers: 4
        });
    }
    
    // 71-90关：14-16种颜色，4个空瓶，最大瓶子数
    for (let i = 71; i <= 90; i++) {
        const colorCount = 14 + Math.floor((i - 71) / 10);
        const colorSelection = Object.values(COLORS).slice(0, Math.min(colorCount, 18));
        levels.push({
            bottles: 18 + Math.floor((i - 71) / 10),
            emptyBottles: 4,
            colors: colorSelection,
            layers: 4
        });
    }
    
    // 91-100关：16-18种颜色，4个空瓶，最大难度
    for (let i = 91; i <= 100; i++) {
        const colorCount = 16 + Math.floor((i - 91) / 5);
        const colorSelection = Object.values(COLORS).slice(0, Math.min(colorCount, 19));
        levels.push({
            bottles: 20,
            emptyBottles: 4,
            colors: colorSelection,
            layers: 4
        });
    }
    
    return levels;
}

// 生成所有关卡配置
const LEVELS = generateLevelConfigs();

// 生成关卡数据
function generateLevelData(levelIndex) {
    const levelConfig = LEVELS[levelIndex];
    if (!levelConfig) return null;
    
    const { bottles, emptyBottles, colors, layers } = levelConfig;
    
    // 创建颜色层数组，确保每种颜色的层数是4的倍数
    let colorLayers = [];
    for (const color of colors) {
        // 每种颜色添加layers层（应该是4的倍数）
        for (let i = 0; i < layers; i++) {
            colorLayers.push(color);
        }
    }
    
    // 确保颜色层总数是瓶子容量的整数倍
    if (colorLayers.length % 4 !== 0) {
        console.error('颜色层总数必须是4的倍数');
    }
    
    // 洗牌颜色层
    colorLayers = shuffleArray(colorLayers);
    
    // 创建瓶子数据
    const bottlesData = [];
    
    // 添加带颜色的瓶子
    let colorIndex = 0;
    for (let i = 0; i < bottles - emptyBottles; i++) {
        const bottle = {
            id: i,
            layers: []
        };
        
        // 每个瓶子添加4层颜色
        for (let j = 0; j < 4; j++) {
            if (colorIndex < colorLayers.length) {
                bottle.layers.unshift(colorLayers[colorIndex]); // 使用unshift确保底部先填充
                colorIndex++;
            }
        }
        
        bottlesData.push(bottle);
    }
    
    // 添加空瓶子
    for (let i = bottles - emptyBottles; i < bottles; i++) {
        bottlesData.push({
            id: i,
            layers: []
        });
    }
    
    return bottlesData;
}