export const addToBasket = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity = 1 } = req.body; // Устанавливаем значение по умолчанию

  // Проверяем, существует ли продукт
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Проверяем, существует ли корзина пользователя
  let basket = await prisma.basket.findFirst({
    where: { userId },
  });

  if (!basket) {
    // Создаем корзину, если она не существует
    basket = await prisma.basket.create({
      data: { userId },
    });
  }

  // Проверяем, существует ли товар в корзине
  const basketItem = await prisma.basketItem.findFirst({
    where: {
      basketId: basket.id,
      productId,
    },
  });

  if (basketItem) {
    // Обновляем количество, если товар уже в корзине
    const updatedBasketItem = await prisma.basketItem.update({
      where: { id: basketItem.id },
      data: {
        quantity: basketItem.quantity + quantity,
      },
    });

    res.json(updatedBasketItem);
  } else {
    // Добавляем новый товар в корзину
    const newBasketItem = await prisma.basketItem.create({
      data: {
        basketId: basket.id,
        productId,
        quantity, // Убедитесь, что значение есть
        price: product.price,
      },
    });

    res.status(201).json(newBasketItem);
  }
});
