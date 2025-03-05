/**
 * 音效管理
 */

class SoundManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.isSoundEnabled = localStorage.getItem('soundEnabled') !== 'false';
        this.isMusicEnabled = localStorage.getItem('musicEnabled') !== 'false';
        
        // 初始化音效
        this.initSounds();
    }
    
    // 初始化音效
    initSounds() {
        // 按钮点击音效
        this.sounds.click = new Howl({
            src: ['assets/sounds/click.mp3'],
            volume: 0.5
        });
        
        // 倒水音效
        this.sounds.pour = new Howl({
            src: ['assets/sounds/pour.mp3'],
            volume: 0.6
        });
        
        // 完成音效
        this.sounds.complete = new Howl({
            src: ['assets/sounds/complete.mp3'],
            volume: 0.7
        });
        
        // 错误音效
        this.sounds.error = new Howl({
            src: ['assets/sounds/error.mp3'],
            volume: 0.5
        });
        
        // 星星音效
        this.sounds.star = new Howl({
            src: ['assets/sounds/star.mp3'],
            volume: 0.6
        });
        
        // 背景音乐
        this.music = new Howl({
            src: ['assets/sounds/background.mp3'],
            volume: 0.3,
            loop: true
        });
    }
    
    // 播放音效
    play(soundName) {
        if (this.isSoundEnabled && this.sounds[soundName]) {
            this.sounds[soundName].play();
        }
    }
    
    // 播放背景音乐
    playMusic() {
        if (this.isMusicEnabled && this.music) {
            this.music.play();
        }
    }
    
    // 暂停背景音乐
    pauseMusic() {
        if (this.music) {
            this.music.pause();
        }
    }
    
    // 启用/禁用音效
    toggleSound(enabled) {
        this.isSoundEnabled = enabled;
        localStorage.setItem('soundEnabled', enabled);
    }
    
    // 启用/禁用音乐
    toggleMusic(enabled) {
        this.isMusicEnabled = enabled;
        localStorage.setItem('musicEnabled', enabled);
        
        if (enabled) {
            this.playMusic();
        } else {
            this.pauseMusic();
        }
    }
}