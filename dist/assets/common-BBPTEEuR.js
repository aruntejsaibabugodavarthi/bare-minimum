var e=(e,t,n)=>()=>{if(n)throw n[0];try{return e&&(t=e(e=0)),t}catch(e){throw n=[e],e}},t=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports);(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function n(e){let t=document.querySelector(`.toast`);t&&t.remove();let n=document.createElement(`div`);n.className=`toast`,n.innerHTML=DOMPurify.sanitize(`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
    <span>${e}</span>
  `),document.body.appendChild(n),requestAnimationFrame(()=>{requestAnimationFrame(()=>{n.classList.add(`show`)})}),setTimeout(()=>{n.classList.remove(`show`),setTimeout(()=>n.remove(),400)},2500)}function r(){let e=document.querySelector(`.nav`);window.addEventListener(`scroll`,()=>{window.scrollY>50?e.classList.add(`scrolled`):e.classList.remove(`scrolled`)},{passive:!0});let t=document.querySelector(`.nav-toggle`),n=document.querySelector(`.nav-links`);t&&n&&(t.addEventListener(`click`,()=>{t.classList.toggle(`active`),n.classList.toggle(`open`),document.body.style.overflow=n.classList.contains(`open`)?`hidden`:``}),n.querySelectorAll(`a`).forEach(e=>{e.addEventListener(`click`,()=>{t.classList.remove(`active`),n.classList.remove(`open`),document.body.style.overflow=``})}))}function i(){let e=document.getElementById(`nav-links`);if(!e)return;let t=document.createElement(`div`);t.className=`nav-search`,t.innerHTML=DOMPurify.sanitize(`
    <div class="search-input-wrapper">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input type="text" id="global-search" placeholder="Search..." autocomplete="off">
    </div>
    <div id="search-results" class="search-results-overlay"></div>
  `);let n=e.querySelector(`.nav-cart`);n?e.insertBefore(t,n):e.appendChild(t);let r=document.getElementById(`global-search`),i=document.getElementById(`search-results`);r.addEventListener(`input`,e=>{let t=e.target.value.toLowerCase().trim();if(!t){i.classList.remove(`visible`);return}let n=l.filter(e=>e.name.toLowerCase().includes(t)||e.category.toLowerCase().includes(t)||e.description.toLowerCase().includes(t)).slice(0,5);n.length>0?i.innerHTML=DOMPurify.sanitize(n.map(e=>`
        <a href="product.html?id=${e.id}" class="search-result-item">
          <img src="${e.image}" alt="${e.name}" loading="lazy">
          <div class="search-result-info">
            <div class="search-result-name">${e.name}</div>
            <div class="search-result-price">₹${e.price}</div>
          </div>
        </a>
      `).join(``)):i.innerHTML=DOMPurify.sanitize(`<div class="search-result-empty">No products found.</div>`),i.classList.add(`visible`)}),document.addEventListener(`click`,e=>{t.contains(e.target)||i.classList.remove(`visible`)})}function a(){let e=document.querySelectorAll(`.reveal`);if(!e.length)return;let t=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting&&(e.target.classList.add(`visible`),t.unobserve(e.target))})},{threshold:.1,rootMargin:`0px 0px -60px 0px`});e.forEach(e=>t.observe(e))}function o(){let e=document.querySelector(`.newsletter-form`);e&&e.addEventListener(`submit`,t=>{t.preventDefault();let r=e.querySelector(`input`);r&&r.value.trim()&&(n(`Welcome to the Bare Minimum community!`),r.value=``)})}function s(){let e=document.getElementById(`nav-links`);if(e){let t=p.getCurrentUser(),n=document.createElement(`div`);if(n.className=`nav-auth`,t){(t.name||t.email||t.phone||`U`).charAt(0).toUpperCase();let e=t.role===`admin`?`<a href="admin.html" class="nav-admin">Dashboard</a>`:``;n.innerHTML=DOMPurify.sanitize(`
        ${e}
        <a href="account.html" class="nav-avatar" title="My Account">
          <span class="avatar-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
        </a>
        <a href="#" onclick="event.preventDefault(); auth.logout();" class="auth-link">Logout</a>
      `)}else n.innerHTML=DOMPurify.sanitize(`
        <a href="login.html" class="auth-link">Login</a>
      `);e.appendChild(n)}let t=document.getElementById(`otp-request-form`),r=document.getElementById(`otp-verify-form`),i=document.getElementById(`email-login-form`),a=document.getElementById(`btn-google-login`),o=``;t&&t.addEventListener(`submit`,async e=>{e.preventDefault(),o=document.getElementById(`phone-number`).value.trim();let i=crypto.randomUUID();try{let e=await(await fetch(`/api/auth/request-otp`,{method:`POST`,headers:{"Content-Type":`application/json`,"Idempotency-Key":i},body:JSON.stringify({phone:o})})).json();e.success?(n(`OTP Sent! (Check SMS)`),t.style.display=`none`,r.style.display=`block`):n(e.message||`Failed to send OTP`)}catch{n(`Failed to connect to server`)}}),r&&r.addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`otp-code`).value.trim();try{let e=await(await fetch(`/api/auth/verify-otp`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({phone:o,otp:t})})).json();e.success?(p.setSession({accessToken:e.accessToken,refreshToken:e.refreshToken},e.user),e.new_user?window.location.href=`account.html`:window.location.href=`index.html`):n(e.message||`Invalid OTP`)}catch{n(`Failed to connect to server`)}}),i&&i.addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`email-addr`).value.trim(),r=document.getElementById(`password`).value.trim();try{let e=await(await fetch(`/api/auth/login-password`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({email:t,password:r})})).json();e.success?(p.setSession({accessToken:e.accessToken,refreshToken:e.refreshToken},e.user),window.location.href=`index.html`):n(e.message)}catch{n(`Failed to connect to server`)}}),a&&a.addEventListener(`click`,async e=>{e.preventDefault();let t=prompt(`MOCK OAUTH: Enter email to simulate google login returning:`);if(t)try{let e=await(await fetch(`/api/auth/social-login`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({email:t,name:t.split(`@`)[0],provider:`google`,providerId:`g_`+Math.random().toString(36).substr(2)})})).json();e.success?(p.setSession({accessToken:e.accessToken,refreshToken:e.refreshToken},e.user),window.location.href=`index.html`):n(e.message)}catch{n(`Failed to connect to server`)}})}function c(){document.body.insertAdjacentHTML(`beforeend`,`
    <div class="support-widget" id="support-widget">
      <div class="support-panel" id="support-panel">
        <div class="support-panel-header">
          <h4>Customer Support</h4>
          <p>We typically reply in a few minutes.</p>
        </div>
        <div class="support-panel-body">
          <p>Hi there! How can we help you today?</p>
          <a href="mailto:support@bareminimum.example.com" class="btn btn-primary btn-sm" style="width: 100%; text-decoration: none;">Send us an Email</a>
          <p style="margin-top: 1rem; font-size: 0.8rem; color: #888;">Or call us at 1-800-555-BARE<br>(Mon-Fri 9am-5pm PST)</p>
        </div>
      </div>
      <button class="support-toggle" id="support-toggle" aria-label="Toggle support chat">
        <svg class="icon-chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <svg class="icon-close" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `);let e=document.getElementById(`support-toggle`),t=document.getElementById(`support-panel`);e&&t&&e.addEventListener(`click`,()=>{e.classList.toggle(`active`),t.classList.toggle(`open`)})}var l,u,d,f,p,m,h=e((()=>{l=[],u=class{constructor(){this.items=JSON.parse(localStorage.getItem(`bm_cart`))||[],this.updateBadge()}save(){localStorage.setItem(`bm_cart`,JSON.stringify(this.items)),this.updateBadge()}addItem(e,t=1,r=``){let i=this.items.find(t=>t.productId===e&&t.color===r);i?i.quantity+=t:this.items.push({productId:e,quantity:t,color:r}),this.save(),n(`Added to cart`)}removeItem(e){this.items.splice(e,1),this.save()}updateQuantity(e,t){if(t<=0){this.removeItem(e);return}this.items[e].quantity=t,this.save()}getTotal(){return this.items.reduce((e,t)=>{let n=l.find(e=>e.id===t.productId);return e+(n?n.price*t.quantity:0)},0)}getTax(){return this.items.reduce((e,t)=>{let n=l.find(e=>e.id===t.productId);if(n&&n.gstSlab){let r=n.gstSlab/100,i=n.price/(1+r);return e+(n.price-i)*t.quantity}return e},0)}getItemCount(){return this.items.reduce((e,t)=>e+t.quantity,0)}clear(){this.items=[],this.save()}updateBadge(){let e=document.querySelectorAll(`.cart-badge`),t=this.getItemCount();e.forEach(e=>{e.textContent=t,e.classList.toggle(`visible`,t>0)})}},d=new u,f=class{constructor(){this.token=localStorage.getItem(`bm_access_token`),this.refreshToken=localStorage.getItem(`bm_refresh_token`),this.user=JSON.parse(localStorage.getItem(`bm_user`))||null}setSession(e,t){this.token=e.accessToken,this.refreshToken=e.refreshToken,this.user=t,localStorage.setItem(`bm_access_token`,this.token),localStorage.setItem(`bm_refresh_token`,this.refreshToken),localStorage.setItem(`bm_user`,JSON.stringify(t))}async logout(){if(this.refreshToken)try{await fetch(`/api/auth/logout`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({refreshToken:this.refreshToken})})}catch(e){console.error(`Logout error`,e)}this.token=null,this.refreshToken=null,this.user=null,localStorage.removeItem(`bm_access_token`),localStorage.removeItem(`bm_refresh_token`),localStorage.removeItem(`bm_user`),n(`Logged out`),setTimeout(()=>location.reload(),500)}async fetchWithAuth(e,t={}){if(!this.token){window.location.href=`login.html`;return}t.headers=t.headers||{},t.headers.Authorization=`Bearer ${this.token}`;let n=await fetch(e,t);if(n.status===401&&this.refreshToken){let r=await fetch(`/api/auth/refresh`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({refreshToken:this.refreshToken})});if(r.ok){let i=await r.json();this.setSession({accessToken:i.accessToken,refreshToken:i.refreshToken},this.user),t.headers.Authorization=`Bearer ${this.token}`,n=await fetch(e,t)}else this.logout()}return n}getCurrentUser(){return this.user}},p=new f,m=class{constructor(){this.storageKey=`bm_consent`,this.consentState=JSON.parse(localStorage.getItem(this.storageKey)),this.init()}init(){this.consentState||setTimeout(()=>this.showBanner(),1e3)}showBanner(){if(document.getElementById(`consent-banner`))return;let e=document.createElement(`div`);e.id=`consent-banner`,e.style.cssText=`
      position: fixed;
      bottom: 0; left: 0; right: 0;
      background: #111;
      color: #fff;
      padding: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: 0 -4px 12px rgba(0,0,0,0.15);
      animation: slideUp 0.5s ease-out;
    `,e.innerHTML=DOMPurify.sanitize(`
      <div class="container" style="display: flex); flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem;">
        <div style="flex: 1 1 300px;">
          <h4 style="margin: 0 0 0.5rem; color: #fff; font-size: 1.1rem;">We Value Your Privacy (DPDP Act 2023)</h4>
          <p style="margin: 0; font-size: 0.9rem; color: #ccc; line-height: 1.5;">
            We process personal data to fulfill orders, ensure security, and improve your experience. 
            By clicking "Accept All", you consent to our <a href="privacy.html" style="color: var(--copper); text-decoration: underline;">Privacy Policy</a>.
          </p>
        </div>
        <div style="display: flex; gap: 1rem;">
          <button id="btn-accept-consent" class="btn btn-primary btn-sm" style="background: var(--copper); border-color: var(--copper); padding: 0.5rem 1.5rem;">Accept All</button>
        </div>
      </div>
    `);let t=document.createElement(`style`);t.textContent=`
      @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
    `,document.head.appendChild(t),document.body.appendChild(e),document.getElementById(`btn-accept-consent`).addEventListener(`click`,()=>{this.accept(),e.style.transform=`translateY(100%)`,e.style.transition=`transform 0.3s ease-in`,setTimeout(()=>e.remove(),300)})}accept(){this.consentState={essential:!0,timestamp:new Date().toISOString()},localStorage.setItem(this.storageKey,JSON.stringify(this.consentState))}},document.addEventListener(`DOMContentLoaded`,async()=>{try{let e=await(await fetch(`/api/products`)).json();e.success&&(l=e.products.map(e=>({...e,id:e.slug,image:e.images[0],variants:[{id:e.slug+`-v1`,size:`Standard`,color:`Standard`,stock:e.inventoryCount}],isNew:!0,isFeatured:!0,rating:4.5,reviewCount:10,reviews:[]})))}catch(e){console.error(`Error fetching products:`,e)}s(),r(),i(),c(),o(),a(),new m})}));export{t as a,h as i,p as n,d as r,l as t};