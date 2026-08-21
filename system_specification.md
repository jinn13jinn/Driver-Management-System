# SYSTEM PROMPT: DATABASE SCHEMA & LOGIC SPECIFICATION
# PROJECT: ระบบบริหารการใช้รถของราชการ (วิทยาลัยพยาบาลบรมราชชนนี สวรรค์ประชารักษ์ นครสวรรค์)

## 1. System Overview & Access Control
- Objective: บริหารจัดการและบันทึกข้อมูลพนักงานขับรถส่วนกลาง (4 คน) จากเอกสาร Paper ที่ ผอ. อนุมัติแล้ว
- Domain Constraints: เฉพาะบุคลากรในองค์กร (@bcnsprnw.ac.th)
- Access Control:
  * Admin (คีย์/แก้ไขข้อมูล/จัดการเวร): jinn13jinn@bcnsprnw.ac.th, wassana.t@bcnsprnw.ac.th
  * Viewer (ดู Dashboard เท่านั้น): บุคลากรทุกคนในโดเมน @bcnsprnw.ac.th

---

## 2. Database Schema (Google Sheets - 5 Tabs)

### Tab 1: Usage_Logs (ตารางบันทึกการใช้รถจริง)
- Doc_Date (Date, YYYY-MM-DD): วันที่ในเอกสารอนุมัติ
- Requester_Name (Text): ชื่อผู้ขอใช้รถ
- Position (Text): ตำแหน่งผู้ขอใช้รถ
- Objective (Text): ขออนุญาตใช้รถราชการเพื่อ (วัตถุประสงค์)
- Location_Start (Text): จุดเริ่มต้น (Default: "วิทยาเขต สปร.")
- Location_End (Text): สถานที่ปลายทาง
- Trip_Type (Dropdown): ลักษณะการเดินทาง [1. ไปส่งแล้วอยู่ค้างรอวันกลับ | 2. ไป-กลับภายในวันเดียว | 3. ไปส่งแล้วให้กลับแล้วไปรับวันกลับ | 4. ไปส่งหรือรับเที่ยวเดียว]
- Start_Datetime (Datetime, YYYY-MM-DD HH:mm): วัน-เวลา ออกเดินทาง
- End_Datetime (Datetime, YYYY-MM-DD HH:mm): วัน-เวลา เดินทางกลับ (คาดการณ์)
- Passenger_Count (Number): จำนวนผู้โดยสาร
- Shift_Driver (Text): ชื่อ พขร. เจ้าของเวรสัปดาห์นั้น (Lookup จาก Shift_Master)
- Actual_Driver (Text): ชื่อ พขร. ที่ปฏิบัติงานจริง (ดึงจากปุ่มที่กดเลือก)
- Work_Type (Text): ประเภทงาน [งานในเวร | ปฏิบัติงานนอกเหนือตารางเวร]
- Vehicle_ID (Text): สำรองไว้ใส่รหัสรถในอนาคต (ปัจจุบันเว้นว่าง)
- Created_At (Datetime): เวลาที่บันทึกข้อมูลเข้าสู่ระบบ
- Expense_Claim (Dropdown): การเบิกจ่ายค่าใช้จ่าย [1. เบิกค่าใช้จ่าย | 2. ไม่เบิก]

### Tab 2: Shift_Master (ตารางรอบเวรหลัก เสาร์-ศุกร์)
- Week_No (Number): ลำดับสัปดาห์ที่จัดเวร (1, 2, 3, ...)
- Start_Date (Date, YYYY-MM-DD): วันเสาร์เริ่มต้นกะ
- End_Date (Date, YYYY-MM-DD): วันศุกร์สิ้นสุดกะ (ระยะเวลา 7 วันเสมอ)
- Driver_ID (Text): รหัส พขร. [D001 | D002 | D003 | D004]
- Driver_Name (Text): ชื่อ พขร. เจ้าของเวร
- Updated_At (Datetime): วัน-เวลาที่มีการแก้ไขข้อมูลล่าสุด

### Tab 3: Driver_Master (ตารางข้อมูลพนักงานขับรถ 4 คน)
- Driver_ID (Text, PK): [D001 | D002 | D003 | D004]
- Driver_Name (Text): ชื่อ-นามสกุล พขร.
- Phone (Text): เบอร์โทรศัพท์
- Status (Text): สถานะปัจจุบัน [พร้อมปฏิบัติงาน | ลา]

### Tab 4: Audit_Logs (ประวัติการแก้ไขข้อมูลโดย Admin)
- Log_ID (Text, PK): รหัสรายการบันทึกประวัติ (e.g. LOG-001)
- Edited_At (Datetime): วัน-เวลาที่ทำการแก้ไข
- Admin_Email (Text): อีเมลแอดมินผู้แก้ไข
- Target_Row (Number): เลขแถวใน Sheet Usage_Logs ที่ถูกแก้ไข
- Field_Changed (Text): คอลัมน์ที่ถูกแก้ไข
- Old_Value (Text): ข้อมูลเดิมก่อนแก้
- New_Value (Text): ข้อมูลใหม่หลังแก้

### Tab 5: Monthly_Summary (ตารางสรุปสถิติรายเดือน)
- Year_Month (Text, YYYY-MM): งวดเดือน-ปี
- Driver_ID (Text): รหัส พขร.
- Driver_Name (Text): ชื่อ พขร.
- Total_Trips (Number): เที่ยววิ่งรวมทั้งหมด (On_Shift_Trips + Cover_Trips)
- On_Shift_Trips (Number): เที่ยววิ่งที่เป็นเวรตัวเอง
- Cover_Trips (Number): เที่ยววิ่งที่ไปปฏิบัติงานนอกเหนือตารางเวร/ไปแทนคนอื่น
- Call_Out_Rate (Percentage): อัตราส่วนการปฏิบัติงานนอกเหนือตารางเวร (Cover_Trips / Total_Trips)

---

## 3. กฎเกณฑ์ทางธุรกิจและสูตรคำนวณ (Business Rules & Logic)

1. **Auto-Lookup Shift Driver**:
   - เมื่อระบุวันเวลาเดินทาง ระบบจะนำ `Start_Datetime` ไปค้นหาใน `Shift_Master` ว่าตกอยู่ในช่วง `[Start_Date <= วันเดินทาง <= End_Date]` ของสัปดาห์ใด แล้วดึง `Driver_Name` มาเป็น `Shift_Driver` โดยอัตโนมัติ

2. **Auto Work-Type Classification**:
   - `IF (Shift_Driver == Actual_Driver)` -> Work_Type = "งานในเวร"
   - `IF (Shift_Driver != Actual_Driver)` -> Work_Type = "ปฏิบัติงานนอกเหนือตารางเวร"

3. **Conflict & Availability Check**:
   - ตรวจสอบคิวซ้อนใน `Usage_Logs` โดยเช็กช่วงเวลา `(New_Start < Exist_End AND New_End > Exist_Start)`
   - หาก พขร. ติดงานในช่วงเวลาดังกล่าว ปุ่มเลือก พขร. คนนั้นจะขึ้นสถานะ "ติดงาน" และถูก Disable

4. **Trip Type Priority Order**:
   - การแสดงผลประเภทการเดินทางต้องเรียงตามลำดับความสำคัญเสมอ: 
     1. ต่างจังหวัด(เหมาจ่าย) -> 2. ค้างคืน -> 3. ไป-กลับ

---

## 4. System Assets & Images
- **College Logo**: `https://lh5.googleusercontent.com/d/1fsZkrCDHOrfERVDD9Edeca7uMhtG765s`
- **Driver Photos**:
  - `D001 สุวิทย์ สิทธิไกร`: `https://lh5.googleusercontent.com/d/1hseQ7xnN1gUrLXr9qehGll2ncsTF-ZJX`
  - `D002 ศักดิ์ชัย เสราชโสภา`: `https://lh5.googleusercontent.com/d/1ehA3DVigsAyXVgPjO9O2_CwsasZmVxZE`
  - `D003 จักรกฤษณ์ นาวิก`: `https://lh5.googleusercontent.com/d/1fnr5M_rlNsh1VE0G0YdLKWNGkFOzlrqT`
  - `D004 ธนาวุฒิ ยุติธรรมวรวาท`: `https://lh5.googleusercontent.com/d/1eCgCgAv3zJ2lKs4EscVzEggXHe7Rg6KV`
