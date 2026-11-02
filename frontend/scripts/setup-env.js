#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function setupEnvironment() {
  console.log('\n🚀 CONFIGURAÇÃO SPEEDFORMAS SYSTEM')
  console.log('====================================\n')
  
  console.log('Este script vai configurar seu ambiente de desenvolvimento.')
  console.log('Pressione ENTER para usar os valores padrão entre parênteses.\n')

  // Configurações básicas
  const useMock = await question('Usar dados mock para desenvolvimento? (true): ') || 'true'
  
  // Configurações do Dify
  console.log('\n📡 CONFIGURAÇÕES DO DIFY:')
  const difyUrl = await question('URL da API Dify (https://api.dify.ai/v1): ') || 'https://api.dify.ai/v1'
  const difyKey = await question('Chave da API Dify (deixe vazio por enquanto): ') || 'app-your-dify-key-here'
  
  // Configurações de upload
  console.log('\n📁 CONFIGURAÇÕES DE UPLOAD:')
  const maxFileSize = await question('Tamanho máximo dos arquivos em MB (50): ') || '50'
  
  // Configurações da aplicação
  console.log('\n🌐 CONFIGURAÇÕES DA APLICAÇÃO:')
  const appPort = await question('Porta da aplicação (3000): ') || '3000'
  const apiUrl = await question('URL da API backend (http://localhost:3001/api): ') || 'http://localhost:3001/api'

  // Conteúdo do arquivo .env.local
  const envContent = `# ====================================
# CONFIGURAÇÕES SPEEDFORMAS SYSTEM
# ====================================

# MODO DE DESENVOLVIMENTO
NEXT_PUBLIC_USE_MOCK=${useMock}

# ====================================
# CONFIGURAÇÕES DA API DIFY
# ====================================
NEXT_PUBLIC_DIFY_API_URL=${difyUrl}
NEXT_PUBLIC_DIFY_API_KEY=${difyKey}

# Endpoints da IA
NEXT_PUBLIC_DIFY_PROCESS_ENDPOINT=/workflows/run
NEXT_PUBLIC_DIFY_STATUS_ENDPOINT=/workflows/status

# ====================================
# OUTRAS CONFIGURAÇÕES
# ====================================
NEXT_PUBLIC_API_URL=${apiUrl}

# Configurações de upload
NEXT_PUBLIC_MAX_FILE_SIZE=${maxFileSize}
NEXT_PUBLIC_ALLOWED_EXTENSIONS=.dwg,.dxf

# ====================================
# CONFIGURAÇÕES DE DESENVOLVIMENTO
# ====================================
PORT=${appPort}
NEXT_PUBLIC_APP_URL=http://localhost:${appPort}

# ====================================
# GERADO AUTOMATICAMENTE
# ====================================
# Data de criação: ${new Date().toISOString()}
`

  // Salvar arquivo
  try {
    fs.writeFileSync(path.join(process.cwd(), '.env.local'), envContent)
    
    console.log('\n✅ CONFIGURAÇÃO CONCLUÍDA!')
    console.log('====================================')
    console.log('✓ Arquivo .env.local criado com sucesso')
    console.log('✓ Modo mock habilitado para desenvolvimento')
    
    if (difyKey === 'app-your-dify-key-here') {
      console.log('\n⚠️  AÇÃO NECESSÁRIA:')
      console.log('   → Configure sua chave do Dify no arquivo .env.local')
      console.log('   → Quando estiver pronto, altere NEXT_PUBLIC_USE_MOCK para false')
    }
    
    console.log('\n🚀 PRÓXIMOS PASSOS:')
    console.log('   → npm run dev (para iniciar o servidor)')
    console.log('   → Acesse http://localhost:' + appPort)
    console.log('   → Login: teste@teste.com | Senha: teste')
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message)
    console.log('\n📝 CONTEÚDO MANUAL:')
    console.log('Crie o arquivo .env.local manualmente com o conteúdo:')
    console.log('\n' + envContent)
  }
  
  rl.close()
}

// Executar setup
setupEnvironment().catch(console.error)


