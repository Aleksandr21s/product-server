const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const crypto = require('crypto');

const PasswordReset = sequelize.define('PasswordReset', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'password_resets',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['token']
        },
        {
            fields: ['userId']
        },
        {
            fields: ['expiresAt']
        }
    ]
});

// Связь с User
const User = require('./User');
PasswordReset.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

User.hasMany(PasswordReset, {
    foreignKey: 'userId',
    as: 'passwordResets'
});

// Метод для генерации токена
PasswordReset.generateToken = function() {
    return crypto.randomBytes(32).toString('hex');
};

// Метод для проверки истечения срока
PasswordReset.prototype.isExpired = function() {
    return new Date() > this.expiresAt;
};

// Метод для пометки как использованного
PasswordReset.prototype.markAsUsed = async function() {
    this.used = true;
    await this.save();
};

module.exports = PasswordReset;