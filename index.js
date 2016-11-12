'use strict';

var testing = require('testing');
var net = require('net');
var simplecached = require('simplecached');


function Client(host, port) {
	this.host = host;
	this.port = port;
	this.clientDatabase = new net.Socket();
	this.clientDatabase = this.clientDatabase.setNoDelay(true);
}

function handleConnection() {
	console.log('Connected');
}

Client.prototype.connect = function(callback) {
	this.clientDatabase.connect(this.port, this.host, () => {
		this.clientDatabase.once('data', function(data){
			console.log('started: ' + data);
			return callback(null);
		});
	});
};

Client.prototype.get = function(key, callback){
	this.clientDatabase.write('get '+key+'\r\n');
	this.clientDatabase.once('data', (data) => {
		var result = String(data);
		result = result.trim();
		console.log('Received: ' + result);
		var salida = result.split(' ');
		callback(null, salida[2]);
	});
	
};

Client.prototype.set = function(key, value, callback){
	this.clientDatabase.write('set '+key+' '+value+'\r\n', function(){
		handleWrite('set ' + key + ' ' +value);
	});
	this.clientDatabase.once('data', function(data) {
		var result = String(data);
		console.log('Received: ' + data.toString());
		if (data == 'exit') {
			client.destroy(); // kill client after server's response
		}
		return callback(null, null);
	});
}

Client.prototype.delete = function(key, callback){
	this.clientDatabase.write('delete '+key+'\r\n', function(){
		handleWrite('delete ' + key );
	});
	this.clientDatabase.once('data', (data) => {
		var result = String(data);
		console.log('Received: ' + data.toString());
		if (data == 'exit') {
			client.destroy(); // kill client after server's response
		}
		return callback(null, null);
	});
}

Client.prototype.end = function(){
	this.clientDatabase.end();
}

function testClient(callback){
	var client = new Client('localhost', 11311);
	client.connect(function(error){
		testing.check(error, 'No connection', callback);
		client.get('hola', function(error, result){
			testing.check(error, 'Error en el get');
			testing.assert(!result, callback);
			client.set('hola', 'mundo', function(error){
				testing.check(error, 'Error en el set');
				client.get('hola', function(error, result){
					testing.check(error, 'Error en el get');
					testing.equals(result, 'mundo', callback);
					client.delete('hola', function(error, result){
						testing.check(error, 'Error en el get');
						client.get('hola', function(error, result){
							testing.check(error, 'Error en el get');
							testing.assert(!result, callback);
							testing.success(callback);
							client.end();
						});
						
					});
					
				});
			});
		})
		
	});
}

testing.run(testClient, testing.show);

//var cliente = new Client('localhost', 11311);
//cliente.connect(function(error, result){
//	console.log('Nos hemos conectado');
//});
//cliente.set('hola', 'mundo', callbackGenerico);
//cliente.get('hola', callbackGenerico);

function callbackGenerico(error, result){
	console.log('Nos hemos conectado');
}

function handleWrite( command ){
	console.log(`End write ${command}`);
}

