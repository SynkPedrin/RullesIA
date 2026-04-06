export const runtime = 'nodejs'
export const maxDuration = 60

import OpenAI from "openai"
import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_API_KEY) {
  console.error('[RullesIA] Erro: OPENAI_API_KEY não configurada nas variáveis de ambiente.')
}
const openai = new OpenAI({ apiKey: OPENAI_API_KEY || '' })

// Cache do Vade Mecum em memória para não recarregar a cada request
let vadeMecumCache: string | null = null

async function loadVadeMecum(): Promise<string | null> {
  if (vadeMecumCache) return vadeMecumCache
  
  try {
    const pdfPath = path.join(process.cwd(), 'vade_mecum.pdf')
    const pdfBuffer = await readFile(pdfPath)
    
    try {
      const pdfExtract = require('pdf-parse-fork');
      const data = await pdfExtract(pdfBuffer)
      
      // OpenAI gpt-4o suporta janelas de contexto muito maiores (128k),
      // mas mantemos um limite seguro para performance.
      vadeMecumCache = data.text.substring(0, 500000) 
      console.log('[RullesIA] Vade Mecum carregado com sucesso via pdf-parse-fork')
    } catch (e) {
      console.error('[RullesIA] Erro ao processar PDF do Vade Mecum:', e)
      return null
    }
    
    return vadeMecumCache
  } catch (error) {
    console.error('[RullesIA] Erro ao carregar Vade Mecum:', error)
    return null
  }
}

// Detecta se a pergunta é sobre legislação/Vade Mecum
function isLegalQuery(text: string): boolean {
  const legalKeywords = [
    'artigo', 'art.', 'art ', 'lei ', 'lei,', 'decreto', 'código', 'codigo',
    'constituição', 'constituicao', 'vade mecum', 'vademecum',
    'legislação', 'legislacao', 'norma', 'emenda', 'súmula', 'sumula',
    'jurisprudência', 'jurisprudencia', 'cpc', 'cpp', 'clt',
    'cdc', 'eca', 'lgpd', 'lindb', 'ctn', 'civil', 'penal',
    'processo', 'trabalhista', 'tributário', 'consumidor',
    'prescrição', 'decadência', 'recurso', 'apelação', 'agravo',
    'tutela', 'liminar', 'contrato', 'rescisão', 'multa',
    'dano', 'indenização', 'usucapião', 'inventário',
    'divórcio', 'guarda', 'pensão', 'crime', 'pena', 'prisão',
    'licitação', 'prazo', 'competência', 'petição', 'sentença'
  ]
  const lowerText = text.toLowerCase()
  return legalKeywords.some(keyword => lowerText.includes(keyword))
}

const IMAGE_MIME_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
  'image/bmp', 'image/tiff'
]

function isImageFile(mimeType: string): boolean {
  return IMAGE_MIME_TYPES.some(t => mimeType.startsWith(t.split('/')[0] + '/' + t.split('/')[1]))
}

const systemPrompt = `Você é o RullesIA, uma Inteligência Artificial Jurídica de elite da Orvyn. Seu objetivo é ajudar advogados e gestores com análises técnicas, pedagógicas e conversas naturais, como um colega de trabalho altamente capacitado.

## DIRETRIZES DE CONVERSA:
1. **Personalidade**: Seja prestativo, profissional e natural (estilo ChatGPT). Você não apenas responde comandos, você dialoga e antecipa necessidades.
2. **Citação Obrigatória do Vade Mecum**: Para cada risco, cláusula ou sugestão, você DEVE fundamentar com a legislação brasileira (Código Civil, CPC, CLT, CDC, etc.).
3. **Análise de Documentos**: Ao analisar documentos, seja minucioso e destaque: Nome do Cliente, Objeto, Valor, Datas e Riscos.
4. **Automação Inteligente**: O sistema já está configurado para adicionar clientes e dados automaticamente. Informe ao usuário que os dados foram identificados e estão sendo alimentados no sistema.

## COMPORTAMENTO:
- Use Markdown rico (títulos, negritos, tabelas).
- Responda a dúvidas gerais e perguntas personalizadas do usuário com atenção total ao contexto.
- Se faltar alguma informação crucial, peça de forma educada.`


interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || ''
    
    let messages: ChatMessage[] = []
    let documentBase64: string | null = null
    let documentMimeType: string | null = null
    let documentName: string | null = null
    let extractedText = ""
    let aiSettings = {
      model: 'gpt-4o',
      detailLevel: 'detalhado',
      detectHiddenClauses: true,
      marketComparison: true
    }
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const messagesJson = formData.get('messages') as string
      const aiSettingsJson = formData.get('aiSettings') as string
      const file = formData.get('file') as File | null
      
      messages = JSON.parse(messagesJson || '[]')
      if (aiSettingsJson) aiSettings = JSON.parse(aiSettingsJson)
      
      if (file) {
        documentName = file.name
        documentMimeType = file.type || 'application/pdf'
        
        // Normalizar
        const lowerName = documentName.toLowerCase()
        if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) documentMimeType = 'image/jpeg'
        else if (lowerName.endsWith('.png')) documentMimeType = 'image/png'
        else if (lowerName.endsWith('.webp')) documentMimeType = 'image/webp'
        else if (lowerName.endsWith('.gif')) documentMimeType = 'image/gif'
        else if (lowerName.endsWith('.pdf')) documentMimeType = 'application/pdf'

        const bytes = await file.arrayBuffer()
        
        if (isImageFile(documentMimeType)) {
          documentBase64 = Buffer.from(bytes).toString('base64')
        } else {
          if (documentMimeType === 'application/pdf') {
            try {
              const pdfExtract = require('pdf-parse-fork');
              const data = await pdfExtract(Buffer.from(bytes));
              extractedText = data.text;
              console.log('[RullesIA] Texto extraído com sucesso no chat via pdf-parse-fork');
            } catch (e) {
              console.error('[RullesIA] Erro detalhado no chat:', e);
              throw new Error(`Falha ao ler o PDF: ${e instanceof Error ? e.message : 'Erro técnico'}`);
            }
          } else {
            extractedText = Buffer.from(bytes).toString('utf-8')
          }
        }
      }
    } else {
      const body = await req.json()
      messages = body.messages || []
      if (body.aiSettings) aiSettings = body.aiSettings
    }
    
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Nenhuma mensagem fornecida' }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    const needsVadeMecum = isLegalQuery(lastMessage.content)
    let vadeMecumText: string | null = null
    
    if (needsVadeMecum && !documentName) {
      vadeMecumText = await loadVadeMecum()
    }
    
    // Montando a conversa para a API OpenAI
    const dynamicPrompt = `
      ${systemPrompt}
      
      ## CONFIGURAÇÕES DESTA SESSÃO:
      - Nível de Detalhe: ${aiSettings.detailLevel}
      - Detecção de Cláusulas Ocultas: ${aiSettings.detectHiddenClauses ? 'ATIVADO' : 'DESATIVADO'}
      - Comparação de Mercado: ${aiSettings.marketComparison ? 'ATIVADO' : 'DESATIVADO'}
      
      ${aiSettings.detailLevel === 'resumido' ? 'Por favor, seja extremamente conciso e direto ao ponto.' : ''}
      ${aiSettings.detailLevel === 'detalhado' ? 'Por favor, forneça uma análise exaustiva e minuciosa.' : ''}
    `

    const apiMessages: any[] = [
      { role: "system", content: dynamicPrompt }
    ]

    // Context message
    if (vadeMecumText) {
      apiMessages.push({ 
        role: "system", 
        content: `CONTEXTO ADICIONAL (Vade Mecum): ${vadeMecumText}\n\nUse isso como base de conhecimento exclusiva para responder.` 
      })
    }
    
    // Adicionando o histórico do usuário
    for (let i = 0; i < messages.length - 1; i++) {
       apiMessages.push({
         role: messages[i].role,
         content: messages[i].content
       })
    }

    let isVisionRequired = !!documentBase64

    // Adicionando a última mensagem (com ou sem doc)
    if (documentName) {
      if (isVisionRequired) {
        apiMessages.push({
          role: "user",
          content: [
            { type: "text", text: `[ARQUIVO ANEXADO: ${documentName}]\n\nAnalise este documento e responda à mensagem do usuário: ${lastMessage.content}` },
            { type: "image_url", image_url: { url: `data:${documentMimeType};base64,${documentBase64}` } }
          ]
        })
      } else {
         apiMessages.push({
           role: "user",
           content: `[ARQUIVO ANEXADO: ${documentName}]\n\nConteúdo extraído do documento:\n\n${extractedText}\n\nMensagem do usuário: ${lastMessage.content}`
         })
      }
    } else {
      apiMessages.push({ role: "user", content: lastMessage.content })
    }

    const completion = await openai.chat.completions.create({
      model: aiSettings.model || "gpt-4o",
      messages: apiMessages,
      temperature: 0.7,
    })

    const responseText = completion.choices[0].message.content

    return NextResponse.json({ 
      success: true,
      message: {
        role: 'assistant',
        content: responseText
      }
    })
  } catch (error) {
    console.error('[RullesIA] Erro no chat:', error)
    
    let errorMsg = 'Erro ao processar mensagem'
    if (error instanceof Error) {
      if (error.message.includes('SAFETY')) {
        errorMsg = 'O conteúdo foi bloqueado pelo filtro de segurança. Tente reformular sua pergunta.'
      } else if (error.message.includes('quota') || error.message.includes('429')) {
        errorMsg = 'Limite de requisições atingido na sua conta OpenAI. Verifique seu saldo ou aguarde alguns segundos.'
      } else if (error.message.includes('too large') || error.message.includes('size') || error.message.includes('maximum context length')) {
        errorMsg = 'O arquivo é muito grande ou gerou muito texto. Tente com um fragmento menor do documento.'
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
