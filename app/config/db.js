const mongoose = require('mongoose');
const logger = require('../utils/logger');

const DBcon = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        logger.info("Database connected");
    
    } catch (error) {
        logger.error(error);
    }
}


module.exports = DBcon;