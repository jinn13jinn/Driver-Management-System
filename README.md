# ระบบบริหารการใช้รถของราชการ (Driver Management System)
### วิทยาลัยพยาบาลบรมราชชนนี สวรรค์ประชารักษ์ นครสวรรค์

ระบบเว็บแอปพลิเคชันบริหารจัดการและกำกับติดตามการใช้รถราชการ พัฒนาด้วย **Google Apps Script (GAS)**, **HTML5 / Modern CSS / Vanilla JavaScript** และเชื่อมต่อฐานข้อมูล **Google Sheets**

---

## 🌟 ฟังก์ชันหลักของระบบ (Key Features)

### 📊 Module 1: รายงานข้อมูลสรุปการปฏิบัติงาน (Dashboard & Calendar)
* **Google Calendar Month View**: ปฏิทินตารางเวร พขร. ประจำเดือน (รอบ 7 วัน เสาร์-ศุกร์) พร้อมแถบสีประจำตัว พขร. และป๊อปอัปดูรายละเอียดเวร/ภารกิจประจำวัน
* **สถานะความพร้อมแบบ Real-time & คิวถัดไป**: การ์ด พขร. 4 ท่าน พร้อมแถบไฮไลต์ลูกศร `👉 คิวถัดไป` คำนวณคิวที่จะได้รับการจัดสรรงานคนถัดไปอย่างเป็นธรรม
* **สถิติรายบุคคล & ตัวกรองย้อนหลัง**: สรุปยอดเที่ยววิ่งรวม, งานในเวร, ปฏิบัติงานนอกเหนือตารางเวร และอัตรา `Call-Out Rate (%)` พร้อม Dropdown เลือกดูย้อนหลังได้ทุกงวดเดือน
* **ตารางภารกิจการเดินรถ (Chronological Order)**: เรียงลำดับงานวันนี้/ปัจจุบันขึ้นบนสุด และไล่เรียงตามเวลาลงไปหาอนาคต

### 📝 Module 2: บันทึก/แก้ไข จัดการ การปฏิบัติงาน (Zero-Typing Admin Form)
* **Mobile-First Zero-Typing UI**: ตัด Dropdown ออกทั้งหมด ใช้ปุ่มกด 1-Tap (Pill / Chip Buttons)
* **Smart Presets**: ปุ่มลัดวันที่ `[วันนี้]` `[เมื่อวาน]` `[พรุ่งนี้]` และเวลาเดินทาง `[08:30]` `[09:00]` `[13:00]` `[16:30]` รวมถึงปุ่มขยายเวลากลับ `[+1 ชม.]` `[+2 ชม.]` `[12:00]` `[16:30]`
* **Auto-Lookup Shift Driver**: ดึงชื่อ พขร. เจ้าของเวรอัตโนมัติตามช่วงวันเดินทาง
* **Real-time Conflict Checking**: ตรวจสอบและบล็อก พขร. ที่มีคิวติดงานซ้อนกับช่วงเวลาที่เลือก
* **Auto Work-Type Classification**: จำแนกประเภท `งานในเวร` หรือ `ปฏิบัติงานนอกเหนือตารางเวร` ให้อัตโนมัติ
* **Audit Trail System**: ตารางจัดการแก้ไข/ลบรายการ พร้อมระบบบันทึกประวัติการแก้ไขลง `Audit_Logs` อัตโนมัติ

### 🗓️ Module 3: จัดการ ตารางเวร พขร. (Shift & Status Management)
* **Shift Schedule Master**: ตารางจัดการรอบเวรเสาร์-ศุกร์ พร้อมระบบคำนวณวันสิ้นสุด 7 วันอัตโนมัติ
* **Driver Status Switcher**: สลับสถานะ พขร. `พร้อมปฏิบัติงาน` / `ลา` แบบ Real-time

---

## 🔒 การควบคุมสิทธิ์และความปลอดภัย (Access Control)
* **โดเมนองค์กร**: จำกัดการเข้าใช้งานเฉพาะบุคลากรภายใต้โดเมน `@bcnsprnw.ac.th`
* **ระบบจำแนกบทบาท (Role Separation)**:
  * **Admin (ผู้ดูแลระบบ)**: `jinn13jinn@bcnsprnw.ac.th`, `wassana.t@bcnsprnw.ac.th` (บันทึก, แก้ไข, ลบ, จัดการเวร)
  * **Viewer (ดูข้อมูลเท่านั้น)**: บุคลากรทุกคนในองค์กร (เข้าดู Dashboard และปฏิทินเวร)

---

## 🛠️ สถาปัตยกรรมระบบ (Tech Stack)
* **Backend**: Google Apps Script (V8 Engine) - `รหัส.js`
* **Frontend**: HTML5, Tailwind CSS, SweetAlert2, FontAwesome, Google Fonts (Prompt & Sarabun) - `Index.html`
* **Database**: Google Sheets (5 Tabs: `Usage_Logs`, `Shift_Master`, `Driver_Master`, `Audit_Logs`, `Monthly_Summary`)
* **DevOps**: Google Clasp CLI

---

## 🚀 การติดตั้งและ Deploy ผ่าน Clasp
```bash
# ติดตั้ง dependencies
npm install -g @google/clasp

# เข้าสู่ระบบ Google
clasp login

# ส่งโค้ดขึ้น Apps Script
clasp push -f

# Deploy เวอร์ชันใหม่ (ต้องระบุ -i Deployment ID เดิมเสมอ)
clasp deploy -i AKfycbz5I5daF1CTZn8LGyQwvFoL78BvvRSxjL96rHK1WzSAdyzRpCamP8_wbRTMvd-Ef-KN -d "Release Description"
```
