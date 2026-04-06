import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Tipos de email
type EmailType = 'confirmation' | 'welcome' | 'notification' | 'reminder' | 'custom'

interface EmailRequest {
  to: string
  type: EmailType
  subject?: string
  data?: {
    name?: string
    token?: string
    message?: string
    processNumber?: string
    deadline?: string
    clientName?: string
  }
}

// Templates de email gerados por IA
async function generateEmailContent(type: EmailType, data: EmailRequest['data']) {
  const prompts: Record<EmailType, string> = {
    confirmation: `Gere um email profissional de confirmação de conta para um sistema jurídico chamado RullesIA (criado pela Orvyn). 
      Nome do usuário: ${data?.name || 'Usuário'}
      Link de confirmação: https://rullesia.orvyn.com/confirmar?token=${data?.token || 'TOKEN'}
      O email deve ser formal, em português brasileiro, com visual clean e profissional.
      Retorne apenas o HTML do email, sem explicações.`,
    
    welcome: `Gere um email de boas-vindas profissional para um novo usuário do sistema jurídico RullesIA (criado pela Orvyn).
      Nome do usuário: ${data?.name || 'Usuário'}
      O email deve apresentar as funcionalidades principais: análise de contratos com IA, gestão de processos, CRM jurídico.
      Retorne apenas o HTML do email, sem explicações.`,
    
    notification: `Gere um email de notificação profissional sobre movimentação processual para o sistema RullesIA.
      Nome do cliente: ${data?.clientName || 'Cliente'}
      Número do processo: ${data?.processNumber || 'Não informado'}
      Mensagem: ${data?.message || 'Nova movimentação registrada'}
      Retorne apenas o HTML do email, sem explicações.`,
    
    reminder: `Gere um email de lembrete de prazo judicial para o sistema RullesIA.
      Nome do advogado: ${data?.name || 'Advogado'}
      Número do processo: ${data?.processNumber || 'Não informado'}
      Prazo: ${data?.deadline || 'Não informado'}
      O email deve ser urgente mas profissional.
      Retorne apenas o HTML do email, sem explicações.`,
    
    custom: `Gere um email profissional para o sistema jurídico RullesIA com o seguinte conteúdo:
      ${data?.message || 'Mensagem padrão'}
      Destinatário: ${data?.name || 'Usuário'}
      Retorne apenas o HTML do email, sem explicações.`
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "Você é um assistente gerador de HTML de emails. Retorne APENAS HTML, nada além" },
      { role: "user", content: prompts[type] }
    ],
    temperature: 0.3,
  })

  return completion.choices[0].message.content || ""
}

// Função para enviar email (simulada - em produção usar serviço como Resend, SendGrid, etc)
async function sendEmail(to: string, subject: string, htmlContent: string) {
  // Em produção, integrar com serviço de email real
  // Por agora, retornamos sucesso simulado
  console.log(`[RullesIA] Email enviado para: ${to}`)
  console.log(`[RullesIA] Assunto: ${subject}`)
  
  return {
    success: true,
    messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    to,
    subject
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: EmailRequest = await req.json()
    const { to, type, subject, data } = body

    if (!to || !type) {
      return NextResponse.json(
        { error: 'Email e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    // Gera conteúdo do email com IA
    const htmlContent = await generateEmailContent(type, data)

    // Define assunto baseado no tipo
    const emailSubjects: Record<EmailType, string> = {
      confirmation: 'Confirme sua conta - RullesIA',
      welcome: 'Bem-vindo ao RullesIA - Engenharia Jurídica Inteligente',
      notification: `Movimentação Processual - ${data?.processNumber || 'Processo'}`,
      reminder: `URGENTE: Prazo Judicial - ${data?.processNumber || 'Processo'}`,
      custom: subject || 'Comunicado - RullesIA'
    }

    // Envia o email
    const result = await sendEmail(to, emailSubjects[type], htmlContent)

    return NextResponse.json({
      success: true,
      message: 'Email enviado com sucesso',
      data: result
    })

  } catch (error) {
    console.error('[RullesIA] Erro ao enviar email:', error)
    return NextResponse.json(
      { error: 'Erro ao processar envio de email' },
      { status: 500 }
    )
  }
}

// GET para verificar status do serviço
export async function GET() {
  return NextResponse.json({
    service: 'RullesIA Email Service',
    status: 'online',
    types: ['confirmation', 'welcome', 'notification', 'reminder', 'custom']
  })
}
