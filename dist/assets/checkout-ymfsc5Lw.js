import{a as e,i as t,n,r,t as i}from"./common-BBPTEEuR.js";/* empty css              */var a=e((()=>{t();function e(){let e=document.getElementById(`checkout-summary`);if(!e)return;function t(){if(r.items.length===0){e.innerHTML=DOMPurify.sanitize(`<p>Your cart is empty. <a href="shop.html">Return to shop</a>.</p>`);return}let t=r.getTotal(),n=t>=6e3?0:500,a=Math.round(r.getTax()*100)/100,o=t+n;e.innerHTML=DOMPurify.sanitize(`
      <h3 style="font-size: 1.25rem); margin-bottom: 1.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">Order Summary</h3>
      <div class="checkout-items" style="margin-bottom: 1.5rem;">
        ${r.items.map(e=>{let t=i.find(t=>t.id===e.productId);return t?`
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center;">
              <div style="position: relative;">
                <img src="${t.image}" alt="${t.name}" style="width: 64px; height: 64px; object-fit: cover; border-radius: 6px; border: 1px solid #eee;" loading="lazy">
                <span style="position: absolute; top: -8px; right: -8px; background: #666; color: #fff; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">${e.quantity}</span>
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 500; font-size: 0.95rem;">${t.name}</div>
                ${e.color?`<div style="font-size: 0.8rem; color: #666;">${e.color}</div>`:``}
              </div>
              <div style="font-weight: 500;">₹${(t.price*e.quantity).toFixed(2)}</div>
            </div>
          `:``}).join(``)}
      </div>
      <div style="border-top: 1px solid #eee; padding-top: 1rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.95rem;">
          <span style="color: #555;">Subtotal</span>
          <span>₹${t.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.95rem;">
          <span style="color: #555;">Included GST</span>
          <span>₹${a.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.95rem;">
          <span style="color: #555;">Shipping</span>
          <span>${n===0?`Free`:`₹`+n.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-top: 1px solid #eee; padding-top: 1rem; font-weight: 600; font-size: 1.25rem;">
          <span>Total</span>
          <span>₹${o.toFixed(2)}</span>
        </div>
      </div>
    `)}t();let a=document.getElementById(`checkout-form`),o=document.getElementById(`checkout-pincode`),s=document.getElementById(`checkout-city`),c=document.getElementById(`checkout-state`),l=document.getElementById(`serviceability-msg`),u=!1;o&&o.addEventListener(`input`,async e=>{let t=e.target.value.trim();if(t.length===6){l.textContent=`Checking serviceability...`,l.style.color=`#666`;try{let e=await(await fetch(`/api/logistics/pincode/${t}`)).json();if(e.success)if(s.value=e.city,c.value=e.state,u=e.serviceable,u){let t=new Date(e.estimatedMin).toLocaleDateString(),n=new Date(e.estimatedMax).toLocaleDateString();l.textContent=`Serviceable! Delivery estimated between ${t} and ${n}.`,l.style.color=`green`}else l.textContent=`Sorry, we do not deliver to this pincode at the moment.`,l.style.color=`red`;else u=!1,s.value=``,c.value=``,l.textContent=`Invalid pincode.`,l.style.color=`red`}catch{l.textContent=`Error checking pincode.`,l.style.color=`red`}}else s.value=``,c.value=``,l.textContent=``,u=!1}),a&&a.addEventListener(`submit`,async e=>{e.preventDefault();let t=document.querySelector(`.payment-tab.active`),i=t?t.dataset.target:`card`,a=document.getElementById(`checkout-email`);document.getElementById(`checkout-phone`);let l=a?a.value:``,d=n.getCurrentUser(),f=r.getTotal(),p=f>=6e3?0:500;if(Math.round(r.getTax()*100)/100,f+p,!u){alert(`Please enter a serviceable pincode to proceed.`);return}if(i===`cod`&&(!d||!d.is_verified)){alert(`Cash on Delivery is only available for verified accounts. Please log in with a verified phone number.`);return}let m={address1:document.getElementById(`checkout-address1`)?document.getElementById(`checkout-address1`).value:``,address2:document.getElementById(`checkout-address2`)?document.getElementById(`checkout-address2`).value:``,landmark:document.getElementById(`checkout-landmark`)?document.getElementById(`checkout-landmark`).value:``,city:s?s.value:``,state:c?c.value:``,pincode:o?o.value:``};try{let e=await(await window.auth.fetchWithAuth(`/api/orders`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({paymentMethod:i,contact:l,address:m,items:r.items.map(e=>({productId:e.productId,quantity:e.quantity}))})})).json();if(!e.success){alert(`Failed to initialize order: `+(e.message||`Server error`));return}if(i===`cod`){alert(`Order placed successfully (Cash on Delivery)!`),r.clear(),window.location.href=`invoice.html?id=`+e.orderId;return}else{alert(`Order placed successfully! (Note: Payment Gateway is in Sandbox mode)`),r.clear(),window.location.href=`invoice.html?id=`+e.orderId;return}let t={key:e.keyId,amount:e.amount,currency:e.currency,name:`Bare Minimum`,description:`Curated Essentials`,order_id:e.orderId,handler:async function(t){(await(await fetch(`/verify-payment`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({razorpay_payment_id:t.razorpay_payment_id,razorpay_order_id:t.razorpay_order_id,razorpay_signature:t.razorpay_signature})})).json()).success?(alert(`Payment successful! Order placed.`),r.clear(),window.location.href=`invoice.html?id=`+e.orderId):alert(`Payment verification failed. Please contact support.`)},prefill:{name:`Test User`,email:`test@bareminimum.example.com`,contact:`9999999999`},theme:{color:`#c49a6c`}},n=new window.Razorpay(t);n.on(`payment.failed`,function(e){alert(`Payment Failed: `+e.error.description)}),n.open()}catch(e){console.error(e),alert(`An error occurred while connecting to the payment gateway.`)}})}document.addEventListener(`DOMContentLoaded`,()=>{setTimeout(e,100)})}));t(),a();