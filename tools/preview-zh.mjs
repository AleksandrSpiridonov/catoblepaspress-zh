import http from "node:http"
import handler from "serve-handler"

const prefix = "/catoblepaspress-zh"
http
  .createServer((req, res) => {
    if (req.url === "/" || req.url === prefix) {
      res.writeHead(302, { Location: prefix + "/" }).end()
      return
    }
    if (!req.url.startsWith(prefix + "/")) {
      res.writeHead(404).end("Not found")
      return
    }
    req.url = req.url.slice(prefix.length)
    const writeHead = res.writeHead.bind(res)
    res.writeHead = (status, headers) => {
      if (headers?.Location?.startsWith("/")) {
        headers = { ...headers, Location: prefix + headers.Location }
      }
      return writeHead(status, headers)
    }
    return handler(req, res, { public: "public", cleanUrls: true })
  })
  .listen(8093, "127.0.0.1", () => {
    console.log("Chinese preview: http://127.0.0.1:8093/catoblepaspress-zh/")
  })
