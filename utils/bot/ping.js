/* 
   * Code pris et modifier sur:
   * https://www.npmjs.com/package/jping
*/

// Imports
const net = require('net');
const { Resolver } = require('dns');
// Class
class Ping {
    /**
     * Ping
     * @param {string} host Host to request
     * @param {number} port  Port
     * @param {number} infinite Execute infinite
     * @param {number} Timeout of connection
     */
    constructor({
        host,
        port,
        infinite,
        timeout,
    }) {
        // Properties
        this.host = host;
        this.rhost = `${host.slice(0, 3)}*******`;
        this.port = port;
        this.timeout = timeout || 3000;
        this.infinite = infinite;
        // Config
        this.net = net;
        this.resolver = new Resolver();
        // Others
        this.finish = false;
        this.all = [];
        this.isDomain = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/g;
        this.average = 0;
        this.attempts = 0;
    }
    MyAverage() {
        return (this.average / this.attempts).toFixed(2);
    }
    Print(total) {
        // Print
        this.all.push(`PING: Reply from ${this.rhost} (port: ${this.port}), time = ${total}ms, average = ${this.MyAverage()}ms`);
        // console.log(`PING: Reply from ${this.host} (port: ${this.port}), time = ${total}ms, average = ${this.MyAverage()}ms`);
    }
    ResolverDomain() {
        // This
        const self = this;
        // Logic response
        const response = (resolve, reject) => {
            // Resolver
            this.resolver.resolve4(self.host, (err, ip) => {
                if (err) reject(err); // Error handler
                else resolve(ip);
            });
        };
        // Return
        return new Promise(response);
    }
    async go() {
        this.Send();
        return new Promise(resolve => {
            let e = setInterval(() => {
                if (this.finish) {
                    clearInterval(e);
                    resolve(this.all)
                }
            }, 1000);
        })
    }
    async Send(logs = true) {
        if (this.finish) return;
        // Print logs
        if (logs) {
            // Detect if is domain
            const domain = this.host.match(this.isDomain);
            if (domain) {
                // Resolver
                this.ResolverDomain()
                    .then((ip) => {
                        // Send logs
                        this.all.push(`PING: Pinging to ${this.rhost} (ip = ${ip}, port = ${this.port})`);
                        // Init system
                        this.Send(false);
                    })
                    .catch(console.error);
            } else {
                // Log
                this.all.push(`PING: Pinging to ${this.rhost} on port ${this.port}`);
                // Send
                this.Send(false);
            }
            return;
        }
        // Config
        const socket = net.Socket();
        this.Run(socket);
    }
    Run(socket) {
        if (this.finish) return;
        return new Promise(resolve => {
            // Config
            const startTime = new Date().getTime();
            // Start
            socket.connect(this.port, this.host, () => {
                // ResponseTime
                const responseTime = new Date().getTime();
                // Calcule
                const total = responseTime - startTime;
                // Properties
                this.attempts += 1;
                this.average += total;
                // Print
                this.Print(total);
                // Repeat
                if (this.infinite || this.attempts < 5) {
                    setTimeout(() => this.Send(false), 600);
                } else {
                    this.all.push(`PING: Ping average = ${this.MyAverage()}ms`);
                    this.finish = true;
                    return resolve(this.all);
                    // process.exit();
                }
            });
            // Error handler
            socket.on('error', () => {
                resolve(false)
                this.all.push(`PING: Error connection to ${this.rhost}:${this.port}`);
            });
        })
    }
}

// Export
module.exports = Ping;