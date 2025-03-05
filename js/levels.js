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
    BROWN: '#795548',     // 棕色（保留但不建议在前几关使用）
    GRAY: '#9E9E9E',      // 灰色（保留但不建议在前几关使用）
    NAVY: '#3F51B5'       // 海军蓝
};

// 关卡设计
const LEVELS = [
    // 关卡 1 - 简单的2种颜色
    {
        bottles: 4, // 总瓶子数
        emptyBottles: 2, // 空瓶子数（修改为2个空瓶子）
        colors: [COLORS.RED, COLORS.BLUE], // 使用的颜色
        layers: 4 // 每种颜色的层数（修改为4层，正好填满一个瓶子）
    },
    
    // 关卡 2 - 3种颜色
    {
        bottles: 5,
        emptyBottles: 2,
        colors: [COLORS.RED, COLORS.BLUE, COLORS.GREEN],
        layers: 4 // 确保每种颜色有4层
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
];

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