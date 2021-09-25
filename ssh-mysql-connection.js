const mysql = require('mysql2');
const {Client} = require('ssh2');
const {readUInt32BE} = require("ssh2/lib/protocol/utils");
const ssh = new Client();
require('dotenv').config();

let pool = null;
let database_ssh = null;


const dbServer = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
}

const tunnelConfig = {
    host: process.env.SSH_HOST,
    port: process.env.SSH_PORT,
    username: process.env.SSH_USER,
    password: process.env.SSH_PASSWORD
}

const forwardConfig = {
    srcHost: '127.0.0.1',
    srcPort: 12345,
    dstHost: dbServer.host,
    dstPort: dbServer.port
};

class db {
    static singleton = null;
    _pool = null;

    constructor() {
        if (db.singleton) return db.singleton;
        db.singleton = this;
        return this;
    }

    createPool() {
        return new Promise((resolve, reject) => {
            ssh.on('ready', () => {
                ssh.forwardOut(
                    forwardConfig.srcHost,
                    forwardConfig.srcPort,
                    forwardConfig.dstHost,
                    forwardConfig.dstPort,
                    (err, stream) => {
                        if (err) return reject(err);

                        try {
                            const pool = mysql.createPool({
                                ...dbServer,
                                stream,
                                waitForConnections: true,
                                connectionLimit: 1,
                                queueLimit: 0
                            })
                            resolve(pool);
                        } catch (err) {
                            reject(err);
                        }
                    }
                )
            }).connect(tunnelConfig);
        })
    }

    async run(query, callback) {
        this._pool = this._pool ?? await this.createPool();
        this._pool.getConnection((err, connection) => {
            if (err) throw err;
            connection.query(query, callback);
            connection.release();
        })
    }
}

module.exports = run = async function (query, callback) {
    const database = new db();
    await database.run(query, callback);
}