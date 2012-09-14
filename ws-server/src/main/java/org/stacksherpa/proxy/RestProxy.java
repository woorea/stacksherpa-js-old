package org.stacksherpa.proxy;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpHead;
import org.apache.http.client.methods.HttpOptions;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.entity.ByteArrayEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;

public class RestProxy {
	
	private static final HttpClient proxy;
	
	static {
		HttpParams httpParameters = new BasicHttpParams();
		// Set the timeout in milliseconds until a connection is established.
		// The default value is zero, that means the timeout is not used. 
		int timeoutConnection = 4000;
		HttpConnectionParams.setConnectionTimeout(httpParameters, timeoutConnection);
		// Set the default socket timeout (SO_TIMEOUT) 
		// in milliseconds which is the timeout for waiting for data.
		int timeoutSocket = 8000;
		HttpConnectionParams.setSoTimeout(httpParameters, timeoutSocket);
		
		proxy = new DefaultHttpClient(httpParameters);

	}
	
	 
	
	public static Map<String, Object> execute(HttpRequestBase httpRequestBase, Map<String, String> headers) {
		
		Map<String, Object> response = new HashMap<String, Object>();
		
		try {
			
			
			for(String notAllowedHeader : new String[]{
				"connection","host","accept-language","origin","user-agent","pragma","cache-control","accept-encoding","x-requested-with","referer","content-length"
			}) {
				headers.remove(notAllowedHeader);
			}
			
			//headers.put("accept", "application/json");
			
			for(Map.Entry<String, String> header : headers.entrySet()) {
				httpRequestBase.addHeader(header.getKey(), header.getValue());
				System.out.println(String.format("proxy:header>>%s:%s", header.getKey(), header.getValue()));
			}
			
			HttpResponse httpResponse = proxy.execute(httpRequestBase);
			
			HttpEntity httpEntity = httpResponse.getEntity();
			
			if(httpEntity != null) {
				response.put("entity", httpEntity.getContent());
			}
			
			
			Map<String, String> responseHeaders = new HashMap<>();
			for(Header header : httpResponse.getAllHeaders()) {
				responseHeaders.put(header.getName(), header.getValue());
				System.out.println(String.format("proxy:header<<%s:%s", header.getName(), header.getValue()));
			}
			
			response.put("headers", responseHeaders);
			response.put("status", httpResponse.getStatusLine().getStatusCode());
			
			
			
		} catch (IOException e) {
			System.out.println(e.getMessage());
			response.put("status", 500);;
		}
		
		return response;
		
	}
	
	public static Map<String, Object> get(String uri, Map<String, String> headers) throws Exception {
		HttpGet httpMethod = new HttpGet(uri);
		return execute(httpMethod, headers);
	}
	
	public static Map<String, Object> post(String uri, byte[] entity, Map<String, String> headers) throws Exception {
		HttpPost httpMethod = new HttpPost(uri);
		httpMethod.setEntity(new ByteArrayEntity(entity));
		return execute(httpMethod, headers);
	}
	
	public static Map<String, Object> put(String uri, byte[] entity, Map<String, String> headers) throws Exception {
		HttpPut httpMethod = new HttpPut(uri);
		httpMethod.setEntity(new ByteArrayEntity(entity));
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
	
	public static Map<String, Object> options(String uri, Map<String, String> headers) throws Exception {
		HttpOptions httpMethod = new HttpOptions(uri);
		return execute(httpMethod, headers);
	}

}
