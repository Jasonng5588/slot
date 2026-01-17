/**
 * LuckyDragon Casino - Professional Footer Component
 * Enterprise-grade gambling platform footer with certifications
 */

const FooterComponent = {
    /**
     * Get the full footer HTML
     */
    getHTML: function () {
        return `
        <footer class="site-footer">
            <div class="footer-container">
                <!-- Gaming Licenses & Certifications -->
                <div class="footer-certifications">
                    <div class="cert-badge verified">
                        <span class="cert-icon">🛡️</span>
                        <span>MGA Licensed</span>
                    </div>
                    <div class="cert-badge verified">
                        <span class="cert-icon">✅</span>
                        <span>eCOGRA Certified</span>
                    </div>
                    <div class="cert-badge verified">
                        <span class="cert-icon">🔒</span>
                        <span>SSL 256-bit</span>
                    </div>
                    <div class="cert-badge">
                        <span class="cert-icon">🎮</span>
                        <span>GLI Certified</span>
                    </div>
                    <div class="cert-badge">
                        <span class="cert-icon">🏆</span>
                        <span>iTech Labs</span>
                    </div>
                    <div class="cert-badge">
                        <span class="cert-icon">📋</span>
                        <span>UKGC Compliant</span>
                    </div>
                    <div class="cert-badge verified">
                        <span class="cert-icon">🎯</span>
                        <span>Curacao eGaming</span>
                    </div>
                    <div class="cert-badge">
                        <span class="cert-icon">⚡</span>
                        <span>PAGCOR</span>
                    </div>
                </div>

                <!-- Payment Methods -->
                <div class="footer-payments">
                    <div class="payment-method" title="Visa">💳</div>
                    <div class="payment-method" title="Mastercard">💳</div>
                    <div class="payment-method" title="Bank Transfer">🏦</div>
                    <div class="payment-method" title="E-Wallet">📱</div>
                    <div class="payment-method" title="Crypto">₿</div>
                    <div class="payment-method" title="Touch n Go">📲</div>
                    <div class="payment-method" title="GrabPay">🎯</div>
                    <div class="payment-method" title="Boost">⚡</div>
                </div>

                <!-- Security Badges -->
                <div class="footer-security">
                    <div class="security-badge">
                        <span class="badge-icon">🔐</span>
                        <span>AES-256 Encryption</span>
                    </div>
                    <div class="security-badge">
                        <span class="badge-icon">🛡️</span>
                        <span>PCI DSS Compliant</span>
                    </div>
                    <div class="security-badge">
                        <span class="badge-icon">✓</span>
                        <span>RNG Certified</span>
                    </div>
                    <div class="security-badge">
                        <span class="badge-icon">🔒</span>
                        <span>Anti-Fraud Protected</span>
                    </div>
                    <div class="security-badge">
                        <span class="badge-icon">👁️</span>
                        <span>GDPR Compliant</span>
                    </div>
                </div>

                <!-- Responsible Gaming -->
                <div class="footer-responsible">
                    <p>
                        <strong>🎲 Responsible Gaming:</strong> 
                        LuckyDragon is committed to responsible gambling. We provide tools to help you stay in control, 
                        including deposit limits, self-exclusion, and cool-off periods. 
                        If you need help, please contact <a href="#">GamCare</a> or <a href="#">BeGambleAware</a>.
                        Gambling should be fun – know your limits and play responsibly.
                    </p>
                </div>

                <!-- Copyright -->
                <div class="footer-copyright">
                    <p>© 2024-2026 LuckyDragon Casino. All Rights Reserved.</p>
                    <p class="license-info">
                        Licensed and regulated by the Malta Gaming Authority (MGA/B2C/xxx/2024) | 
                        Operated by LuckyDragon Gaming Limited
                    </p>
                    <div class="age-restriction">
                        <span>🔞</span>
                        <span>18+ ONLY | Gambling Can Be Addictive</span>
                    </div>
                </div>
            </div>
        </footer>
        `;
    },

    /**
     * Inject footer into the page
     */
    inject: function () {
        // Check if footer already exists
        if (document.querySelector('.site-footer')) return;

        // Create footer element
        const footerHTML = this.getHTML();
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    },

    /**
     * Initialize footer (call on DOMContentLoaded)
     */
    init: function () {
        // Wait for DOM if needed
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.inject();
                this.initLiveChat();
            });
        } else {
            this.inject();
            this.initLiveChat();
        }
    },

    /**
     * Initialize LiveChat customer support
     */
    initLiveChat: function () {
        // Skip if already loaded
        if (window.LiveChatWidget) return;

        window.__lc = window.__lc || {};
        window.__lc.license = 19456875;
        window.__lc.integration_name = "manual_onboarding";
        window.__lc.product_name = "livechat";

        (function (n, t, c) {
            function i(n) { return e._h ? e._h.apply(null, n) : e._q.push(n) }
            var e = {
                _q: [], _h: null, _v: "2.0",
                on: function () { i(["on", c.call(arguments)]) },
                once: function () { i(["once", c.call(arguments)]) },
                off: function () { i(["off", c.call(arguments)]) },
                get: function () { if (!e._h) throw new Error("[LiveChatWidget] You can't use getters before load."); return i(["get", c.call(arguments)]) },
                call: function () { i(["call", c.call(arguments)]) },
                init: function () {
                    var n = t.createElement("script");
                    n.async = !0;
                    n.type = "text/javascript";
                    n.src = "https://cdn.livechatinc.com/tracking.js";
                    t.head.appendChild(n);
                }
            };
            !n.__lc.asyncInit && e.init();
            n.LiveChatWidget = n.LiveChatWidget || e;
        }(window, document, [].slice));
    }
};

// Auto-inject footer when script loads
FooterComponent.init();
