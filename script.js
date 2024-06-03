// Get elements
const cartButton = document.querySelector(".cart-button");
const cartBadge = document.querySelector(".cart-badge");
const modal = document.querySelector(".modal");
const modalClose = document.querySelector(".close");
const buyButton = document.querySelector(".buy-btn");
const cartItemsList = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const itemsGrid = document.querySelector(".items-grid");
const searchBar = document.getElementById("search-bar");
const addFunds = document.getElementById("add-funds");
const addmodalClose = document.querySelector(".add-close");
const addmodal = document.querySelector(".add-modal");
const addBar = document.getElementById("add-bar");
const addButton = document.getElementById("add-button");

var walletObj = document.getElementById("wallet");
var walletAmount = 0;
walletObj.innerHTML = intToString(walletAmount);

var message = document.getElementById("message");

let items = [];

async function fetchItems() {
  try {
    const response = await fetch("database.php"); // Adjust the path as needed
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
  }
}

// Immediately Invoked Function Expression (IIFE) to fetch items before anything else
(async function initialize() {
  console.log("Before fetchItems");

  items = await fetchItems();

  console.log("Items fetched and stored:", items);

  // Place any code that depends on items being fetched here
  console.log("After items have been fetched");

  fillItemsGrid(); // Fill the items grid with fetched items

  // Set up event listeners after items are fetched
  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      // Find the item name associated with the button
      const itemName = event.target.dataset.name;

      // Add the selected item to the cart
      addToCart(itemName);
    });
  });

  // Other code that depends on items being fetched
})();

let cart = [];
let emptyCart = [];

console.log(items);

function fillItemsGrid() {
  for (const item of items) {
    let itemElement = document.createElement("div");
    itemElement.classList.add("item");
    itemElement.innerHTML = `
      <img src="imgs/${item.name}.jpg" alt="${item.name}">
      <h2>${item.name}</h2>
      <p>$${item.price.toLocaleString()}</p>
      <button class="add-to-cart-btn" data-name="${
        item.name
      }">Add to cart</button>
    `;
    itemsGrid.appendChild(itemElement);
  }
}

function updateCartBadge() {
  cartBadge.textContent = cart.length;
}

function addToCart(itemName) {
  const selectedItem = items.find((item) => item.name === itemName);
  if (selectedItem) {
    cart.push(selectedItem);
    updateCartBadge();
  } else {
    console.error("Item not found.");
  }
}

function intToString(v) {
  return `$${v.toLocaleString()}`;
}

function displayCartItems() {
  cartItemsList.innerHTML = "";

  const itemCounts = {};

  cart.forEach((item) => {
    if (itemCounts[item.name]) {
      itemCounts[item.name]++;
    } else {
      itemCounts[item.name] = 1;
    }
  });

  Object.entries(itemCounts).forEach(([itemName, quantity]) => {
    const li = document.createElement("li");
    const item = items.find((item) => item.name === itemName);
    if (quantity > 1) {
      li.innerHTML = `
        ${itemName} ${
        quantity > 1 ? `x${quantity}` : ""
      } - $${item.price.toLocaleString()}
        <div class="delete-btn-div">
          <button class="delete-single-btn" data-name="${itemName}">Delete Single</button>
          <button class="delete-all-btn" data-name="${itemName}">Delete All</button>
        </div>
      `;
    } else {
      li.innerHTML = `
        ${itemName} ${
        quantity > 1 ? `x${quantity}` : ""
      } - $${item.price.toLocaleString()}
        <button class="delete-single-btn" data-name="${itemName}">Delete</button>
      `;
    }
    cartItemsList.appendChild(li);
  });

  // Ensure totalPrice is calculated correctly as a number
  const totalPrice = cart.reduce((acc, item) => acc + Number(item.price), 0);
  cartTotal.textContent = `$${totalPrice.toLocaleString()}`;

  // Add event listeners to delete buttons
  const deleteSingleButtons = document.querySelectorAll(".delete-single-btn");
  deleteSingleButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      const itemName = event.target.dataset.name;
      deleteSingleItem(itemName);
      displayCartItems();
    });
  });

  const deleteAllButtons = document.querySelectorAll(".delete-all-btn");
  deleteAllButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      const itemName = event.target.dataset.name;
      deleteAllItems(itemName);
      displayCartItems();
    });
  });
}

function deleteSingleItem(itemName) {
  const index = cart.findIndex((item) => item.name === itemName);
  if (index !== -1) {
    cart.splice(index, 1);
    updateCartBadge();
  }
}

function deleteAllItems(itemName) {
  cart = cart.filter((item) => item.name !== itemName);
  updateCartBadge();
}

function isQuantityOK() {
  const itemCounts = {};

  cart.forEach((item) => {
    if (itemCounts[item.name]) {
      itemCounts[item.name]++;
    } else {
      itemCounts[item.name] = 1;
    }
  });

  const outOfStockItems = [];

  for (const [itemName, quantity] of Object.entries(itemCounts)) {
    const item = items.find((item) => item.name === itemName);
    if (item && item.stock < quantity) {
      outOfStockItems.push(itemName);
    }
  }

  if (outOfStockItems.length > 0) {
    const messageText = `Not enough stock for ${outOfStockItems.join(", ")}`;
    message.innerText = messageText;
    setTimeout(() => (message.innerText = ""), 3000);
    return false;
  }

  return true;
}

searchBar.addEventListener("input", function () {
  const searchTerm = searchBar.value.trim().toLowerCase();

  // Iterate through item elements
  itemsGrid.querySelectorAll(".item").forEach((itemElement) => {
    const itemName = itemElement.querySelector("h2").textContent.toLowerCase();

    if (itemName.includes(searchTerm)) {
      itemElement.style.display = "block";
    } else {
      itemElement.style.display = "none";
    }
  });
});

cartButton.addEventListener("click", function () {
  // Display cart items
  displayCartItems();

  modal.classList.toggle("show-modal");
});

modalClose.addEventListener("click", function () {
  modal.classList.toggle("show-modal");
});

buyButton.addEventListener("click", function () {
  if (!isQuantityOK()) {
    modal.classList.toggle("show-modal");
    return;
  }

  const totalPrice = cart.reduce((acc, item) => acc + Number(item.price), 0);
  if (totalPrice > walletAmount) {
    modal.classList.toggle("show-modal");

    msgAfterFailedPurchase();
  } else if (cart.length === 0) {
    msgAfterEmtpyCart();
    modal.classList.toggle("show-modal");
  } else {
    cart = [];
    modal.classList.toggle("show-modal");
    walletAmount -= totalPrice;
    walletObj.innerHTML = intToString(walletAmount);

    msgAfterPurchase(totalPrice);
  }
});

function msgAfterPurchase(value) {
  message.innerText = `-${intToString(value)}`;
  setTimeout(() => (message.innerText = "Thank you for your purchase!"), 2000);
  setTimeout(() => (message.innerText = ""), 4000);
}

function msgAfterFailedPurchase() {
  message.innerText = "Insufficient funds.";
  setTimeout(() => (message.innerText = ""), 3000);
}

function msgAfterEmtpyCart() {
  message.innerText = "Cart is empty.";
  setTimeout(() => (message.innerText = ""), 3000);
}

addFunds.addEventListener("click", function () {
  addmodal.classList.toggle("show-modal");
});

addmodalClose.addEventListener("click", function () {
  addmodal.classList.toggle("show-modal");
});

addButton.addEventListener("click", function () {
  var value = parseInt(addBar.value);
  if (value != 0) {
    walletAmount += value;
    walletObj.innerHTML = intToString(walletAmount);
    addBar.value = "";
    addmodal.classList.toggle("show-modal");

    message.innerText = `${intToString(value)} has been added to your account`;

    setTimeout(() => (message.innerText = ""), 2000);
  } else {
    addmodal.classList.toggle("show-modal");
  }
});
