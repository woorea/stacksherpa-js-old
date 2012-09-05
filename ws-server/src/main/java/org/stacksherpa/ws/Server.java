package org.stacksherpa.ws;

import org.vertx.java.core.Handler;
import org.vertx.java.core.buffer.Buffer;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.http.ServerWebSocket;
import org.vertx.java.deploy.Verticle;

public class Server extends Verticle implements Handler<HttpServerRequest> {
	
	private String webRootPrefix = "web" + File.separator

	public void start() {
		vertx.createHttpServer()
			.websocketHandler(new Handler<ServerWebSocket>() {
				public void handle(final ServerWebSocket ws) {
					if (ws.path.equals("/myapp")) {
						ws.dataHandler(new Handler<Buffer>() {
							public void handle(Buffer data) {
								ws.writeTextFrame(data.toString()); // Echo it back
							}
						});
					} else {
						ws.reject();
					}
				}
			})
			.requestHandler(this)
			.listen(7070);
	}
	public void handle(HttpServerRequest req) {
		// browser gzip capability check
		//String acceptEncoding = req.headers().get("accept-encoding");
		//boolean acceptEncodingGzip = acceptEncoding == null ? false : acceptEncoding.contains("gzip");

		String fileName = webRootPrefix + req.path;
		if (req.path.equals("/")) {
			req.response.sendFile("index.html");
		} else if (!req.path.contains("..")) {
			// send not gzip file
			req.response.sendFile(fileName);
			/*
			// try to send *.gz file
			if (gzipFiles && acceptEncodingGzip) {
				File file = new File(PathAdjuster.adjust(fileName + ".gz"));
				if (file.exists()) {
					// found file with gz extension
					req.response.putHeader("content-encoding", "gzip");
					req.response.sendFile(fileName + ".gz");
				} else {
					// not found gz file, try to send uncompressed file
					req.response.sendFile(fileName);
				}
			} else {
				// send not gzip file
				req.response.sendFile(fileName);
			}
			*/
		} else {
			req.response.statusCode = 404;
			req.response.end();
		}
	}
}
