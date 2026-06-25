// app.js

// --------------------------------------------------------------------------
// 1. Web Audio API Sound Generator for HTML5 Ads
// --------------------------------------------------------------------------
const AdSound = {
    enabled: true,
    ctx: null,
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    playBeep(freq, type, duration) {
        if (!this.enabled) return;
        try {
            this.init();
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            osc.type = type || 'sine';
            gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + duration);
            
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn("Web Audio not supported or blocked", e);
        }
    },
    playHeartPop() {
        this.playBeep(440, 'triangle', 0.12);
        setTimeout(() => this.playBeep(880, 'sine', 0.15), 40);
    },
    playSuccess() {
        const notes = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playBeep(freq, 'triangle', 0.20);
            }, idx * 100);
        });
    }
};

// --------------------------------------------------------------------------
// 2. Google H5 Games Ads API & Button Loading Controller
// --------------------------------------------------------------------------

// Initialize H5 Games Ads configuration if available
if (typeof adConfig === 'function') {
    adConfig({
        preloadAdBreaks: 'on',
        sound: 'on',
        onReady: function () {
            console.log('H5 Games Ads initialized and ready');
        }
    });
}

function handleContinueClick(event) {
    const btn = event.currentTarget;
    if (btn.classList.contains('loading')) return;

    event.preventDefault();
    const targetUrl = 'question-1.html'; // Age check continue target page

    const btnText = btn.querySelector('.btn-text');

    // Show button loading spinner (matching G:\Clone quiz result.js logic)
    btn.disabled = true;
    btn.classList.add('loading');
    if (btnText) {
        btnText.innerHTML = `<span class="claim-button-spinner"></span>Loading...`;
    }

    AdSound.playHeartPop();

    // 1.5s buffer for ad to preload
    setTimeout(() => {
        if (typeof adBreak !== 'function') {
            console.error('adBreak not available - redirecting immediately');
            window.location.href = targetUrl;
            return;
        }

        let adShown = false;
        let callbackFired = false;

        function proceedToNextPage() {
            window.location.href = targetUrl;
        }

        adBreak({
            type: 'reward', // Cloned from result.js reward flow
            name: 'continue_to_quiz',
            beforeReward: function (showAdFn) {
                console.log('Ad ready, showing now...');
                adShown = true;
                showAdFn();
            },
            adViewed: function () {
                callbackFired = true;
                console.log('Ad viewed successfully');
                proceedToNextPage();
            },
            adDismissed: function () {
                callbackFired = true;
                console.log('Ad dismissed');
                proceedToNextPage();
            },
            adBreakDone: function (placementInfo) {
                console.log('adBreakDone status:', placementInfo ? placementInfo.breakStatus : 'unknown');
                
                // If ad was shown, proceedToNextPage will run on viewed/dismissed.
                // If no ad was served/shown, we proceed directly.
                if (!adShown && !callbackFired) {
                    console.log('No ad served - proceeding directly');
                    proceedToNextPage();
                } else if (adShown && !callbackFired) {
                    // Fallback to ensure redirect if ad was shown but callbacks didn't fire
                    setTimeout(proceedToNextPage, 200);
                }
            }
        });
    }, 1500);
}

function handleOptionClick(event, element, isProfileCard = false) {
    if (element.classList.contains('loading')) return;

    event.preventDefault();
    const targetUrl = element.getAttribute('href') || 'index.html';

    // Show loading spinner
    element.classList.add('loading');
    
    // Disable clicks on all options on the page to prevent double taps
    const allOptions = document.querySelectorAll('.select-btn, .profile-card.neon-card');
    allOptions.forEach(opt => {
        opt.style.pointerEvents = 'none';
        opt.style.opacity = '0.7';
    });

    // Update inner content to show spinner
    if (isProfileCard) {
        const statusDiv = element.querySelector('.status');
        if (statusDiv) {
            statusDiv.innerHTML = `<span class="claim-button-spinner" style="width: 10px; height: 10px; margin-right: 4px; border-width: 1.5px; vertical-align: middle;"></span>Loading...`;
        }
    } else {
        element.innerHTML = `<span class="claim-button-spinner" style="width: 12px; height: 12px; margin-right: 6px; border-width: 1.5px; vertical-align: middle;"></span>Loading...`;
    }

    AdSound.playHeartPop();

    // 1.5s buffer for ad to preload
    setTimeout(() => {
        if (typeof adBreak !== 'function') {
            console.error('adBreak not available - redirecting immediately');
            window.location.href = targetUrl;
            return;
        }

        let adShown = false;
        let callbackFired = false;

        function proceedToNextPage() {
            window.location.href = targetUrl;
        }

        adBreak({
            type: 'reward', // Direct rewarded integration
            name: 'answer_selection',
            beforeReward: function (showAdFn) {
                console.log('Ad ready, showing now...');
                adShown = true;
                showAdFn();
            },
            adViewed: function () {
                callbackFired = true;
                console.log('Ad viewed successfully');
                proceedToNextPage();
            },
            adDismissed: function () {
                callbackFired = true;
                console.log('Ad dismissed');
                proceedToNextPage();
            },
            adBreakDone: function (placementInfo) {
                console.log('adBreakDone status:', placementInfo ? placementInfo.breakStatus : 'unknown');
                
                // If ad was shown, proceedToNextPage will run on viewed/dismissed.
                // If no ad was served/shown, we proceed directly.
                if (!adShown && !callbackFired) {
                    console.log('No ad served - proceeding directly');
                    proceedToNextPage();
                } else if (adShown && !callbackFired) {
                    // Fallback to ensure redirect if ad was shown but callbacks didn't fire
                    setTimeout(proceedToNextPage, 200);
                }
            }
        });
    }, 1500);
}

// --------------------------------------------------------------------------
// 3. Document Load and Event Listeners
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Intercept clicks only on the main welcome/intro continue button
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', handleContinueClick);
    }

    // Intercept clicks on even-numbered question pages
    const isEvenQuestionPage = /(question-2|question-4|question-6|question-8)/i.test(window.location.pathname);
    if (isEvenQuestionPage) {
        // For question-2, 4, 6: options are select-btn
        const selectButtons = document.querySelectorAll('.select-btn');
        selectButtons.forEach(btn => {
            btn.addEventListener('click', (event) => handleOptionClick(event, btn));
        });

        // For question-8: options are profile-card neon-card
        const profileCards = document.querySelectorAll('.profile-card.neon-card');
        profileCards.forEach(card => {
            card.addEventListener('click', (event) => handleOptionClick(event, card, true));
        });
    }

    // Handle auto-rewarded ads on load if configured on the Welcome screen (intro and index)
    const isWelcomeScreen = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('intro.html');
    if (isWelcomeScreen) {
        setTimeout(() => {
            if (typeof AdManager !== 'undefined' && typeof AdManager.showRewarded === 'function') {
                console.log('[App] Auto rewarded ad loading on Welcome screen');
                AdManager.showRewarded();
            }
        }, 100);
    }
});
