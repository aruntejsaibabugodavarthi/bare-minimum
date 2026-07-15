import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="nav" id="main-nav">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          <span className="dot"></span>
          Bare Minimum
        </Link>
        <div className="nav-links" id="nav-links">
          <Link href="/shop">Shop</Link>
          <Link href="/about">About</Link>
          <Link href="/account">My Account</Link>
          <Link href="/cart" className="nav-cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <span className="cart-badge">0</span>
          </Link>
        </div>
        <div className="nav-toggle" id="nav-toggle">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
}
