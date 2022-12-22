import { Socket } from "./ws.io.js"
import fs from "fs"
import url from 'url'
import path from 'path'
import express from "express"


let server = express().use((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = `./data/${parsedUrl.pathname}`;
  const mimeType = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.pdf': 'application/pdf',
  };
  fs.exists(pathname, function (exist) {
    if (!exist) {
      res.statusCode = 404;
      res.end(`File ${pathname} not found!`);
      return;
    }
    if (fs.statSync(pathname).isDirectory()) {
      pathname += 'index.html';
    }
    fs.readFile(pathname, function (err, data) {
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        const ext = path.parse(pathname).ext;
        res.setHeader('Content-type', mimeType[ext] || 'text/plain');
        res.end(data);
      }
    });
  });
}).listen(process.env.PORT || 3004);

const io = new Socket(server);

io.on("connect", socket => {
  console.log("connected");
  socket.on("bla", (...args) => {
    console.log("bla", ...args);
  })
})