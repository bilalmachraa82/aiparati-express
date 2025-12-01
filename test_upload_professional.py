#!/usr/bin/env python3
"""
Teste completo do upload profissional para validar o envio de todos os campos obrigatórios
"""

import requests
import json
from pathlib import Path

# Configuração
API_BASE_URL = "http://localhost:8000"
IES_FILE = "IES - 2023.pdf"

def test_upload_completo():
    """Testa upload com todos os campos obrigatórios"""

    print("🧪 Teste de Upload Profissional")
    print("=" * 50)

    # Verificar se o arquivo existe
    if not Path(IES_FILE).exists():
        print(f"❌ Arquivo {IES_FILE} não encontrado!")
        return False

    # Dados obrigatórios para o teste
    dados_empresa = {
        "nif": "508450877",  # NIF válido de teste
        "ano_exercicio": "2023",
        "designacao_social": "AutoFund AI Solutions Lda.",
        "email": "teste@autofund.ai",
        "context": "Teste de integração frontend profissional"
    }

    print(f"📤 Enviando arquivo: {IES_FILE}")
    print(f"📋 Dados da empresa:")
    for key, value in dados_empresa.items():
        print(f"   • {key}: {value}")
    print()

    # Preparar o upload
    url = f"{API_BASE_URL}/api/upload"

    # Abrir o arquivo
    with open(IES_FILE, 'rb') as f:
        files = {'file': (IES_FILE, f, 'application/pdf')}

        # Enviar dados como form fields
        data = dados_empresa

        print("🚀 Fazendo requisição POST...")

        try:
            response = requests.post(url, files=files, data=data)

            print(f"📊 Status Code: {response.status_code}")

            if response.status_code == 200:
                result = response.json()
                print("✅ Upload realizado com sucesso!")
                print(f"📝 Task ID: {result.get('task_id')}")
                print(f"⏱️ Tempo estimado: {result.get('estimated_time')}")

                # Verificar status
                task_id = result.get('task_id')
                if task_id:
                    print(f"\n🔍 Verificando status da tarefa {task_id}...")

                    status_response = requests.get(f"{API_BASE_URL}/api/status/{task_id}")

                    if status_response.status_code == 200:
                        status = status_response.json()
                        print(f"📊 Status: {status.get('status')}")

                        if status.get('status') == 'completed':
                            print("✅ Processamento concluído!")

                            # Obter resultados
                            result_response = requests.get(f"{API_BASE_URL}/api/result/{task_id}")

                            if result_response.status_code == 200:
                                result_data = result_response.json()

                                print("\n📈 Resultados da Análise:")
                                print("-" * 40)

                                if 'dados_financeiros' in result_data:
                                    financeiros = result_data['dados_financeiros']
                                    print(f"Ativo Total: €{financeiros.get('ativo_total', 0):,.2f}")
                                    print(f"Volume Negócios: €{financeiros.get('volume_negocios', 0):,.2f}")
                                    print(f"EBITDA: €{financeiros.get('ebitda', 0):,.2f}")
                                    print(f"Autonomia Financeira: {financeiros.get('autonomia_financeira', 0):.1f}%")
                                    print(f"Liquidez Geral: {financeiros.get('liquidez_geral', 0):.2f}")

                                if 'analise' in result_data:
                                    analise = result_data['analise']
                                    print(f"\n🎯 Rating: {analise.get('rating')}")
                                    print(f"📊 Score: {analise.get('score')}")

                                    if 'recomendacoes' in analise:
                                        print("\n💡 Recomendações:")
                                        for rec in analise['recomendacoes']:
                                            print(f"   • {rec}")

                                print("\n🎉 Teste concluído com sucesso!")
                                return True
                            else:
                                print(f"❌ Erro ao obter resultados: {result_response.status_code}")

                    else:
                        print(f"❌ Erro ao verificar status: {status_response.status_code}")

            else:
                print("❌ Erro no upload!")
                print(f"Status: {response.status_code}")

                try:
                    error = response.json()
                    print(f"Erro: {json.dumps(error, indent=2)}")
                except:
                    print(f"Resposta: {response.text}")

                return False

        except Exception as e:
            print(f"❌ Erro na requisição: {str(e)}")
            return False

def health_check():
    """Verifica se o backend está online"""
    print("🔍 Verificando saúde do backend...")

    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)

        if response.status_code == 200:
            print("✅ Backend está online!")
            data = response.json()
            print(f"📊 Status: {data.get('status')}")
            print(f"📅 Timestamp: {data.get('timestamp')}")
            return True
        else:
            print(f"❌ Backend retornou status: {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ Erro ao conectar ao backend: {str(e)}")
        print("💡 Certifique-se de que o backend está rodando em http://localhost:8000")
        return False

if __name__ == "__main__":
    print("AutoFund AI - Teste de Upload Profissional")
    print("=" * 50)

    # Verificar saúde do backend
    if not health_check():
        print("\n❌ Backend não está disponível!")
        exit(1)

    print()

    # Executar teste completo
    if test_upload_completo():
        print("\n✅ Todos os testes passaram!")
        print("🚀 O frontend profissional está pronto para uso!")
        print("\n🌐 Acesse: http://localhost:3002/index_professional.html")
    else:
        print("\n❌ Teste falhou!")
        print("🔧 Verifique o erro acima e tente novamente.")