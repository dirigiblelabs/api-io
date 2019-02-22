/*
 * Copyright (c) 2010-2019 SAP and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   SAP - initial API and implementation
 */

/**
 * API v4 FTP
 * 
 * Note: This module is supported only with the Mozilla Rhino engine
 */

var bytes = require("io/v4/bytes");
var streams = require("io/v4/streams");

/**
 * Returns a FTP Client
 * 
 * @param {host} the ftp host
 * @param {port} the ftp port
 * @param {userName} the ftp user
 * @param {password} the ftp user's password
 * @return {FTPClient} the FTP Client
 */
exports.getClient = function(host, port, userName, password) {
	var manager = new FTPClientManager(host, port, userName, password);
	return new FTPClient(manager);
};

/**
 * Internal FTP Client Manager
 * 
 * @private
 */
function FTPClientManager(host, port, userName, password) {
	this.host = host;
	this.port = port;
	this.userName = userName;
	this.password = password;

	this.getCurrentFolder = function() {
		checkConnection(this);
		return this.instance.printWorkingDirectory();
	};

	this.setCurrentFolder = function(path, folderName) {
		checkConnection(this);
		return this.instance.changeWorkingDirectory(this.getFullPath(path, folderName));
	};

	this.list = function() {
		checkConnection(this);
		return this.instance.listFiles();
	};

	this.getFileStream = function(path, fileName) {
		try {
			checkConnection(this);
			var inputStream = new streams.InputStream();
			inputStream.native = this.instance.retrieveFileStream(this.getFullPath(path, fileName));
			return inputStream;
		} finally {
			disconnect(this);
		}
	};

	this.createFile = function(path, fileName, inputStream) {
		try {
			checkConnection(this);
			return this.instance.storeFile(this.getFullPath(path, fileName), inputStream.native);
		} finally {
			disconnect(this);
		}
	};

	this.deleteFile = function(path, fileName) {
		try {
			connect(this);
			return this.instance.deleteFile(this.getFullPath(path, fileName));
		} finally {
			disconnect(this);
		}
	};

	this.getFullPath = function(path, fileName) {
		if (path && path.length > 0 && fileName && fileName.length > 0) {
			return path + fileName;
		} else if (path && !fileName) {
			return path;
		}
		return fileName;
	};

	this.close = function() {
		disconnect(this);
	};

	function connect(context) {
		disconnect(context);
		context.instance = org.eclipse.dirigible.api.v3.io.FTPFacade.connect(context.host, context.port, context.userName, context.password);
	}

	function disconnect(context) {
		if (isConnected(context)) {
			org.eclipse.dirigible.api.v3.io.FTPFacade.disconnect(context.instance);
		}
	}

	function isConnected(context) {
		return context.instance && context.instance.isConnected();
	}

	function checkConnection(context) {
		if (!isConnected(context)) {
			connect(context);
		}
	}
}

/**
 * FTP Client
 */
function FTPClient(manager) {
	this.manager = manager;

	/**
	 * Returns the root folder
	 * 
	 * @return {FTPFolder} the root folder
	 */
	this.getRootFolder = function() {
		return new FTPFolder(this.manager, "/", "/");
	};

	/**
	 * Returns the content of the file as an Input Stream
	 * 
	 * @param {path} the path to the file
	 * @param {fileName} the name of the file
	 * @return {InputStream} the file content as an input stream
	 */
	this.getFile = function(path, fileName) {
		return this.manager.getFileStream(path, fileName);
	};

	/**
	 * Returns the content of the file as Byte Array
	 * 
	 * @param {path} the path to the file
	 * @param {fileName} the name of the file
	 * @return {Array} the file content as byte array
	 */
	this.getFileBinary = function(path, fileName) {
		var inputStream = this.getFile(path, fileName);
		return inputStream.isValid() ? inputStream.readBytes() : null;
	};

	/**
	 * Returns the content of the file as String
	 * 
	 * @param {path} the path to the file
	 * @param {fileName} the name of the file
	 * @return {String} the file content as string
	 */
	this.getFileText = function(path, fileName) {
		var inputStream = this.getFile(path, fileName);
		return inputStream.isValid() ? inputStream.readText() : null;
	};

	/**
	 * Returns the folder
	 * 
	 * @param {path} the path to the folder
	 * @param {folderName} the name of the folder
	 * @return {FTPFolder} the folder
	 */
	this.getFolder = function(path, folderName) {
		var exists = this.manager.setCurrentFolder(path, folderName);
		return exists ? new FTPFolder(this.manager, path, folderName) : null;
	};

	/**
	 * Create file from input stream
	 * 
	 * @param {path} the path to the file
	 * @param {fileName} the name of the file
	 * @param {inputStream} the input stream
	 * @return {Boolean} true if the file was created successfully
	 */
	this.createFile = function(path, fileName, inputStream) {
		return this.manager.createFile(path, fileName, inputStream);
	};

	/**
	 * Create file from byte array
	 * 
	 * @param {path} the path to the file
	 * @param {fileName} the name of the file
	 * @param {bytes} the bytes
	 * @return {Boolean} true if the file was created successfully
	 */
	this.createFileBinary = function(path, fileName, bytes) {
		var inputStream = streams.createByteArrayInputStream(bytes);
		return this.createFile(path, fileName, inputStream);
	};

	/**
	 * Create file from byte array
	 * 
	 * @param {path} the path to the file
	 * @param {fileName} the name of the file
	 * @param {text} the text
	 * @return {Boolean} true if the file was created successfully
	 */
	this.createFileText = function(path, fileName, text) {
		var inputStream = streams.createByteArrayInputStream(bytes.textToByteArray(text));
		return this.createFile(path, fileName, inputStream);
	};

	this.createFolder = function(path, folderName) {
		// TODO Implement me!
		throw new Error("Not Implemented");
	};

	/**
	 * Close the FTP Client
	 */
	this.close = function() {
		this.manager.close();
	};
}

function FTPObject(manager, instance, path, name) {
	this.manager = manager;
	this.instance = instance;
	this.path = path;
	this.name = name;

	this.getPath = function() {
		return this.path;
	};

	this.getName = function() {
		return this.name;
	};

	this.isFile = function() {
		return this.instance.isFile();
	};

	this.isFolder = function() {
		return this.instance.isDirectory();
	};

	this.getFile = function() {
		if (this.isFile()) {
			return new FTPFile(this.manager, this.instance, this.path, this.name);
		}
		return null;
	};

	this.getFolder = function() {
		if (this.isFolder()) {
			return new FTPFolder(this.manager, this.path, this.name);
		}
		return null;
	};
}

function FTPFolder(manager, path, name) {
	this.manager = manager;
	this.path = path;
	this.name = name;

	this.getPath = function() {
		return this.path;
	};

	this.getName = function() {
		return this.name;
	};

	this.getFile = function(fileName) {
		var files = this.listFiles();
		for (var i = 0; i < files.length; i ++) {
			if (files[i].getName() === fileName) {
				return files[i];
			}
		}
		return null;
	};

	this.getFolder = function(folderName) {
		// TODO Implement me!
		throw new Error("Not Implemented");
	};

	this.list = function() {
		var objects = [];
		var internalObjects = this.manager.list();
		for (var i = 0; i < internalObjects.length; i ++) {
			objects.push(new FTPObject(this.manager, internalObjects[i], this.path, internalObjects[i].getName()));
		}
		return objects;
	};

	this.listFiles = function() {
		var files = [];
		this.manager.setCurrentFolder(this.path, this.name);
		var internalObjects = this.manager.list();
		for (var i = 0; i < internalObjects.length; i ++) {
			if (internalObjects[i].isFile()) {
				files.push(new FTPFile(this.manager, internalObjects[i], this.path, internalObjects[i].getName()));
			}
		}
		return files;
	};

	this.listFolders = function() {
		var folders = [];
		this.manager.setCurrentFolder(this.path, this.name);
		var internalObjects = this.manager.list();
		for (var i = 0; i < internalObjects.length; i ++) {
			if (internalObjects[i].isDirectory()) {
				folders.push(new FTPFolder(this.manager, this.path, internalObjects[i].getName()));
			}
		}
		return folders;
	};

	this.createFile = function(fileName, inputStream) {
		var folderPath = this.manager.getFullPath(this.path, this.name);
		this.manager.createFile(folderPath, fileName, inputStream);
		return this.getFile(fileName);
	};

	this.createFileBinary = function(fileName, bytes) {
		var inputStream = streams.createByteArrayInputStream(bytes);
		return this.createFile(fileName, inputStream);
	};

	this.createFileText = function(fileName, text) {
		var inputStream = streams.createByteArrayInputStream(bytes.textToByteArray(text));
		return this.createFile(fileName, inputStream);
	};

	this.createFolder = function(folderName) {
		// TODO Implement me!
		throw new Error("Not Implemented");
	};

	this.delete = function() {
		this.manager.deleteFile(this.path, this.name);
	};

	this.deleteFile = function(fileName) {
		var folderPath = this.getFullPath(this.path, this.name);
		return this.manager.deleteFile(folderPath, fileName);
	};

	this.deleteFolder = function(folderName) {
		// TODO Implement me!
		throw new Error("Not Implemented");
	};
}

function FTPFile(manager, instance, path, name) {
	this.manager = manager;
	this.instance = instance;
	this.path = path;
	this.name = name;

	this.getPath = function() {
		return this.path;
	};

	this.getName = function() {
		return this.name;
	};

	this.getContent = function() {
		return this.manager.getFileStream(this.path, this.name);
	};

	this.getContentBinary = function() {
		var inputStream = this.getContent();
		return inputStream && inputStream.native ? inputStream.readBytes() : null;
	};

	this.getContentText = function() {
		var inputStream = this.getContent();
		return inputStream && inputStream.native ? inputStream.readText() : null;
	};

	this.setContent = function(inputStream) {
		this.manager.createFile(this.path, this.fileName, inputStream);
	};

	this.setContentBinary = function(bytes) {
		var inputStream = streams.createByteArrayInputStream(bytes);
		this.manager.createFile(this.path, this.fileName, inputStream);
	};

	this.setContentText = function(text) {
		var inputStream = streams.createByteArrayInputStream(bytes.textToByteArray(text));
		this.manager.createFile(this.path, this.fileName, inputStream);
	};

	this.delete = function() {
		this.manager.deleteFile(this.path, this.fileName);
	};
}