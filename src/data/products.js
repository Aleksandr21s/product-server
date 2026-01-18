// Начальные данные о товарах
let products = [
    {
        id: 1,
        name: "Ноутбук Dell XPS 13",
        description: "13-дюймовый ноутбук с процессором Intel Core i7",
        price: 129999,
        category: "Электроника",
        inStock: true
    },
    {
        id: 2,
        name: "Смартфон iPhone 14 Pro",
        description: "Смартфон Apple с камерой 48 МП",
        price: 99999,
        category: "Электроника",
        inStock: true
    },
    {
        id: 3,
        name: "Наушники Sony WH-1000XM5",
        description: "Беспроводные наушники с шумоподавлением",
        price: 29999,
        category: "Аудиотехника",
        inStock: true
    },
    {
        id: 4,
        name: "Книга 'Чистый код'",
        description: "Роберт Мартин. Искусство написания чистого кода",
        price: 2499,
        category: "Книги",
        inStock: false
    }
];

module.exports = products;