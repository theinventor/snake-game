import { GameConfig } from '../config/GameConfig.js';

export class AudioSystem {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.backgroundMusic = null;
        this.isMuted = false;
        this.masterVolume = GameConfig.AUDIO.MASTER_VOLUME;
        
        this.initializeSounds();
        console.log('AudioSystem initialized');
    }
    
    initializeSounds() {
        // Initialize sound effects
        if (this.scene.cache.audio.exists('hit')) {
            this.sounds.hit = this.scene.sound.add('hit', {
                volume: GameConfig.AUDIO.SFX_VOLUME * this.masterVolume
            });
        }
        
        if (this.scene.cache.audio.exists('success')) {
            this.sounds.success = this.scene.sound.add('success', {
                volume: GameConfig.AUDIO.SFX_VOLUME * this.masterVolume
            });
        }
        
        // Initialize background music
        if (this.scene.cache.audio.exists('background')) {
            this.backgroundMusic = this.scene.sound.add('background', {
                volume: GameConfig.AUDIO.MUSIC_VOLUME * this.masterVolume,
                loop: true
            });
        }
        
        console.log('Audio sounds initialized:', Object.keys(this.sounds));
    }
    
    playSound(soundName) {
        if (this.isMuted) {
            console.log(`Sound ${soundName} skipped (muted)`);
            return;
        }
        
        if (this.sounds[soundName]) {
            try {
                this.sounds[soundName].play();
                console.log(`Playing sound: ${soundName}`);
            } catch (error) {
                console.warn(`Failed to play sound ${soundName}:`, error);
            }
        } else {
            console.warn(`Sound ${soundName} not found`);
        }
    }
    
    playBackgroundMusic() {
        if (this.isMuted || !this.backgroundMusic) {
            console.log('Background music skipped (muted or not available)');
            return;
        }
        
        try {
            if (!this.backgroundMusic.isPlaying) {
                this.backgroundMusic.play();
                console.log('Background music started');
            }
        } catch (error) {
            console.warn('Failed to play background music:', error);
        }
    }
    
    stopBackgroundMusic() {
        if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
            this.backgroundMusic.stop();
            console.log('Background music stopped');
        }
    }
    
    pauseBackgroundMusic() {
        if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
            this.backgroundMusic.pause();
            console.log('Background music paused');
        }
    }
    
    resumeBackgroundMusic() {
        if (this.backgroundMusic && this.backgroundMusic.isPaused) {
            this.backgroundMusic.resume();
            console.log('Background music resumed');
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.pauseBackgroundMusic();
        } else {
            this.resumeBackgroundMusic();
        }
        
        console.log(`Audio ${this.isMuted ? 'muted' : 'unmuted'}`);
        return this.isMuted;
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        
        // Update all sound volumes
        Object.values(this.sounds).forEach(sound => {
            sound.setVolume(GameConfig.AUDIO.SFX_VOLUME * this.masterVolume);
        });
        
        if (this.backgroundMusic) {
            this.backgroundMusic.setVolume(GameConfig.AUDIO.MUSIC_VOLUME * this.masterVolume);
        }
        
        console.log('Master volume set to:', this.masterVolume);
    }
    
    setSFXVolume(volume) {
        const newVolume = Math.max(0, Math.min(1, volume));
        GameConfig.AUDIO.SFX_VOLUME = newVolume;
        
        Object.values(this.sounds).forEach(sound => {
            sound.setVolume(newVolume * this.masterVolume);
        });
        
        console.log('SFX volume set to:', newVolume);
    }
    
    setMusicVolume(volume) {
        const newVolume = Math.max(0, Math.min(1, volume));
        GameConfig.AUDIO.MUSIC_VOLUME = newVolume;
        
        if (this.backgroundMusic) {
            this.backgroundMusic.setVolume(newVolume * this.masterVolume);
        }
        
        console.log('Music volume set to:', newVolume);
    }
    
    destroy() {
        // Stop all sounds
        Object.values(this.sounds).forEach(sound => {
            if (sound.isPlaying) {
                sound.stop();
            }
        });
        
        if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
            this.backgroundMusic.stop();
        }
        
        console.log('AudioSystem destroyed');
    }
}
