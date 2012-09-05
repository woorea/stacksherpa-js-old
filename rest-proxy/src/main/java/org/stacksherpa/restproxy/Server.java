package org.stacksherpa.restproxy;


import java.util.Map;

import org.vertx.java.core.Handler;
import org.vertx.java.core.buffer.Buffer;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.deploy.Verticle;

public class Server extends Verticle {

  public void start() {
	  
    vertx.createHttpServer().requestHandler(new Handler<HttpServerRequest>() {
      public void handle(final HttpServerRequest req) {
    	  
    	  System.out.println("Got request: " + req.uri);
          System.out.println("Headers are: ");
          for (String key : req.headers().keySet()) {
            System.out.println(key + ":" + req.headers().get(key));
          }
    	  
          //TODO: populate response headers from proxy
          //req.response.headers().put("Content-Type", "text/html; charset=UTF-8");
    	  
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
    }).listen(9090);
  }
}
