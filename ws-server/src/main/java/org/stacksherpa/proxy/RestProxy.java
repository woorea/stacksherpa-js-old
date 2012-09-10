package org.stacksherpa.proxy;

import java.util.HashMap;
import java.util.Map;

import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpHead;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;

public class RestProxy {
	
	private static final HttpClient proxy = new DefaultHttpClient();
	
	public static Map<String, Object> execute(HttpRequestBase httpRequestBase, Map<String, String> headers) throws Exception {
		
		Map<String, Object> response = new HashMap<String, Object>();
		
		
		for(String headerName : new String[]{"Content-Type", "Accept", "X-Auth-Token"}) {
			String headerValue = headers.get(headerName);
			if(headerValue != null) {
				httpRequestBase.addHeader(headerName, headerValue);
			}
		}
		
		HttpResponse httpResponse = proxy.execute(httpRequestBase);
		
		HttpEntity httpEntity = httpResponse.getEntity();
		
		if(httpEntity != null) {
			response.put("entity", EntityUtils.toString(httpEntity));
			EntityUtils.consume(httpEntity);
		}
		
		
		Map<String, String> responseHeaders = new HashMap<>();
		for(Header header : httpResponse.getAllHeaders()) {
			responseHeaders.put(header.getName(), header.getValue());
		}
		
		response.put("headers", responseHeaders);
		response.put("status", httpResponse.getStatusLine().getStatusCode());
		
		return response;
	}
	
	public static Map<String, Object> get(String uri, Map<String, String> headers) throws Exception {
		HttpGet httpMethod = new HttpGet(uri);
		return execute(httpMethod, headers);
	}
	
	public static Map<String, Object> post(String uri, String entity, Map<String, String> headers) throws Exception {
		HttpPost httpMethod = new HttpPost(uri);
		httpMethod.setEntity(new StringEntity(entity));
		return execute(httpMethod, headers);
	}
	
	public static Map<String, Object> put(String uri, String entity, Map<String, String> headers) throws Exception {
		HttpPut httpMethod = new HttpPut(uri);
		httpMethod.setEntity(new StringEntity(entity));
		return execute(httpMethod, headers);
	}
	
	public static Map<String, Object> delete(String uri, Map<String, String> headers) throws Exception {
		HttpDelete httpMethod = new HttpDelete(uri);
		return execute(httpMethod, headers);
	}
	
	public static Map<String, Object> head(String uri, Map<String, String> headers) throws Exception {
		HttpHead httpMethod = new HttpHead(uri);
		return execute(httpMethod, headers);
	}

	/**
	 * @param args
	 */
	public static void execute() throws Exception {
		String json = "{\"auth\":{\"passwordCredentials\":{\"username\":\"demo\",\"password\":\"secret0\"}, \"tenantName\" : \"demo\"}}";
		post("http://192.168.1.38:5000/v2.0/tokens", json, new HashMap<String, String>() {{
			put("Content-Type", "application/json");
		}});
	
	}

}
