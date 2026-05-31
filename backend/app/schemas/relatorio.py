from pydantic import BaseModel

from app.reports.relatorio_pdf import DadosRelatorio


class LoteResumo(BaseModel):
    nome: str
    tipo: str
    preco_unitario: float
    vendidos: int
    cortesias: int
    checkins: int
    receita: float


class RelatorioResumoResponse(BaseModel):
    evento_nome: str
    receita_bruta: float
    desconto_cupons: float
    valor_reembolsado: float
    receita_liquida: float
    total_ingressos: int
    total_checkins: int
    taxa_comparecimento: float  # 0.0–1.0
    lotes: list[LoteResumo]

    @classmethod
    def from_dados(cls, d: DadosRelatorio) -> "RelatorioResumoResponse":
        return cls(
            evento_nome=d.evento_nome,
            receita_bruta=d.receita_bruta,
            desconto_cupons=d.desconto_cupons,
            valor_reembolsado=d.valor_reembolsado,
            receita_liquida=d.receita_liquida,
            total_ingressos=d.total_ingressos,
            total_checkins=d.total_checkins,
            taxa_comparecimento=d.taxa_comparecimento,
            lotes=[
                LoteResumo(
                    nome=lote.nome,
                    tipo=lote.tipo,
                    preco_unitario=lote.preco_unitario,
                    vendidos=lote.vendidos,
                    cortesias=lote.cortesias,
                    checkins=lote.checkins,
                    receita=lote.receita,
                )
                for lote in d.lotes
            ],
        )
