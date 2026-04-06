export const runtime = 'nodejs'
export const maxDuration = 60

import OpenAI from "openai"
import { NextResponse } from "next/server"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const systemPrompt = `Você é o RullesIA, uma IA especializada em Engenharia Jurídica e Gestão de Operações Legais, criada pela Orvyn.

DIRETRIZES:
1. Precisão Pragmática: Se uma informação não estiver no documento, use "Informação não localizada no documento"
2. Foco em Risco: Priorize a identificação de cláusulas abusivas, prazos fatais e multas
3. Cite sempre o número da página de onde extraiu a informação (ou use 1 se não puder identificar)
4. BASE LEGAL: Utilize o Vade Mecum e a legislação brasileira vigente (Código Civil, CPC, CLT, etc.) para fundamentar sua análise. Indique qual lei ou artigo embase suas conclusões quando possível.

ANÁLISE:
- Identifique metadados: Partes, Objeto, Valor, Data de Assinatura, Foro
- Estruture cláusulas em categorias: Rescisórias, Obrigações, Penalidades
- Busque inconsistências entre cláusulas
- Identifique cláusulas ocultas que podem prejudicar o cliente
- Classifique riscos: alto (multas acima do padrão, prazos muito curtos), medio (pontos de atenção), baixo (padrão)

STATUS:
- URGENTE: Prazos em menos de 7 dias ou riscos críticos
- REVISÃO NECESSÁRIA: Cláusulas que precisam de renegociação
- CONCORDANTE: Contrato dentro dos padrões, aprovado para assinatura

Responda SEMPRE em português do Brasil e retorne um JSON válido com a seguinte estrutura RIGOROSA:
{
  "metadados": {
    "contratante": "string",
    "contratado": "string",
    "objeto": "string",
    "valor": "string",
    "dataAssinatura": "YYYY-MM-DD",
    "foro": "string",
    "documento": "string (CPF ou CNPJ)",
    "endereco": "string (logradouro, nº, bairro, cidade-UF, CEP)",
    "tipoCliente": "pessoa_fisica | pessoa_juridica"
  },
  "clausulas": [
    {
      "numero": "string",
      "titulo": "string",
      "conteudo": "string resumido",
      "pagina": 1,
      "risco": "baixo",
      "observacao": "string ou null"
    }
  ],
  "prazos": [
    {
      "descricao": "string",
      "data": "YYYY-MM-DD",
      "pagina": 1,
      "concluido": false
    }
  ],
  "riscos": [
    {
      "clausula": "string",
      "nivel": "baixo",
      "motivo": "string",
      "pagina": 1
    }
  ],
  "resumoExecutivo": "string com 3 frases",
  "clausulasOcultas": ["array de strings"],
  "proximaAcao": "string",
  "statusTag": "CONCORDANTE"
}`

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || ''
    
    let fileBuffer: ArrayBuffer
    let fileName: string
    let mimeType: string

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File
      
      if (!file) {
        return NextResponse.json({ error: 'Arquivo não fornecido' }, { status: 400 })
      }
      
      fileBuffer = await file.arrayBuffer()
      fileName = file.name
      mimeType = file.type || 'application/pdf'
      
      // Normalizar mime types por extensão
      const ext = fileName.toLowerCase().split('.').pop()
      if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg'
      else if (ext === 'png') mimeType = 'image/png'
      else if (ext === 'webp') mimeType = 'image/webp'
      else if (ext === 'gif') mimeType = 'image/gif'
      else if (ext === 'pdf') mimeType = 'application/pdf'
    } else {
      return NextResponse.json({ error: 'Formato de requisição inválido' }, { status: 400 })
    }

    let isImage = mimeType.startsWith('image/')
    let extractedText = ""

    if (!isImage) {
      if (mimeType === 'application/pdf') {
        try {
          // Usando pdf-parse-fork que corrige o erro de ENOENT em bundlers como Next.js
          const pdfExtract = require('pdf-parse-fork');
          
          const data = await pdfExtract(Buffer.from(fileBuffer));
          extractedText = data.text;
          console.log('[RullesIA] Texto extraído com sucesso via pdf-parse-fork');
        } catch (e) {
          console.error('[RullesIA] Erro detalhado no extrator:', e);
          throw new Error(`Falha ao ler o PDF: ${e instanceof Error ? e.message : 'Erro técnico'}`);
        }
      } else {
        extractedText = Buffer.from(fileBuffer).toString('utf-8')
      }
    }

    const messages: any[] = [
      { role: "system", content: systemPrompt }
    ]

    if (isImage) {
      const base64 = Buffer.from(fileBuffer).toString('base64');
      messages.push({
        role: "user",
        content: [
          { type: "text", text: "Analise este documento jurídico e extraia todas as informações conforme as diretrizes. Retorne APENAS o JSON válido." },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } }
        ]
      })
    } else {
      messages.push({
        role: "user",
        content: `Documento:\n${extractedText}\n\nAnalise este documento jurídico e extraia todas as informações conforme as diretrizes. Retorne APENAS o JSON válido.`
      })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.1,
      response_format: { type: "json_object" }
    })

    let text = completion.choices[0].message.content || "{}"
    
    // Clean up the response just in case
    text = text.replace(/```json\s*/gi, '')
    text = text.replace(/```\s*/gi, '')
    text = text.trim()
    
    let analysis
    try {
      analysis = JSON.parse(text)
    } catch (parseError) {
      console.error('[v0] JSON parse error:', parseError)
      
      // Create a basic structure from the raw response
      analysis = {
        metadados: {
          contratante: "Identificação pendente",
          contratado: "Identificação pendente",
          objeto: "Documento analisado - verifique manualmente",
          valor: "Não especificado",
          dataAssinatura: new Date().toISOString().split('T')[0],
          foro: "Não especificado"
        },
        clausulas: [],
        prazos: [],
        riscos: [{
          clausula: "Geral",
          nivel: "medio",
          motivo: "Análise automática incompleta - revisão manual necessária",
          pagina: 1
        }],
        resumoExecutivo: text.substring(0, 500) || "Documento recebido para análise. Revisão manual recomendada.",
        clausulasOcultas: [],
        proximaAcao: "Revisar documento manualmente",
        statusTag: "REVISÃO NECESSÁRIA"
      }
    }

    // Ensure all required fields exist
    analysis.metadados = analysis.metadados || {}
    analysis.clausulas = analysis.clausulas || []
    analysis.prazos = analysis.prazos || []
    analysis.riscos = analysis.riscos || []
    analysis.clausulasOcultas = analysis.clausulasOcultas || []
    
    // Normalize dates in prazos to YYYY-MM-DD format
    analysis.prazos = analysis.prazos.map((prazo: { data?: string; descricao?: string; pagina?: number; concluido?: boolean }) => {
      let normalizedDate = prazo.data
      if (prazo.data) {
        // Try to parse and normalize the date
        try {
          const date = new Date(prazo.data)
          if (!isNaN(date.getTime())) {
            normalizedDate = date.toISOString().split('T')[0]
          }
        } catch {
          // Keep original if parsing fails
        }
      }
      return {
        ...prazo,
        data: normalizedDate || new Date().toISOString().split('T')[0],
        concluido: prazo.concluido || false
      }
    })

    const contractId = crypto.randomUUID()

    return NextResponse.json({ 
      success: true,
      analysis: {
        id: contractId,
        nomeArquivo: fileName,
        dataUpload: new Date().toISOString().split('T')[0],
        status: 'analise',
        ...analysis,
      }
    })
  } catch (error) {
    console.error('[v0] Erro na análise:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ 
      error: `Erro ao analisar o documento: ${errorMessage}`,
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
