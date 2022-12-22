import { Socket } from "./ws.io.js"
import fs from "fs"
import url from 'url'
import path from 'path'
import express from "express"
import https from 'https';

const password = "ef79103ea7669e41723aba18ff11d2b5589b91ad";

const post = ({ args, model, method }) => {
  return new Promise((resolve, reject) => {
    var postData = JSON.stringify({
      // jsonrpc: "2.0",
      params: {
        service: "object",
        method: "execute",
        args: ["openerp", 1569417, password, model, method, ...args]
      }
    })

    var options = {
      hostname: 'www.odoo.com',
      port: 443,
      path: '/jsonrpc',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    var req = https.request(options, (res) => {
      let data = "";
      res.on('data', (d) => {
        data += d;
      });
      res.on("end", () => {
        resolve(JSON.parse(data));
      })
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end()
  })
}
const read = async (model, ids, fields) => {
  const body = await post({
    args: [typeof ids == "number" ? [ids] : ids, typeof fields == "string" ? [fields]: fields],
    method: "read",
    model
  })
  return body.result;
}
const create = async (model, args) => {
  const body = await post({
    args: typeof args == "array" ? args: [args],
    method: "create",
    model
  })
  return body.result;
}

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
const createDescription = (url, data) => {
  let html = "";
  const title = `<h3><a href="${url}" target="_blank" rel="noreferrer">Sentry ticket</a></h3>`;
  html += title;
  const date = `<h3>Date</h3>
        <p>
            <span style="color: rgb(153, 141, 165); font-size: 14px; background-color: rgb(36, 29, 42); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;">
            <font class="bg-o-color-3" style="color: inherit;">${new Date(data.datetime).toUTCString()}</font>
            </span>
        </p>`
  html += date;
  const events = `<h3>Events</h3>
        <p>XX</p>`
  html += events;
  let tags = `<h3>Tags</h3>
        <table class="table table-bordered">
            <tbody>
            ${data.tags.map(tag => `<tr>
                <td><p>${tag[0]}</p></td>
                <td><p>${tag[1]}</p></td>
            </tr>`).join("\n")}
            </tbody>
        </table>`;
  html += tags;
  const message = `<h3>Message</h3>
        <pre>${data.message}</pre>`;
  html += message;
  const RAWstacktrace = `
        <h3>RAW Stacktrace</h3>
        <pre>
        ${data.exception.values[0].type}: ${data.exception.values[0].value}
        ${data.exception.values.map(value=>{
          return value.stacktrace.frames.map(frame => {
            return `${frame.filename}::${frame.module}.${frame.function}:${frame.lineno}\n${frame.context_line}`;
          }).join("\n")
        }).join("\n\n")}
        </pre>`
  html += RAWstacktrace;
  const processData = `
    <h3>Data</h3>
        <table class="table table-bordered">
            <tbody>
              ${[...Object.entries(data.extra), ["Python version", data.modules.python], ["SDK", data.sdk.name + " " + data.sdk.version]].map(p => {
    return `<tr>
                          <td><p>${p[0]}</p></td>
                          <td><p>${p[1]}</p></td>
                      </tr>`
  }).join("\n")}
            </tbody>
        </table>`
  html += processData;
  return html;
}
const postTicket = async (data = {}) => {
  const {
    stage_id,
    user_id,
    name,
    reviewer_id,
    tag_id,
    description,
  } = data;
  const payload = [
        {
          name,
          stage_id,
          "reviewer_id": reviewer_id,
          description,
          "user_ids": [[6, false, [user_id]]],
          "tag_ids": [[6, false, [tag_id]]],
          "recurrence_id": false,
          "company_id": 1,
          "recurrence_update": "this",
          "priority": "0",
          "kanban_state": "normal",
          "project_id": 49,
          "display_project_id": false,
          "x_owner_id": false,
          "active": true,
          "partner_id": false,
          "partner_phone": false,
          "sale_line_id": false,
          "planned_date_begin": false,
          "planned_date_end": false,
          "date_deadline": false,
          "recurring_task": false,
          "mnt_subscription_id": false,
          "planned_hours": 0,
          "x_reliability": false,
          "x_virtual_remaining": 0,
          "timesheet_ids": [],
          "child_ids": [],
          "depend_on_ids": [[6, false, []]],
          "repeat_interval": 1,
          "repeat_unit": "week",
          "sun": false,
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "repeat_on_month": "date",
          "repeat_on_year": "date",
          "repeat_day": false,
          "repeat_week": false,
          "repeat_weekday": false,
          "repeat_month": false,
          "repeat_type": "forever",
          "repeat_until": "2022-12-22",
          "repeat_number": 1,
          "analytic_account_id": 55,
          "analytic_tag_ids": [[6, false, []]],
          "parent_id": false,
          "sequence": 10,
          "email_from": false,
          "email_cc": false,
          "displayed_image_id": false,
          "x_no_dev": false,
          "x_lead_id": false,
          "x_date_production": false,
          "x_date_support": false,
          "x_review": "<p><br></p>",
          "enterprise_open_issue_ids": [],
          "message_follower_ids": [],
          "activity_ids": [],
          "message_ids": []
        }
      ]
  const ids = await create("project.task", payload);
  return typeof ids == "array" ? ids.length == 1 ? ids[0] : ids : ids;
}

const createOdooTicket = async (url, data) => {
  const eventUrl = url.replace("/json/", "");
  const description = createDescription(eventUrl, data);
  const id = await postTicket({
    stage_id: 194,
    user_id: 1569417,
    reviewer_id: 1569417,
    tag_id: 25564,
    name: data.title,
    description,
  });
  return id;
}

const io = new Socket(server);
io.on("connect", socket => {
  console.log("connected");
  socket.emit("connect");
  socket.on("createTicket", async (url, data, clbk = () => { }) => {
    const id = await createOdooTicket(url, data);
    clbk(id);
  })
})