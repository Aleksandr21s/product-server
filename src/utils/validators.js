// Валидация email
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Валидация пароля
const validatePassword = (password) => {
    // Минимум 6 символов, хотя бы одна цифра и одна буква
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    return passwordRegex.test(password);
};

// Валидация имени пользователя
const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
};

// Валидация данных регистрации
const validateRegister = (data) => {
    const errors = [];
    
    if (!data.username || !validateUsername(data.username)) {
        errors.push('Имя пользователя должно содержать 3-30 символов (буквы, цифры, подчеркивание)');
    }
    
    if (!data.email || !validateEmail(data.email)) {
        errors.push('Введите корректный email');
    }
    
    if (!data.password || !validatePassword(data.password)) {
        errors.push('Пароль должен содержать минимум 6 символов, включая хотя бы одну букву и одну цифру');
    }
    
    if (data.password !== data.confirmPassword) {
        errors.push('Пароли не совпадают');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

// Валидация данных входа
const validateLogin = (data) => {
    const errors = [];
    
    if (!data.email && !data.username) {
        errors.push('Введите email или имя пользователя');
    }
    
    if (!data.password) {
        errors.push('Введите пароль');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = {
    validateEmail,
    validatePassword,
    validateUsername,
    validateRegister,
    validateLogin
};