// ===== إعدادات التطبيق =====
const FOLDER_ID = '11pTpys3A_vvO8CPvybTGz5vDnoPTISXA'; // مجلد الصور الرئيسي
const SHEET_ID = ''; // اختياري: ضع ID جوجل شيت لتسجيل البيانات

function doPost(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'upload') {
      return handleUpload(e);
    } else if (action === 'submit') {
      return handleSubmit(e);
    } else {
      return returnJson({ success: false, message: 'إجراء غير معروف' });
    }
  } catch (err) {
    return returnJson({ success: false, message: err.toString() });
  }
}

// ===== معالجة رفع الصورة =====
function handleUpload(e) {
  const file = e.file;
  const fileName = e.parameter.fileName || 'image.jpg';
  const studentName = e.parameter.studentName || 'طالب';
  
  if (!file) {
    return returnJson({ success: false, message: 'لا يوجد ملف مرفوع' });
  }
  
  const mainFolder = DriveApp.getFolderById(FOLDER_ID);
  
  let studentFolder;
  const folders = mainFolder.getFoldersByName(studentName);
  if (folders.hasNext()) {
    studentFolder = folders.next();
  } else {
    studentFolder = mainFolder.createFolder(studentName);
  }
  
  const blob = file.getBlob();
  const fileObj = studentFolder.createFile(blob);
  fileObj.setName(studentName + ' - ' + fileName);
  
  return returnJson({
    success: true,
    url: fileObj.getUrl(),
    fileId: fileObj.getId(),
    message: 'تم رفع الصورة بنجاح'
  });
}

// ===== معالجة إرسال النموذج =====
function handleSubmit(e) {
  // جمع البيانات
  const fullName = e.parameter.fullName || '';
  const uniId = e.parameter.uniId || '';
  const phone = e.parameter.phone || '';
  const nationalId = e.parameter.nationalId || '';
  const grade = e.parameter.grade || '';
  const level = e.parameter.level || '';
  const workNature = e.parameter.workNature || '';
  const execution = e.parameter.execution || '';
  const materials = e.parameter.materials || '';
  const styles = e.parameter.styles || '';
  const talents = e.parameter.talents || '';
  const notes = e.parameter.notes || '';
  const imageUrls = e.parameter.imageUrls || '[]';
  const imageCount = e.parameter.imageCount || 0;
  
  // حفظ البيانات في جوجل شيت (اختياري)
  if (SHEET_ID) {
    saveToSheet(fullName, uniId, phone, nationalId, grade, level, workNature, execution, materials, styles, talents, notes, imageUrls, imageCount);
  }
  
  return returnJson({
    success: true,
    message: 'تم التسجيل بنجاح',
    row: 1
  });
}

// ===== حفظ البيانات في جوجل شيت (اختياري) =====
function saveToSheet(fullName, uniId, phone, nationalId, grade, level, workNature, execution, materials, styles, talents, notes, imageUrls, imageCount) {
  if (!SHEET_ID) return;
  
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sheet1');
  if (!sheet) return;
  
  const timestamp = new Date();
  sheet.appendRow([
    timestamp,
    fullName,
    uniId,
    phone,
    nationalId,
    grade,
    level,
    workNature,
    execution,
    materials,
    styles,
    talents,
    notes,
    imageUrls,
    imageCount
  ]);
}

// ===== دالة مساعدة لإرجاع JSON =====
function returnJson(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== دالة للتعامل مع طلبات GET (للتجربة) =====
function doGet() {
  return ContentService.createTextOutput('الخدمة تعمل ✅');
}
