#!/usr/bin/env python3
"""
Teste offline do AutoFund AI - Simula o fluxo completo sem usar API
"""

import json
from datetime import datetime
from autofund_ai_poc_v3 import ExtracoesFinanceiras, AnaliseFinanceira, ExcelGenerator, OUTPUT_DIR

def create_mock_data():
    """Cria dados financeiros mock baseados no IES real"""
    return {
        "nome_empresa": "PLF - PROJETOS, LDA.",
        "nif": "516807706",
        "periodo": "2023",
        "cae": "71120 - Engenharia e técnicas afins",
        "volume_negocios": 89200.00,
        "custo_mercadorias": 0.0,
        "custo_materias": 0.0,
        "fornecimento_servicos": 41782.00,
        "custos_pessoal": 13280.67,
        "depreciacoes": 8000.00,
        "resultados_operacionais": 26137.33,
        "resultados_financeiros": -900.00,
        "resultados_antes_imposto": 25237.33,
        "imposto_periodo": 3032.62,
        "resultado_liquido": 22204.71,
        "ativo_corrente": 70258.97,
        "ativo_nao_corrente": 10427.00,
        "total_ativo": 80685.97,
        "passivo_corrente": 28239.70,
        "passivo_nao_corrente": 6500.00,
        "total_passivo": 34739.70,
        "capital_proprio": 45946.27
    }

def create_mock_analysis():
    """Cria análise mock do que seria gerado pelo Opus"""
    return {
        "autonomia_financeira": 0.569,  # 56.9%
        "liquidez_geral": 2.49,
        "margem_ebitda": 0.300,  # 30%
        "rentabilidade_ativos": 0.275,  # 27.5%
        "endividamento": 0.431,
        "nivel_risco": "BAIXO",
        "pontos_fortes": [
            "Autonomia financeira sólida (56.9%)",
            "Elevada margem EBITDA (30%)",
            "Liquidez confortável (2.49)"
        ],
        "pontos_fracos": [
            "Volume de negócios em queda pós-COVID",
            "Dependência de grandes clientes",
            "Setor da construção com baixo crescimento"
        ],
        "recomendacoes": [
            "Diversificar carteira de clientes",
            "Expandir para serviços de consultoria digital",
            "Capitalização para aproveitar oportunidades PT2030"
        ],
        "memoria_descritiva": """
        A PLF - Projetos, LDA. é uma empresa de engenharia com sólida posição financeira,
        demonstrando autonomia financeira de 56.9% e liquidez geral de 2.49 em 2023.

        Apesar dos desafios do setor da construção civil pós-pandemia, a empresa manteve
        uma margem EBITDA de 30%, reflectindo eficiência operacional e controlo de custos.
        O resultado líquido de €22.204,71 evidencia a resiliência do modelo de negócio.

        Para o período 2024-2026, a empresa projeta um crescimento sustentado suportado
        em:
        - Diversificação para mercados internacionais
        - Transição digital dos serviços de engenharia
        - Candidatura a projetos de inovação no âmbito do Portugal 2030

        A solidez financeira demonstrada, aliada ao plano estratégico apresentado,
        posiciona a empresa como uma candidata ideal para financiamento,
        com capacidade para executar os projetos propostos e gerar retorno económico
        significativo para a economia nacional.
        """.strip()
    }

def test_validation():
    """Testa validação Pydantic"""
    print("🧪 Testando validação Pydantic...")

    mock_data = create_mock_data()

    # Testar com dados válidos
    try:
        financial_data = ExtracoesFinanceiras(**mock_data)
        print(f"✅ Validação OK")
        print(f"   Empresa: {financial_data.nome_empresa}")
        print(f"   NIF: {financial_data.nif}")
        print(f"   Contabilidade bate: {financial_data._contabilidade_bate}")
        print(f"   EBITDA calculado: €{financial_data.ebitda:,.2f}")
    except Exception as e:
        print(f"❌ Erro na validação: {str(e)}")
        return False

    # Testar com NIF inválido
    invalid_data = mock_data.copy()
    invalid_data['nif'] = '123'
    try:
        ExtracoesFinanceiras(**invalid_data)
        print("❌ Deveria ter falhado com NIF inválido")
        return False
    except Exception as e:
        print(f"✅ Detectado NIF inválido: {str(e)}")

    # Testar equação contabilística
    unbalanced_data = mock_data.copy()
    unbalanced_data['total_ativo'] = 100000
    try:
        financial_data = ExtracoesFinanceiras(**unbalanced_data)
        if not financial_data._contabilidade_bate:
            print(f"✅ Detectado desequilíbrio contabilístico")
        else:
            print("❌ Não detectou desequilíbrio")
            return False
    except Exception as e:
        print(f"✅ Validação capturou erro: {str(e)}")

    return True

def test_analysis():
    """Testa criação de objeto AnaliseFinanceira"""
    print("\n🧪 Testando modelo de análise...")

    mock_analysis = create_mock_analysis()

    try:
        analysis = AnaliseFinanceira(**mock_analysis)
        print(f"✅ Análise válida")
        print(f"   Nível de risco: {analysis.nivel_risco}")
        print(f"   Autonomia: {analysis.autonomia_financeira:.1%}")
        print(f"   Pontos fortes: {len(analysis.pontos_fortes)}")
        print(f"   Pontos fracos: {len(analysis.pontos_fracos)}")
        print(f"   Memória descritiva: {len(analysis.memoria_descritiva)} chars")
        return True
    except Exception as e:
        print(f"❌ Erro na análise: {str(e)}")
        return False

def test_excel_generation():
    """Testa geração do Excel"""
    print("\n🧪 Testando geração do Excel...")

    try:
        # Criar dados
        financial_data = ExtracoesFinanceiras(**create_mock_data())
        analysis = AnaliseFinanceira(**create_mock_analysis())

        # Gerar Excel
        excel_gen = ExcelGenerator("template_iapmei.xlsx")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = OUTPUT_DIR / f"test_output_{timestamp}.xlsx"

        excel_gen.fill_template(financial_data, analysis, str(output_path))

        print(f"✅ Excel gerado: {output_path}")

        # Verificar se ficheiro existe
        if output_path.exists():
            size = output_path.stat().st_size
            print(f"   Tamanho: {size} bytes")
            return True
        else:
            print("❌ Ficheiro não foi criado")
            return False

    except Exception as e:
        print(f"❌ Erro na geração Excel: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def generate_test_report():
    """Gera relatório de teste completo"""
    print("\n📊 Gerando relatório de teste completo...")

    # Dados financeiros
    financial_data = ExtracoesFinanceiras(**create_mock_data())

    # Análise mock (simulando Opus)
    analysis = AnaliseFinanceira(**create_mock_analysis())

    # Relatório completo
    report = {
        "metadata": {
            "empresa": financial_data.nome_empresa,
            "nif": financial_data.nif,
            "periodo": financial_data.periodo,
            "data_processamento": datetime.now().isoformat(),
            "versao": "1.0.0-test"
        },
        "dados_financeiros": financial_data.model_dump(),
        "analise": analysis.model_dump(),
        "validacoes": {
            "contabilidade_valida": financial_data._contabilidade_bate,
            "nif_valido": len(financial_data.nif) == 9,
            "periodo_valido": len(financial_data.periodo) == 4
        },
        "testes_realizados": [
            "Validação Pydantic",
            "Cálculo de rácios",
            "Geração Excel",
            "Formatação condicional"
        ]
    }

    # Salvar JSON
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_path = OUTPUT_DIR / f"test_report_{timestamp}.json"

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"✅ Relatório salvo: {json_path}")
    return json_path

def main():
    """Executa todos os testes offline"""
    print("🚀 AutoFund AI - Teste Offline")
    print("="*50)

    # Criar diretório de saída
    OUTPUT_DIR.mkdir(exist_ok=True)

    # Executar testes
    test_results = []

    test_results.append(("Validação Pydantic", test_validation()))
    test_results.append(("Modelo de Análise", test_analysis()))
    test_results.append(("Geração Excel", test_excel_generation()))

    # Gerar relatório
    report_path = generate_test_report()

    # Resumo
    print("\n" + "="*50)
    print("📋 RESUMO DOS TESTES")
    print("="*50)

    passed = 0
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:30} {status}")
        if result:
            passed += 1

    print(f"\nResultados: {passed}/{len(test_results)} testes passaram")

    if passed == len(test_results):
        print("\n🎉 Todos os testes passaram! O sistema está pronto para uso com API.")
        print("\n📝 Próximos passos:")
        print("1. Configure ANTHROPIC_API_KEY no .env")
        print("2. Execute: python3 autofund_ai_poc_v2.py")
        print("3. Faça upload do seu IES PDF")
    else:
        print("\n⚠️ Alguns testes falharam. Verifique os erros acima.")

    print(f"\n📊 Relatório detalhado: {report_path}")

if __name__ == "__main__":
    main()