'use strict';

var net = require('net');

var server = net.createServer(handleConnection);

server.on('error', function(error) {
    console.log('Error en servidor: %s\n', error);
});

server.listen(11311);

function handleConnection(socket) {
    var database = {};

    socket.write('¿Hola?\r\n');

    socket.on('error', function(error) {
        console.log('Error en socket: %s\n', error);
    });

    socket.on('close', function() {
        console.log('Conexión cerrada por el cliente\n');
    });

    socket.on('data', function(data) {
        var startTime = Date.now();

        var message = data.toString().trim();

        if (!message) return;

        console.log('Data received %s', message);

        var command = message.split(' ');
        var salida;
        var key;

        switch (command[0]) {
            case 'set':
                if (command.length >= 3) {
                    key = command[1];

                    var value = command.slice(2).join(' ');

                    database[key] = value;

                    salida = 'STORED';
                }
                else {
                    salida = 'ERROR';
                }

                break;

            case 'get':
                if (command.length == 2) {
                    key = command[1];

                    if (database[key]) {
                        salida = `VALUE ${key} ${database[key]}`;
                    }
                    else {
                        salida = 'END';
                    }
                }
                else {
                    salida = 'ERROR';
                }

                break;

            case 'delete':
                if (command.length == 2) {
                    key = command[1];

                    if (database[key]) {
                        delete database[key];

                        salida = 'DELETED';
                    }
                    else {
                        salida = 'NOT_FOUND';
                    }
                }
                else {
                    salida = 'ERROR';
                }
                break;

            case 'quit':
                if (command.length == 1) {
                    return socket.end();
                }
                else {
                    salida = 'ERROR';
                }

                break;

            default:
                salida = 'ERROR';
        }

        socket.write(salida + '\n\r');
        console.log('Devolvemos ' +salida);

        console.log('Elapsed: %s ms.\n', Date.now() - startTime);
    });
}
