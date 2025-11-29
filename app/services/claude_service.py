"""
Enhanced Claude AI Service for Portugal 2030 Analysis
"""

import anthropic
from typing import Dict, Any, Optional
import json
import asyncio
from datetime import datetime

from app.core.config import settings


class ClaudeService:
    """Service for interacting with Claude AI models"""

    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        self.model_extraction = settings.model_extraction
        self.model_analysis = settings.model_analysis

    async def extract_financial_data(self, file_content: bytes) -> Dict[str, Any]:
        """
        Extract financial data from IES PDF using Claude 3.5 Sonnet
        """
        try:
            # Create message with file
            message = self.client.messages.create(
                model=self.model_extraction,
                max_tokens=4000,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": self._get_extraction_prompt()
                            },
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "application/pdf",
                                    "data": file_content
                                }
                            }
                        ]
                    }
                ]
            )

            # Parse response
            response_text = message.content[0].text
            return json.loads(response_text)

        except Exception as e:
            raise Exception(f"Failed to extract financial data: {str(e)}")

    async def analyze_financial_data(
        self,
        financial_data: Dict[str, Any],
        company_context: str = ""
    ) -> Dict[str, Any]:
        """
        Perform detailed Portugal 2030 analysis using Claude Opus
        """
        try:
            # Enhanced prompt for Portugal 2030 specific analysis
            prompt = self._get_portugal_2030_analysis_prompt(
                financial_data,
                company_context
            )

            message = self.client.messages.create(
                model=self.model_analysis,
                max_tokens=6000,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            response_text = message.content[0].text
            return json.loads(response_text)

        except Exception as e:
            raise Exception(f"Failed to analyze financial data: {str(e)}")

    def _get_extraction_prompt(self) -> str:
        """
        Get the optimized prompt for IES data extraction
        """
        return """
        Como especialista em contabilidade portuguesa, extrai todos os dados financeiros relevantes deste IES.

        Extrai e estrutura os seguintes campos:

        IDENTIFICAÇÃO:
        - Nome da empresa
        - NIF (9 dígitos)
        - CAE principal
        - Período fiscal

        DEMONSTRAÇÃO DE RESULTADOS:
        - Volume de negócios (Vendas + Prestações de serviços)
        - Custo das mercadorias vendidas
        - Custo das matérias-primas e consumíveis
        - Fornecimento e serviços externos
        - Gastos com o pessoal
        - Depreciações e amortizações
        - Resultados operacionais
        - Resultados financeiros
        - Resultados antes de imposto
        - Imposto sobre o rendimento do período
        - Resultado líquido do período

        BALANÇO:
        - Ativo não corrente
        - Ativo corrente
        - Total do ativo
        - Passivo não corrente
        - Passivo corrente
        - Total do passivo
        - Capital próprio

        INDICADORES ADICIONAIS:
        - Número de funcionários
        - Investimentos em imobilizado

        Responde em formato JSON válido com exatamente estes campos.
        Valores numéricos sem formatação (ex: 12345.67 não 12.345,67€).
        """

    def _get_portugal_2030_analysis_prompt(
        self,
        financial_data: Dict[str, Any],
        company_context: str
    ) -> str:
        """
        Get the enhanced Portugal 2030 specific analysis prompt
        """
        # Calculate key ratios
        total_assets = financial_data.get('total_ativo', 0)
        capital_próprio = financial_data.get('capital_proprio', 0)
        ativo_corrente = financial_data.get('ativo_corrente', 0)
        passivo_corrente = financial_data.get('passivo_corrente', 0)
        volume_negocios = financial_data.get('volume_negocios', 0)
        resultado_liquido = financial_data.get('resultado_liquido', 0)
        depreciacoes = financial_data.get('depreciacoes', 0)

        autonomia_financeira = (capital_próprio / total_assets * 100) if total_assets > 0 else 0
        liquidez_geral = (ativo_corrente / passivo_corrente) if passivo_corrente > 0 else 0
        ebitda = resultado_liquido + depreciacoes
        margem_ebitda = (ebitda / volume_negocios * 100) if volume_negocios > 0 else 0
        rentabilidade_ativos = (resultado_liquido / total_assets * 100) if total_assets > 0 else 0

        return f"""
        COMO CONSULTOR SÉNIOR ESPECIALIZADO EM PORTUGAL 2030, analise esta PME para candidatura:

        DADOS DA EMPRESA:
        {json.dumps(financial_data, indent=2)}

        CONTEXTO ADICIONAL:
        {company_context}

        RÁCIOS CALCULADOS:
        - Autonomia Financeira: {autonomia_financeira:.1f}%
        - Liquidez Geral: {liquidez_geral:.2f}
        - Margem EBITDA: {margem_ebitda:.1f}%
        - Rentabilidade dos Ativos: {rentabilidade_ativos:.1f}%

        ANALISE OS SEGUINTES ASPECTOS ESPECÍFICOS PORTUGAL 2030:

        1. **ENQUADRAMENTO SETORIAL PORTUGAL 2030**
        - Análise do setor CAE {financial_data.get('cae', 'N/A')}
        - Posição competitiva no mercado português
        - Potencial de crescimento e inovação
        - Alinhamento com prioridades da transição verde e digital

        2. **CRITÉRIOS DE ELEGIBILIDADE PORTUGAL 2030**
        - Classificação PME (critérios UE: <250 funcionários, <50M€ volume)
        - Viabilidade económico-financeira (solvabilidade, rentabilidade)
        - Capacidade de investimento próprio (mínimo 30-40%推荐)
        - Potencial de criação de emprego qualificado

        3. **ANÁLISE FINANCEIRA APROFUNDADA**
        - Sustentabilidade da estrutura financeira
        - Capacidade de geração de caixa operacional
        - Nível de endividamento e capacidade de serviço
        - Rácios vs benchmark sectorial português

        4. **RECOMENDAÇÕES ESTRATÉGICAS PORTUGAL 2030**
        - Tipologias de investimento mais adequadas
        - Montante de incentivo elegível (estimativa)
        - Pontos fracos a mitigar na candidatura
        - Oportunidades de otimização financeira

        5. **PLANO DE MELHORIA**
        - Ações corretivas para aumentar elegibilidade
        - Investimentos prioritários
        - Calendário recomendado para candidatura
        - Sinergias com outros programas disponíveis

        6. **AVALIAÇÃO DE RISCO E SUCESSO**
        - Score de elegibilidade (0-100)
        - Nível de risco (BAIXO/MÉDIO/ALTO/CRÍTICO)
        - Probabilidade de sucesso estimada
        - Fatores críticos de sucesso

        7. **IMPACTO ESPERADO**
        - Contribuição para objetivos Portugal 2030
        - Impacto na competitividade e sustentabilidade
        - Potencial de internacionalização
        - Alinhamento com políticas ambientais e sociais

        RESPONDE EM FORMATO JSON COM ESTA ESTRUTURA EXATA:

        {{
            "metadata": {{
                "empresa": "nome_empresa",
                "nif": "nif",
                "cae": "cae_principal",
                "setor": "descricao_setor",
                "periodo_analise": "ano_fiscal",
                "data_analise": "data_atual"
            }},
            "classificacao_pme": {{
                "micro_empresa": boolean,
                "pequena_empresa": boolean,
                "media_empresa": boolean,
                "funcionarios": numero,
                "volume_negocios": valor,
                "total_balanco": valor
            }},
            "analise_financeira": {{
                "autonomia_financeira": {{
                    "valor": percentagem,
                    "classificacao": "excelente/boa/aceitável/fraca/crítica",
                    "comentario": "analise_detelhada"
                }},
                "liquidez_geral": {{
                    "valor": rácio,
                    "classificacao": "excelente/boa/aceitável/fraca/crítica",
                    "comentario": "analise_detelhada"
                }},
                "margem_ebitda": {{
                    "valor": percentagem,
                    "classificacao": "excelente/boa/aceitável/fraca/crítica",
                    "comentario": "analise_detelhada"
                }},
                "rentabilidade_ativos": {{
                    "valor": percentagem,
                    "classificacao": "excelente/boa/aceitável/fraca/crítica",
                    "comentario": "analise_detelhada"
                }},
                "avaliacao_global": {{
                    "score": 0-100,
                    "nivel_risco": "BAIXO/MÉDIO/ALTO/CRÍTICO",
                    "viabilidade": boolean,
                    "observacoes": "comentarios_adicionais"
                }}
            }},
            "elegibilidade_portugal_2030": {{
                "criterios_pme": {{
                    "cumpre": boolean,
                    "justificacao": "detalhes"
                }},
                "viabilidade_economica": {{
                    "cumpre": boolean,
                    "justificacao": "detalhes"
                }},
                "capacidade_investimento": {{
                    "percentagem_capital_proprio": valor,
                    "cumpre": boolean,
                    "justificacao": "detalhes"
                }},
                "score_geral": 0-100,
                "elegivel": boolean
            }},
            "recomendacoes_estrategicas": {{
                "tipologias_investimento": [
                    {{
                        "tipo": "digitalizacao/industria_4.0/transicao_verde/qualificacao/...",
                        "descricao": "detalhes",
                        "prioridade": "alta/media/baixa",
                        "impacto_esperado": "descricao"
                    }}
                ],
                "montante_incentivo": {{
                    "investimento_total_estimado": valor,
                    "percentagem_incentivo": percentagem,
                    "incentivo_estimado": valor
                }},
                "acoes_corretivas": [
                    {{
                        "acao": "descricao",
                        "prioridade": "alta/media/baixa",
                        "prazo": "imediatate/curto_prazo/medio_prazo",
                        "impacto": "descricao"
                    }}
                ]
            }},
            "plano_implementacao": {{
                "fases": [
                    {{
                        "fase": "1/2/3...",
                        "descricao": "objetivos",
                        "duracao": "meses",
                        "recursos": "descricao"
                    }}
                ],
                "calendario_candidatura": "data_recomendada",
                "proximos_passos": [
                    "acao_1",
                    "acao_2",
                    "action_3"
                ]
            }},
            "impacto_portugal_2030": {{
                "alinhamento_prioridades": {{
                    "transicao_verde": boolean,
                    "transicao_digital": boolean,
                    "coesao_social": boolean
                }},
                "indicadores_esperados": {{
                    "criacao_emprego": numero,
                    "qualificacao_profissional": "descricao",
                    "sustentabilidade_ambiental": "descricao",
                    "inovacao": "descricao"
                }},
                "contribuicao_estrategica": "descricao_detalhada"
            }},
            "analise_cenario": {{
                "otimista": {{
                    "probabilidade_sucesso": percentagem,
                    "montante_maximo": valor,
                    "condicoes": "descricao"
                }},
                "realista": {{
                    "probabilidade_sucesso": percentagem,
                    "montante_esperado": valor,
                    "condicoes": "descricao"
                }},
                "conservador": {{
                    "probabilidade_sucesso": percentagem,
                    "montante_minimo": valor,
                    "condicoes": "descricao"
                }}
            }},
            "pontos_fortes": [
                "ponto_forte_1_com_detalhes",
                "ponto_forte_2_com_detalhes"
            ],
            "pontos_fracos": [
                "ponto_fraco_1_com_detalhes",
                "ponto_fraco_2_com_detalhes"
            ],
            "oportunidades": [
                "oportunidade_1_com_detalhes",
                "oportunidade_2_com_detalhes"
            ],
            "ameacas": [
                "ameaca_1_com_detalhes",
                "ameaca_2_com_detalhes"
            ],
            "conclusao": {{
                "recomendacao_final": "FAZER_CANDIDATURA/NÃO_FAZER/AGUARDAR_MELHORIAS",
                "justificacao": "motivos_detalhados",
                "valor_estrategico": "descricao",
                "proximos_passos_criticos": "acoes_imediatas"
            }},
            "informacao_adicional": {{
                "documentos_necessarios": ["documento_1", "documento_2"],
                "prazos_importantes": ["prazo_1", "prazo_2"],
                "contactos_uteis": ["entidade_1", "entidade_2"]
            }}
        }}

        SÊ ESPECÍFICO, PRÁTICO E ORIENTADO PARA AÇÃO. INCLUI NÚMEROS E ESTIMATIVAS QUANDO POSSÍVEL.
        """