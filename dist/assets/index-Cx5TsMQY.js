import{a as e,i as t,n,t as r}from"./common-BBPTEEuR.js";/* empty css              */var i=e((()=>{t();function e(){let e=document.getElementById(`featured-grid`);if(!e)return;let t=r.filter(e=>e.isFeatured);e.innerHTML=DOMPurify.sanitize(t.map((e,t)=>`
    <a href="product.html?id=${e.id}" class="product-card reveal reveal-delay-${t+1}" id="featured-${e.id}">
      <div class="product-card-image">
        ${e.isNew?`<span class="badge-new">New</span>`:``}
        ${n.getCurrentUser()&&n.getCurrentUser().role===`admin`?`<div class="admin-edit-badge" onclick="event.preventDefault()); showToast(&apos;Admin Edit Mode&apos;)">Edit</div>`:``}
        <img src="${e.image}" alt="${e.name}" loading="lazy">
        <div class="product-card-overlay">
          <span class="btn btn-sm btn-outline-light">View Details</span>
        </div>
      </div>
      <div class="product-card-body">
        <div class="product-card-category">${e.category}</div>
        <div class="product-card-name">${e.name}</div>
        <div class="product-card-price">₹${e.price}</div>
      </div>
      </div>
    </a>
  `).join(``))}document.addEventListener(`DOMContentLoaded`,()=>{setTimeout(e,100)})}));t(),i();