module.exports = (function () {
    const { Op, Sequelize } = require('sequelize');
    const SequelizeAuto = require('sequelize-auto');

    const tunnel = require('tunnel-ssh');
    require('dotenv').config();

    const db_config = {
        database: process.env.DB_DATABASE,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        dialect: 'mysql',
    };

    const ssh_config = {
        username: process.env.SSH_USER,
        password: process.env.SSH_PASSWORD,
        host: process.env.SSH_HOST,
        port: process.env.SSH_PORT,
        dstHost: process.env.DB_HOST,
        dstPort: process.env.DB_PORT,
    };

    const sequelize = new Sequelize(
        db_config.database,
        db_config.username,
        db_config.password,
        db_config
    );

    function getORM() {
        return new Promise((resolve, reject) => {
            sequelize
                .authenticate()
                .then(() => {
                    const init_models = require('./init-models');
                    const orm = init_models(sequelize);
                    resolve(orm);
                })
                .catch(async (exception) => {
                    if (exception.name === 'SequelizeConnectionRefusedError') {
                        await sshTunneling();
                        const orm = await getORM();
                        resolve(orm);
                    } else reject(exception);
                });
        });
    }

    function initModels() {
        new SequelizeAuto(
            db_config.database,
            db_config.username,
            db_config.password,
            {
                host: db_config.host,
                port: process.env.DB_PORT,
                dialect: db_config.dialect,
            }
        ).run();
    }

    function sshTunneling() {
        return new Promise((resolve, reject) => {
            tunnel(ssh_config, function (error, server) {
                if (error) {
                    reject(error);
                } else if (server !== null) {
                    resolve(server);
                }
            });
        });
    }

    sshTunneling().then(() => initModels());

    return async function () {
        const orm = await getORM();
        return orm;
    };
})();
