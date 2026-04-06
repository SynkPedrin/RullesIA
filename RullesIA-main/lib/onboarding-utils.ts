import { useCRMStore } from './crm-store'
import { useContractStore } from './contracts-store'
import { ContractAnalysis, Client, JudicialProcess, Payment, ProductionCard } from './types'

/**
 * Executa o onboarding automático de um contrato analisado pela IA.
 * Alimenta os módulos de Clientes, Processos, Financeiro e Produção.
 */
export function executeAutoOnboarding(analysis: ContractAnalysis) {
  const { addClient, addProcess, addPayment, clients } = useCRMStore.getState()
  const { addProductionCard, addContract } = useContractStore.getState()

  const clientId = crypto.randomUUID()
  const processId = crypto.randomUUID()
  
  const metadados = analysis.metadados
  const clienteNome = metadados.contratante || 'Cliente Identificado por IA'
  // Melhora o parsing de valor (suporta formato brasileiro: 1.234,56 -> 1234.56)
  const valorInput = parseFloat(metadados.valor.replace(/\./g, '').replace(',', '.')) || 
                     parseFloat(metadados.valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0
  
  // 1. Verificar se o cliente já existe (simplificado por nome)
  const existingClient = clients.find(c => c.nome.toLowerCase() === clienteNome.toLowerCase())
  const finalClientId = existingClient ? existingClient.id : clientId

  if (!existingClient) {
    // Tentar parsear o endereço se disponível
    const enderecoRaw = metadados.endereco || ''
    const parts = enderecoRaw.split(',').map(p => p.trim())
    
    // Adicionar Novo Cliente
    const newClient: Client = {
      id: clientId,
      tipo: metadados.tipoCliente || (metadados.contratante.length > 25 ? 'pessoa_juridica' : 'pessoa_fisica'),
      status: 'ativo',
      nome: clienteNome,
      documento: metadados.documento || '000.000.000-00',
      endereco: { 
        logradouro: parts[0] || '', 
        numero: parts[1] || '', 
        bairro: parts[2] || '', 
        cidade: parts[3]?.split('-')[0]?.trim() || '', 
        estado: parts[3]?.split('-')[1]?.trim() || '', 
        cep: parts[4] || '' 
      },
      contatos: [],
      areaJuridica: ['civil'],
      responsavel: 'Dr. Rulles (IA)',
      dataCadastro: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      leadScore: 100,
      valorTotalContratos: valorInput,
      processosAtivos: 1
    }
    addClient(newClient)
  } else {
    // Atualizar valor total do cliente existente
    useCRMStore.getState().updateClient(existingClient.id, {
      valorTotalContratos: (existingClient.valorTotalContratos || 0) + valorInput,
      processosAtivos: (existingClient.processosAtivos || 0) + 1
    })
  }

  // 2. Adicionar Processo/Contrato Relacionado
  const newProcess: JudicialProcess = {
    id: processId,
    numeroProcesso: 'IA-' + Math.floor(Math.random() * 1000000),
    clienteId: finalClientId,
    clienteNome: clienteNome,
    tipo: 'civel',
    vara: 'Análise por IA',
    comarca: metadados.foro || 'Não especificada',
    tribunal: 'TJ',
    status: 'ativo',
    lado: 'autor',
    valorCausa: valorInput,
    dataDistribuicao: analysis.dataUpload || new Date().toISOString(),
    dataUltimaMovimentacao: new Date().toISOString(),
    partes: [
      { nome: metadados.contratante, documento: metadados.documento || '', tipo: 'autor' },
      { nome: metadados.contratado, documento: '', tipo: 'reu' }
    ],
    movimentacoes: [
      { id: crypto.randomUUID(), data: new Date().toISOString(), descricao: 'Contrato analisado e importado via IA Rulles', tipo: 'peticao', concluido: true }
    ],
    honorariosContratados: valorInput, // VALOR TUDO: Usando o valor total do contrato
    responsavel: 'RullesIA'
  }
  addProcess(newProcess)

  // 3. Adicionar Lançamento Financeiro (Valor Tudo)
  if (valorInput > 0) {
    const newPayment: Payment = {
      id: crypto.randomUUID(),
      clienteId: finalClientId,
      processoId: processId,
      tipo: 'honorario',
      descricao: `Contrato: ${metadados.objeto || 'Análise IA'}`,
      valor: valorInput, // VALOR TUDO: Lançando o valor integral
      dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pendente'
    }
    addPayment(newPayment)
  }

  // 4. Adicionar Card à Produção (Kanban)
  const newCard: ProductionCard = {
    id: crypto.randomUUID(),
    clienteNome: clienteNome,
    contratoTitulo: metadados.objeto || 'Novo Contrato Analisado',
    status: 'analise',
    statusTag: analysis.statusTag || 'CONCORDANTE',
    prioridade: analysis.riscos.some(r => r.nivel === 'alto') ? 'alta' : 'media',
    dataCriacao: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString(),
    proximaAcao: analysis.proximaAcao || 'Revisar cláusulas destacadas',
    prazos: analysis.prazos
  }
  addProductionCard(newCard)

  // 5. Salvar a análise no repositório de contratos
  addContract(analysis)

  return {
    clientId: finalClientId,
    processId,
    clientName: clienteNome
  }
}
