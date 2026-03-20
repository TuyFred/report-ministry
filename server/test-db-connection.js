require('dotenv').config();
const { Client } = require('pg');
const net = require('net');
const url = require('url');
const fs = require('fs');
const tls = require('tls');

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error('DATABASE_URL is missing');
    process.exit(1);
}

let parsed;
try {
    parsed = new url.URL(dbUrl);
    const host = parsed.hostname;
    const port = parsed.port || 5432;

    console.log(`Attempting TCP connection to ${host}:${port}...`);

    // Resolve DNS to check IP
    const dns = require('dns');
    dns.lookup(host, (err, address, family) => {
        if (err) {
            console.error('DNS Lookup failed:', err);
            fs.writeFileSync('ip_info.txt', 'DNS Lookup failed: ' + err.message);
        } else {
            console.log('Resolved IP:', address);
            fs.writeFileSync('ip_info.txt', 'Resolved IP: ' + address);
        }
    });

    const socket = new net.Socket();
    socket.setTimeout(5000);

    socket.on('connect', () => {
        console.log('TCP Connection successful!');
        socket.end();
        testPgConnection();
    });

    socket.on('timeout', () => {
        console.error('TCP Connection timed out');
        socket.destroy();
        process.exit(1);
    });

    socket.on('error', (err) => {
        console.error('TCP Connection error:', err.message);
        process.exit(1);
    });

    socket.connect(port, host);

} catch (err) {
    console.error('Error parsing DATABASE_URL:', err.message);
    process.exit(1);
}

function testPgConnection() {
    // Write URL info to file to avoid console encoding issues
    const urlInfo = {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port,
        pathname: parsed.pathname,
        search: parsed.search,
        auth: parsed.username ? 'User present' : 'No user'
    };
    fs.writeFileSync('url_info.txt', JSON.stringify(urlInfo, null, 2));
    console.log('URL info written to url_info.txt');

    console.log('Attempting raw TLS connection...');
    const socket = tls.connect({
        host: parsed.hostname,
        port: parsed.port || 5432,
        rejectUnauthorized: false,
        servername: parsed.hostname // SNI
    }, () => {
        console.log('TLS Handshake successful!');
        socket.end();

        // If TLS works, try PG again with specific settings
        console.log('Retrying PG Client with ssl: { rejectUnauthorized: false }...');
        const client = new Client({
            connectionString: dbUrl,
            ssl: {
                rejectUnauthorized: false
            }
        });

        client.connect()
            .then(() => {
                console.log('PG Connected successfully');
                return client.end();
            })
            .catch(err => {
                console.error('PG Connection error details:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
                process.exit(1);
            });
    });

    socket.on('error', (err) => {
        console.error('TLS Connection error:', err);
        // Even if TLS fails (expected for standard PG), try PG connect one last time
        // but this time we know direct TLS failed.
        process.exit(1);
    });
}
