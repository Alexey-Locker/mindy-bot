const http = require('http');
const { parse } = require("querystring");
const fs = require('fs');
const url = require('url');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 })


let variabel = [{ "name": "fasss", "type": "long", "time": '20:20', "actualTime": 50 }, { "name": "Lest", "type": "long", "time": '20:20', "actualTime": 200 }, { "name": "fassss", "type": "Short", "time": '20:20', "actualTime": 2000 }];
let maxShort = 3;
let connection = [];


wss.on('connection', ws => {
    console.log("connection");
    connection.push(ws);

    let response = JSON.stringify([{ "type": null, "value": maxShort }, { "type": "person", "value": variabel }]);

    ws.on('message', request => {

        let value = JSON.parse(request);

        if (value.type === "short") {

            if (value.message === 1 || value.message === -1) {
                maxShort = +maxShort + value.message;
            } else {
                maxShort = value.message;
            }

            response = JSON.stringify({ "type": "short", "value": maxShort });

        } else if (value.type === "add person") {

            console.log("OK");

        }
        connection.forEach(e => {

            e.send(response);

        })
    }).on("close", (...args) => {

        for (let i = 0; i < connection.length; i++) {

            if (connection[i] === ws) {

                connection.splice(i, 1);

            }
        }

        console.info('websocket close, try to reconnect...', args);

    })

    ws.send(response);

})


function clientPost(object) {

    let short = 0;

    for (let i = 0; i < variabel.length; i++) {

        if (variabel[i].type === "short") short++;

    }
    if (object.type === "сame back") {

        for (let i = 0; i < variabel.length; i++) {

            if (variabel[i].name === object.name) {

                variabel.slice(i, 1);

                return `Вы вернулись. Short ${short}           Long ${Math.abs(short - variabel.length)}`;

            }
        }
    } else if (variabel.length === maxShort && object.type !== "long") {

        return `На данный момент сейчас слишком много людей на перерыве. Short ${short}           Long ${Math.abs(short - variabel.length)}`

    }
    for (let i = 0; i < variabel.length; i++) {

        if (variabel[i].name === object.name) {

            return `На данный момент ты уже находишься на перерыве. Пожалуйста, нажми + <br>  Short ${short}           Long ${Math.abs(short - variabel.length)}`;

        }
    }
    variabel.push(object);

    (object.type === "short") ? short++ : "";

    return `Short ${short}           Long ${Math.abs(short  - variabel.length)}`;

}

http.createServer((request, response) => {

    if (request.method === "GET") {

        let filePath = request.url.substr(1);

        if (filePath === "") filePath = "index.html";

        fs.access(filePath, fs.constants.R_OK, err => {

            if (err) {
                response.statusCode = 404;
                response.end("Resourse not found!");
            } else {
                fs.createReadStream(filePath).pipe(response);
            }

        });

    } else {
        if ("/break") {
            let body = ""
            request.on("data", chunk => {
                body += chunk;
            })
            request.on("end", function() {
                request.setEncoding('utf8');
                const object = JSON.parse(body);

                let value = clientPost(object);
                response.end(JSON.stringify(value));
            })
        }
    }

}).listen(3000, function() {
    console.log("Server started at 3000");
});


function actualTime() {
    for (let i = 0; i < variabel.length; i++) {
        variabel[i].actualTime++;
    }
}

let seconds = setInterval(actualTime, 1000);