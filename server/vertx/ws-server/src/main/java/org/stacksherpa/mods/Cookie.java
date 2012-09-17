package org.stacksherpa.mods;

import org.vertx.java.core.http.HttpServerRequest;

/**
 * Super simple class for extracting and handling Cookies. Should probably replace with an existing
 * implementation.
 * 
 */
public class Cookie {

  /**
   * Get an array of Cookies from a request.
   */
  public static Cookie[] extractCookies(HttpServerRequest req) {
    String cookies = req.headers().get("Cookie");

    if (cookies == null) {
      return new Cookie[0];
    }

    String[] cookieStrArr = cookies.split(";");
    Cookie[] cookieArr = new Cookie[cookieStrArr.length];

    for (int i = 0; i < cookieStrArr.length; i++) {
      String cookie = cookieStrArr[i].trim();
      String[] cookieTup = cookie.split("=");
      cookieArr[i] = new Cookie(cookieTup[0], cookieTup[1]);
    }

    return cookieArr;
  }

  /**
   * @return a specific Cookie by name or {@code null} if it doesn't exist.
   */
  public static Cookie getCookie(String name, HttpServerRequest req) {
    Cookie[] cookies = extractCookies(req);
    for (Cookie cookie : cookies) {
      if (name.equals(cookie.name)) {
        return cookie;
      }
    }
    return null;
  }

  public final String name;
  public final String value;

  public Cookie(String name, String value) {
    this.name = name;
    this.value = value;
  }
}
