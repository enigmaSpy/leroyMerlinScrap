const cheerio = require('cheerio');
const axios = require('axios');
const express = require('express');

const app = express();

const PORT = process.env.PORT || 8000;
const basicURL = 'https://www.leroymerlin.pl/materialy-budowlane';
const endURL = ',a132.html';

const materials = [];
const products = [];

const scrapeData = (url, category, indexPage = 0) => {
    return new Promise((resolve, reject) => {
        axios(url)
            .then(async (res) => {
                const html = res.data;
                const $ = cheerio.load(html);

                $('.ProductBlockWrapper_wrapper__BMppI').each(async function () {
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

                const nextPageURL = url.slice(0, -5);
                indexPage = 1;

                try {
                    let newUrl = `${nextPageURL},strona-${indexPage}.html`
                    indexPage++;
                    axios(newUrl)
                        .then(async (res) => {
                            const html = res.data;
                            const $ = cheerio.load(html);
                            $('.ProductBlockWrapper_wrapper__BMppI').each(async function () {
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
                        });
                    console.log(indexPage);
                } catch (error) {
                    console.log(error);
                }
                resolve(products.length);
            })
            .catch((err) => {
                reject(err);
            });
    });
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
            const products = await scrapeData(basicURL + item.url, item.title);
            console.log(products);
        }
    } catch (err) {
        console.error(err);
    }
};

scrapePage();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    /*
    ...
     */
});
