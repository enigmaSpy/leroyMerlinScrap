const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8000;

app.use(cors());

const appPath = '/products';
app.get('/', (req, res) => {
  res.json('webscraper for leroymerline bulding products');
});

const basicURL = 'https://www.leroymerlin.pl/materialy-budowlane';
const endURL = ',a132.html';

const materials = [];
const products = [];

const saveArrToJSON = (fileName, arr) => {
  const jsonData = JSON.stringify(arr, null, 2);

  fs.writeFile(fileName, jsonData, 'utf-8', (err) => {
    if (err) {
      console.error('Wystąpił błąd podczas zapisywania pliku :(', err);
      return;
    }
    console.log('Plik JSON został pomyślnie utworzony i zapisany :D');
  });
};

const scrapeData = async (url, category) => {
  try {
    const res = await axios.get(url);
    const html = res.data;
    const $ = cheerio.load(html);

    $('.ProductBlockWrapper_wrapper__BMppI').each(function () {
      const title = $(this).find('.ProductBlockName_link__fYuf1').text();
      const price = $(this).find('.ProductPrice_price__0Enwf').text();
      const url = $(this).find('.ProductBlockImage_wrapper__GbhBq').attr('href');

      const imgAttr=$(this).find('.ProductImage_wrapper__30Lsf').attr();
      const img = (imgAttr === undefined) ? null:imgAttr.src;
      products.push({
        category,
        title,
        price,
        url:basicURL+url,
        img
      });
    });

    let nextPageURL = url.slice(0, -5);

    let indexPage = 2;

    let newUrl = `${nextPageURL},strona-${indexPage}.html`;
    while (true) {
        try {
          const res = await axios.get(newUrl);
          const html = res.data;
          const $ = cheerio.load(html);
          const productCount = $('.ProductBlockWrapper_wrapper__BMppI').length;
      
          if (productCount === 0) {
            break; // Zakończ pętlę, jeśli nie ma więcej produktów
          }
      
          $('.ProductBlockWrapper_wrapper__BMppI').each(function () {
            const title = $(this).find('.ProductBlockName_link__fYuf1').text();
            const price = $(this).find('.ProductPrice_price__0Enwf').text();
            const url = $(this).find('.ProductBlockImage_wrapper__GbhBq').attr('href');
            const imgAttr=$(this).find('.ProductImage_wrapper__30Lsf').attr();
            const img = (imgAttr === undefined) ? null:imgAttr.src;
            products.push({
              category,
              title,
              price,
              url:basicURL+url,
              img,
            });
          });
      
          indexPage++;
          newUrl = `${nextPageURL},strona-${indexPage}.html`;
        } catch (error) {
          console.log(error);
          break;
        }
      }
    saveArrToJSON('produkty.json', products);
    
  } catch (error) {
    throw error;
  }
};

const scrapePage = async () => {
  try {
    const res = await axios.get(basicURL + endURL);
    const html = res.data;
    const $ = cheerio.load(html);
    $('.CatalogListItem_wrapper__Wp5_l').each(function () {
      const title = $(this).find('.CatalogListItem_name__dUuwq').text();
      const url = $(this).find('.CatalogListItem_link__Xo0R7').attr('href');

      materials.push({
        title,
        url,
      });
    });

    for (const item of materials) {
      await scrapeData(basicURL + item.url, item.title);
    }
  } catch (error) {
    console.log(error);
  }
};

scrapePage();

app.get(appPath, (req, res) => {
    res.json(products);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
