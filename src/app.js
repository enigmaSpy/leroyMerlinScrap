const productsDisplay = document.querySelector('#products');

const url = 'http://localhost:8000/products';
let render = '';

fetch('http://localhost:8000/products')
    .then(res => res.json())
    .then(data => {
        data.forEach(product => {
            render += `
               <div class='product__item'>
                <span class='products__category'>${product.category}</span>
                <h3 class='products__title'><a href='${product.url}' target='_blank'>${product.title}</a></h3>
                <p class='products__price'>${product.price}</p>
                <img src='${product.img}' alt='product-img' class='products__img'>
               </div>
            `
        });
        productsDisplay.innerHTML = render;
    })