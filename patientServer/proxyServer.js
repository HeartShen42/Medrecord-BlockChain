var http = require('http'),
    httpProxy = require('http-proxy');


var proxy = httpProxy.createProxyServer({});

// Create an HTTP server
http.createServer(function (req, res) {
  proxy.web(req, res, { target: 'http://localhost:3000' });
}).listen(8000);  

console.log("Proxy server running on http://localhost:8000")
