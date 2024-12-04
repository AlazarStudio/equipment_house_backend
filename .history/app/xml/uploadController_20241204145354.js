const fs = require('fs');
const xml2js = require('xml2js');
const prisma = require('../prisma/client');

const uploadController = async (req, res) => {
  const filePath = req.file.path;

  try {
    const xmlData = fs.readFileSync(filePath, 'utf-8');

    xml2js.parseString(
      xmlData,
      { explicitArray: false },
      async (err, result) => {
        if (err) {
          console.error('Ошибка парсинга XML:', err);
          return res.status(500).json({ message: 'Ошибка парсинга XML' });
        }

        const offers = result.offers.offer;

        for (const offer of offers) {
          const { id, url, price, currencyId, categoryId, model, description } =
            offer;

          try {
            // Вставка в базу через Prisma
            const createdOffer = await prisma.offer.create({
              data: {
                id: parseInt(id),
                url,
                price: parseFloat(price),
                currency: currencyId,
                categoryId: parseInt(categoryId),
                model,
                description,
              },
            });

            // Добавление параметров
            if (offer.param) {
              const params = Array.isArray(offer.param)
                ? offer.param
                : [offer.param];
              for (const param of params) {
                const { name, value } = param;

                await prisma.parameter.create({
                  data: {
                    offerId: createdOffer.id,
                    name,
                    value,
                  },
                });
              }
            }
          } catch (dbError) {
            console.error(`Ошибка сохранения товара ${id}:`, dbError);
          }
        }

        res.json({ message: 'Данные успешно загружены' });
      }
    );
  } catch (error) {
    console.error('Ошибка обработки файла:', error);
    res.status(500).json({ message: 'Ошибка обработки файла' });
  }
};

module.exports = uploadController;
