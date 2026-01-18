// В seed.js добавляем пользователей разных ролей
const users = await User.bulkCreate([
    {
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', salt),
        firstName: 'Админ',
        lastName: 'Системный',
        role: 'admin',
        activated: true,
        isActive: true,
        permissions: ['all']
    },
    {
        email: 'moderator@example.com',
        password: await bcrypt.hash('moderator123', salt),
        firstName: 'Модератор',
        lastName: 'Контрольный',
        role: 'moderator',
        activated: true,
        isActive: true,
        permissions: DEFAULT_PERMISSIONS['moderator']
    },
    {
        email: 'seller@example.com',
        password: await bcrypt.hash('seller123', salt),
        firstName: 'Продавец',
        lastName: 'Товарный',
        role: 'seller',
        activated: true,
        isActive: true,
        permissions: DEFAULT_PERMISSIONS['seller']
    },
    {
        email: 'customer@example.com',
        password: await bcrypt.hash('customer123', salt),
        firstName: 'Покупатель',
        lastName: 'Обычный',
        role: 'customer',
        activated: true,
        isActive: true,
        permissions: DEFAULT_PERMISSIONS['customer']
    }
]);