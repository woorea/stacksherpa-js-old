import sys
import httplib
import urlparse
import json

from flask import Flask, request, Response
from werkzeug.datastructures import Headers

app = Flask(__name__)

@app.route("/")
def http_proxy():
	
	#TODO: replace this json with the real stream coming from the request
	json_dict = { 
		'auth': {
			'passwordCredentials' : {
				'username' : 'demo',
				'password' : 'secret0'
			}
		}
	}
	json_data = json.dumps(json_dict)
	post_data = json_data.encode('utf-8')
	
	conn = httplib.HTTPConnection("192.168.1.37",5000)
	
	request_headers = {
		"content-type" : "application/json"
	}
	
	conn.request("POST", "/v2.0/tokens", body=post_data, headers=request_headers)
	resp = conn.getresponse()
	
	contents = resp.read()
	
	sys.stdout.write(contents)
	
	flask_response = Response(response=contents, status=resp.status, headers=resp.getheaders())
	
	return flask_response
	
if __name__ == "__main__":
    app.run()

