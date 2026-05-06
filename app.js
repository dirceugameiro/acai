/* =====================
   TOAST NOTIFICATION
   ===================== */
function showToast(message, duration) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(function () { toast.classList.remove('show'); }, duration || 4000);
}

/* =====================
   NAV TOGGLE (MOBILE)
   ===================== */
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', function () {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    navLinks.classList.toggle('open', !isOpen);
  });

  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      toggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('open');
      
    });
  })
  ;
})();
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!toggle || !navLinks) return;

  document.addEventListener('click', function (e) {
    const clicouDentroMenu = navLinks.contains(e.target);
    const clicouNoBotao = toggle.contains(e.target);

    if (!clicouDentroMenu && !clicouNoBotao) {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

/* =====================
   CARRINHO
   ===================== */
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cartCount').textContent = count;
  const mobileCount = document.getElementById('mobileCartCount');
  if (mobileCount) mobileCount.textContent = count;
}

function updateCartDisplay() {
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  cartItems.innerHTML = '';
  let total = 0;
  cart.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <div class="cart-item-info">
        <div>${item.name}</div>
        <div>R$ ${(item.price * item.quantity).toFixed(2)}</div>
      </div>
      <div class="cart-item-controls">
        <button onclick="changeQuantity(${index}, -1)">-</button>
        <span>${item.quantity}</span>
        <button onclick="changeQuantity(${index}, 1)">+</button>
        <button class="remove-btn" onclick="removeFromCart(${index})">🗑️</button>
      </div>
    `;
    cartItems.appendChild(itemDiv);
    total += item.price * item.quantity;
  });
  cartTotal.textContent = total.toFixed(2);
}

function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ name, price: parseFloat(price), quantity: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  updateCartDisplay();
  showToast(`${name} adicionado ao carrinho!`);
}

function changeQuantity(index, delta) {
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  updateCartDisplay();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  updateCartDisplay();
}

function toggleCart() {
  const overlay = document.getElementById('cartOverlay');
  const sidebar = document.getElementById('cartSidebar');
  overlay.classList.toggle('active');
  sidebar.classList.toggle('active');
}

function finalizeOrder() {
  if (cart.length === 0) {
    showToast('Carrinho vazio!');
    return;
  }
  let message = 'Olá, gostaria de fazer o seguinte pedido:\n';
  cart.forEach(item => {
    message += `${item.name} x${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
  });
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  message += `Total: R$ ${total.toFixed(2)}\n`;
  message += 'Obrigado!';
  const whatsappUrl = `https://wa.me/5567996981846?text=${encodeURIComponent(message)}`; // Substitua pelo número real do WhatsApp
  window.open(whatsappUrl, '_blank');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
  updateCartDisplay();

  document.querySelectorAll('.btn-pedir').forEach(btn => {
    btn.addEventListener('click', function() {
      const card = this.closest('.produto-card');
      const name = card.dataset.name;
      const price = card.dataset.price;
      addToCart(name, price);
    });
  });

  document.getElementById('cartBtn').addEventListener('click', toggleCart);
  const mobileCartBtn = document.getElementById('mobileCartBtn');
  if (mobileCartBtn) mobileCartBtn.addEventListener('click', toggleCart);
  document.getElementById('closeCart').addEventListener('click', toggleCart);
  document.getElementById('cartOverlay').addEventListener('click', toggleCart);
  document.getElementById('finalizeOrder').addEventListener('click', finalizeOrder);
});


/* =====================
   RASPADINHA
   ===================== */
(function () {
  const canvas = document.getElementById('raspagem');
  if (!canvas) return;

  const premioEl = document.getElementById('premio');
  const ctx = canvas.getContext('2d');
  const EXPIRACAO_HORAS = 12;

  function now() { return new Date().getTime(); }

  function salvar(d) {
    try { localStorage.setItem('raspadinha_data', JSON.stringify(d)); } catch (e) { }
  }

  function carregar() {
    try {
      const d = localStorage.getItem('raspadinha_data');
      return d ? JSON.parse(d) : null;
    } catch (e) {
      return null;
    }
  }

  function limpar() {
    try { localStorage.removeItem('raspadinha_data'); } catch (e) { }
  }

  var data = carregar();

  if (data && now() > data.expira) {
    limpar();
    data = null;
  }

  if (data && data.usado) {
    canvas.style.display = 'none';
    premioEl.textContent = data.desconto + '% OFF 🎁';
    return;
  }

  var desconto;

  if (data) {
    desconto = data.desconto;
  } else {
    desconto = Math.floor(Math.random() * 11) + 5;
    data = {
      desconto: desconto,
      usado: false,
      criado: now(),
      expira: now() + (EXPIRACAO_HORAS * 60 * 60 * 1000)
    };
    salvar(data);
  }

  premioEl.textContent = desconto + '% OFF';

  ctx.fillStyle = '#bbb';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'destination-out';

  var raspando = false;
  var raspado = 0;

  canvas.addEventListener('mousedown', function () { raspando = true; });
  canvas.addEventListener('mouseup', function () { raspando = false; });
  canvas.addEventListener('mouseleave', function () { raspando = false; });
  canvas.addEventListener('mousemove', raspar);

  canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    raspando = true;
  }, { passive: false });

  canvas.addEventListener('touchend', function () { raspando = false; });

  canvas.addEventListener('touchmove', function (e) {
    e.preventDefault();
    rasparTouch(e);
  }, { passive: false });

  function raspar(e) {
    if (!raspando) return;
    var rect = canvas.getBoundingClientRect();
    desenhar(e.clientX - rect.left, e.clientY - rect.top);
  }

  function rasparTouch(e) {
    var rect = canvas.getBoundingClientRect();
    var t = e.touches[0];
    desenhar(t.clientX - rect.left, t.clientY - rect.top);
  }

  function desenhar(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    raspado++;
    if (raspado % 15 === 0) verificar();
  }

  function verificar() {
    var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    var total = pixels.length / 4;
    var transparentes = 0;
    for (var i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentes++;
    }
    if (transparentes / total > 0.28) finalizar();
  }

  function finalizar() {
    canvas.style.display = 'none';
    data.usado = true;
    salvar(data);

    var codigo = 'RASPA' + desconto;
    try { localStorage.setItem('cupom', codigo); } catch (e) { }

    setTimeout(function () {
      showToast('🎉 Você ganhou ' + desconto + '% OFF! Cupom: ' + codigo);
    }, 300);
  }
})();



/* =====================
   PARALLAX
   ===================== */
(function () {
  var elements = document.querySelectorAll('.parallax');
  var bg = document.querySelector('.bg-parallax');
  var ticking = false;

  function update() {
    var scrollY = window.scrollY;

    elements.forEach(function (el) {
      var speed = parseFloat(el.dataset.speed) || 0.3;
      el.style.transform = 'translate3d(0, ' + (scrollY * speed) + 'px, 0)';
    });

    if (bg) {
      bg.style.transform = 'translate3d(0, ' + (scrollY * 0.15) + 'px, 0)';
    }

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  });
})();
/* =====================
   SLIDER AUTO (FUNCIONA DE VERDADE)
   ===================== */
(function () {

  const slider = document.getElementById("produtosSlider");
  if (!slider) return;

  let speed = 0.5;
  let raf = null;

  let isDown = false;
  let startX = 0;
  let scrollStart = 0;

  function startLoop() {
    if (raf) return;

    function animate() {
      slider.scrollLeft += speed;

      if (slider.scrollLeft >= slider.scrollWidth / 2) {
        slider.scrollLeft = 0;
      }

      raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);
  }

  function stopLoop() {
    cancelAnimationFrame(raf);
    raf = null;
  }

  // 🔥 ESPERA TUDO (ESSA É A CHAVE)
  function initWhenReady() {

    // espera até o scrollWidth existir de verdade
    if (slider.scrollWidth <= slider.clientWidth) {
      requestAnimationFrame(initWhenReady);
      return;
    }

    // duplica só depois do layout pronto
    const content = slider.innerHTML;
    slider.innerHTML += content;

    // posiciona corretamente
    slider.scrollLeft = 0;

    // inicia autoplay
    startLoop();
  }

  // 🔥 inicia corretamente
  requestAnimationFrame(initWhenReady);

  // ===== DRAG =====
  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    stopLoop();
    startX = e.pageX;
    scrollStart = slider.scrollLeft;
  });

  slider.addEventListener("mouseup", () => {
    isDown = false;
    startLoop();
  });

  slider.addEventListener("mouseleave", () => {
    isDown = false;
    startLoop();
  });

  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const walk = (e.pageX - startX) * 1.5;
    slider.scrollLeft = scrollStart - walk;
  });

  // ===== TOUCH =====
  slider.addEventListener("touchstart", (e) => {
    stopLoop();
    startX = e.touches[0].pageX;
    scrollStart = slider.scrollLeft;
  });

  slider.addEventListener("touchend", () => {
    startLoop();
  });

  slider.addEventListener("touchmove", (e) => {
    const walk = (e.touches[0].pageX - startX) * 1.5;
    slider.scrollLeft = scrollStart - walk;
  });

})();

//mostrar mapa
function mostrarMapa(local) {
  const mapa = document.getElementById("mapaFrame");
  const container = document.getElementById("mapa-container");

  const url = `https://www.google.com/maps?q=${encodeURIComponent(local)}&output=embed`;

  mapa.src = url;
  container.style.display = "block";

  // scroll suave até o mapa (UX top)
  container.scrollIntoView({ behavior: "smooth" });
}
