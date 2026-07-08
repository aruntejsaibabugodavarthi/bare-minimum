import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <Image src="/assets/images/hero.png" alt="Bare Minimum lifestyle essentials" fill style={{ objectFit: 'cover' }} priority />
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content container">
          <div className="hero-eyebrow">Curated Essentials</div>
          <h1>Less, But<br/>Better.</h1>
          <p>Mindfully designed products for modern, intentional living. Every piece earns its place.</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/shop" className="btn btn-primary">Shop the Collection</Link>
            <Link href="/about" className="btn btn-outline-light">Our Story</Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="products-section section">
        <div className="container">
          <div className="section-header reveal">
            <h2>Featured Essentials</h2>
            <div className="divider"></div>
            <p>Our most loved pieces — each one designed with intention and crafted to last.</p>
          </div>
          <div className="product-grid" id="featured-grid">
            {/* Products will be fetched here via API */}
            <p>Loading products...</p>
          </div>
          <div className="text-center" style={{ marginTop: '3rem' }}>
            <Link href="/shop" className="btn btn-secondary reveal">View All Products</Link>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="story-section section">
        <div className="container">
          <div className="story-grid">
            <div className="story-content reveal">
              <div className="eyebrow">Our Philosophy</div>
              <h2>Designed for<br/>Intentional Living</h2>
              <p>In a world of excess, we believe in the power of restraint. Every Bare Minimum product is a distillation — stripped of the unnecessary, refined to its essence.</p>
              <p>We work with artisans who share our obsession with detail, using materials that age beautifully: Portuguese cork, Belgian linen, Japanese stoneware, and organic cotton.</p>
              <Link href="/about" className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>Read Our Story</Link>
            </div>
            <div className="story-image reveal reveal-delay-2" style={{ position: 'relative', height: '400px' }}>
              <Image src="/assets/images/brand-story.png" alt="Bare Minimum careful packaging process" fill style={{ objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="values-section section">
        <div className="container">
          <div className="section-header reveal">
            <h2 style={{ color: 'var(--cream)' }}>What We Stand For</h2>
            <div className="divider"></div>
          </div>
          <div className="values-grid">
            <div className="value-card reveal reveal-delay-1">
              <div className="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
                </svg>
              </div>
              <h4>Minimal Design</h4>
              <p>Every element earns its place. We remove the unnecessary so what remains is beautiful and functional.</p>
            </div>
            <div className="value-card reveal reveal-delay-2">
              <div className="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22c-4.97 0-9-2.69-9-6v-4"/>
                  <path d="M12 22c4.97 0 9-2.69 9-6v-4"/>
                  <ellipse cx="12" cy="6" rx="9" ry="4"/>
                  <path d="M3 6v6c0 3.31 4.03 6 9 6s9-2.69 9-6V6"/>
                </svg>
              </div>
              <h4>Sustainable Materials</h4>
              <p>Cork, linen, organic cotton, soy wax — we choose materials that tread lightly on the planet.</p>
            </div>
            <div className="value-card reveal reveal-delay-3">
              <div className="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
              </div>
              <h4>Made with Love</h4>
              <p>Small-batch production with artisans who value craft over speed and quality over quantity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-inner reveal">
            <h3>Stay in the Loop</h3>
            <p>Join our community for early access to new releases, exclusive offers, and stories about intentional living.</p>
            <form className="newsletter-form">
              <input type="email" placeholder="your@email.com" required />
              <button type="submit" className="btn btn-primary btn-sm">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
