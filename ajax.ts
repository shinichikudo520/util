// import pako from 'pako-deflate';
const pako = null;
const autoGzipAjaxPostSize = 1e4;
enum CONTENT_TYPE {
  JSON = "application/json",
  FORM = "application/x-www-form-unlencoded",
}

enum HEADERS_KEY {
  CONTENT_TYPE = "content-type",
}
enum NET_STATUS {
  SUCCESS = 200,
  ERROR = 500,
  NOT_FOUND = 404,
}

export default function ajax(
  type: "GET" | "POST" = "GET",
  url: string,
  data: any = {},
  options: any = {}
) {
  return new Promise<any>((resolve) => {
    try {
      let params, req;

      // 让 headers 的 key 都忽略大小写
      if (options.headers) {
        options.headers = lowerHeaders(options.headers);
      }

      const d = ajaxPreFilter(type, url, data, options);
      params = d.params;
      url = d.url;

      // 开始发送请求
      req = new XMLHttpRequest();
      req.open(type, url, true);
      handleAjaxHeaders(req, type, options);

      params = gzipRequest(req, type, url, params, options);

      req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === NET_STATUS.SUCCESS) {
          return resolve(JSON.parse(req.responseText));
        } else if (req.status === NET_STATUS.NOT_FOUND) {
          console.warn("catch ajax error...", req.status);
          return resolve({
            success: false,
            code: req.status,
            message: "Network Error!",
          });
        } else if (req.status === NET_STATUS.ERROR) {
          console.warn("catch ajax error...", req.status);
          return resolve({
            success: false,
            code: req.status,
            message: "Network Error!",
          });
        }
      };
      req.onerror = function (err) {
        console.warn("catch ajax error...", err);
        resolve({ success: false, message: "Network Error!" });
      };
      // 如果 send 较大的 Uint8Array 会很卡，改为 Blob 提速
      if (params instanceof Uint8Array) {
        const blob = new Blob([params]);
        req.send(blob);
      } else {
        req.send(params);
      }
      return req;
    } catch (error) {
      console.warn("catch ajax error...", error);
      resolve({ success: false, message: "Network Error!" });
    }
  });
}
/** headers 的 key 都忽略大小写 */
function lowerHeaders(headers: { [k: string]: string }) {
  const newHeaders = {};
  for (const k in headers) {
    const v = headers[k];
    newHeaders[k.toLocaleLowerCase()] = v;
  }
  return newHeaders;
}

function ajaxPreFilter(
  type: "GET" | "POST" = "GET",
  url: string,
  data: any = {},
  options: any = {}
) {
  let params, idx, value;
  let data_array = [];
  const headers = options.headers;

  if (data instanceof FormData) {
    params = data;
  } else if (headers?.[HEADERS_KEY.CONTENT_TYPE]?.includes(CONTENT_TYPE.JSON)) {
    params = JSON.stringify(data);
  } else {
    for (const idx in data) {
      const value = data[idx];
      if (value instanceof Array) {
        value.forEach((val) => {
          const s =
            encodeURIComponent(`${idx}[]`) + "=" + encodeURIComponent(val);
          data_array.push(s);
        });
      } else if (Object.prototype.toString.call(value) === "[object Object]") {
        for (const key in value) {
          const d = value[key];
          const s =
            encodeURIComponent(`${idx}[${key}]`) +
            "=" +
            (d ? encodeURIComponent(d) : "");
          data_array.push(s);
        }
      } else {
        const s = encodeURIComponent(idx) + "=" + encodeURIComponent(value);
        data_array.push(s);
      }
    }
    params = data_array.join("&");
  }

  // 處理url中的{name}
  // 比如 url: '/api/project/{uuid}'，type: 'GET',data:{uuid:123}，則需要將url转变成 '/api/project/123'，如项目无此类传参方式，则这段代码可省略
  const reg = /{[a-zA-Z]+}/gim;
  const matchArr = [...new Set(url.match(reg))];
  matchArr.forEach((item) => {
    const key = item.substring(1, item.length - 1);
    url = url.replace(item, data[key]);
  });

  return { params, url };
}

function handleAjaxHeaders(
  req: XMLHttpRequest,
  type: "GET" | "POST" = "GET",
  options: any = {}
) {
  const headers = options.headers;
  if (headers) {
    headers.forEach((v, k) => {
      // header 中的参数，只编码中文，不编码特殊符号，比如 ;/?:@&=+$,   （10个）
      req.setRequestHeader(encodeURI(k), encodeURI(v));
    });
    // contentType = false 时，不需要设置请求头 'conten-type'
    // 如果没有主动设置则默认是 "application/x-www-form-unlencoded"
    if (options.contentType !== false && !headers[HEADERS_KEY.CONTENT_TYPE]) {
      req.setRequestHeader(HEADERS_KEY.CONTENT_TYPE, CONTENT_TYPE.FORM);
    }
  } else {
    // contentType = false 时，不需要设置请求头 'conten-type'
    if (options.contentType !== false) {
      req.setRequestHeader(HEADERS_KEY.CONTENT_TYPE, CONTENT_TYPE.FORM);
    }
  }

  // 添加 xsrf 防御支持
  const method = type.toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    const m = /XSRF-TOKEN=(\S+);?/.exec(document.cookie);
    if (m) {
      req.setRequestHeader("X-XSRF-TOKEN", decodeURIComponent(m[1]));
    }
  }
}

function gzipRequest(
  req: XMLHttpRequest,
  type: "GET" | "POST" = "GET",
  url: string,
  params: any = {},
  options: any = {}
) {
  // 是post请求，且是本域内请求（'/'开头），才采用gzip
  // 本地不压缩
  if (
    type.match(/post/i) &&
    url[0] == "/" &&
    typeof params == "string" &&
    typeof pako == "object" &&
    params.length >= autoGzipAjaxPostSize
  ) {
    params = pako.gzip(params);
    req.setRequestHeader("Content-Encoding", "gzip");
  }
  return params;
}
