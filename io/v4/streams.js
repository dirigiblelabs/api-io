/*
 * Copyright (c) 2010-2020 SAP and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * Contributors:
 *   SAP - initial API and implementation
 */

const bytes = require('io/v4/bytes');

/**
 * InputStream object. To be used internally by the API layer
 */
exports.InputStream = function() {

	this.read = function() {
		return org.eclipse.dirigible.api.v3.io.StreamsFacade.read(this.native);
	};

	this.readBytes = function() {
		const native = org.eclipse.dirigible.api.v3.io.StreamsFacade.readBytes(this.native);
		return bytes.toJavaScriptBytes(native);
	};

	this.readBytesNative = function() {
		return org.eclipse.dirigible.api.v3.io.StreamsFacade.readBytes(this.native);
	};

	this.readText = function() {
		return org.eclipse.dirigible.api.v3.io.StreamsFacade.readText(this.native);
	};

	this.close = function() {
		org.eclipse.dirigible.api.v3.io.StreamsFacade.close(this.native);
	};

	this.isValid = function() {
		return this.native !== null;
	};

};

/**
 * OutputStream object. To be used internally by the API layer
 */
exports.OutputStream = function() {

	this.write = function(byte) {
		org.eclipse.dirigible.api.v3.io.StreamsFacade.write(this.native, byte);
	};

	this.writeBytes = function(data) {
		const native = bytes.toJavaBytes(data);
		org.eclipse.dirigible.api.v3.io.StreamsFacade.writeBytes(this.native, native);
	};

	this.writeBytesNative = function(data) {
		org.eclipse.dirigible.api.v3.io.StreamsFacade.writeBytes(this.native, data);
	};

	this.writeText = function(text) {
		org.eclipse.dirigible.api.v3.io.StreamsFacade.writeText(this.native, text);
	};

	this.close = function() {
		org.eclipse.dirigible.api.v3.io.StreamsFacade.close(this.native);
	};

	this.getBytes = function() {
		const native = org.eclipse.dirigible.api.v3.io.StreamsFacade.getBytes(this.native);
		const data = bytes.toJavaScriptBytes(native);
		return data;
	};

	this.getBytesNative = function() {
		const native = org.eclipse.dirigible.api.v3.io.StreamsFacade.getBytes(this.native);
		return native;
	};

	this.getText = function() {
		const value = org.eclipse.dirigible.api.v3.io.StreamsFacade.getText(this.native);
		return value;
	};

	this.isValid = function() {
		return this.native !== null;
	};

};

exports.copy = function(input, output) {
	org.eclipse.dirigible.api.v3.io.StreamsFacade.copy(input.native, output.native);
};

exports.copyLarge = function(input, output) {
	org.eclipse.dirigible.api.v3.io.StreamsFacade.copyLarge(input.native, output.native);
};

/**
 * Get an ByteArrayInputStream for the provided resource
 */
exports.getResourceAsByteArrayInputStream = function(path) {
	const inputStream = new exports.InputStream();
	inputStream.native = org.eclipse.dirigible.api.v3.io.StreamsFacade.getResourceAsByteArrayInputStream(path);
	return inputStream;
};

/**
 * Create an ByteArrayInputStream for byte array provided
 */
exports.createByteArrayInputStream = function(data) {
	const inputStream = new exports.InputStream();
	const array = bytes.toJavaBytes(data);
	inputStream.native = org.eclipse.dirigible.api.v3.io.StreamsFacade.createByteArrayInputStream(array);
	return inputStream;
};


/**
 * Create a ByteArrayOutputStream
 */
exports.createByteArrayOutputStream = function() {
	const outputStream = new exports.OutputStream();
	outputStream.native = org.eclipse.dirigible.api.v3.io.StreamsFacade.createByteArrayOutputStream();
	return outputStream;
};

/**
 * Create an InputStream object by a native InputStream
 */
exports.createInputStream = function(native) {
	const inputStream = new exports.InputStream();
	inputStream.native = native;
	return inputStream;
};

/**
 * Create an OutputStream object by a native OutputStream
 */
exports.createOutputStream = function(native) {
	const outputStream = new exports.OutputStream();
	outputStream.native = native;
	return outputStream;
};
