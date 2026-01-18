const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Создаём папки, если они не существуют
const createUploadFolders = () => {
    const folders = [
        './uploads',
        './uploads/products',
        './uploads/categories',
        './uploads/temp',
        './public',
        './public/images'
    ];
    
    folders.forEach(folder => {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }
    });
};

// Вызываем создание папок при импорте
createUploadFolders();

// Настройка хранилища для Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = 'temp';
        
        if (req.baseUrl.includes('products')) {
            folder = 'products';
        } else if (req.baseUrl.includes('categories')) {
            folder = 'categories';
        }
        
        cb(null, `./uploads/${folder}/`);
    },
    filename: function (req, file, cb) {
        // Создаём уникальное имя файла: timestamp-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = path.basename(file.originalname, ext) + '-' + uniqueSuffix + ext;
        
        cb(null, filename);
    }
});

// Фильтр файлов (разрешаем только изображения)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Ошибка: разрешены только изображения (jpeg, jpg, png, gif, webp)'));
    }
};

// Создаём экземпляр multer с настройками
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB максимум
    },
    fileFilter: fileFilter
});

// Middleware для одной загрузки
const uploadSingle = (fieldName) => {
    return (req, res, next) => {
        const uploadMiddleware = upload.single(fieldName);
        uploadMiddleware(req, res, function(err) {
            if (err) {
                if (err instanceof multer.MulterError) {
                    // Ошибки Multer
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({
                            success: false,
                            message: 'Файл слишком большой. Максимальный размер: 5MB'
                        });
                    }
                    return res.status(400).json({
                        success: false,
                        message: `Ошибка загрузки файла: ${err.message}`
                    });
                } else if (err) {
                    // Другие ошибки
                    return res.status(400).json({
                        success: false,
                        message: err.message
                    });
                }
            }
            next();
        });
    };
};

// Middleware для множественной загрузки
const uploadMultiple = (fieldName, maxCount = 5) => {
    return (req, res, next) => {
        const uploadMiddleware = upload.array(fieldName, maxCount);
        uploadMiddleware(req, res, function(err) {
            if (err) {
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({
                            success: false,
                            message: 'Один или несколько файлов слишком большие. Максимальный размер: 5MB'
                        });
                    }
                    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                        return res.status(400).json({
                            success: false,
                            message: `Слишком много файлов. Максимум: ${maxCount}`
                        });
                    }
                    return res.status(400).json({
                        success: false,
                        message: `Ошибка загрузки файлов: ${err.message}`
                    });
                } else if (err) {
                    return res.status(400).json({
                        success: false,
                        message: err.message
                    });
                }
            }
            next();
        });
    };
};

// Функция для создания публичной ссылки на файл
const getPublicUrl = (filename, type = 'temp') => {
    if (!filename) return null;
    return `/images/${type}/${filename}`;
};

// Функция для перемещения файла из temp в постоянную папку
const moveFileToPermanent = async (tempFilename, targetFolder) => {
    try {
        const tempPath = `./uploads/temp/${tempFilename}`;
        const targetPath = `./uploads/${targetFolder}/${tempFilename}`;
        
        if (await fs.pathExists(tempPath)) {
            await fs.move(tempPath, targetPath, { overwrite: true });
            return true;
        }
        return false;
    } catch (error) {
        console.error('Ошибка при перемещении файла:', error);
        return false;
    }
};

module.exports = {
    uploadSingle,
    uploadMultiple,
    getPublicUrl,
    moveFileToPermanent
};