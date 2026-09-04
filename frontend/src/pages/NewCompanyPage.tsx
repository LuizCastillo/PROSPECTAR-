import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from './_PageShell';
import { api } from '@/lib/api';

interface CreatedCompany {
  id: string;
  name: string;
}

const fieldClass =
  'w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2 text-sm text-paper outline-none focus:border-ember-500';
const labelClass = 'mb-1 block text-xs font-medium text-ink-400';

export function NewCompanyPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#E8703A');
  const [secondaryColor, setSecondaryColor] = useState('#12100D');
  const [accentColor, setAccentColor] = useState('#4C7A92');
  const [clientSpecifications, setClientSpecifications] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const company = await api.post<CreatedCompany>('/api/companies', {
        name,
        category: category || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        postalCode: postalCode || undefined,
        phone: phone || undefined,
        website: website || undefined,
        clientSpecifications: clientSpecifications || undefined,
        visualIdentity: { primaryColor, secondaryColor, accentColor },
      });
      navigate(`/companies/${company.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar empresa.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-5 md:p-8">
      <PageHeader
        title="Nova empresa"
        subtitle="Cadastre os dados que você já levantou com o cliente — nada aqui é buscado automaticamente."
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <section className="rounded-xl border border-ink-800 bg-ink-900 p-6 shadow-card">
          <h2 className="mb-4 text-sm font-semibold text-paper">Dados da empresa</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="col-span-2">
              <label className={labelClass}>Nome *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className={fieldClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Categoria / segmento</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: barbearia, restaurante, clínica"
                className={fieldClass}
              />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Endereço</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Cidade</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <input value={state} onChange={(e) => setState(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>CEP</label>
              <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Telefone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Site atual (se tiver)</label>
              <input value={website} onChange={(e) => setWebsite(e.target.value)} className={fieldClass} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-ink-800 bg-ink-900 p-6 shadow-card">
          <h2 className="mb-4 text-sm font-semibold text-paper">Identidade visual</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Cor primária</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-9 w-9 shrink-0 cursor-pointer rounded border border-ink-700 bg-ink-800"
                />
                <input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className={fieldClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Cor secundária</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-9 w-9 shrink-0 cursor-pointer rounded border border-ink-700 bg-ink-800"
                />
                <input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Cor de destaque</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-9 w-9 shrink-0 cursor-pointer rounded border border-ink-700 bg-ink-800"
                />
                <input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className={fieldClass} />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-ink-800 bg-ink-900 p-6 shadow-card">
          <h2 className="mb-1 text-sm font-semibold text-paper">Especificações do cliente</h2>
          <p className="mb-3 text-xs text-ink-400">
            Personalizações, pedidos específicos ou observações que o cliente passou — isso alimenta a geração do
            protótipo e do prompt final.
          </p>
          <textarea
            value={clientSpecifications}
            onChange={(e) => setClientSpecifications(e.target.value)}
            rows={6}
            placeholder="Ex: quer botão de WhatsApp bem visível, galeria de fotos dos serviços, tom mais premium..."
            className={fieldClass}
          />
        </section>

        {error && (
          <div className="rounded-lg border border-hot/30 bg-hot/10 px-4 py-3 text-sm text-hot">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-ember-500 px-4 py-2 text-sm font-medium text-paper hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar empresa'}
        </button>
      </form>
    </div>
  );
}
