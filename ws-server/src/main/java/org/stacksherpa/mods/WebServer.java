package org.stacksherpa.mods;

import java.util.Map;

import org.vertx.java.busmods.BusModBase;
import org.vertx.java.core.Handler;
import org.vertx.java.core.buffer.Buffer;
import org.vertx.java.core.file.impl.PathAdjuster;
import org.vertx.java.core.http.HttpServer;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.http.ServerWebSocket;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.sockjs.SockJSServer;

import java.io.File;

import org.stacksherpa.proxy.RestProxy;

public class WebServer extends BusModBase implements Handler<HttpServerRequest> {

  private String webRootPrefix;
  private String indexPage;
  private boolean gzipFiles;

  public void start() {
    super.start();

    HttpServer server = vertx.createHttpServer();

    if (getOptionalBooleanConfig("ssl", false)) {
      server.setSSL(true).setKeyStorePassword(getOptionalStringConfig("key_store_password", "wibble"))
                         .setKeyStorePath(getOptionalStringConfig("key_store_path", "server-keystore.jks"));
    }
	
	/*
	server.websocketHandler(new Handler<ServerWebSocket>() {
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
	*/
	
    if (getOptionalBooleanConfig("static_files", true)) {
      server.requestHandler(this);
    }

    boolean bridge = getOptionalBooleanConfig("bridge", false);
    if (bridge) {
      SockJSServer sjsServer = vertx.createSockJSServer(server);
      JsonArray inboundPermitted = getOptionalArrayConfig("inbound_permitted", new JsonArray());
      JsonArray outboundPermitted = getOptionalArrayConfig("outbound_permitted", new JsonArray());

      sjsServer.bridge(getOptionalObjectConfig("sjs_config", new JsonObject().putString("prefix", "/eventbus")),
                       inboundPermitted, outboundPermitted,
                       getOptionalLongConfig("auth_timeout", 5 * 60 * 1000),
                       getOptionalStringConfig("auth_address", "vertx.basicauthmanager.authorise"));
    }

    gzipFiles = getOptionalBooleanConfig("gzip_files", false);
    String webRoot = getOptionalStringConfig("web_root", "web");
    String index = getOptionalStringConfig("index_page", "index.html");
    webRootPrefix = webRoot + File.separator;
    indexPage = webRootPrefix + index;

    server.listen(getOptionalIntConfig("port", 80), getOptionalStringConfig("host", "0.0.0.0"));
  }

  public void handle(HttpServerRequest req) {
	handleWeb(req);
  }

	private void handleWeb(HttpServerRequest req) {
		// browser gzip capability check
	    String acceptEncoding = req.headers().get("accept-encoding");
	    boolean acceptEncodingGzip = acceptEncoding == null ? false : acceptEncoding.contains("gzip");

	    String fileName = webRootPrefix + req.path;
	    if (req.path.equals("/")) {
	      req.response.sendFile(indexPage);
	    } else if (!req.path.contains("..")) {
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
	    } else {
	      req.response.statusCode = 404;
	      req.response.end();
	    }
	}

	private void handleApi(final HttpServerRequest req) {
		System.out.println("Got request: " + req.uri);
          System.out.println("Headers are: ");
          for (String key : req.headers().keySet()) {
            System.out.println(key + ":" + req.headers().get(key));
          }
    	  
        //TODO: populate response headers from proxy
    	req.response.headers().put("Access-Control-Allow-Origin", "*");
		req.response.headers().put("Access-Control-Allow-Headers", "x-url,x-auth-token");
    	final Map<String, Object> response;
    	try {
    		
    		final String uri = req.headers().remove("X-URI");
    		
    		if(uri != null) {
    			if("GET".equals(req.method)) {
        			req.response.end((String) RestProxy.get(uri, req.headers()).get("entity"));
            	} else if ("POST".equals(req.method)) {
            		req.bodyHandler(new Handler<Buffer>() {

    					@Override
    					public void handle(Buffer event) {
    						try {
    							req.response.end((String) RestProxy.post(uri, event.toString("UTF-8"), req.headers()).get("entity"));
    						} catch (Exception e) {
    							e.printStackTrace();
    						}
    						
    					}
    				
            		});
            		
            	} else if ("PUT".equals(req.method)) {
            		req.bodyHandler(new Handler<Buffer>() {

    					@Override
    					public void handle(Buffer event) {
    						try {
    							req.response.end((String) RestProxy.put(uri, event.toString("UTF-8"), req.headers()).get("entity"));
    						} catch (Exception e) {
    							e.printStackTrace();
    						}
    					}
    				
            		});
            	} else if ("DELETE".equals(req.method)) {
            		req.response.end((String) RestProxy.delete(uri, req.headers()).get("entity"));
            	} else if ("HEAD".equals(req.method)) {
            		req.response.end((String) RestProxy.head(uri, req.headers()).get("entity"));
            	} else if ("OPTIONS".equals(req.method)) {
            		//cors!
            	}
    		} else {
    			req.response.end("No X-URI HTTP Header found in this request");
    		}
    	} catch (Exception e) {
    		e.printStackTrace();
    	}
	}

}