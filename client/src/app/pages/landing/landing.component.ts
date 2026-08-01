import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="landing">
      <!-- Animated background mesh -->
      <div class="bg-mesh"></div>
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>
      <div class="bg-orb bg-orb-3"></div>

      <!-- Header -->
      <header class="landing-header">
        <div class="container header-inner">
          <a class="logo" href="/">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#logoGrad)"/>
              <path d="M10 16L14 20L22 12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <defs><linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32"><stop stop-color="#6c5ce7"/><stop offset="1" stop-color="#a29bfe"/></linearGradient></defs>
            </svg>
            <span>Splitly</span>
          </a>
          <div class="header-actions">
            @if (auth.isAuthenticated()) {
              <a routerLink="/dashboard" class="btn btn-primary">Go to Dashboard</a>
            } @else {
              <a routerLink="/login" class="btn btn-ghost">Sign In</a>
              <a routerLink="/register" class="btn btn-primary">Get Started</a>
            }
          </div>
        </div>
      </header>

      <!-- Hero -->
      <section class="hero">
        <div class="container hero-inner">
          <div class="hero-badge animate-slide-down">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
            Smart Expense Splitting for Modern Teams
          </div>
          <h1 class="hero-title animate-slide-up">
            Split expenses<br>
            <span class="gradient-text">without the awkwardness</span>
          </h1>
          <p class="hero-subtitle animate-slide-up" style="animation-delay: 100ms">
            Track group expenses, calculate fair splits instantly, and settle debts
            transparently. Built for roommates, trips, dinners, and everything in between.
          </p>
          <div class="hero-cta animate-slide-up" style="animation-delay: 200ms">
            <a routerLink="/register" class="btn btn-primary btn-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              Start Splitting Free
            </a>
            <a href="#features" class="btn btn-secondary btn-lg">
              Learn More
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19,12 12,19 5,12"/></svg>
            </a>
          </div>

          <!-- Floating Cards -->
          <div class="hero-visual animate-scale-in" style="animation-delay: 400ms">
            <div class="floating-card card-1 glass-card-static">
              <div class="fc-header">
                <div class="fc-avatar" style="background: linear-gradient(135deg, #6c5ce7, #a29bfe)">AK</div>
                <div>
                  <div class="fc-name">Amit paid</div>
                  <div class="fc-amount">₹2,400</div>
                </div>
              </div>
              <div class="fc-tag badge badge-purple">Dinner</div>
            </div>

            <div class="floating-card card-2 glass-card-static">
              <div class="fc-header">
                <div class="fc-avatar" style="background: linear-gradient(135deg, #00cec9, #81ecec)">RS</div>
                <div>
                  <div class="fc-name">Riya paid</div>
                  <div class="fc-amount">₹5,200</div>
                </div>
              </div>
              <div class="fc-tag badge badge-teal">Hotel</div>
            </div>

            <div class="floating-card card-3 glass-card-static">
              <div class="fc-split">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
                <span>Split equally — ₹600 each</span>
              </div>
            </div>

            <div class="hero-glow"></div>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section id="features" class="features">
        <div class="container">
          <div class="section-header animate-slide-up">
            <h2>Everything you need to<br><span class="gradient-text">split smart</span></h2>
            <p>No more spreadsheets, no more awkward conversations.</p>
          </div>

          <div class="features-grid stagger-children">
            <div class="feature-card glass-card">
              <div class="feature-icon" style="background: rgba(108, 92, 231, 0.12)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a29bfe" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3>Group Management</h3>
              <p>Create groups for roommates, trips, or dinner parties. Add members instantly by email.</p>
            </div>

            <div class="feature-card glass-card">
              <div class="feature-icon" style="background: rgba(0, 206, 201, 0.12)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#81ecec" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3>Flexible Splitting</h3>
              <p>Split equally, by exact amounts, or by percentage. Every split mode you could need.</p>
            </div>

            <div class="feature-card glass-card">
              <div class="feature-icon" style="background: rgba(0, 184, 148, 0.12)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#55efc4" stroke-width="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>
              </div>
              <h3>Real-time Balances</h3>
              <p>See who owes whom at a glance. Balances update in real-time as expenses are added.</p>
            </div>

            <div class="feature-card glass-card">
              <div class="feature-icon" style="background: rgba(253, 203, 110, 0.12)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fdcb6e" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <h3>Expense History</h3>
              <p>Full history of every expense with dates, amounts, and who paid. Never lose track again.</p>
            </div>

            <div class="feature-card glass-card">
              <div class="feature-icon" style="background: rgba(225, 112, 85, 0.12)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e17055" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h3>Secure & Private</h3>
              <p>JWT-authenticated APIs, encrypted passwords, and your data stays yours.</p>
            </div>

            <div class="feature-card glass-card">
              <div class="feature-icon" style="background: rgba(116, 185, 255, 0.12)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#74b9ff" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </div>
              <h3>Works Everywhere</h3>
              <p>Responsive design works beautifully on desktop, tablet, and mobile devices.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-card glass-card-static">
            <div class="cta-glow"></div>
            <h2>Ready to stop guessing<br>who owes what?</h2>
            <p>Join thousands who've simplified expense splitting.</p>
            <a routerLink="/register" class="btn btn-primary btn-lg">
              Get Started — It's Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
            </a>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="landing-footer">
        <div class="container footer-inner">
          <div class="footer-brand">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#footGrad)"/>
              <path d="M10 16L14 20L22 12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <defs><linearGradient id="footGrad" x1="0" y1="0" x2="32" y2="32"><stop stop-color="#6c5ce7"/><stop offset="1" stop-color="#a29bfe"/></linearGradient></defs>
            </svg>
            <span>Splitly</span>
          </div>
          <p class="footer-copy">Built with ❤️ using MEAN Stack · © 2026</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .landing {
      position: relative;
      overflow-x: hidden;
    }

    /* Background effects */
    .bg-mesh {
      position: fixed;
      inset: 0;
      background: var(--gradient-mesh);
      pointer-events: none;
      z-index: 0;
    }

    .bg-orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
      z-index: 0;
    }
    .bg-orb-1 {
      width: 600px;
      height: 600px;
      background: rgba(108, 92, 231, 0.08);
      top: -200px;
      right: -200px;
      animation: float 8s ease-in-out infinite;
    }
    .bg-orb-2 {
      width: 400px;
      height: 400px;
      background: rgba(0, 206, 201, 0.06);
      bottom: 10%;
      left: -100px;
      animation: float 10s ease-in-out infinite reverse;
    }
    .bg-orb-3 {
      width: 300px;
      height: 300px;
      background: rgba(253, 203, 110, 0.04);
      top: 50%;
      right: 10%;
      animation: float 12s ease-in-out infinite;
    }

    /* Header */
    .landing-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(10, 10, 15, 0.6);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border-subtle);
    }

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      text-decoration: none;
    }
    .logo span {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 1.3rem;
      color: var(--text-primary);
    }

    .header-actions {
      display: flex;
      gap: var(--space-sm);
    }

    /* Hero */
    .hero {
      position: relative;
      z-index: 1;
      padding: 80px 0 40px;
      text-align: center;
    }

    .hero-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
      padding: 6px 16px;
      background: rgba(108, 92, 231, 0.1);
      border: 1px solid rgba(108, 92, 231, 0.2);
      border-radius: var(--radius-full);
      color: var(--accent-purple-light);
      font-size: 0.8rem;
      font-weight: 500;
      margin-bottom: var(--space-xl);
    }

    .hero-title {
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.03em;
      margin-bottom: var(--space-lg);
    }

    .gradient-text {
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.15rem;
      color: var(--text-secondary);
      max-width: 540px;
      line-height: 1.7;
      margin-bottom: var(--space-2xl);
    }

    .hero-cta {
      display: flex;
      gap: var(--space-md);
      flex-wrap: wrap;
      justify-content: center;
    }

    /* Floating Cards */
    .hero-visual {
      position: relative;
      width: 100%;
      max-width: 600px;
      height: 280px;
      margin-top: var(--space-3xl);
    }

    .floating-card {
      position: absolute;
      padding: 16px 20px;
    }

    .card-1 {
      top: 0;
      left: 5%;
      animation: float 6s ease-in-out infinite;
    }

    .card-2 {
      top: 20px;
      right: 5%;
      animation: float 7s ease-in-out infinite 1s;
    }

    .card-3 {
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      animation: float 5s ease-in-out infinite 0.5s;
    }

    .fc-header {
      display: flex;
      align-items: center;
      gap: var(--space-md);
    }

    .fc-avatar {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      font-weight: 600;
      font-size: 0.85rem;
      color: white;
    }

    .fc-name {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .fc-amount {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 1.3rem;
      color: var(--text-primary);
    }

    .fc-tag {
      margin-top: var(--space-sm);
    }

    .fc-split {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      color: var(--color-success);
      font-weight: 500;
      font-size: 0.9rem;
    }

    .hero-glow {
      position: absolute;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(108, 92, 231, 0.15), transparent 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: -1;
      animation: pulse-glow 4s ease-in-out infinite;
    }

    /* Features */
    .features {
      position: relative;
      z-index: 1;
      padding: 100px 0;
    }

    .section-header {
      text-align: center;
      margin-bottom: var(--space-3xl);
    }
    .section-header h2 {
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      font-weight: 700;
      margin-bottom: var(--space-md);
    }
    .section-header p {
      color: var(--text-secondary);
      font-size: 1.1rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--space-lg);
    }

    .feature-card {
      padding: var(--space-xl);
    }
    .feature-card h3 {
      font-size: 1.1rem;
      margin-bottom: var(--space-sm);
    }
    .feature-card p {
      color: var(--text-secondary);
      font-size: 0.9rem;
      line-height: 1.6;
    }

    .feature-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-md);
    }

    /* CTA */
    .cta-section {
      position: relative;
      z-index: 1;
      padding: 40px 0 100px;
    }

    .cta-card {
      position: relative;
      overflow: hidden;
      padding: var(--space-3xl);
      text-align: center;
    }
    .cta-card h2 {
      font-size: clamp(1.5rem, 3vw, 2.2rem);
      font-weight: 700;
      margin-bottom: var(--space-md);
    }
    .cta-card p {
      color: var(--text-secondary);
      margin-bottom: var(--space-xl);
      font-size: 1.05rem;
    }

    .cta-glow {
      position: absolute;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(108, 92, 231, 0.12), transparent 70%);
      top: -200px;
      right: -100px;
      pointer-events: none;
    }

    /* Footer */
    .landing-footer {
      position: relative;
      z-index: 1;
      border-top: 1px solid var(--border-subtle);
      padding: var(--space-xl) 0;
    }

    .footer-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      font-family: var(--font-heading);
      font-weight: 600;
      color: var(--text-secondary);
    }

    .footer-copy {
      color: var(--text-tertiary);
      font-size: 0.85rem;
    }

    @media (max-width: 768px) {
      .hero { padding: 48px 0 24px; }
      .hero-visual { height: 220px; }
      .floating-card { padding: 12px 14px; }
      .fc-amount { font-size: 1.1rem; }
      .features-grid { grid-template-columns: 1fr; }
      .cta-card { padding: var(--space-2xl); }
      .footer-inner { flex-direction: column; gap: var(--space-md); text-align: center; }
    }
  `]
})
export class LandingComponent {
  constructor(public auth: AuthService) {}
}
