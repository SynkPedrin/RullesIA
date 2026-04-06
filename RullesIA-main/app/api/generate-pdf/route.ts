import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { content, filename, type } = await req.json()
    
    // Generate HTML content for the PDF
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    @page { margin: 2cm; }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #000;
      padding-bottom: 20px;
    }
    .header h1 {
      font-size: 16pt;
      font-weight: bold;
      margin: 0;
    }
    .header p {
      margin: 5px 0;
      font-size: 10pt;
    }
    .title {
      text-align: center;
      font-size: 14pt;
      font-weight: bold;
      margin: 30px 0;
      text-transform: uppercase;
    }
    .content {
      text-align: justify;
    }
    .content p {
      margin: 10px 0;
      text-indent: 40px;
    }
    .clause {
      margin: 20px 0;
    }
    .clause-title {
      font-weight: bold;
      margin-bottom: 10px;
    }
    .signature {
      margin-top: 60px;
    }
    .signature-line {
      margin-top: 50px;
      border-top: 1px solid #000;
      width: 250px;
      text-align: center;
      padding-top: 5px;
    }
    .date-location {
      margin-top: 40px;
      text-align: right;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>RULLES IA - ADVOCACIA</h1>
    <p>OAB/XX 00000 | Rua Exemplo, 123 - Centro</p>
    <p>contato@escritorio.adv.br | (00) 0000-0000</p>
  </div>
  
  <div class="title">${type || 'DOCUMENTO JURÍDICO'}</div>
  
  <div class="content">
    ${content}
  </div>
  
  <div class="date-location">
    <p>_________________, ___ de ______________ de ____.</p>
  </div>
  
  <div class="signature">
    <div class="signature-line">
      <p>Assinatura</p>
    </div>
  </div>
</body>
</html>`

    // Return HTML that can be converted to PDF on client side
    return NextResponse.json({ 
      success: true,
      html: htmlContent,
      filename: filename || 'documento.pdf'
    })
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    return NextResponse.json({ 
      error: 'Erro ao gerar o documento.' 
    }, { status: 500 })
  }
}
