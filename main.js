//DOM variables
const printItemsPage = document.querySelector("#print-items-page");
const pageNumberDiv = document.querySelector("#page-number-div");
const fragment = document.createDocumentFragment();
//other variables
const limitPerPage = 20;
let pageNumbers = {};
//event listeners
document.addEventListener("click", ({ target }) => {
  if (target.matches(".page-number-button")) {
    selectPage(target.textContent);
  }
  if (target.matches(".forward-button") || target.matches(".back-button")) {
    const action = target.classList.value;
    shiftPage(action);
  }
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
const getData = async (skip) => {
  let url;
  try {
    if (!skip) {
      url = `https://dummyjson.com/products?limit=${limitPerPage}`;
    } else {
      url = `https://dummyjson.com/products?limit=${limitPerPage}&skip=${skip}`;
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
    goldStar.src = "stars/star1.png";
    starArray.push(goldStar);
  }
  for (let i = 0; i < numGreyStars; i++) {
    let greyStar = document.createElement("IMG");
    greyStar.src = "stars/star2.png";
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
printAllItems();
printPageButtons();
