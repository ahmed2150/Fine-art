function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('رفع صور الطلاب');
}

function uploadFileToDrive(fileData, fileName, studentName) {
  try {
    // المجلد الرئيسي (الذي أعطيتني رابطَه)
    var mainFolderId = '11pTpys3A_vvO8CPvybTGz5vDnoPTISXA';
    var mainFolder = DriveApp.getFolderById(mainFolderId);
    
    // البحث عن مجلد فرعي باسم الطالب
    var subFolders = mainFolder.getFoldersByName(studentName);
    var studentFolder;
    
    if (subFolders.hasNext()) {
      // إذا كان المجلد موجوداً بالفعل، استخدمه
      studentFolder = subFolders.next();
    } else {
      // إذا لم يكن موجوداً، أنشئ مجلداً جديداً باسم الطالب
      studentFolder = mainFolder.createFolder(studentName);
    }
    
    // تحويل البيانات إلى ملف
    var blob = Utilities.newBlob(fileData, 'image/jpeg', fileName);
    
    // رفع الملف إلى مجلد الطالب
    var file = studentFolder.createFile(blob);
    
    // إعادة تسمية الملف
    var timestamp = new Date().toLocaleString('ar-EG');
    file.setName(studentName + ' - ' + fileName);
    file.setDescription('تم الرفع بواسطة: ' + studentName + ' | التاريخ: ' + timestamp);
    
    return '✅ تم رفع صورة الطالب: ' + studentName + ' بنجاح!\n📁 في مجلد: ' + studentName;
    
  } catch (error) {
    return '❌ حدث خطأ: ' + error.toString();
  }
}
