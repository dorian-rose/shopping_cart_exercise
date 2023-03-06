document.addEventListener("DOMContentLoaded", () => {
  //DOM variables
  const printErrorDiv = document.querySelector("#print-error-div");
  const printItemsPage = document.querySelector("#print-items-page");
  const pageNumberDiv = document.querySelector("#page-number-div");
  const shoppingCartDiv = document.querySelector("#shopping-cart-div");
  const itemAdded = document.querySelector(".item-added");
  const finaliseShoppingDiv = document.querySelector("#finalise-shopping-div");
  const productDetails = document.querySelector("#product-details");
  const fragment = document.createDocumentFragment();
  //other variables
  const limitPerPage = 20;
  let pageNumbers = {};
  let cartArray = JSON.parse(localStorage.getItem("productsInCart")) || [];

  //EVENTLISTENERS
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
    //click on an add to cart button to add it to cart/ increase button to increase number
    if (
      target.matches(".add-item-button") ||
      target.matches(".increase-button")
    ) {
      addToCartList(target.id);
    }
    //click on decrease button to remove/decrease item
    if (target.matches(".decrease-button")) {
      removeFromCart(target.id);
    }
    //delete all copies of product
    if (target.matches(".delete-all")) {
      removeFromCart(null, target.id);
    }

    //empty all button on pop up cart list
    if (target.matches(".empty-cart-button")) {
      emptyCart();
    }
    //go to purchase page//error if nothing in cart
    if (target.matches(".purchase-button")) {
      if (cartArray.length > 0) {
        location.href = "../secondaryPages/purchase.html?purchase";
      } else {
        printError("Nothing in cart");
      }
    }
    //click on item to see large photo and more info
    if (target.matches(".product")) {
      location.href = `../secondaryPages/product.html?id=${target.id}`;
    }
    //go back to home page
    if (target.matches(".back-home-button")) {
      location.href = "../index.html";
    }
    //finalise purchase notification
    if (target.matches(".finalise-button")) {
      purchaseComplete();
    }
    //end
  });

  //FUNCTIONS

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
        if (!skip && !id) {
          throw new Error("Unable to load items");
        } else if (skip) {
          throw new Error("Unable to find page numbers");
        } else if (id) {
          throw new Error(`Unable to find product with id ${id}`);
        }
      }
    } catch (error) {
      return error;
    }
  }; // END fetch function

  //gestiona errores
  const printError = (error) => {
    printErrorDiv.innerHTML = "";
    const errorPara = document.createElement("P");
    errorPara.classList.add("error-para");
    errorPara.textContent = error;
    if (error != "Nothing in cart") {
      printErrorDiv.append(errorPara);
    } else {
      shoppingCartDiv.append(errorPara);
    }
  }; // End gestiona errores

  //PAGINACION Y MOVER ENTRE PAGINGA
  //retrieve page numbers
  const getPageNumbers = async (skipPages) => {
    const data = await getData(skipPages);
    const { response, ok } = data;
    if (ok) {
      const { skip, total } = response;
      pageNumbers = {
        pageNumber: skip / limitPerPage + 1,
        numOfPages: total / limitPerPage,
      };
      return pageNumbers;
    } else {
      return data;
    }
  };

  //print page buttons
  const printPageButtons = async (skip) => {
    const pageData = await getPageNumbers(skip);
    let { pageNumber, numOfPages } = pageData;
    if (pageNumber) {
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
    } else {
      printError(pageData);
    }
  }; //end page buttons

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
  }; //END PAGINACION

  //IMPRIME PRODUCTOS
  //print all items on home page
  const printAllItems = async (skip) => {
    const data = await getData(skip);
    const { response, ok } = data;
    if (ok) {
      const printArray = response.products;
      printArray.forEach((item) => {
        const productArticle = document.createElement("ARTICLE");
        const itemImgDiv = document.createElement("DIV");
        const itemImg = document.createElement("IMG");
        itemImg.src = item.images[0];
        itemImg.alt = item.title;
        itemImg.classList.add("product");
        itemImg.setAttribute("id", item.id);
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
    } else {
      printError(data);
    }
  };

  //create an array of images displaying number of gold/grey stars according to rating
  const printStars = (rating) => {
    const numGoldStars = Math.round(rating);
    const numGreyStars = 5 - numGoldStars;
    starArray = [];

    for (let i = 0; i < numGoldStars; i++) {
      let goldStar = document.createElement("IMG");
      goldStar.src = "../resources/star1.png";
      starArray.push(goldStar);
    }
    for (let i = 0; i < numGreyStars; i++) {
      let greyStar = document.createElement("IMG");
      greyStar.src = "../resources/star2.png";
      starArray.push(greyStar);
    }
    return starArray;
  }; //end imprime productos

  //CARRITO -pintar, anadir, borrar etc
  //prepara elementos para pintar tanto en carrito como pagina de compra
  const prepareShoppingCart = () => {
    let total = 0;
    const headings = ["Image", "Product", "Price", "Quantity", "Subtotal"];
    const cartTable = document.createElement("TABLE");
    const headRow = document.createElement("TR");
    //print table headings
    headings.forEach((element) => {
      const head = document.createElement("TH");
      head.textContent = element;
      headRow.append(head);
    });
    //print rest of table
    cartArray.forEach((item) => {
      const productRow = document.createElement("TR");
      const data1 = document.createElement("TD");
      const cartImgDiv = document.createElement("DIV");
      const cartItemImg = document.createElement("IMG");
      cartItemImg.src = item.images[0];
      cartImgDiv.append(cartItemImg);
      data1.append(cartImgDiv);
      const data2 = document.createElement("TD");
      data2.textContent = item.title;
      const data3 = document.createElement("TD");
      data3.textContent = `$ ${item.price}`;
      const data4 = document.createElement("TD");
      data4.innerHTML = `<i class="fa-solid fa-square-plus increase-button" id="${item.id}"></i> ${item.count} <i class="fa-solid fa-square-minus decrease-button" id="${item.id}"></i>`;
      const data5 = document.createElement("TD");
      data5.textContent = `$ ${item.subtotal}`;
      const data6 = document.createElement("TD");
      data6.innerHTML = `<i class="fa-solid fa-trash delete-all" id="${item.id}"></i>`;
      data6.setAttribute("id", item.id);
      productRow.append(data1, data2, data3, data4, data5, data6);
      fragment.append(productRow);
      total += item.subtotal;
    });
    // print total;
    const totalRow = document.createElement("TR");
    const printTotal = document.createElement("TD");
    printTotal.textContent = `TOTAL: $ ${total}`;
    printTotal.setAttribute("colspan", "5");
    printTotal.classList.add("total");
    totalRow.append(printTotal);
    cartTable.append(headRow, fragment, totalRow);
    fragment.append(cartTable);
    return fragment;
  };
  const printShoppingCart = () => {
    const emptyCartButton = document.createElement("BUTTON");
    emptyCartButton.textContent = "Empty Cart";
    emptyCartButton.classList.add("empty-cart-button");
    const purchaseButton = document.createElement("BUTTON");
    purchaseButton.textContent = "Purchase";
    purchaseButton.classList.add("purchase-button");
    shoppingCartDiv.append(
      prepareShoppingCart(),
      emptyCartButton,
      purchaseButton
    );
  };
  //Anadir y borrar de carrito
  const addToCartList = async (id) => {
    const data = await getData(null, id);
    const { response, ok } = data;
    if (ok) {
      shoppingCartDiv.innerHTML = "";
      const newData = { count: 1, subtotal: response.price };
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
      itemAddedMessage();
      printShoppingCart();
    } else {
      printError(data);
    }
  };

  const itemAddedMessage = () => {
    const itemAddedMessage = document.createElement("P");
    itemAddedMessage.textContent = "Item added successfully";
    itemAdded.append(itemAddedMessage);
    setTimeout(deleteItemAddedMessage, 2000);
  }; //mensaje de que haya anadido producto

  const deleteItemAddedMessage = () => {
    itemAdded.innerHTML = "";
  }; //borrar mensaje de que haya anadido producto

  const removeFromCart = (id, deleteAllID) => {
    if (shoppingCartDiv) {
      shoppingCartDiv.innerHTML = "";
    } else {
      finaliseShoppingDiv.innerHTML = "";
    }
    //if id, borrar solo uno de este producto
    if (id) {
      const productFound = cartArray.find((item) => item.id == id);
      if (productFound.count > 1) {
        productFound.count--;
        productFound.subtotal -= productFound.price;
        setLocal();
      } else {
        const elementIndex = cartArray.findIndex((item) => item.id == id);
        if (elementIndex != -1) {
          cartArray.splice(elementIndex, 1);
          setLocal();
        }
      } //if deleteAllID, borrar todo de este producto
    } else if (deleteAllID) {
      const elementIndex = cartArray.findIndex(
        (item) => item.id == deleteAllID
      );
      cartArray.splice(elementIndex, 1);
      setLocal();
    }
    //call print functions
    if (shoppingCartDiv) {
      printShoppingCart();
    } else {
      printPurchasePage();
    }
  };

  const emptyCart = () => {
    shoppingCartDiv.innerHTML = "";
    localStorage.clear();
    cartArray = [];
    printShoppingCart();
  }; //END CARRITO

  //PAGINA DE COMPRA
  //coge y imprime elementos preparados
  const printPurchasePage = () => {
    const finaliseButton = document.createElement("BUTTON");
    finaliseButton.textContent = "Finalise Purchase";
    finaliseButton.classList.add("finalise-button");
    finaliseShoppingDiv.append(prepareShoppingCart(), finaliseButton);
  };

  const purchaseComplete = () => {
    finaliseShoppingDiv.innerHTML = "";
    const finaliseMessage = document.createElement("P");
    finaliseMessage.textContent = "Purcase complete";
    finaliseShoppingDiv.append(finaliseMessage);
  };

  //Muestra en otro html detalles del producto
  const showProduct = async (id) => {
    const data = await getData(null, id);
    const { response, ok } = data;
    if (ok) {
      const itemImgDiv = document.createElement("DIV");
      itemImgDiv.classList.add("product-photos");
      response.images.forEach((element) => {
        const itemImg = document.createElement("IMG");
        itemImg.src = element;
        itemImg.alt = response.title;
        itemImgDiv.append(itemImg);
        fragment.append(itemImgDiv);
      });

      const itemInfoDiv = document.createElement("DIV");
      itemInfoDiv.classList.add("item-info");
      const itemTitle = document.createElement("H4");
      itemTitle.textContent = response.title;
      const itemPrice = document.createElement("P");
      itemPrice.textContent = `$${response.price}`;
      const itemDescript = document.createElement("P");
      itemDescript.textContent = response.description;
      itemDescript.classList.add("product-details");
      const stock = document.createElement("P");
      stock.classList.add("product-details");
      if (response.stock > 0) {
        stock.textContent = `In stock: ${response.stock} remaining`;
      } else {
        stock.textContent = "Out of stock";
      }
      itemInfoDiv.append(itemTitle, itemPrice, itemDescript, stock);
      const starDiv = document.createElement("DIV");
      starDiv.classList.add("star-div");
      const starArray = printStars(response.rating);
      starArray.forEach((element) => {
        starDiv.append(element);
      });
      const backToHomeButton = document.createElement("BUTTON");
      backToHomeButton.innerHTML = `<i class="fa-solid fa-circle-arrow-left"></i> Back`;
      backToHomeButton.classList.add("back-home-button");
      backToHomeButton.setAttribute("id", response.id);
      productDetails.append(fragment, itemInfoDiv, starDiv, backToHomeButton);
    } else {
      printError(data);
    }
  };

  //set  and get local
  setLocal = () => {
    return localStorage.setItem("productsInCart", JSON.stringify(cartArray));
  };
  getLocal = () => {
    return JSON.parse(localStorage.getItem("productsInCart")) || [];
  };

  //INIT
  const init = () => {
    const urlParams = new URLSearchParams(window.location.search);

    if (!window.location.search || urlParams.has("home")) {
      printShoppingCart();
      printAllItems();
      printPageButtons();
    } else if (urlParams.has("purchase")) {
      printPurchasePage();
    } else if (urlParams.has("id")) {
      const id = urlParams.get("id");
      showProduct(id);
    }
  };
  init();
}); //LOAD
