#!/usr/bin/env python3
"""
Teste de Upload via API - AutoFund AI
"""

import requests
import json
from pathlib import Path

# Configuração
API_URL = "http://localhost:8000"
IES_PATH = "IES - 2023.pdf"

def test_upload():
    """Testa upload do IES via API"""
    print("🚀 Testando Upload via API")
    print("=" * 50)

    # Verificar se arquivo existe
    if not Path(IES_PATH).exists():
        print(f"❌ Arquivo IES não encontrado: {IES_PATH}")
        return

    try:
        # Preparar dados
        data = {
            "nif": "516807706",
            "ano_exercicio": "2023",
            "designacao_social": "PLF - PROJETOS, LDA.",
            "email": "test@autofund.ai",
            "context": "Teste via API"
        }

        # Fazer upload
        print(f"📤 Enviando arquivo: {IES_PATH}")
        print(f"📊 Dados: {json.dumps(data, indent=2)}")

        with open(IES_PATH, "rb") as f:
            files = {"file": (IES_PATH, f, "application/pdf")}
            response = requests.post(f"{API_URL}/api/upload", data=data, files=files)

        print(f"\n📥 Resposta Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print("✅ Upload realizado com sucesso!")
            print(json.dumps(result, indent=2))

            # Verificar status
            task_id = result.get("task_id")
            if task_id:
                print(f"\n🔄 Verificando status da tarefa: {task_id}")
                status_response = requests.get(f"{API_URL}/api/status/{task_id}")

                if status_response.status_code == 200:
                    status = status_response.json()
                    print(f"Status: {status.get('status')}")
                    if "result" in status:
                        print("\n📊 Resultado:")
                        print(json.dumps(status["result"], indent=2))
        else:
            print(f"❌ Erro: {response.status_code}")
            print(response.text)

    except Exception as e:
        print(f"❌ Erro no upload: {e}")

def test_api_health():
    """Testa se API está online"""
    try:
        response = requests.get(f"{API_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ API está online!")
            print(json.dumps(response.json(), indent=2))
            return True
        else:
            print(f"❌ API retornou status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Não foi possível conectar à API")
        print("   Certifique-se de que o backend está rodando em http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def main():
    print("🧪 TESTE API AUTOFUND AI")
    print("=" * 60)

    # 1. Verificar saúde da API
    if test_api_health():
        print("\n" + "=" * 60)
        # 2. Testar upload
        test_upload()
    else:
        print("\n❌ Execute o backend antes de fazer upload:")
        print("   python3 -m uvicorn api.main:app --reload --port 8000")

if __name__ == "__main__":
    main()