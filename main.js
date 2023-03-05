//DOM variables
const printItemsPage = document.querySelector("#print-items-page");
const pageNumberDiv = document.querySelector("#page-number-div");
const shoppingCartDiv = document.querySelector("#shopping-cart-div");
const fragment = document.createDocumentFragment();
//other variables
const limitPerPage = 20;
let pageNumbers = {};
let cartArray = JSON.parse(localStorage.getItem("productsInCart")) || [];

//EVENTLISTENERS
//event listeners
document.addEventListener("click", ({ target }) => {
  //click on page number to go to that page
  if (target.matches(".page-number-button")) {
    selectPage(target.textContent);
  }
  //click on page forward or back to go to next or previous page
  if (target.matches(".forward-button") || target.matches(".back-button")) {
    const action = target.classList.value;
    shiftPage(action);
  }
  //click on cart icon to make shopping cart appear
  if (target.matches(".cart-icon")) {
    shoppingCartDiv.classList.toggle("appear");
  }
  //click on an add to cart button to add it to cart
  if (target.matches(".add-item-button")) {
    addToCartList(target.id);
  }
  //end
});

//FUNCTIONS
//Change to specific page number
const selectPage = (page) => {
  const skip = (page - 1) * limitPerPage;
  printItemsPage.innerHTML = "";
  pageNumberDiv.innerHTML = "";
  printAllItems(skip);
  printPageButtons(skip);
};
//move forward or backward a page
const shiftPage = (action) => {
  printItemsPage.innerHTML = "";
  pageNumberDiv.innerHTML = "";
  let number = pageNumbers.pageNumber;
  let skip = 0;
  if (action == "forward-button") {
    skip = number * limitPerPage;
  }
  if (action == "back-button") {
    skip = (number - 2) * limitPerPage;
  }
  printAllItems(skip);
  printPageButtons(skip);
};

//FETCH function, retrieves information for all uses
const getData = async (skip, id) => {
  let url;
  try {
    if (!skip && !id) {
      url = `https://dummyjson.com/products?limit=${limitPerPage}`;
    } else if (skip) {
      url = `https://dummyjson.com/products?limit=${limitPerPage}&skip=${skip}`;
    } else if (id) {
      url = `https://dummyjson.com/products/${id}`;
    }
    let request = await fetch(url);
    if (request.ok) {
      let response = await request.json();
      return { ok: true, response };
    } else {
      throw {
        ok: false,
        msg: "Unable to load items",
      };
    }
  } catch (error) {
    return error;
  }
};

//print all items on home page
const printAllItems = async (skip) => {
  const { response, ok } = await getData(skip);
  if (ok) {
    const printArray = response.products;
    printArray.forEach((item) => {
      const productArticle = document.createElement("ARTICLE");
      const itemImgDiv = document.createElement("DIV");
      const itemImg = document.createElement("IMG");
      itemImg.src = item.images[0];
      itemImg.alt = item.title;
      itemImgDiv.append(itemImg);
      const itemInfoDiv = document.createElement("DIV");
      itemInfoDiv.classList.add("item-info");
      const itemTitle = document.createElement("H4");
      itemTitle.textContent = item.title;
      const itemPrice = document.createElement("P");
      itemPrice.textContent = `$${item.price}`;
      itemImgDiv.append(itemTitle, itemPrice);
      const starDiv = document.createElement("DIV");
      starDiv.classList.add("star-div");
      const starArray = printStars(item.rating);
      starArray.forEach((element) => {
        starDiv.append(element);
      });
      const addItemButton = document.createElement("BUTTON");
      addItemButton.textContent = "Add item to cart";
      addItemButton.classList.add("add-item-button");
      addItemButton.setAttribute("id", item.id);
      productArticle.append(
        itemImg,
        itemTitle,
        itemPrice,
        starDiv,
        addItemButton
      );
      fragment.append(productArticle);
    });
    printItemsPage.append(fragment);
  }
};

//create an array of images displaying number of gold/grey stars according to rating
const printStars = (rating) => {
  const numGoldStars = Math.round(rating);
  const numGreyStars = 5 - numGoldStars;
  starArray = [];

  for (let i = 0; i < numGoldStars; i++) {
    let goldStar = document.createElement("IMG");
    goldStar.src = "resources/star1.png";
    starArray.push(goldStar);
  }
  for (let i = 0; i < numGreyStars; i++) {
    let greyStar = document.createElement("IMG");
    greyStar.src = "resources/star2.png";
    starArray.push(greyStar);
  }
  return starArray;
};

const getPageNumbers = async (skipPages) => {
  const { response, ok } = await getData(skipPages);
  const { skip, total } = response;
  pageNumbers = {
    pageNumber: skip / limitPerPage + 1,
    numOfPages: total / limitPerPage,
  };
  return pageNumbers;
};

const printPageButtons = async (skip) => {
  let { pageNumber, numOfPages } = await getPageNumbers(skip);
  //forward and back buttons
  const forwardButton = document.createElement("BUTTON");
  forwardButton.textContent = ">";
  if (pageNumber < numOfPages) {
    forwardButton.classList.add("forward-button");
  } else {
    forwardButton.classList.add("disactivated");
  }
  const backButton = document.createElement("BUTTON");
  backButton.textContent = "<";
  if (pageNumber > 1) {
    backButton.classList.add("back-button");
  } else {
    backButton.classList.add("disactivated");
  }
  //page buttons
  if (pageNumber <= 2) {
    for (let i = 1; i < pageNumber + 2; i++) {
      let pageNumberButton = document.createElement("BUTTON");
      pageNumberButton.textContent = i;
      pageNumberButton.classList.add("page-number-button");
      if (i == pageNumber) {
        pageNumberButton.classList.add("active");
      }
      fragment.append(pageNumberButton);
    }
  } else if (pageNumber > 2 && pageNumber < numOfPages - 1) {
    for (let i = pageNumber - 2; i < pageNumber + 2; i++) {
      let pageNumberButton = document.createElement("BUTTON");
      pageNumberButton.textContent = i;
      pageNumberButton.classList.add("page-number-button");
      if (i == pageNumber) {
        pageNumberButton.classList.add("active");
      }
      fragment.append(pageNumberButton);
    }
  } else {
    for (let i = pageNumber - 2; i <= numOfPages; i++) {
      let pageNumberButton = document.createElement("BUTTON");
      pageNumberButton.textContent = i;
      pageNumberButton.classList.add("page-number-button");
      if (i == pageNumber) {
        pageNumberButton.classList.add("active");
      }
      fragment.append(pageNumberButton);
    }
  }
  pageNumberDiv.append(backButton, fragment, forwardButton);
};

const addToCartList = async (id) => {
  const { response, ok } = await getData(null, id);
  if (ok) {
    const newData = { count: 1, subtotal: response.price };
    console.log(response.price);
    const product = { ...response, ...newData };
    const productAlready = cartArray.find((item) => item.id == product.id);

    if (!productAlready) {
      cartArray.push(product);
      setLocal();
    } else {
      productAlready.count++;
      productAlready.subtotal = productAlready.price * productAlready.count;
      setLocal();
    }
    printShoppingCart();
  } else {
    printError(error);
  }
};

//set  and get local
setLocal = () => {
  return localStorage.setItem("productsInCart", JSON.stringify(cartArray));
};
getLocal = () => {
  return JSON.parse(localStorage.getItem("productsInCart")) || [];
};

const printShoppingCart = () => {
  const headings = ["Image", "Product", "Price", "Quantity", "Subtotal"];
  const cartTable = document.createElement("TABLE");
  const headRow = document.createElement("TR");

  headings.forEach((element) => {
    const head = document.createElement("TH");
    head.textContent = element;
    headRow.append(head);
  });
  cartArray.forEach((item) => {
    const productRow = document.createElement("TR");
    const data1 = document.createElement("TD");
    const cartImgDiv = document.createElement("DIV");
    const cartItemImg = document.createElement("IMG");
    cartItemImg.src = item.thumbnail;
    cartImgDiv.append(cartItemImg);
    data1.append(cartImgDiv);
    const data2 = document.createElement("TD");
    data2.textContent = item.title;
    const data3 = document.createElement("TD");
    data3.textContent = `$${item.price}`;
    const data4 = document.createElement("TD");
    data4.textContent = item.count;
    const data5 = document.createElement("TD");
    data5.textContent = item.subtotal;
    productRow.append(data1, data2, data3, data4, data5);
    fragment.append(productRow);
    //add
  });
  cartTable.append(headRow, fragment);
  shoppingCartDiv.append(cartTable);
  // cartItemImg.src = "";
};
printShoppingCart();
printAllItems();
printPageButtons();
