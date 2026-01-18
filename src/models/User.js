const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 100]
        }
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    activationLink: {
        type: DataTypes.STRING,
        allowNull: true
    },
    activated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    resetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetTokenExpires: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Расширяем роли
    role: {
        type: DataTypes.ENUM('guest', 'customer', 'seller', 'moderator', 'admin'),
        defaultValue: 'customer'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
    },
    permissions: {
        type: DataTypes.JSON,
        defaultValue: []
    }
}, {
    tableName: 'users',
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// Методы
User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

User.prototype.toSafeObject = function() {
    const values = { ...this.toJSON() };
    delete values.password;
    delete values.resetToken;
    delete values.resetTokenExpires;
    delete values.activationLink;
    return values;
};

// Проверка ролей
User.prototype.isAdmin = function() {
    return this.role === 'admin';
};

User.prototype.isModerator = function() {
    return this.role === 'moderator' || this.role === 'admin';
};

User.prototype.isSeller = function() {
    return this.role === 'seller' || this.role === 'moderator' || this.role === 'admin';
};

User.prototype.hasPermission = function(permission) {
    if (this.role === 'admin') return true;
    
    // Проверяем разрешения в JSON поле
    if (this.permissions && Array.isArray(this.permissions)) {
        return this.permissions.includes(permission);
    }
    
    return false;
};

module.exports = User;