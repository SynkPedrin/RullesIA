export const runtime = 'nodejs'
export const maxDuration = 60

import OpenAI from "openai"
import { NextResponse } from "next/server"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_API_KEY) {
  console.error('[RullesIA] Erro: OPENAI_API_KEY não configurada nas variáveis de ambiente em summarize.')
}
const openai = new OpenAI({ apiKey: OPENAI_API_KEY || '' })

const summarizePrompt = `Você é o RullesIA, IA jurídica especializada da Orvyn.

Sua tarefa é gerar um RESUMO ESTRUTURADO do documento enviado, otimizado para advogados.

FORMATO OBRIGATÓRIO (retorne como JSON válido):
{
  "tipoDocumento": "string - tipo identificado (contrato, petição, certidão, procuração, etc.)",
  "resumoExecutivo": "string - resumo em 3-5 frases objetivas",
  "pontosChave": ["array de strings - pontos mais importantes do documento"],
  "partesEnvolvidas": ["array de strings - nomes das partes identificadas"],
  "valores": ["array de strings - valores monetários encontrados"],
  "datas": ["array de strings - datas importantes encontradas"],
  "prazos": ["array de strings - prazos identificados"],
  "riscos": [
    {
      "descricao": "string",
      "nivel": "baixo | medio | alto",
      "recomendacao": "string"
    }
  ],
  "artigosRelevantes": [
    {
      "artigo": "string - ex: Art. 421 do Código Civil",
      "relevancia": "string - por que este artigo é relevante"
    }
  ],
  "recomendacoes": ["array de strings - próximos passos sugeridos para o advogado"],
  "alertas": ["array de strings - questões que precisam de atenção imediata"]
}

REGRAS:
- BASE LEGAL: Sempre fundamente o resumo com base no Vade Mecum e leis brasileiras.
- Se uma informação não estiver no documento, omita o campo ou use array vazio
- Sempre cite artigos de lei relevantes ao documento
- Foque em informações práticas para o dia a dia do advogado
- Identifique riscos contratuais e cláusulas potencialmente abusivas
- Retorne APENAS o JSON`

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || ''
    
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Formato de requisição inválido. Envie via multipart/form-data.' }, { status: 400 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Validar tamanho (max ~25MB)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo: 25MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    let mimeType = file.type || 'application/pdf'

    // Normalizar mime type
    const fileName = file.name.toLowerCase()
    if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) mimeType = 'image/jpeg'
    else if (fileName.endsWith('.png')) mimeType = 'image/png'
    else if (fileName.endsWith('.webp')) mimeType = 'image/webp'
    else if (fileName.endsWith('.gif')) mimeType = 'image/gif'
    else if (fileName.endsWith('.pdf')) mimeType = 'application/pdf'

    let isImage = mimeType.startsWith('image/')
    let extractedText = ""

    if (!isImage) {
      if (mimeType === 'application/pdf') {
        try {
          const pdfExtract = require('pdf-parse-fork');
          const data = await pdfExtract(Buffer.from(bytes));
          extractedText = data.text;
          console.log('[RullesIA] Texto extraído com sucesso para resumo via pdf-parse-fork');
        } catch (e) {
          console.error('[RullesIA] Erro detalhado no resumo:', e);
          throw new Error(`Falha ao ler o PDF: ${e instanceof Error ? e.message : 'Erro técnico'}`);
        }
      } else {
        extractedText = Buffer.from(bytes).toString('utf-8')
      }
    }

    const messages: any[] = [
      { role: "system", content: summarizePrompt }
    ]

    if (isImage) {
      const base64 = Buffer.from(bytes).toString('base64');
      messages.push({
        role: "user",
        content: [
          { type: "text", text: "Analise este documento e gere o resumo estruturado conforme o formato especificado. Retorne APENAS o JSON válido." },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } }
        ]
      })
    } else {
      messages.push({
        role: "user",
        content: `Documento:\n${extractedText}\n\nAnalise este documento e gere o resumo estruturado conforme o formato especificado. Retorne APENAS o JSON válido.`
      })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.2,
      response_format: { type: "json_object" }
    })

    let text = completion.choices[0].message.content || "{}"
    
    // Limpar resposta
    text = text.replace(/```json\s*/gi, '')
    text = text.replace(/```\s*/gi, '')
    text = text.trim()
    
    let summary
    try {
      summary = JSON.parse(text)
    } catch {
      console.error('[RullesIA] Erro ao parsear JSON do resumo:', text.substring(0, 500))
      
      // Fallback: retornar o texto bruto como resumo
      summary = {
        tipoDocumento: "Documento",
        resumoExecutivo: text.substring(0, 1000) || "Documento recebido para análise. Revisão manual recomendada.",
        pontosChave: [],
        partesEnvolvidas: [],
        valores: [],
        datas: [],
        prazos: [],
        riscos: [],
        artigosRelevantes: [],
        recomendacoes: ["Revisar o documento manualmente"],
        alertas: ["Análise automática incompleta - revisão manual necessária"]
      }
    }

    return NextResponse.json({ 
      success: true,
      summary: {
        ...summary,
        nomeArquivo: file.name,
        tamanhoArquivo: file.size,
        tipoArquivo: mimeType,
        dataAnalise: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('[RullesIA] Erro no resumo:', error)
    
    let errorMsg = 'Erro ao resumir documento'
    if (error instanceof Error) {
      if (error.message.includes('SAFETY')) {
        errorMsg = 'O conteúdo foi bloqueado pelo filtro de segurança.'
      } else if (error.message.includes('too large') || error.message.includes('size')) {
        errorMsg = 'O arquivo é muito grande para análise.'
      } else {
        errorMsg = `Erro: ${error.message}`
      }
    }
    
    return NextResponse.json({ 
      error: errorMsg,
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
