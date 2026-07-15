import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="dot"></span>
              Bare Minimum
            </div>
            <p>Curated essentials for modern, intentional living. Less, but better.</p>
            <div
              className="contact-info"
              style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}
            >
              <strong>Support:</strong>{' '}
              <a
                href="mailto:support@bareminimum.example.com"
                style={{ color: '#333', textDecoration: 'underline' }}
              >
                support@bareminimum.example.com
              </a>
              <br />
              <strong>Phone:</strong> 1-800-555-BARE
              <br />
              <strong>Hours:</strong> Mon-Fri, 9am - 5pm PST
            </div>
            <div className="footer-social">
              <a href="#" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="#" aria-label="Pinterest">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 21c1-3 2-5 3-8 0 0-.5-1-.5-2.5C10.5 9 11 8 12 8s1.5.5 1.5 1.5c0 1-.7 2.5-1 3.5-.3 1 .3 2 1.5 2 2.5 0 4-3 4-6 0-3-2.5-5-5.5-5S7 7 7 10c0 1 .5 2 1 2.5" />
                </svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4l11.7 16H20L8.3 4H4z" />
                  <path d="M4 20l6.8-8M13.2 12L20 4" />
                </svg>
              </a>
            </div>
          </div>
          <div className="footer-column">
            <h5>Shop</h5>
            <Link href="/shop">All Products</Link>
            <Link href="/shop">Drinkware</Link>
            <Link href="/shop">Bags</Link>
            <Link href="/shop">Stationery</Link>
            <Link href="/shop">Home</Link>
          </div>
          <div className="footer-column">
            <h5>Company</h5>
            <Link href="/about">About</Link>
            <Link href="#">Journal</Link>
            <Link href="#">Sustainability</Link>
            <Link href="#">Careers</Link>
          </div>
          <div className="footer-column">
            <h5>Support</h5>
            <Link href="#">Contact</Link>
            <Link href="#">FAQ</Link>
            <Link href="#">Shipping</Link>
            <Link href="#">Returns</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Bare Minimum. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link href="/admin">Admin Portal</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
