const productsDisplay = document.querySelector('.products');

const url = 'http://localhost:8000/products';
let render = '';

fetch('http://localhost:8000/products')
    .then(res => res.json())
    .then(data => {
        data.forEach(product => {
            render += `
            <a href='${product.url}' target='_blank' class='product__item'>
                <span class='products__category'>${product.category}</span>
                <div class='products__imgWrapper'>
                <img src='${product.img}' alt='product-img' class='products__img'>
                </div>
                <h3 class='products__title'>${product.title}</h3>
                <p class='products__price'>${product.price}</p>
               </a>
            `
        });
        productsDisplay.innerHTML = render;
    })