// Конфигурация ролей и разрешений

const ROLES = {
    GUEST: 'guest',        // Неавторизованный пользователь
    CUSTOMER: 'customer',  // Обычный покупатель
    SELLER: 'seller',      // Продавец (может управлять своими товарами)
    MODERATOR: 'moderator',// Модератор (может управлять всеми товарами и пользователями)
    ADMIN: 'admin'         // Администратор (полные права)
};

// Иерархия ролей (какая роль включает какие)
const ROLE_HIERARCHY = {
    [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.MODERATOR, ROLES.SELLER, ROLES.CUSTOMER, ROLES.GUEST],
    [ROLES.MODERATOR]: [ROLES.MODERATOR, ROLES.SELLER, ROLES.CUSTOMER, ROLES.GUEST],
    [ROLES.SELLER]: [ROLES.SELLER, ROLES.CUSTOMER, ROLES.GUEST],
    [ROLES.CUSTOMER]: [ROLES.CUSTOMER, ROLES.GUEST],
    [ROLES.GUEST]: [ROLES.GUEST]
};

// Разрешения по умолчанию для каждой роли
const DEFAULT_PERMISSIONS = {
    [ROLES.GUEST]: [
        'products:read',
        'categories:read',
        'reviews:read',
        'auth:register',
        'auth:login',
        'auth:forgot-password'
    ],
    
    [ROLES.CUSTOMER]: [
        'products:read',
        'categories:read',
        'reviews:read',
        'reviews:create',
        'reviews:update:own',
        'reviews:delete:own',
        'orders:create',
        'orders:read:own',
        'orders:update:own',
        'cart:manage',
        'profile:read',
        'profile:update:own',
        'auth:register',
        'auth:login',
        'auth:logout',
        'auth:forgot-password',
        'auth:change-password'
    ],
    
    [ROLES.SELLER]: [
        // Все разрешения покупателя
        ...DEFAULT_PERMISSIONS[ROLES.CUSTOMER],
        
        // Дополнительные разрешения продавца
        'products:create',
        'products:update:own',
        'products:delete:own',
        'products:manage:own',
        'dashboard:seller'
    ],
    
    [ROLES.MODERATOR]: [
        // Все разрешения продавца
        ...DEFAULT_PERMISSIONS[ROLES.SELLER],
        
        // Дополнительные разрешения модератора
        'products:update:any',
        'products:delete:any',
        'products:manage:any',
        'categories:create',
        'categories:update',
        'categories:delete',
        'reviews:delete:any',
        'users:read',
        'users:update',
        'users:disable',
        'orders:read:any',
        'orders:update:any',
        'dashboard:moderator'
    ],
    
    [ROLES.ADMIN]: [
        // Все разрешения
        'all'
    ]
};

// Список всех возможных разрешений
const ALL_PERMISSIONS = [
    // Аутентификация
    'auth:register',
    'auth:login',
    'auth:logout',
    'auth:forgot-password',
    'auth:change-password',
    'auth:verify-email',
    
    // Профиль
    'profile:read',
    'profile:update:own',
    'profile:update:any',
    'profile:delete',
    
    // Пользователи
    'users:read',
    'users:create',
    'users:update',
    'users:delete',
    'users:disable',
    'users:manage-roles',
    
    // Товары
    'products:read',
    'products:create',
    'products:update:own',
    'products:update:any',
    'products:delete:own',
    'products:delete:any',
    'products:manage:own',
    'products:manage:any',
    
    // Категории
    'categories:read',
    'categories:create',
    'categories:update',
    'categories:delete',
    
    // Отзывы
    'reviews:read',
    'reviews:create',
    'reviews:update:own',
    'reviews:update:any',
    'reviews:delete:own',
    'reviews:delete:any',
    
    // Заказы
    'orders:create',
    'orders:read:own',
    'orders:read:any',
    'orders:update:own',
    'orders:update:any',
    'orders:delete',
    
    // Корзина
    'cart:manage',
    
    // Дашборды
    'dashboard:customer',
    'dashboard:seller',
    'dashboard:moderator',
    'dashboard:admin',
    
    // Системные
    'system:settings:read',
    'system:settings:update',
    'system:logs:read',
    'system:backup',
    
    // Специальное
    'all' // Полный доступ
];

// Функция для проверки, имеет ли роль разрешение
const hasPermission = (role, permission) => {
    if (role === ROLES.ADMIN) return true;
    
    const rolePermissions = DEFAULT_PERMISSIONS[role] || [];
    
    // Проверка на "all"
    if (rolePermissions.includes('all')) return true;
    
    // Проверка конкретного разрешения
    return rolePermissions.includes(permission);
};

// Функция для получения разрешений роли
const getRolePermissions = (role) => {
    return DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS[ROLES.GUEST];
};

module.exports = {
    ROLES,
    ROLE_HIERARCHY,
    DEFAULT_PERMISSIONS,
    ALL_PERMISSIONS,
    hasPermission,
    getRolePermissions
};