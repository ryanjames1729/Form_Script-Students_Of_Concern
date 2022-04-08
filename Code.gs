function myFunction() {

  // Get the data and sort by name and grade level
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.sort(2).sort(3)
  var data = sheet.getDataRange().getValues();

  var teacherList = [];
  var studentList = [];
  var concernList = [];
  var gradeList = [];

  // Threshold of concerns, if thresh = 2, only students with 2 or more concerns will run in report
  const concernThreshold = 2;

  // Data -> Arrays
  for (var i = 1; i < data.length; i++){
    var teacher = data[i][1].substring(1, data[i][1].indexOf("@"));
    teacher = teacher.charAt(0).toUpperCase() + teacher.slice(1);
    teacherList[i-1] = teacher;
    studentList[i-1] = data[i][2];
    gradeList[i-1] = data[i][3];
    concernList[i-1] = data[i][4];
  }

  // Filter out students that don't meet threshold concerns
  var count = 0;
  for (var i = studentList.length; i >= 0; i--) {
    var name = studentList[i];
    
    count = 0;
    for (var j = 0; j < studentList.length; j++) {
      if (name == studentList[j]) {
        count++;
      }
    }
    Logger.log(name + " " + count);
    if (count < concernThreshold) {
      var k = studentList.length;
      while (k--) {
        if (studentList[k] === name) {
          var index = studentList.indexOf(name);
          studentList.splice(index, 1);
          teacherList.splice(index, 1);
          gradeList.splice(index, 1);
          concernList.splice(index, 1);
        }
      }
    }
  }

  Logger.log(teacherList + "\n" + studentList + "\n" + concernList);

  // Clean the data -> get rid of duplicates and consolidate the comments
  var studentListCleaned = [];
  var gradeListCleaned = [];
  var commentList = [];

  for (var i = 0; i < studentList.length; i++) {
    var n = studentList[i];
    var g = gradeList[i];
    var c = "According to " + teacherList[i] + ", \'" + concernList[i] + "\'. ";
    for (var j = i+1; j < studentList.length; j++) {
      if (n == studentList[j]) {
        c += "According to " + teacherList[j] + ", \'" + concernList[j] + "\'. ";
      }
    }
    if (studentListCleaned.indexOf(n) < 0) {
      studentListCleaned.push(n)
      gradeListCleaned.push(g);
      commentList.push(c);
    }
  }

  Logger.log(studentListCleaned);
  Logger.log(gradeListCleaned);
  Logger.log(commentList);

  var doc = DocumentApp.create('Students of Concern');
  var body = doc.getBody();

  var image = 'https://scontent-atl3-2.xx.fbcdn.net/v/t1.6435-9/36637595_10156687891910362_8033954816449314816_n.png?_nc_cat=111&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=4vjcQ1MctVkAX89ACFQ&_nc_ht=scontent-atl3-2.xx&oh=00_AT833zTwIqTVcNqtmO2qESaTsGz3AJ784OFPU40OyxQVKw&oe=62638593';
  var blob = UrlFetchApp.fetch(image).getBlob();
  var inlineI = body.appendImage(blob);
  var width = inlineI.getWidth();
  var newW = width;
  var height = inlineI.getHeight();
  var newH = height;
  var ratio = width/height
  if(width>100){
    newW = 100;
    newH = parseInt(newW/ratio);
  }
  inlineI.setWidth(newW).setHeight(newH)
  var styles = {};
  styles[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] = DocumentApp.HorizontalAlignment.CENTER;
  inlineI.getParent().setAttributes(styles);


  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); 
  var yyyy = today.getFullYear();
  today = mm + '/' + dd + '/' + yyyy;
  body.appendParagraph("Students of Concern - " + today);

  const gradeLevels = [9, 10, 11, 12];

  for (var i= 0; i < gradeLevels.length; i++) {
    body.appendParagraph("\nGrade: " + gradeLevels[i] + "\n");

    for (var j = 0; j < studentListCleaned.length; j++) {
      if (gradeListCleaned[j] == gradeLevels[i]){
        var name = studentListCleaned[j];
        var comment = commentList[j];
        
        body.appendParagraph(name);
        // var nameBold = body.editAsText();
        // nameBold.setBold(true);
        body.appendParagraph(comment)
        body.appendParagraph("\n\n");
      }
    }
  }
  
  doc.saveAndClose();
  
}
