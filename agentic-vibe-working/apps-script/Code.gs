/**
 * Google Apps Script — nhận form Đặt lịch 1:1 → ghi vào Sheet.
 *
 * Sheet: https://docs.google.com/spreadsheets/d/1EwnkSvz8tNke2bHsCzEhuFjN6YbLAjR-7PnrSqjIvDY
 *
 * Cách triển khai (1 lần):
 * 1. Mở Sheet → Extensions (Tiện ích) → Apps Script
 * 2. Xóa code mặc định, dán toàn bộ file này → Save
 * 3. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy URL .../macros/s/.../exec → dán vào GAS_WEBAPP_URL trong index.html
 * 5. Hàng 1 Sheet nên có header: Timestamp | Name | Contact | Need | Note | Source
 */

var SHEET_ID = "1EwnkSvz8tNke2bHsCzEhuFjN6YbLAjR-7PnrSqjIvDY";
var SHEET_NAME = ""; // để trống = sheet đầu tiên (gid=0)

function doPost(e) {
  try {
    var data = parseBody_(e);
    var sheet = getSheet_();
    ensureHeader_(sheet);

    sheet.appendRow([
      new Date(),
      data.name || "",
      data.contact || "",
      data.need || "",
      data.note || "",
      data.source || "agentic-vibe-working",
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json_({
    ok: true,
    service: "agentic-vibe-working booking",
    hint: "POST JSON: name, contact, need, note",
  });
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Empty body");
  }
  var raw = String(e.postData.contents || "").trim();

  // Landing gửi JSON (kể cả Content-Type: text/plain để tránh CORS preflight)
  if (raw.charAt(0) === "{") {
    return JSON.parse(raw);
  }

  var out = {};
  raw.split("&").forEach(function (pair) {
    var p = pair.split("=");
    var k = decodeURIComponent((p[0] || "").replace(/\+/g, " "));
    var v = decodeURIComponent((p.slice(1).join("=") || "").replace(/\+/g, " "));
    out[k] = v;
  });
  return out;
}

function getSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  if (SHEET_NAME) return ss.getSheetByName(SHEET_NAME);
  return ss.getSheets()[0];
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow(["Timestamp", "Name", "Contact", "Need", "Note", "Source"]);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
