var cls = require("./lib/class"),
    url = require('url'),
    http = require('http'),
    WebSocket = require('ws'),
    websocket = require('websocket'),
    Utils = require('./utils'),
    _ = require('underscore'),
    BISON = require('bison'),
    WS = {},
    useBison = false;

module.exports = WS;


/**
 * Abstract Server and Connection classes
 */
var Server = cls.Class.extend({
    init: function(port) {
        this.port = port;
    },
    
    onConnect: function(callback) {
        this.connection_callback = callback;
    },
    
    onError: function(callback) {
        this.error_callback = callback;
    },
    
    broadcast: function(message) {
        throw "Not implemented";
    },
    
    forEachConnection: function(callback) {
        _.each(this._connections, callback);
    },
    
    addConnection: function(connection) {
        this._connections[connection.id] = connection;
    },
    
    removeConnection: function(id) {
        delete this._connections[id];
    },
    
    getConnection: function(id) {
        return this._connections[id];
    }
});


var Connection = cls.Class.extend({
    init: function(id, connection, server) {
        this._connection = connection;
        this._server = server;
        this.id = id;
    },
    
    onClose: function(callback) {
        this.close_callback = callback;
    },
    
    listen: function(callback) {
        this.listen_callback = callback;
    },
    
    broadcast: function(message) {
        throw "Not implemented";
    },
    
    send: function(message) {
        throw "Not implemented";
    },
    
    sendUTF8: function(data) {
        throw "Not implemented";
    },
    
    close: function(logError) {
        log.info("Closing connection to "+this._connection.remoteAddress+". Error: "+logError);
        this._connection.close();
    }
});



/**
 * MultiVersionWebsocketServer
 * 
 * Websocket server supporting WebSocket protocol using modern ws package.
 */
WS.MultiVersionWebsocketServer = Server.extend({
    _connections: {},
    _counter: 0,
    
    init: function(port) {
        var self = this;
        
        this._super(port);
        
        this._httpServer = http.createServer(function(request, response) {
            var path = url.parse(request.url).pathname;
            switch(path) {
                case '/status':
                    if(self.status_callback) {
                        response.writeHead(200);
                        response.write(self.status_callback());
                        break;
                    }
                default:
                    response.writeHead(404);
            }
            response.end();
        });
        
        this._httpServer.listen(port, function() {
            log.info("Server is listening on port "+port);
        });
        
        // Modern WebSocket server using 'ws' package
        this._wsServer = new WebSocket.Server({ 
            server: this._httpServer,
            perMessageDeflate: false // Disable compression to avoid issues
        });
        
        this._wsServer.on('connection', function(ws, request) {
            // Add remoteAddress property
            ws.remoteAddress = request.socket.remoteAddress;
            
            // Creating a normalized connection
            var c = new WS.modernWebSocketConnection(self._createId(), ws, self);
            
            if(self.connection_callback) {
                self.connection_callback(c);
            }
            self.addConnection(c);
        });
        
        this._wsServer.on('error', function(error) {
            log.error("WebSocket server error: " + error);
            if(self.error_callback) {
                self.error_callback(error);
            }
        });
    },
    
    _createId: function() {
        return '5' + Utils.random(99) + '' + (this._counter++);
    },
    
    broadcast: function(message) {
        this.forEachConnection(function(connection) {
            connection.send(message);
        });
    },
    
    onRequestStatus: function(status_callback) {
        this.status_callback = status_callback;
    }
});


/**
 * Connection class for modern WebSocket server (ws package)
 */
WS.modernWebSocketConnection = Connection.extend({
    init: function(id, connection, server) {
        var self = this;
        
        this._super(id, connection, server);
        
        this._connection.on('message', function(data) {
            if(self.listen_callback) {
                // Handle both string and binary messages
                if (typeof data === 'string') {
                    try {
                        if (useBison) {
                            self.listen_callback(BISON.decode(data));
                        } else {
                            self.listen_callback(JSON.parse(data));
                        }
                    } catch(e) {
                        log.error("Invalid message format: " + e);
                        self.close("Invalid message format");
                    }
                } else if (data instanceof Buffer) {
                    try {
                        if (useBison) {
                            self.listen_callback(BISON.decode(data));
                        } else {
                            self.listen_callback(JSON.parse(data.toString()));
                        }
                    } catch(e) {
                        log.error("Invalid binary message format: " + e);
                        self.close("Invalid binary message format");
                    }
                }
            }
        });
        
        this._connection.on('close', function(code, reason) {
            if(self.close_callback) {
                self.close_callback();
            }
            self._server.removeConnection(self.id);
        });
        
        this._connection.on('error', function(error) {
            log.error("WebSocket connection error: " + error);
            if(self.close_callback) {
                self.close_callback();
            }
            self._server.removeConnection(self.id);
        });
    },
    
    send: function(message) {
        var data;
        
        if(useBison) {
            data = BISON.encode(message);
        } else {
            data = JSON.stringify(message);
        }
        this.sendUTF8(data);
    },
    
    sendUTF8: function(data) {
        if (this._connection.readyState === WebSocket.OPEN) {
            this._connection.send(data);
        }
    },
    
    broadcast: function(message) {
        this._server.broadcast(message);
    }
});
