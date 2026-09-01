import { useParams } from 'react-router-dom';
import { PageHeader, EmptyState } from '../_PageShell';

export function PromptGeneratorPage() {
  const { companyId } = useParams();

  // TODO (Fase 5): três colunas -
  // esquerda: dados da empresa | centro: Business/Brand/Strategy/Score | direita: prompt final + versionamento.

  return (
    <div className="p-8">
      <PageHeader
        title="Gerador de prompt"
        subtitle={`Empresa ${companyId ?? ''} — briefing e prompt final para IA de desenvolvimento.`}
      />
      <EmptyState
        title="Prompt Engine ainda não conectado"
        description="Disponível a partir da Fase 5, após Business Analyzer e Website Strategist estarem implementados."
      />
    </div>
  );
}
