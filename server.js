let http = require('http');
let fs = require('fs');
let url = require('url');
let port = 8080;

http.createServer((req, res) => {
    let parsedUrl = url.parse(req.url, true);
    let path = parsedUrl.pathname;

    // log each request
    let logline = `[${new Date().toISOString()}] ${path}\n`;
    fs.appendFile('log.txt', logline, (err) => {
        if (err) console.error("Error writing to log:", err);
    });

    // decide which file to serve
    let fileserve = "index.html";
    if (path.includes("documentation")) {
        fileserve = "documentation.html";
    }

    // read the file and send it
    fs.readFile(fileserve, (err, data) => {
        if (err) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("404 Not Found");
            return;
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
    });

}).listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
