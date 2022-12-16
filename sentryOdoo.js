const postTicket = async (data = {}) => {
  const {
    stage_id,
    user_id,
    name,
    reviewer_id,
    tag_id,
    description,
  } = data;
  const payload = {
    "id": 72,
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "args": [
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
      ],
      "model": "project.task",
      "method": "create",
      "kwargs": {
        "context": {
          "lang": "en_US",
          "tz": "Europe/Brussels",
          "uid": 1569417,
          "allowed_company_ids": [1],
          "params": { "menu_id": 5879, "action": 3531, "cids": 1 },
          "search_default_my_tasks": 1,
          "search_default_display_project_id": 49,
          "default_project_id": 49
        }
      }
    }
  }
  const response = await fetch("https://www.odoo.com/web/dataset/call_kw/project.task/create", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7",
      "content-type": "application/json",
      "sec-ch-ua": "'Not?A_Brand';v='8', 'Chromium';v='108', 'Google Chrome';v='108'",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "'Windows'",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin"
    },
    "referrer": "https://www.odoo.com/web",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": JSON.stringify(payload),
    "method": "POST",
    "mode": "cors",
    "credentials": "include"
  });
  const json = await response.json();
  return json.result;
}



const createOdooTicket = async (url, data) => {
  const description = createDescription(url, data);
  const id = await postTicket({
    stage_id: 194,
    user_id: 1569417,
    reviewer_id: 1569417,
    tag_id: 25564,
    name: data.title,
    description,
  });
}

const createDescription = (url, data) => {
  const container = document.createElement("div");
  let html = "";
  const title = `<h3><a href="http://google.com" target="_blank" rel="noreferrer">Sentry ticket</a></h3>`;
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
      ${data.tags.map(tag=>`<tr>
        <td><p>${tag[0]}</p></td>
        <td><p>${tag[1]}</p></td>
      </tr>`)}
    </tbody>
  </table>`;
  html += tags;
  const message = `<h3>Message</h3>
  <pre>${data.message}</pre>`;
  const RAWstacktrace = `
  <h3>RAW Stacktrace</h3>
  <pre>
  ${data.exception.values[0].type}: ${data.exception.values[0].value}

  ${data.exception.values[0].stacktrace.frames.map(frame=>{
    return `${frame.filename}::${frame.module}.${frame.function}:${frame.lineno}\n${frame.context_line}`;
  })}
  </pre>`
  html += RAWstacktrace;
  const processData = `
  <table class="table table-bordered">
    <tbody>
      ${[...data.extra, ["Python version", data.modules.python], ["SDK", data.sdk.name + " " + data.sdk.version]].map(p => {
        return `<tr>
        <td><p>${p[0]}/p></td>
        <td><p>${p[1]}</p></td>
      </tr>`
      })}
    </tbody>
  </table>
  `
  html += processData;
  return html;
}