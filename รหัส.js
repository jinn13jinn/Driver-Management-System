/**
 * ระบบบริหารการใช้รถของราชการ (Driver Management System)
 * วิทยาลัยพยาบาลบรมราชชนนี สวรรค์ประชารักษ์ นครสวรรค์
 */

const CONFIG = {
  SPREADSHEET_ID: '1twRpHEhvUVtWOEYIbGjHID8fIMNgXC8YV83F5rGTN1M',
  ALLOWED_DOMAIN: 'bcnsprnw.ac.th',
  ADMIN_EMAILS: [
    'jinn13jinn@bcnsprnw.ac.th',
    'wassana.t@bcnsprnw.ac.th'
  ],
  DRIVERS: [
    { id: 'D001', name: 'สุวิทย์ สิทธิไกร', phone: '088-585-9957', photo: 'https://lh5.googleusercontent.com/d/1hseQ7xnN1gUrLXr9qehGll2ncsTF-ZJX' },
    { id: 'D002', name: 'จักรกฤษณ์ นาวิก', phone: '064-826-4672', photo: 'https://lh5.googleusercontent.com/d/1fnr5M_rlNsh1VE0G0YdLKWNGkFOzlrqT' },
    { id: 'D003', name: 'ศักดิ์ชัย เสราชโสภา', phone: '082-402-2112', photo: 'https://lh5.googleusercontent.com/d/1ehA3DVigsAyXVgPjO9O2_CwsasZmVxZE' },
    { id: 'D004', name: 'ธนาวุฒิ ยุติธรรมวรวาท', phone: '061-332-3175', photo: 'https://lh5.googleusercontent.com/d/1eCgCgAv3zJ2lKs4EscVzEggXHe7Rg6KV' }
  ],
  LOGO_URL: 'https://lh5.googleusercontent.com/d/1fsZkrCDHOrfERVDD9Edeca7uMhtG765s',
  ORG_NAME: 'วิทยาลัยพยาบาลบรมราชชนนี สวรรค์ประชารักษ์ นครสวรรค์',
  SYSTEM_NAME: 'ระบบบริหารการใช้รถของราชการ'
};

function getSpreadsheet() {
  if (CONFIG.SPREADSHEET_ID) {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Web App Entry Point
 */
function doGet(e) {
  const template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle(CONFIG.SYSTEM_NAME + ' - ' + CONFIG.ORG_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Helper to include HTML sub-templates if needed
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Get current user email and role
 */
function getCurrentUser() {
  let email = '';
  try {
    email = Session.getActiveUser().getEmail() || '';
  } catch (err) {
    email = '';
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  const isAdmin = CONFIG.ADMIN_EMAILS.map(e => e.toLowerCase()).includes(normalizedEmail);
  const isDomainUser = normalizedEmail.endsWith('@' + CONFIG.ALLOWED_DOMAIN) || isAdmin;

  return {
    email: email || 'Guest User',
    isAdmin: isAdmin,
    isDomainUser: isDomainUser,
    role: isAdmin ? 'Admin' : (isDomainUser ? 'Viewer' : 'External')
  };
}

/**
 * Fetch All Initial Data for Frontend
 */
function getInitialData() {
  const ss = getSpreadsheet();
  const user = getCurrentUser();
  
  const usageLogsSheet = ss.getSheetByName('Usage_Logs');
  const shiftMasterSheet = ss.getSheetByName('Shift_Master');
  const driverMasterSheet = ss.getSheetByName('Driver_Master');
  const auditLogsSheet = ss.getSheetByName('Audit_Logs');
  const monthlySummarySheet = ss.getSheetByName('Monthly_Summary');
  const leaveLogsSheet = ss.getSheetByName('Leave_Logs');

  const usageLogs = getSheetDataWithRows(usageLogsSheet);
  const shiftMaster = getSheetDataWithRows(shiftMasterSheet);
  const driverMaster = getSheetData(driverMasterSheet);
  const monthlySummary = getSheetData(monthlySummarySheet);
  const auditLogs = user.isAdmin ? getSheetData(auditLogsSheet) : [];
  const leaveLogs = getSheetDataWithRows(leaveLogsSheet);

  // Match Driver master with photo assets
  const drivers = CONFIG.DRIVERS.map(d => {
    const live = driverMaster.find(dm => dm.Driver_ID === d.id) || {};
    return {
      id: d.id,
      name: live.Driver_Name || d.name,
      phone: live.Phone || d.phone,
      status: live.Status || 'พร้อมปฏิบัติงาน',
      photo: d.photo
    };
  });

  return {
    user: user,
    config: {
      logoUrl: CONFIG.LOGO_URL,
      orgName: CONFIG.ORG_NAME,
      systemName: CONFIG.SYSTEM_NAME,
      adminEmails: CONFIG.ADMIN_EMAILS
    },
    drivers: drivers,
    usageLogs: usageLogs,
    shiftMaster: shiftMaster,
    leaveLogs: leaveLogs,
    monthlySummary: monthlySummary,
    auditLogs: auditLogs
  };
}

function getSheetData(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0].map(h => String(h).trim());
  const rows = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row.every(cell => cell === '' || cell === null)) continue;
    const obj = {};
    headers.forEach((header, colIndex) => {
      let val = row[colIndex];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, 'Asia/Bangkok', 'yyyy-MM-dd HH:mm');
      }
      obj[header] = val !== undefined && val !== null ? String(val).trim() : '';
    });
    rows.push(obj);
  }
  return rows;
}

function getSheetDataWithRows(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0].map(h => String(h).trim());
  const rows = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row.every(cell => cell === '' || cell === null)) continue;
    const obj = { _row: i + 1 }; // 1-based row index in Sheet
    headers.forEach((header, colIndex) => {
      let val = row[colIndex];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, 'Asia/Bangkok', 'yyyy-MM-dd HH:mm');
      }
      obj[header] = val !== undefined && val !== null ? String(val).trim() : '';
    });
    rows.push(obj);
  }
  return rows;
}

/**
 * Standardize Date Parsing (DD/MM/YYYY or YYYY-MM-DD or ISO)
 */
function parseDateTime(str) {
  if (!str) return null;
  if (str instanceof Date) return str;
  str = String(str).trim();
  
  // Format: DD/MM/YYYY HH:mm or DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const hour = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 0;
    const min = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
    const sec = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;
    return new Date(year, month, day, hour, min, sec);
  }

  // Format: YYYY-MM-DD HH:mm or YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const hour = ymdMatch[4] ? parseInt(ymdMatch[4], 10) : 0;
    const min = ymdMatch[5] ? parseInt(ymdMatch[5], 10) : 0;
    const sec = ymdMatch[6] ? parseInt(ymdMatch[6], 10) : 0;
    return new Date(year, month, day, hour, min, sec);
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * 1. Shift Lookup Rule:
 * Look up Shift_Master for Start_Date <= Start_Datetime <= End_Date
 */
function lookupShiftDriver(startDatetimeStr) {
  const targetDate = parseDateTime(startDatetimeStr);
  if (!targetDate) return { driverName: '', driverId: '' };

  const ss = getSpreadsheet();
  const shiftSheet = ss.getSheetByName('Shift_Master');
  const shiftData = getSheetData(shiftSheet);

  // Normalize target date to midnight for date comparison
  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();

  for (let i = 0; i < shiftData.length; i++) {
    const shift = shiftData[i];
    const sDate = parseDateTime(shift.Start_Date);
    const eDate = parseDateTime(shift.End_Date);
    if (!sDate || !eDate) continue;

    const sMidnight = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate()).getTime();
    const eMidnight = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate(), 23, 59, 59).getTime();

    if (targetMidnight >= sMidnight && targetMidnight <= eMidnight) {
      return {
        driverName: shift.Driver_Name,
        driverId: shift.Driver_ID,
        weekNo: shift.Week_No
      };
    }
  }

  return { driverName: '', driverId: '', weekNo: '' };
}

/**
 * 2. Conflict & Availability Check:
 * Check if a driver is busy in Usage_Logs: (New_Start < Exist_End AND New_End > Exist_Start)
 */
function checkDriverAvailability(startDatetimeStr, endDatetimeStr, excludeRow) {
  const newStart = parseDateTime(startDatetimeStr);
  const newEnd = parseDateTime(endDatetimeStr);
  
  const result = {
    D001: { isBusy: false, conflictInfo: '' },
    D002: { isBusy: false, conflictInfo: '' },
    D003: { isBusy: false, conflictInfo: '' },
    D004: { isBusy: false, conflictInfo: '' }
  };

  if (!newStart || !newEnd) return result;

  const ss = getSpreadsheet();
  const usageSheet = ss.getSheetByName('Usage_Logs');
  const logs = getSheetDataWithRows(usageSheet);

  logs.forEach(log => {
    if (excludeRow && log._row === excludeRow) return;

    const existStart = parseDateTime(log.Start_Datetime);
    const existEnd = parseDateTime(log.End_Datetime);
    if (!existStart || !existEnd) return;

    // Check overlap: (New_Start < Exist_End && New_End > Exist_Start)
    if (newStart.getTime() < existEnd.getTime() && newEnd.getTime() > existStart.getTime()) {
      const actualDriver = (log.Actual_Driver || '').trim();
      const matchedDriver = CONFIG.DRIVERS.find(d => d.name === actualDriver || actualDriver.includes(d.name.split(' ')[0]));
      
      if (matchedDriver && result[matchedDriver.id]) {
        const timeFmt = `${Utilities.formatDate(existStart, 'Asia/Bangkok', 'HH:mm')} - ${Utilities.formatDate(existEnd, 'Asia/Bangkok', 'HH:mm')}`;
        result[matchedDriver.id].isBusy = true;
        result[matchedDriver.id].conflictInfo = `${log.Location_End || 'มีภารกิจ'} (${timeFmt})`;
      }
    }
  });

  // Check Leave_Logs
  const leaveSheet = ss.getSheetByName('Leave_Logs');
  const leaves = getSheetDataWithRows(leaveSheet);

  leaves.forEach(lv => {
    const lvStart = parseDateTime(lv.Start_Date);
    const lvEnd = parseDateTime(lv.End_Date);
    if (!lvStart || !lvEnd) return;

    const lvEndFull = new Date(lvEnd.getFullYear(), lvEnd.getMonth(), lvEnd.getDate(), 23, 59, 59);

    if (newStart.getTime() <= lvEndFull.getTime() && newEnd.getTime() >= lvStart.getTime()) {
      if (result[lv.Driver_ID]) {
        result[lv.Driver_ID].isBusy = true;
        result[lv.Driver_ID].isLeave = true;
        result[lv.Driver_ID].conflictInfo = `ลา (${lv.Leave_Type || 'ลากิจ'} ${lv.Start_Date} ถึง ${lv.End_Date})`;
      }
    }
  });

  return result;
}

/**
 * Save Usage Log (Module 2)
 */
function saveUsageLog(payload) {
  const user = getCurrentUser();
  if (!user.isAdmin) {
    throw new Error('ขออภัย คุณไม่มีสิทธิ์บันทึกข้อมูล (เฉพาะ Admin เท่านั้น)');
  }

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Usage_Logs');
  if (!sheet) throw new Error('ไม่พบชีต Usage_Logs');

  // Format Dates
  const docDate = payload.docDate ? Utilities.formatDate(parseDateTime(payload.docDate), 'Asia/Bangkok', 'yyyy-MM-dd') : '';
  const startDatetime = payload.startDatetime ? Utilities.formatDate(parseDateTime(payload.startDatetime), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm') : '';
  const endDatetime = payload.endDatetime ? Utilities.formatDate(parseDateTime(payload.endDatetime), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm') : '';
  const createdAt = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');

  // 1. Shift Lookup Rule
  const shiftInfo = lookupShiftDriver(payload.startDatetime);
  const shiftDriver = shiftInfo.driverName || payload.shiftDriver || '';

  const driverList = Array.isArray(payload.actualDrivers) && payload.actualDrivers.length > 0
    ? payload.actualDrivers
    : [payload.actualDriver || ''];

  driverList.forEach(actualDriver => {
    let workType = 'งานในเวร';
    if (shiftDriver && actualDriver) {
      const sName = shiftDriver.replace(/^นาย\s*/, '').trim();
      const aName = actualDriver.replace(/^นาย\s*/, '').trim();
      if (sName !== aName) {
        workType = 'ปฏิบัติงานนอกเหนือตารางเวร';
      }
    }

    const newRow = [
      docDate,
      payload.requesterName || '',
      payload.position || '',
      payload.objective || '',
      payload.locationStart || 'วิทยาเขต สปร.',
      payload.locationEnd || '',
      payload.tripType || '2. ไป-กลับภายในวันเดียว',
      startDatetime,
      endDatetime,
      payload.passengerCount ? Number(payload.passengerCount) : 1,
      shiftDriver,
      actualDriver,
      workType,
      payload.vehicleId || '',
      createdAt,
      payload.expenseClaim || '1. เบิกค่าใช้จ่าย'
    ];

    sheet.appendRow(newRow);
  });

  // Recalculate Monthly Summary
  syncMonthlySummary(startDatetime);

  return {
    success: true,
    message: 'บันทึกข้อมูลการใช้รถเรียบร้อยแล้ว (' + driverList.length + ' คัน/คน)',
    shiftDriver: shiftDriver
  };
}

/**
 * Update Usage Log with Audit Trail (Module 2)
 */
function updateUsageLog(payload) {
  const user = getCurrentUser();
  if (!user.isAdmin) {
    throw new Error('ขออภัย คุณไม่มีสิทธิ์แก้ไขข้อมูล (เฉพาะ Admin เท่านั้น)');
  }

  const ss = getSpreadsheet();
  const usageSheet = ss.getSheetByName('Usage_Logs');
  const auditSheet = ss.getSheetByName('Audit_Logs');
  const rowNum = parseInt(payload.targetRow, 10);

  if (isNaN(rowNum) || rowNum < 2 || rowNum > usageSheet.getLastRow()) {
    throw new Error('ไม่พบแถวข้อมูลที่ต้องการแก้ไข');
  }

  const headers = usageSheet.getRange(1, 1, 1, usageSheet.getLastColumn()).getValues()[0];
  const oldRowValues = usageSheet.getRange(rowNum, 1, 1, usageSheet.getLastColumn()).getValues()[0];

  // Lookup shift and worktype again if dates or driver changed
  const startDatetime = payload.startDatetime ? Utilities.formatDate(parseDateTime(payload.startDatetime), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm') : oldRowValues[7];
  const endDatetime = payload.endDatetime ? Utilities.formatDate(parseDateTime(payload.endDatetime), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm') : oldRowValues[8];
  const actualDriver = payload.actualDriver || oldRowValues[11];
  
  const shiftInfo = lookupShiftDriver(startDatetime);
  const shiftDriver = shiftInfo.driverName || oldRowValues[10];

  let workType = 'งานในเวร';
  if (shiftDriver && actualDriver) {
    const sName = shiftDriver.replace(/^นาย\s*/, '').trim();
    const aName = actualDriver.replace(/^นาย\s*/, '').trim();
    if (sName !== aName) {
      workType = 'ปฏิบัติงานนอกเหนือตารางเวร';
    }
  }

  const newValuesMap = {
    Doc_Date: payload.docDate ? Utilities.formatDate(parseDateTime(payload.docDate), 'Asia/Bangkok', 'yyyy-MM-dd') : oldRowValues[0],
    Requester_Name: payload.requesterName !== undefined ? payload.requesterName : oldRowValues[1],
    Position: payload.position !== undefined ? payload.position : oldRowValues[2],
    Objective: payload.objective !== undefined ? payload.objective : oldRowValues[3],
    Location_Start: payload.locationStart !== undefined ? payload.locationStart : (oldRowValues[4] || 'วิทยาเขต สปร.'),
    Location_End: payload.locationEnd !== undefined ? payload.locationEnd : oldRowValues[5],
    Trip_Type: payload.tripType !== undefined ? payload.tripType : oldRowValues[6],
    Start_Datetime: startDatetime,
    End_Datetime: endDatetime,
    Passenger_Count: payload.passengerCount !== undefined ? Number(payload.passengerCount) : oldRowValues[9],
    Shift_Driver: shiftDriver,
    Actual_Driver: actualDriver,
    Work_Type: workType,
    Vehicle_ID: payload.vehicleId !== undefined ? payload.vehicleId : oldRowValues[13],
    Created_At: oldRowValues[14],
    Expense_Claim: payload.expenseClaim !== undefined ? payload.expenseClaim : (oldRowValues[15] || '1. เบิกค่าใช้จ่าย'),
    Cash_Use: payload.expenseClaim !== undefined ? payload.expenseClaim : (oldRowValues[15] || '1. เบิกค่าใช้จ่าย')
  };

  const auditTimestamp = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');
  const auditEntries = [];

  const updatedRowValues = headers.map((header, idx) => {
    const oldVal = oldRowValues[idx];
    const newVal = newValuesMap[header] !== undefined ? newValuesMap[header] : oldVal;

    let oldStr = oldVal instanceof Date ? Utilities.formatDate(oldVal, 'Asia/Bangkok', 'yyyy-MM-dd HH:mm') : String(oldVal || '');
    let newStr = String(newVal || '');

    if (oldStr !== newStr && header !== 'Created_At') {
      const logId = 'LOG-' + Utilities.getUuid().substring(0, 8).toUpperCase();
      auditEntries.push([
        logId,
        auditTimestamp,
        user.email,
        rowNum,
        header,
        oldStr,
        newStr
      ]);
    }
    return newVal;
  });

  // Write updated values
  usageSheet.getRange(rowNum, 1, 1, updatedRowValues.length).setValues([updatedRowValues]);

  // Write audit logs
  if (auditEntries.length > 0 && auditSheet) {
    auditSheet.getRange(auditSheet.getLastRow() + 1, 1, auditEntries.length, 7).setValues(auditEntries);
  }

  // Recalculate summary
  syncMonthlySummary(startDatetime);

  return {
    success: true,
    message: `แก้ไขข้อมูลแถวที่ ${rowNum} เรียบร้อยแล้ว (บันทึก Audit Log ${auditEntries.length} รายการ)`
  };
}

/**
 * Delete Usage Log (Module 2)
 */
function deleteUsageLog(rowNumber) {
  const user = getCurrentUser();
  if (!user.isAdmin) {
    throw new Error('ขออภัย คุณไม่มีสิทธิ์ลบข้อมูล');
  }

  const ss = getSpreadsheet();
  const usageSheet = ss.getSheetByName('Usage_Logs');
  const auditSheet = ss.getSheetByName('Audit_Logs');
  const rowNum = parseInt(rowNumber, 10);

  if (isNaN(rowNum) || rowNum < 2 || rowNum > usageSheet.getLastRow()) {
    throw new Error('ไม่พบแถวข้อมูลที่ต้องการลบ');
  }

  const oldRowValues = usageSheet.getRange(rowNum, 1, 1, usageSheet.getLastColumn()).getValues()[0];
  const auditTimestamp = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');
  const logId = 'LOG-DEL-' + Utilities.getUuid().substring(0, 8).toUpperCase();

  if (auditSheet) {
    auditSheet.appendRow([
      logId,
      auditTimestamp,
      user.email,
      rowNum,
      'ROW_DELETED',
      JSON.stringify(oldRowValues),
      'DELETED'
    ]);
  }

  usageSheet.deleteRow(rowNum);
  syncMonthlySummary();

  return {
    success: true,
    message: `ลบข้อมูลแถวที่ ${rowNum} เรียบร้อยแล้ว`
  };
}

/**
 * Shift Management: Save / Add / Update Shift (Module 3)
 */
function saveShift(payload) {
  const user = getCurrentUser();
  if (!user.isAdmin) {
    throw new Error('ขออภัย คุณไม่มีสิทธิ์จัดการตารางเวร');
  }

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Shift_Master');
  if (!sheet) throw new Error('ไม่พบชีต Shift_Master');

  const now = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');
  const startDate = payload.startDate ? Utilities.formatDate(parseDateTime(payload.startDate), 'Asia/Bangkok', 'yyyy-MM-dd') : '';
  const endDate = payload.endDate ? Utilities.formatDate(parseDateTime(payload.endDate), 'Asia/Bangkok', 'yyyy-MM-dd') : '';

  let rowNum = payload.targetRow ? parseInt(payload.targetRow, 10) : 0;

  // Validate duplicate / overlapping shifts
  const shifts = getSheetDataWithRows(sheet);
  const targetStart = parseDateTime(startDate);
  const targetEnd = parseDateTime(endDate);

  for (let i = 0; i < shifts.length; i++) {
    const s = shifts[i];
    if (rowNum && s._row === rowNum) continue;

    const existStart = parseDateTime(s.Start_Date);
    const existEnd = parseDateTime(s.End_Date);
    if (!existStart || !existEnd) continue;

    const isSameStart = startDate === Utilities.formatDate(existStart, 'Asia/Bangkok', 'yyyy-MM-dd');
    const isOverlap = targetStart && targetEnd && (targetStart.getTime() < existEnd.getTime() && targetEnd.getTime() > existStart.getTime());

    if (isSameStart || isOverlap) {
      throw new Error(`รอบสัปดาห์นี้ซ้ำซ้อนกับรอบเวรเดิม (${s.Start_Date} ถึง ${s.End_Date} โดย ${s.Driver_Name})`);
    }
  }
  if (rowNum >= 2) {
    sheet.getRange(rowNum, 1, 1, 6).setValues([[
      payload.weekNo,
      startDate,
      endDate,
      payload.driverId,
      payload.driverName,
      now
    ]]);
  } else {
    sheet.appendRow([
      payload.weekNo || (sheet.getLastRow()),
      startDate,
      endDate,
      payload.driverId,
      payload.driverName,
      now
    ]);
    rowNum = sheet.getLastRow();
  }

  return { 
    success: true, 
    message: 'บันทึกตารางเวรสำเร็จ',
    shift: {
      _row: rowNum,
      Week_No: String(payload.weekNo),
      Start_Date: startDate,
      End_Date: endDate,
      Driver_ID: payload.driverId,
      Driver_Name: payload.driverName,
      Updated_At: now
    }
  };
}

/**
 * Shift Management: Delete Shift (Module 3)
 */
function deleteShift(rowNum) {
  const user = getCurrentUser();
  if (!user.isAdmin) {
    throw new Error('ขออภัย คุณไม่มีสิทธิ์จัดการตารางเวร');
  }

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Shift_Master');
  if (!sheet) throw new Error('ไม่พบชีต Shift_Master');

  const r = parseInt(rowNum, 10);
  if (isNaN(r) || r < 2 || r > sheet.getLastRow()) {
    throw new Error('ไม่พบแถวรอบเวรที่ต้องการลบ');
  }

  sheet.deleteRow(r);
  return { success: true, message: 'ลบรอบเวรเรียบร้อยแล้ว' };
}

/**
 * Driver Status Management (Module 3)
 */
function updateDriverStatus(driverId, newStatus) {
  const user = getCurrentUser();
  if (!user.isAdmin) {
    throw new Error('ขออภัย คุณไม่มีสิทธิ์แก้ไขสถานะ พขร.');
  }

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Driver_Master');
  if (!sheet) throw new Error('ไม่พบชีต Driver_Master');

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(driverId).trim()) {
      sheet.getRange(i + 1, 4).setValue(newStatus);
      return { success: true, message: `อัปเดตสถานะ ${data[i][1]} เป็น ${newStatus} สำเร็จ` };
    }
  }

  throw new Error('ไม่พบรหัส พขร. ที่ระบุ');
}

/**
 * Leave Management: Save Leave (Module 3)
 */
function saveLeaveLog(payload) {
  const user = getCurrentUser();
  if (!user.isAdmin) {
    throw new Error('ขออภัย คุณไม่มีสิทธิ์จัดการการแจ้งลา');
  }

  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName('Leave_Logs');
  if (!sheet) {
    sheet = ss.insertSheet('Leave_Logs');
    sheet.appendRow(['Leave_ID', 'Driver_ID', 'Driver_Name', 'Leave_Type', 'Start_Date', 'End_Date', 'Reason', 'Created_At']);
  }

  const now = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');
  const startDate = payload.startDate ? Utilities.formatDate(parseDateTime(payload.startDate), 'Asia/Bangkok', 'yyyy-MM-dd') : '';
  const endDate = payload.endDate ? Utilities.formatDate(parseDateTime(payload.endDate), 'Asia/Bangkok', 'yyyy-MM-dd') : '';
  const leaveId = 'LV-' + Utilities.getUuid().substring(0, 8).toUpperCase();

  sheet.appendRow([
    leaveId,
    payload.driverId || '',
    payload.driverName || '',
    payload.leaveType || 'ลากิจ',
    startDate,
    endDate,
    payload.reason || '',
    now
  ]);

  return {
    success: true,
    message: `บันทึกการลาของ ${payload.driverName} เรียบร้อยแล้ว`,
    leave: {
      _row: sheet.getLastRow(),
      Leave_ID: leaveId,
      Driver_ID: payload.driverId,
      Driver_Name: payload.driverName,
      Leave_Type: payload.leaveType || 'ลากิจ',
      Start_Date: startDate,
      End_Date: endDate,
      Reason: payload.reason || '',
      Created_At: now
    }
  };
}

/**
 * Leave Management: Cancel / Delete Leave (Module 3)
 */
function cancelLeaveLog(rowNum) {
  const user = getCurrentUser();
  if (!user.isAdmin) {
    throw new Error('ขออภัย คุณไม่มีสิทธิ์ยกเลิกการลา');
  }

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName('Leave_Logs');
  if (!sheet) throw new Error('ไม่พบชีต Leave_Logs');

  const r = parseInt(rowNum, 10);
  if (isNaN(r) || r < 2 || r > sheet.getLastRow()) {
    throw new Error('ไม่พบแถวรายการลาที่ต้องการยกเลิก');
  }

  sheet.deleteRow(r);
  return { success: true, message: 'ยกเลิกรายการลาเรียบร้อยแล้ว' };
}

/**
 * Recalculate and Sync Monthly_Summary Sheet
 */
function syncMonthlySummary(sampleDateStr) {
  try {
    const ss = getSpreadsheet();
    const usageSheet = ss.getSheetByName('Usage_Logs');
    const summarySheet = ss.getSheetByName('Monthly_Summary');
    if (!usageSheet || !summarySheet) return;

    const logs = getSheetData(usageSheet);
    const summaryMap = {};

    logs.forEach(log => {
      const dt = parseDateTime(log.Start_Datetime);
      if (!dt) return;

      const ym = Utilities.formatDate(dt, 'Asia/Bangkok', 'yyyy-MM');
      const actualDriver = (log.Actual_Driver || '').trim();
      const workType = (log.Work_Type || '').trim();

      const matchedDriver = CONFIG.DRIVERS.find(d => 
        d.name === actualDriver || actualDriver.includes(d.name.split(' ')[0])
      );

      if (!matchedDriver) return;

      const key = `${ym}_${matchedDriver.id}`;
      if (!summaryMap[key]) {
        summaryMap[key] = {
          Year_Month: ym,
          Driver_ID: matchedDriver.id,
          Driver_Name: matchedDriver.name,
          Total_Trips: 0,
          On_Shift_Trips: 0,
          Cover_Trips: 0
        };
      }

      summaryMap[key].Total_Trips++;
      if (workType === 'งานในเวร') {
        summaryMap[key].On_Shift_Trips++;
      } else {
        summaryMap[key].Cover_Trips++;
      }
    });

    // Ensure all 4 drivers have rows for active months
    const allMonths = [...new Set(Object.values(summaryMap).map(s => s.Year_Month))];
    if (allMonths.length === 0) {
      allMonths.push(Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM'));
    }

    allMonths.forEach(ym => {
      CONFIG.DRIVERS.forEach(d => {
        const key = `${ym}_${d.id}`;
        if (!summaryMap[key]) {
          summaryMap[key] = {
            Year_Month: ym,
            Driver_ID: d.id,
            Driver_Name: d.name,
            Total_Trips: 0,
            On_Shift_Trips: 0,
            Cover_Trips: 0
          };
        }
      });
    });

    // Sort by Year_Month desc, Driver_ID asc
    const sortedRows = Object.values(summaryMap).sort((a, b) => {
      if (a.Year_Month !== b.Year_Month) {
        return b.Year_Month.localeCompare(a.Year_Month);
      }
      return a.Driver_ID.localeCompare(b.Driver_ID);
    });

    // Write back to Monthly_Summary
    summarySheet.clearContents();
    summarySheet.appendRow([
      'Year_Month',
      'Driver_ID',
      'Driver_Name',
      'Total_Trips',
      'On_Shift_Trips',
      'Cover_Trips',
      'Call_Out_Rate'
    ]);

    if (sortedRows.length > 0) {
      const outputValues = sortedRows.map(r => {
        const rate = r.Total_Trips > 0 ? Math.round((r.Cover_Trips / r.Total_Trips) * 100) + '%' : '0%';
        return [
          r.Year_Month,
          r.Driver_ID,
          r.Driver_Name,
          r.Total_Trips,
          r.On_Shift_Trips,
          r.Cover_Trips,
          rate
        ];
      });
      summarySheet.getRange(2, 1, outputValues.length, 7).setValues(outputValues);
    }
  } catch (e) {
    console.error('Error syncing Monthly_Summary: ' + e.message);
  }
}
