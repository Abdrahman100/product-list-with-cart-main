const productItems = document.querySelectorAll(".product-item");

let articlepush = []; // لتخزين عناصر السلة المضافة

// عناصر التأكيد
const confirmBtn = document.getElementById("checkout");
const textTotal = document.getElementById("textTotal");
const itemConfirmContainer = document.getElementById("itemConfirm");
const hiddencartconfirm = document.getElementById("confirm-orderCart");
const startNewOrder = document.getElementById("startNewOrder");
const OrderTotalConfirm = document.querySelector(".OrderTotalConfirm");

// عناصر السلة العامة
const NamderOrder = document.getElementById("NamderOrder");
const noOrderMessage = document.querySelector(".no-order");
const orderCart = document.querySelector(".order");
const totalprice = document.getElementById("Total");

// في البداية، السلة فارغة
NamderOrder.textContent = 0;
totalprice.textContent = "$0.00";

// حلقة لكل منتج
productItems.forEach((item, index) => {
  const quantityControls = item.querySelector(".cart-minus-plus");
  const addToCartBtn = item.querySelector(".add-to-cart");
  const incrementBtn = item.querySelector(".decerment");
  const decrementBtn = item.querySelector(".increment");
  const quantity = item.querySelector(".quantity-item");

  // المتغيرات الخاصة بكل منتج (نخزنها في العنصر نفسه)
  item.numProduct = 1;
  item.currentProduct = null;
  item.currentItem = null;

  // زر "أضف إلى السلة"
  addToCartBtn.addEventListener("click", async () => {
    try {
      const response = await fetch("data.json");
      if (!response.ok) throw new Error("فشل تحميل البيانات");

      const data = await response.json();
      item.currentProduct = data[index];

      if (!item.currentItem) {
        item.numProduct = 1;
        item.currentItem = addItem(item, item.currentProduct);
      }
    } catch (error) {
      console.error("خطأ أثناء جلب البيانات:", error);
    }
  });

  // زيادة الكمية
  incrementBtn.addEventListener("click", () => {
    if (item.currentProduct && item.currentItem) {
      item.numProduct++;
      updateItemTotal(item, item.currentProduct);
    }
    updateTotal();
  });

  // تقليل الكمية
  decrementBtn.addEventListener("click", () => {
    if (item.currentProduct && item.currentItem) {
      item.numProduct--;
      updateItemTotal(item, item.currentProduct);
    }
    updateTotal();
  });

  // دالة إضافة منتج إلى السلة
  function addItem(item, product) {
    const cartContainer = document.querySelector(".cart-container");
    const existingItems = document.querySelectorAll(".cart-items");

    quantityControls.classList.remove("active");
    noOrderMessage.classList.add("active");
    orderCart.classList.add("active");

    const productPrice = Number(product.price).toFixed(2);
    const itemTotal = (item.numProduct * productPrice).toFixed(2);

    let article = document.createElement("article");
    article.classList.add("cart-items");
    article.dataset.image = product.image.thumbnail;

    article.innerHTML = `
      <span class="cart-quantity">
        <p class="name-cart">${product.name}</p>
        <span class="quantity">${item.numProduct}x</span>
        <span class="each-item">@$${productPrice}</span>
        <span class="item-total">$${itemTotal}</span>
      </span>
      <button class="remov" aria-label="إزالة المنتج من السلة">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
          <path fill="currentColor" d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"/>
        </svg>
      </button>
    `;

    articlepush.push(article);
    cartContainer.appendChild(article);
    updateTotal();

    NamderOrder.textContent = existingItems.length + 1;

    const removeBtn = article.querySelector(".remov");
    removeBtn.addEventListener("click", () => {
      article.remove();
      quantityControls.classList.add("active");
      item.currentItem = null;
      updateCartCountAfterRemove();
      updateTotal();
    });

    return article;
  }

  // تحديث الكمية الإجمالية والسعر
  function updateItemTotal(item, product) {
    const productPrice = Number(product.price).toFixed(2);
    const itemTotal = (item.numProduct * productPrice).toFixed(2);

    if (item.numProduct === 0) {
      item.currentItem.remove();
      item.currentItem = null;
      item.numProduct = 1;
      quantityControls.classList.add("active");
      updateCartCountAfterRemove();
      return;
    }

    const quantitySpan = item.currentItem.querySelector(".quantity");
    const totalSpan = item.currentItem.querySelector(".item-total");

    quantitySpan.textContent = `${item.numProduct}x`;
    totalSpan.textContent = `$${itemTotal}`;
    quantity.textContent = item.numProduct;
  }
});

// تحديث المجموع النهائي في السلة
function updateTotal() {
  const totalitem = document.querySelectorAll(".item-total");
  let total = 0;
  totalitem.forEach((item) => {
    total += parseFloat(item.textContent.replace("$", ""));
  });
  totalprice.textContent = `$${total.toFixed(2)}`;
}

// تحديث عدد الطلبات بعد الحذف
function updateCartCountAfterRemove() {
  const items = document.querySelectorAll(".cart-items");
  NamderOrder.textContent = items.length;

  if (items.length === 0) {
    noOrderMessage.classList.remove("active");
    orderCart.classList.remove("active");
  }
}

// زر تأكيد الطلب
confirmBtn.addEventListener("click", () => {
  const cartItems = document.querySelectorAll(".cart-items");
  itemConfirmContainer.innerHTML = "";
  textTotal.innerHTML = "";

  let total = 0;

  cartItems.forEach((item) => {
    const name = item.querySelector(".name-cart").textContent;
    const quantity = item.querySelector(".quantity").textContent;
    const priceText = item
      .querySelector(".each-item")
      .textContent.replace("@$", "")
      .trim();
    const price = parseFloat(priceText).toFixed(2);
    const totalItemPrice = parseFloat(price) * parseInt(quantity);
    const imageSrc = item.dataset.image;

    total += totalItemPrice;

    const itemHTML = `
      <div class="your-order">
        <figure class="imag-order">
          <img src="${imageSrc}" alt="image" />
        </figure>
        <span class="cart-quantityConfirm">
          <p class="name-cartConfirm">${name}</p>
          <span class="quantityConfirm">${quantity}</span>
          <span class="each-itemConfirm">@ $${price}</span>
        </span>
        <span class="item-totalConfirm">$${totalItemPrice.toFixed(2)}</span>
      </div>
    `;

    itemConfirmContainer.innerHTML += itemHTML;
  });

  textTotal.innerHTML += `
    <p class="OrderTotalConfirm">
      Order Total <span class="TotalConfirm">$${total.toFixed(2)}</span>
    </p>
  `;

  hiddencartconfirm.classList.remove("hidden");
});

// زر بدء طلب جديد
startNewOrder.addEventListener("click", () => {
  // إخفاء نافذة التأكيد
  hiddencartconfirm.classList.add("hidden");
  window.scroll(0, 0);

  // حذف التأكيد
  itemConfirmContainer.innerHTML = "";
  textTotal.innerHTML = "";

  // حذف عناصر السلة
  articlepush.forEach((article) => article.remove());
  articlepush.length = 0;

  // إعادة المنتجات لحالتها الأصلية
  productItems.forEach((item) => {
    const quantityControls = item.querySelector(".cart-minus-plus");
    const quantity = item.querySelector(".quantity-item");

    quantityControls.classList.add("active");
    quantity.textContent = "1";

    item.numProduct = 1;
    item.currentProduct = null;
    item.currentItem = null;
  });

  NamderOrder.textContent = 0;
  totalprice.textContent = "$0.00";
  noOrderMessage.classList.remove("active");
  orderCart.classList.remove("active");
});
