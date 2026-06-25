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
// 2. HTML5 Interstitial Ad Player Controller
// --------------------------------------------------------------------------
const HTML5AdPlayer = {
    overlay: null,
    closeBtn: null,
    targetUrl: '',

    injectOverlay() {
        const overlayMarkup = `
          <div class="ads-popup" role="dialog" aria-modal="true" aria-label="Advertisement">
            <div class="close-wrap">
              <button class="ads-close-btn" id="ad-close-btn" type="button" aria-label="Close Ad">
                ✖
              </button>
            </div>
            <div id="ad-interstitial" class="custom-gpt-ad interstitial-ad">
              <!-- Loaded by AdManager -->
            </div>
            <div class="popup-ad-label">Advertisement</div>
          </div>
        `;
        
        const overlayDiv = document.createElement('div');
        overlayDiv.id = 'html5-ad-overlay';
        overlayDiv.className = 'ads-popup-overlay';
        overlayDiv.style.display = 'none';
        overlayDiv.innerHTML = overlayMarkup;
        document.body.appendChild(overlayDiv);
    },

    init() {
        this.injectOverlay();

        this.overlay = document.getElementById('html5-ad-overlay');
        this.closeBtn = document.getElementById('ad-close-btn');

        // Close button click
        this.closeBtn.addEventListener('click', () => {
            this.hide();
            if (this.targetUrl) {
                window.location.href = this.targetUrl;
            }
        });
    },

    show(targetUrl) {
        this.targetUrl = targetUrl;
        this.overlay.style.display = 'flex';

        // Dynamically load Google AdSense inside the overlay
        if (typeof AdManager !== 'undefined' && typeof AdManager.display === 'function') {
            AdManager.display("interstitial", "ad-interstitial");
        }
    },

    hide() {
        this.overlay.style.display = 'none';
        
        // Clear the inside of the interstitial slot so it re-renders next time
        const slotEl = document.getElementById("ad-interstitial");
        if (slotEl) {
            slotEl.innerHTML = '';
        }
    }
};

// --------------------------------------------------------------------------
// 3. Document Load and Click Listeners
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Inject and initialize ad player
    HTML5AdPlayer.init();

    // Dynamically load the page banner via original AdManager if it's setup
    const bannerSlot = document.querySelector('.gpt-banner-slot[id]');
    if (
        bannerSlot &&
        typeof AdManager !== 'undefined' &&
        typeof AdManager.loadBanner === 'function'
    ) {
        AdManager.loadBanner(
            bannerSlot.id,
            bannerSlot.dataset.adUnitPath,
            bannerSlot.dataset.adSizes ? JSON.parse(bannerSlot.dataset.adSizes) : [[300, 250], [300, 100], [320, 250], [320, 100], [300, 50], [336, 280], [320, 50]]
        );
    }

    // Intercept clicks only on the main welcome/intro continue button
    document.addEventListener('click', (event) => {
        const targetLink = event.target.closest('#continue-btn');

        if (targetLink) {
            const href = targetLink.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                event.preventDefault();
                console.log('[Click Handler] Intercepting continue button for HTML5 Ad:', href);
                HTML5AdPlayer.show(href);
            }
        }
    });

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
