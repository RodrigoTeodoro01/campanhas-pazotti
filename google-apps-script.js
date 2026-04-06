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
  
  // 1. Encontrar a aba correta pelo GID
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId().toString() === gid) {
      sheet = sheets[i];
      break;
    }
  }
  
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }
  
  var data = sheet.getDataRange().getValues();
  
  // 2. Caçar a linha de cabeçalho correta (procura por "Nº" ou "INDUSTRIA")
  var headerRowIndex = -1;
  for (var r = 0; r < data.length; r++) {
    if (data[r].indexOf("Nº") > -1 || data[r].indexOf("INDUSTRIA") > -1) {
      headerRowIndex = r;
      break;
    }
  }
  
  if (headerRowIndex === -1) return ContentService.createTextOutput("Linha de cabeçalho não encontrada").setMimeType(ContentService.MimeType.TEXT);
  
  var headers = data[headerRowIndex];
  var colIndex = headers.indexOf(field);
  
  if (colIndex === -1) return ContentService.createTextOutput("Coluna '" + field + "' não encontrada").setMimeType(ContentService.MimeType.TEXT);
  
  // 3. Procurar a linha correta pelo Nº (asumindo que está na coluna do cabeçalho "Nº")
  var idColIndex = headers.indexOf("Nº");
  if (idColIndex === -1) idColIndex = 0; // Fallback para primeira coluna
  
  for (var i = headerRowIndex + 1; i < data.length; i++) {
    if (data[i][idColIndex] == rowId) {
      sheet.getRange(i + 1, colIndex + 1).setValue(value);
      break;
    }
  }
  
  return ContentService.createTextOutput("Sucesso na Versão Robusta").setMimeType(ContentService.MimeType.TEXT);
}

function doGet(e) {
  return ContentService.createTextOutput("API Ativa");
}
