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

const createPool = (stream) => {
    pool || (pool = mysql.createPool({
        ...dbServer,
        stream
    }))
    return pool;
}

const databaseSSH = () => new Promise((resolve, reject) => {
    ssh.on('ready', () => {
        ssh.forwardOut(
            forwardConfig.srcHost,
            forwardConfig.srcPort,
            forwardConfig.dstHost,
            forwardConfig.dstPort,
            (err, stream) => {
                if (err) return reject(err);

                try {
                    const connection = mysql.createConnection({
                        ...dbServer,
                        stream
                    })
                    resolve(connection);
                } catch (err) {
                    reject(err);
                }
            }
        )
    }).connect(tunnelConfig);
})

module.exports = run = async (query, callback) => {
    const connection = await databaseSSH();
    connection.query(query, (err, result) => {
        callback(err, result);
    })
}