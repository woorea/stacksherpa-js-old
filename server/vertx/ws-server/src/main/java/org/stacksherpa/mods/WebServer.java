package org.stacksherpa.mods;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import org.stacksherpa.proxy.RestProxy;
import org.vertx.java.busmods.BusModBase;
import org.vertx.java.core.Handler;
import org.vertx.java.core.buffer.Buffer;
import org.vertx.java.core.file.impl.PathAdjuster;
import org.vertx.java.core.http.HttpServer;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.http.RouteMatcher;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.sockjs.SockJSServer;

public class WebServer extends BusModBase {
	
	private static final String API_CONTEXT_PATH = "/api";

	private String webRootPrefix;
	private String indexPage;
	private boolean gzipFiles;

	public void start() {
		
		super.start();
		
		RouteMatcher rm = new RouteMatcher();
		
		rm.all(API_CONTEXT_PATH, new Handler<HttpServerRequest>() {

			@Override
			public void handle(final HttpServerRequest req) {
				
				
		    	req.response.headers().put("Access-Control-Allow-Origin", "*");
				
		    	final Map<String, Object> response;
		    	
		    	try {
		    		
		    		final String uri = req.headers().remove("X-URI");
		    		
		    		if("OPTIONS".equals(req.method)) {
		    			if(req.headers().get("Access-Control-Request-Headers") != null) {
	    		    		req.response.headers().put("Access-Control-Allow-Headers", req.headers().get("Access-Control-Request-Headers"));
	    		    	}
	    		    	if(req.headers().get("Access-Control-Request-Method") != null) {
	    		    		req.response.headers().put("Access-Control-Allow-Methods", req.headers().get("Access-Control-Request-Method"));
	    		    	}
		    		}
	    			if(uri != null) {
		    			if("GET".equals(req.method)) {
							handleResponse(req, RestProxy.get(uri, req.headers()));
							
		            	} else if ("POST".equals(req.method)) {
		            		req.bodyHandler(new Handler<Buffer>() {

		    					@Override
		    					public void handle(Buffer event) {
		    						try {
		    							handleResponse(req, RestProxy.post(uri, event.getBytes(), req.headers()));
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
		    							handleResponse(req, RestProxy.put(uri, event.getBytes(), req.headers()));
		    						} catch (Exception e) {
		    							e.printStackTrace();
		    						}
		    					}
		    				
		            		});
		            	} else if ("DELETE".equals(req.method)) {
		            		handleResponse(req, RestProxy.delete(uri, req.headers()));
		            	} else if ("HEAD".equals(req.method)) {
		            		handleResponse(req, RestProxy.head(uri, req.headers()));
		            	} else if ("OPTIONS".equals(req.method)) {
		            		handleResponse(req, RestProxy.options(uri, req.headers()));
		            	}
		    		} else {
		    			req.response.end("No X-URI HTTP Header found in this request");
		    		}

		    	} catch (Exception e) {
		    		e.printStackTrace();
		    	}
			}
		
		});
		
		rm.get("/nova/key-pair/download", new Handler<HttpServerRequest>() {

			@Override
			public void handle(HttpServerRequest event) {
				// TODO Auto-generated method stub
				
			}
		
		});
		
		rm.get("/swift/download", new Handler<HttpServerRequest>() {

			@Override
			public void handle(HttpServerRequest event) {
				final Cookie cookie = Cookie.getCookie("X-Auth-Token", event);
				String swiftObjectURL = event.params().get("url");
				try {
					handleResponse(event, RestProxy.get(swiftObjectURL, new HashMap<String, String>(){{
						put(cookie.name, cookie.value);
					}}), true);
				} catch (Exception e) {
					event.response.statusCode = 500;
					event.response.statusMessage = e.getMessage();
					event.response.end(e.getMessage());
				}
			}
		
		});
		
		rm.get("/:provider/:tenant/compute/:region", new Handler<HttpServerRequest>() {

			@Override
			public void handle(HttpServerRequest event) {
				
				event.response.sendFile("web/compute/index.html");
			}
		
		});
		
		rm.noMatch(new Handler<HttpServerRequest>() {

			@Override
			public void handle(HttpServerRequest req) {
				
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
		
		});
		

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
			//server.requestHandler(this);
			server.requestHandler(rm);
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
	
	public void handleResponse(HttpServerRequest req, Map<String, Object> proxyResponse) {
		
		handleResponse(req, proxyResponse, false);
		
	}
	
	public void handleResponse(HttpServerRequest req, Map<String, Object> proxyResponse, boolean asAttachment) {
		
		req.response.statusCode = (Integer) proxyResponse.get("status");
		
		if(asAttachment) {
			req.response.headers().put("Content-disposition", "attachment; filename="+req.params().get("filename"));
		}
		
		
		Map<String,String> proxyResponseHeaders = (Map<String, String>) proxyResponse.get("headers");
		
		for(String headerName : new String[]{"Content-Type", "Content-Length", "Accept-Ranges","Last-Modified","Etag"}) {
			if(proxyResponseHeaders.get(headerName) != null) {
				req.response.headers().put(headerName, proxyResponseHeaders.get(headerName));
			}
		}
		
		InputStream entity = (InputStream) proxyResponse.get("entity");
		
		if(entity != null) {  
			try {
				req.response.setChunked(true);
				byte[] bytes = new byte[1024];
				int read = 0;
				while((read = entity.read(bytes)) > 0) {
					Buffer chunk = new Buffer();
					chunk.setBytes(0, Arrays.copyOfRange(bytes, 0, read));
					req.response.write(chunk);	
				}
				entity.close();
			} catch (IOException e) {
				req.response.write("error : " + e.getMessage());
			}
		}
		req.response.end();
		
		
	}

}