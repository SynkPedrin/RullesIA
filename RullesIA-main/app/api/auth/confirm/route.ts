import { NextRequest, NextResponse } from 'next/server'

// Store de tokens (em produção usar banco de dados)
const pendingConfirmations = new Map<string, {
  email: string
  name: string
  createdAt: Date
  expiresAt: Date
}>()

// Gera token de confirmação
function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

// POST - Criar novo token de confirmação e enviar email
export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    const token = generateToken()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 horas

    // Salva o token
    pendingConfirmations.set(token, {
      email,
      name: name || 'Usuário',
      createdAt: now,
      expiresAt
    })

    // Envia email de confirmação
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    try {
      await fetch(`${baseUrl}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          type: 'confirmation',
          data: {
            name: name || 'Usuário',
            token
          }
        })
      })
    } catch (emailError) {
      console.error('[RullesIA] Erro ao enviar email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Email de confirmação enviado',
      // Em produção, não retornar o token
      debug: { token, expiresAt }
    })

  } catch (error) {
    console.error('[RullesIA] Erro na confirmação:', error)
    return NextResponse.json(
      { error: 'Erro ao processar confirmação' },
      { status: 500 }
    )
  }
}

// GET - Verificar token de confirmação
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json(
      { error: 'Token não fornecido' },
      { status: 400 }
    )
  }

  const confirmation = pendingConfirmations.get(token)

  if (!confirmation) {
    return NextResponse.json(
      { error: 'Token inválido ou expirado' },
      { status: 404 }
    )
  }

  if (new Date() > confirmation.expiresAt) {
    pendingConfirmations.delete(token)
    return NextResponse.json(
      { error: 'Token expirado' },
      { status: 410 }
    )
  }

  // Confirma a conta
  pendingConfirmations.delete(token)

  // Em produção, atualizar status do usuário no banco

  return NextResponse.json({
    success: true,
    message: 'Conta confirmada com sucesso',
    email: confirmation.email,
    name: confirmation.name
  })
}
