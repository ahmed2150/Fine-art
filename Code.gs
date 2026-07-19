function doPost(e) {
  try {
    // استقبال البيانات القادمة من موقع HTML وتحويلها من نص إلى كائن JSON
    var data = JSON.parse(e.postData.contents);
    
    // تعريف اسم المجلد الرئيسي الذي سيتم إنشاءه في Google Drive
    var mainFolderName = "صور الاعمال الفنية";
    var folders = DriveApp.getFoldersByName(mainFolderName);
    var mainFolder;
    
    // إذا كان المجلد الرئيسي موجوداً نستخدمه، وإلا نقوم بإنشائه
    if (folders.hasNext()) {
      mainFolder = folders.next();
    } else {
      mainFolder = DriveApp.createFolder(mainFolderName);
    }
    
    // إنشاء مجلد فرعي باسم الطالب وكوده الخاص المميز
    var studentFolderName = data.fullName + " - " + data.studentCode;
    var studentFolder = mainFolder.createFolder(studentFolderName);
    
    var imageUrls = [];
    if (data.images && data.images.length > 0) {
      for (var i = 0; i < data.images.length; i++) {
        var base64Data = data.images[i];
        
        // فصل نوع الصورة عن البيانات الفعلية (مثل data:image/jpeg;base64,...)
        var parts = base64Data.split(',');
        var mimeType = parts[0].split(':')[1].split(';')[0];
        var encodedData = parts[1];
        
        // فك تشفير الصورة وإنشاء ملف في Google Drive
        var decodedData = Utilities.base64Decode(encodedData);
        var fileExtension = mimeType.split('/')[1] || "jpg"; // استخراج الامتداد
        var fileName = "صورة_" + (i + 1) + "." + fileExtension;
        
        var blob = Utilities.newBlob(decodedData, mimeType, fileName);
        var file = studentFolder.createFile(blob);
        
        // حفظ رابط الصورة (اختياري، هنا نحفظ رابط المجلد بالكامل لاحقاً)
        imageUrls.push(file.getUrl());
      }
    }
    
    // فتح الشيت النشط
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // إضافة العناوين في الصف الأول إذا كان الشيت فارغاً
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "وقت التسجيل", "كود الطالب", "الاسم رباعي", "رقم الواتساب", "الرقم القومي", 
        "العنوان", "الفرقة الدراسية", "الخامات", "نوع الرسم", "نوع الموهبة", 
        "المستوى", "طبيعة العمل", "التنفيذ", "أسئلة الطالب", "رابط مجلد أعمال الطالب"
      ]);
      // تجميد الصف الأول وتنسيقه
      sheet.getRange(1, 1, 1, 15).setFontWeight("bold").setBackground("#f3f4f6");
      sheet.setFrozenRows(1);
    }
    
    // تجهيز صف البيانات الجديد
    var rowData = [
      new Date(), // وقت التسجيل
      data.studentCode,
      data.fullName,
      "'" + data.whatsapp, // وضع علامة ' لمنع الإكسيل من حذف الصفر على اليسار
      "'" + data.nationalId, // وضع علامة ' لمنع تحويل الرقم إلى صيغة علمية
      data.address,
      data.academicYear,
      (data.materials || []).join("، "),
      (data.artStyles || []).join("، "),
      (data.talents || []).join("، "),
      data.level,
      data.workNature,
      data.execution,
      data.questions,
      studentFolder.getUrl() // رابط المجلد الذي يحتوي على صور الطالب
    ];
    
    // إضافة البيانات كصف جديد في الشيت
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({
      "status": "success",
      "message": "تم حفظ البيانات ورفع الصور بنجاح",
      "folderUrl": studentFolder.getUrl()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
