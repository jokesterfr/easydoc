/******************************************************************************
 *                                                                            *
 * @file mimetypes.js                                                         *
 * @author Clément Désiles <clement.desiles@telecomsante.com>                 *
 * @date 2012/04/30                                                           *
 *                                                                            *
 * Helper to get common mimetypes                                             *
 *                                                                            *
 *****************************************************************************/

var Mimetypes = {

	// Supported mimetypes
	types: {
		'appcache':'text/cache-manifest',
		'atom':'application/atom+xml',
		'avi':'video/x-msvideo',
		'css':'text/css',
		'gif':'image/gif',
		'htm':'text/html',
		'html':'text/html',
		'ico':'image/x-icon',
		'ics':'text/calendar',
		'jpeg':'image/jpeg',
		'jpg':'image/jpeg',
		'js':'text/javascript',
		'json':'application/json', //IANA standard
		'm3u':'audio/x-mpegurl',
		'm4a':'audio/mp4a-latm',
		'm4b':'audio/mp4a-latm',
		'm4p':'audio/mp4a-latm',
		'm4u':'video/vnd.mpegurl',
		'm4v':'video/x-m4v',
		'mov':'video/quicktime',
		'mp2':'audio/mpeg',
		'mp3':'audio/mpeg',
		'mp4':'video/mp4',
		'mpeg':'video/mpeg',
		'mpg':'video/mpeg',
		'mpga':'audio/mpeg',
		'png':'image/png',
		'svg':'image/svg+xml',
		'swf':'application/x-shockwave-flash',
		'txt':'text/plain',
		'wav':'audio/x-wav',
		'xht':'application/xhtml+xml',
		'xhtml':'application/xhtml+xml',
		'xml':'application/xml',
		'xsl':'application/xml',
		'xslt':'application/xslt+xml',
		'xul':'application/vnd.mozilla.xul+xml',
		'manifest':'text/cache-manifest',
		'ttf':'font/ttf'
	},

	/**
	 * Return the mimetype from the file extension
	 *
	 * @param ext {String} file extension
	 * @return {String} corresponding mimetype
	 */
	get: function(ext) {
		if (ext && ext in this.types) {
			return this.types[ext];
		}
		return 'unknown/unknown';
	},

	/**
	 * Mimetypes to gzip for optimization purpose
	 *
	 * Note: do not loose CPU over bandwith with already compressed
	 * formats such as avi, mp3, png, jpeg...
	 * @param mimetype {String}
	 * @return {Boolean} if mimetype can be gzipped
	 */
	isZippable: function(mimetype) {
		switch (mimetype) {
			case 'text/css':
			case 'application/xml':
			case 'application/xml':
			case 'application/xhtml+xml':
			case 'text/html':
			case 'text/html':
			case 'application/json':
			case 'text/javascript':
			case 'text/plain':
			case 'font/ttf':
				return true;
			default:
				return false;
		}
	}
}

// Export the module
module.exports = Mimetypes;