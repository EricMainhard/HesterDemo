const d = document;
const hamIcon = d.getElementsByClassName('hamMenu')[0],
navBar = d.getElementsByClassName('hero_nav')[0],
cartIcon = d.getElementsByClassName('cart')[0],
closeCartIcon = d.getElementById('closeCart'),
cartQty = d.getElementById('cartQty'),
productsContainer = d.getElementsByClassName('productsContainer')[0],
products = d.querySelectorAll('.product'),
cartDrawer = d.getElementsByClassName('cartDrawer')[0],
cartContent = d.getElementsByClassName('cart_body')[0],
clearCartBtn = d.getElementsByClassName('clear-cart')[0],
subtotal = d.getElementById('cart_subtotal');

let cart = [];
//
let buttonsDOM;

class Products{
    async getProducts(){
        try{
            let result = await fetch('/products.json');
            let data = await result.json();
            return data;
        } catch (error) {
            console.log('Error: ' + error)
        }
    }

}

class Storage{

    static saveProduct(products){
        localStorage.setItem('products',JSON.stringify(products))
    }

    static getProduct(id){
        let products = [...JSON.parse(localStorage.getItem('products'))];
        let selectedProduct = products.find( product => product.id == id)
        return selectedProduct
    }

    static saveCart(cart){
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static getCart(){
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
    }

}

class UI{
    renderProducts(products){
        let result = '';
        products.forEach(product => {
            result += 
            `<div class="product animated pulse">
                <div class="product_image_container">
                    <img src="../public/images/${product.image}" alt="${product.title}" class="product_image">
                    <button class="addToCart" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> ADD TO CART
                    </button>
                </div>
                <h3 class="product_title">${product.title}</h3>
            </div>`
        })
        productsContainer.innerHTML = result;
    }

    navBarStyled(){
        window.scrollY > 0 ? navBar.style.background = 'wheat' : navBar.style.background = "none";
    }
    // addItemAlert(){
    //     let addAlert = d.createElement('div');
    //     addAlert.appendChild(d.createTextNode('Item added to cart'));
    //     productsContainer.appendChild(addAlert);
    //     setInterval(() => {
    //         addAlert.remove()
    //     }, 10);
    // }

    getAddToCartBtns(){
        let addToCart = [...d.querySelectorAll('.addToCart')];
        buttonsDOM = addToCart;
        addToCart.forEach(btn => {
                let id = btn.dataset.id;
                let inCart = cart.find(item => {
                    item.id == id;
                })
                if (inCart){
                    btn.innerText = 'IN CART';
                    btn.setAttribute('disabled','');
                } 
                    btn.addEventListener('click',(event)=>{
                        event.target.innerText = 'IN CART';
                        event.target.setAttribute('disabled','');
                        let cartItem = {...Storage.getProduct(id),amount:1};
                        cart = [...cart, cartItem];
                        cartQty.innerText = cart.length;
                        btn.classList.add('clicked');
                        Storage.saveCart(cart);
                        this.setCartValues(cart);
                        this.addCartItem(cartItem);
                        this.displayCartDrawer();
                    })
            })
    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item =>{
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        subtotal.innerText = '$' + parseFloat(tempTotal);
    }

    addCartItem(item){
        const div = d.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML =  `
                        <div class="cart-img-product">
                            <img src="../public/images/${item.image}"/>
                        </div>    
                        <div class="cart-info-product">
                         <h4>${item.title}</h4>
                         <h5>$${item.price}</h5>
                         <span class="remove-item" data-id=${item.id}>
                            <i class="fas fa-trash" data-id=${item.id}></i>
                         </span>
                        </div>
                        <div class="cart-qty-product">
                            <i class="fas fa-minus" data-id=${item.id}></i>
                            <p>${item.amount}</p>
                            <i class="fas fa-plus" data-id=${item.id}></i>
                        </div>`
        cartContent.appendChild(div);
    }

    displayCartDrawer(){
        cartDrawer.classList.add('showCart');
    }

    hideCartDrawer(){
        cartDrawer.classList.remove('showCart');
    }

    clearCart(){
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => {
            this.removeItem(id);
        })
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCartDrawer();
    }

    removeItem(id){
        cart = cart.filter(item => item.id != id);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i> ADD TO CART`
        buttonsDOM.forEach(btn => btn.classList.contains('clicked') ? btn.classList.remove('clicked') : '')
        cartQty.innerText = cart.length;
        this.setCartValues(cart);
    }

    getSingleButton(id){
        return buttonsDOM.find(btn => btn.dataset.id == id);
    }

    setUpCart(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartIcon.addEventListener('click', this.displayCartDrawer);
        closeCartIcon.addEventListener('click', this.hideCartDrawer);
        cartQty.innerText = cart.length;
    }
    populateCart(cart){
        cart.forEach(item => {
            this.addCartItem(item);
        })
    }

    cartLogic(){

        clearCartBtn.addEventListener('click', ()=>{
            this.clearCart()
        })
        cartContent.addEventListener('click', (e)=>{
            if(e.target.classList.contains('fa-trash')){
                let removeItem = e.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement.parentElement);
                this.removeItem(id);

            } else if (e.target.classList.contains('fa-minus')){
                let restItem = cart.find(item => item.id == e.target.dataset.id);
                restItem.amount = restItem.amount - 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                e.target.nextElementSibling.innerText = restItem.amount;
                if (restItem.amount == 0){
                    this.removeItem(restItem.id);
                    cartContent.removeChild(e.target.parentElement.parentElement)
                }
            } else if (e.target.classList.contains('fa-plus')){
                let plusItem = cart.find(item => item.id == e.target.dataset.id);
                plusItem.amount = plusItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                e.target.previousElementSibling.innerText = plusItem.amount;
            }
        })
    };

}


d.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();

    ui.setUpCart();

    products.getProducts()
    .then(res => {
        return(res);
    })
    .then(data => {
        ui.renderProducts(data);
        Storage.saveProduct(data);
    })
    .then(()=>{
        ui.getAddToCartBtns();
        ui.cartLogic();
    })
    

});

d.addEventListener('scroll',()=>{
    const ui = new UI;
    ui.navBarStyled();
})