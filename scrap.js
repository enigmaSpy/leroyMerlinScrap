const cheerio = require('cheerio');
const axios = require('axios');
const express = require('express');
const fs = require('fs');

const app = express();

const PORT = process.env.PORT || 8000;
const basicURL = 'https://www.leroymerlin.pl/materialy-budowlane';
const endURL = ',a132.html';

const materials = [];
const products = [];

const saveArrToJSON = (fileName, arr)=>{
    const jsonData = JSON.stringify(arr, null, 2);

    fs.writeFile(fileName, jsonData, 'utf-8', (err)=>{
        if(err){
            console.error('Wystąpił błąd podczas zapisywania pliku :(', err);
            return;
        }
        console.log('Plik JSON został pomyślnie utworzony i zapisany :D');
    })
}

const scrapeData = async (url, category) => {
    try {
        const res = await axios.get(url);
        const html = res.data;
        const $ = cheerio.load(html);

        $('.ProductBlockWrapper_wrapper__BMppI').each(function () {
            const title = $(this).find('.ProductBlockName_link__fYuf1').text();
            const price = $(this).find('.ProductPrice_price__0Enwf').text();
            const url = $(this).find('.ProductBlockImage_wrapper__GbhBq').attr('href');

            products.push({
                category,
                title,
                price,
                path: url
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
                    break;
                }

                $('.ProductBlockWrapper_wrapper__BMppI').each(function () {
                    const title = $(this).find('.ProductBlockName_link__fYuf1').text();
                    const price = $(this).find('.ProductPrice_price__0Enwf').text();
                    const url = $(this).find('.ProductBlockImage_wrapper__GbhBq').attr('href');

                    products.push({
                        category,
                        title,
                        price,
                        path: url
                    });
                });

                indexPage++;
                newUrl = `${nextPageURL},strona-${indexPage}.html`;
            } catch (error) {
                console.log(error);
                break;
            }
        }
        saveArrToJSON('produkty.json',products);
        return products;
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
                url
            });
        });

        for (const item of materials) {
            const count = await scrapeData(basicURL + item.url, item.title);
            console.log(count);
        }
    } catch (error) {
        console.log(error);
    }
};

scrapePage();





app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    /*
    ...
     */
});
