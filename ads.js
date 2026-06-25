// ads.js
window.adsbygoogle = window.adsbygoogle || [];

const AdManager = {
  initialized: false,
  slots: {
    banner: "2972053355",       // ssd1 (Top/Page banners)
    middle: "9931876664",       // ssd2 (Middle page banners)
    interstitial: "8618794990", // ssd3 (Popup interstitial)
    rewarded: "2177846433"      // ssd4 (Rewarded)
  },

  init() {
    if (this.initialized) return;

    // Dynamically load Google AdSense script once if not already present
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1484482880870768";
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    this.initialized = true;
    console.log('[AdManager] Google AdSense ca-pub-1484482880870768 initialized.');
  },

  display(slotName, elementId) {
    this.init();
    const el = document.getElementById(elementId);
    if (!el) return;

    // Check if slot already has adsbygoogle active
    if (el.querySelector('ins.adsbygoogle')) {
      return;
    }

    const slotId = this.slots[slotName] || this.slots.banner;

    el.innerHTML = `
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-1484482880870768"
           data-ad-slot="${slotId}"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    `;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("[AdManager] AdSense push failed: ", e);
    }
  },

  loadBanner(divId, adUnitPath, sizes) {
    console.log('[AdManager] loadBanner mapping to AdSense slot:', divId);
    this.display("banner", divId);
  },

  showRewarded(callback) {
    console.log('[AdManager] showRewarded mock fired');
    if (callback) callback();
  },

  showInterstitial(callback) {
    console.log('[AdManager] showInterstitial mock fired');
    if (callback) callback();
  }
};

window.AdManager = AdManager;

// Define the exact TWITQUIZ_ADS and QUIZ_CONFIG structures from Clone quiz for identical script compatibility
window.TWITQUIZ_ADS = {
  createAdManager(adsConfig) {
    return {
      display(position, elementId) {
        // Map positions to slotNames
        let slotName = "banner";
        if (position === "middle" || position === "secondary") {
          slotName = "middle";
        } else if (position === "interstitial") {
          slotName = "interstitial";
        } else if (position === "rewarded") {
          slotName = "rewarded";
        }
        AdManager.display(slotName, elementId);
      },
      showRewarded() {
        return new Promise((resolve) => {
          AdManager.showRewarded(() => resolve(true));
        });
      }
    };
  }
};

window.QUIZ_CONFIG = {
  ads: {
    provider: "demo",
    top: "",
    middle: "",
    interstitial: "",
    rewarded: ""
  }
};

// Auto initialize on script load
AdManager.init();