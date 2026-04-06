/**
 * Instruções para vincular a gravação de dados:
 * 1. Na sua planilha Google, vá em Extensões > Apps Script.
 * 2. Apague o código que estiver lá e cole este abaixo.
 * 3. Clique em "Implantar" > "Nova Implantação".
 * 4. Escolha "App da Web".
 * 5. Em "Quem pode acessar", escolha "Qualquer pessoa" (ou conforme sua segurança).
 * 6. Copie a URL gerada e substitua no seu código React (dataService.js).
 */

function doPost(e) {
  var params = JSON.parse(e.postData.contents);
  var rowId = params.rowId;
  var field = params.field;
  var value = params.value;
  var gid = params.gid;
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var sheet = null;
  
  // Encontrar a aba pelo GID
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId().toString() === gid) {
      sheet = sheets[i];
      break;
    }
  }
  
  if (!sheet) {
    sheet = ss.getSheetByName("ABRIL") || ss.getSheets()[0];
  }
  var data = sheet.getDataRange().getValues();
  
  // Encontrar a coluna correta
  var headers = data[0];
  var colIndex = headers.indexOf(field);
  
  if (colIndex === -1) return ContentService.createTextOutput("Coluna não encontrada").setMimeType(ContentService.MimeType.TEXT);
  
  // Encontrar a linha correta pelo Nº (asumindo que está na primeira coluna)
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == rowId) {
      sheet.getRange(i + 1, colIndex + 1).setValue(value);
      break;
    }
  }
  
  return ContentService.createTextOutput("Sucesso").setMimeType(ContentService.MimeType.TEXT);
}

function doGet(e) {
  return ContentService.createTextOutput("API Ativa");
}
