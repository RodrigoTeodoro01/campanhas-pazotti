import React, { useState, useEffect } from 'react';
import { fetchData, updateRow } from './services/dataService';
import { 
  LayoutDashboard, 
  Table, 
  Download, 
  Eye,
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Menu,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Users,
  PieChart as PieChartIcon,
  Camera,
  FileDown
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LabelList
} from 'recharts';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useRef } from 'react';

import brainLogo from './assets/brain-logo.jfif';
import leticiaImg from './assets/leticia.png';
import cibeleImg from './assets/cibele.png';
import edvaniaImg from './assets/edvania.png';

const UNIT_COLORS = {
  'PAZOTTI MATRIZ': { base: '#3b82f6', dark: '#1d4ed8', light: '#93c5fd' },
  'PAZOTTI FILIAL': { base: '#ef4444', dark: '#b91c1c', light: '#fca5a5' },
  'PAZOTTI FRIOS': { base: '#22c55e', dark: '#15803d', light: '#86efac' },
  'PAZOTTI FOOD': { base: '#f97316', dark: '#c2410c', light: '#fdba74' },
  'PAZOTTI TRIANGULO': { base: '#a855f7', dark: '#7e22ce', light: '#d8b4fe' },
};

const COLORS = {
  'PAZOTTI MATRIZ': '#3b82f6',
  'PAZOTTI FILIAL': '#ef4444',
  'PAZOTTI FRIOS': '#22c55e',
  'PAZOTTI FOOD': '#f97316',
  'PAZOTTI TRIANGULO': '#a855f7',
  'CAMPANHA': '#d4af37',
  'ACOMPANHAMENTO': '#ff0066',
  'DEFAULT': '#666'
};

const ALL_STATUSES = [
  '(Vazio)',
  'EM MONTAGEM',
  'AGUARDANDO DIVISÃO',
  'AGUARDANDO APROVAÇÃO',
  'APROVADA',
  'ENVIADA',
  'CANCELADA'
];

const ALL_FINAL = [
  '(Vazio)',
  'ACOMPANHAMENTO',
  'ATINGIU A META',
  'NÃO ATINGIU A META'
];

const MONTHS = [
  { name: 'JANEIRO', gid: '1822191689' },
  { name: 'FEVEREIRO', gid: '1769551716' }, 
  { name: 'MARÇO', gid: '1774384553' }, 
  { name: 'ABRIL', gid: '753985639' },
];

const ANALYSTS = [
  { name: 'LETICIA', img: leticiaImg, team: 'Equipe Bravo' },
  { name: 'CIBELE', img: cibeleImg, team: 'Equipe Bravo' },
  { name: 'EDVANIA', img: edvaniaImg, team: 'Equipe Bravo' },
];

const Dashboard = ({ data, stats, dataByPazotti, dataByAnalyst, statusCounts, finalCounts, monthName }) => {
  const dashboardRef = useRef(null);

  const exportImage = async () => {
    if (!dashboardRef.current) return;
    try {
      const dataUrl = await toPng(dashboardRef.current, { cacheBust: true, backgroundColor: '#0a0a0a' });
      const link = document.createElement('a');
      link.download = `dashboard_pazotti_${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) { console.error('Erro exportando imagem:', err); }
  };

  const exportPDF = async () => {
    if (!dashboardRef.current) return;
    try {
      const dataUrl = await toPng(dashboardRef.current, { cacheBust: true, backgroundColor: '#0a0a0a' });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`dashboard_pazotti_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) { console.error('Erro exportando PDF:', err); }
  };

  const dataByStatus = Object.entries(
    data.reduce((acc, curr) => {
      const status = curr.STATUS || '(Vazio)';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="dashboard-content" ref={dashboardRef}>
      <div className="dashboard-header-actions">
        <div className="title-area">
          <h3 className="section-title main"><LayoutDashboard size={24} className="gold-icon" /> Visão Geral</h3>
          <p className="dashboard-current-month gold-text">{monthName}</p>
        </div>
        <div className="export-actions">
          <button className="export-btn glass" onClick={exportImage} title="Exportar como Imagem">
            <Camera size={18} /> PNG
          </button>
          <button className="export-btn glass" onClick={exportPDF} title="Exportar como PDF">
            <FileDown size={18} /> PDF
          </button>
        </div>
      </div>

      <div className="kpi-grid main-stats">
        <div className="glass kpi-card" style={{ borderLeft: `4px solid var(--accent-gold)` }}>
          <div className="kpi-icon gold"><LayoutDashboard size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-label">TOTAL GERAL</span>
            <span className="kpi-value">{stats.total}</span>
          </div>
        </div>
        <div className="glass kpi-card" style={{ borderLeft: `4px solid #d4af37` }}>
          <div className="kpi-icon gold"><TrendingUp size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Campanhas</span>
            <span className="kpi-value">{stats.campanhas}</span>
          </div>
        </div>
        <div className="glass kpi-card" style={{ borderLeft: `4px solid #ff0066` }}>
          <div className="kpi-icon pink"><Clock size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Acompanhamentos</span>
            <span className="kpi-value">{stats.acompanhamento}</span>
          </div>
        </div>
      </div>

      <h3 className="section-title mini"><Clock size={18} className="gold-icon" /> Status do Fluxo</h3>
      <div className="kpi-grid status-stats">
        {ALL_STATUSES.map(status => (
          <div className="glass kpi-card mini" key={status} style={{ borderLeft: `3px solid ${status === '(Vazio)' ? '#666' : '#3b82f6'}` }}>
            <div className="kpi-info">
              <span className="kpi-label">{status}</span>
              <span className="kpi-value mini">{statusCounts[status] || 0}</span>
            </div>
          </div>
        ))}
      </div>

      <h3 className="section-title mini"><CheckCircle2 size={18} className="gold-icon" /> Resumo de Resultados (Coluna Final)</h3>
      <div className="kpi-grid status-stats">
        {ALL_FINAL.map(finalStatus => (
          <div className="glass kpi-card mini" key={finalStatus} style={{ borderLeft: `3px solid ${finalStatus === 'ATINGIU A META' ? '#22c55e' : (finalStatus === 'NÃO ATINGIU A META' ? '#ef4444' : '#666')}` }}>
            <div className="kpi-info">
              <span className="kpi-label">{finalStatus}</span>
              <span className="kpi-value mini">{finalCounts[finalStatus] || 0}</span>
            </div>
          </div>
        ))}
      </div>

    <div className="chart-grid-main">
      <div className="glass chart-container full-width">
        <h3 className="chart-title"><BarChart3 size={20} className="gold-icon" /> Campanhas vs Acompanhamentos por Unidade</h3>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <BarChart data={dataByPazotti}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="#a0a0a0" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#a0a0a0" fontSize={12} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #d4af37', borderRadius: '8px' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Bar name="Campanhas" dataKey="campanhas" radius={[4, 4, 0, 0]} barSize={40}>
                {dataByPazotti.map((entry, index) => (
                  <Cell key={`cell-c-${index}`} fill={UNIT_COLORS[entry.name]?.dark || COLORS.CAMPANHA} />
                ))}
                <LabelList dataKey="campanhas" position="top" fill="#a0a0a0" fontSize={12} />
              </Bar>
              <Bar name="Acompanhamentos" dataKey="acompanhamentos" radius={[4, 4, 0, 0]} barSize={40}>
                {dataByPazotti.map((entry, index) => (
                  <Cell key={`cell-a-${index}`} fill={UNIT_COLORS[entry.name]?.light || COLORS.ACOMPANHAMENTO} />
                ))}
                <LabelList dataKey="acompanhamentos" position="top" fill="#a0a0a0" fontSize={12} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-row">
        <div className="glass chart-container">
          <h3 className="chart-title"><Users size={20} className="gold-icon" /> Ações por Analista</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={Object.values(dataByAnalyst)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                <XAxis type="number" stroke="#a0a0a0" fontSize={10} hide />
                <YAxis type="category" dataKey="name" stroke="#a0a0a0" fontSize={11} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #d4af37' }} />
                <Bar dataKey="total" fill="#d4af37" radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="total" position="right" fill="#d4af37" fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass chart-container">
          <h3 className="chart-title"><PieChartIcon size={20} className="gold-icon" /> Status do Fluxo</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={dataByStatus}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {dataByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % 5]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid var(--border-color)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
    
    <div className="analysts-section fade-in">
      <h3 className="section-title"><Users size={24} className="gold-icon" /> Time de Analistas</h3>
      <div className="analysts-grid">
        {ANALYSTS.map(analyst => {
          const analystStats = dataByAnalyst[analyst.name] || { campanhas: 0, acompanhamentos: 0, total: 0 };
          return (
            <div className="analyst-card glass" key={analyst.name}>
              <div className="analyst-photo-wrapper">
                <img src={analyst.img} alt={analyst.name} className="analyst-photo" />
              </div>
              <div className="analyst-details">
                <div className="analyst-header">
                  <h4 className="gold-text">{analyst.name}</h4>
                  <div className="analyst-stats-mini">
                    <span className="mini-stat camp" title="Campanhas">C: {analystStats.campanhas}</span>
                    <span className="mini-stat aco" title="Acompanhamentos">A: {analystStats.acompanhamentos}</span>
                  </div>
                </div>
                <p>{analyst.team}</p>
                <div className="analyst-badge">Analista de Vendas</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
  );
};

const Campaigns = ({ filteredData, searchTerm, setSearchTerm, currentGid, setCurrentGid, handleUpdate }) => (
  <div className="campaigns-view fade-in">
    <div className="filter-bar glass">
      <div className="search-box">
        <Menu size={20} className="search-icon" />
        <input 
          type="text" 
          placeholder="Buscar indústria, analista, unidade..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="month-selector">
        <span className="selector-label">Período:</span>
        <select 
          className="month-dropdown glass"
          value={currentGid}
          onChange={(e) => setCurrentGid(e.target.value)}
        >
          {MONTHS.map(m => (
            <option key={m.name} value={m.gid} disabled={!m.gid}>
              {m.name} {!m.gid ? '(Indisponível)' : ''}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div className="glass table-container">
      <table>
        <thead>
          <tr>
            <th>Nº</th>
            <th>Indústria / Analista</th>
            <th>Unidade</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Final</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row) => (
            <tr key={row['Nº']}>
              <td><span className="row-id">{row['Nº']}</span></td>
              <td>
                <div className="industry-cell">
                  <span className="industry-name">{row.INDUSTRIA}</span>
                  <span className="analyst-name-table">{row.ANALISTA}</span>
                </div>
              </td>
              <td>
                <span className="unit-badge" style={{ color: COLORS[row.PAZOTTI] || '#fff', borderColor: COLORS[row.PAZOTTI] || '#333' }}>
                  {row.PAZOTTI}
                </span>
              </td>
              <td>
                <span className={`badge ${row.TIPO === 'CAMPANHA' ? 'campanha' : 'acompanhamento'}`}>
                  {row.TIPO}
                </span>
              </td>
              <td>
                <select 
                  className="status-select glass"
                  value={row.STATUS || ''}
                  onChange={(e) => handleUpdate(row['Nº'], 'STATUS', e.target.value)}
                >
                  <option value="">(Vazio)</option>
                  <option value="EM MONTAGEM">EM MONTAGEM</option>
                  <option value="AGUARDANDO DIVISÃO">AGUARDANDO DIVISÃO</option>
                  <option value="AGUARDANDO APROVAÇÃO">AGUARDANDO APROVAÇÃO</option>
                  <option value="APROVADA">APROVADA</option>
                  <option value="ENVIADA">ENVIADA</option>
                  <option value="CANCELADA">CANCELADA</option>
                </select>
              </td>
              <td>
                <select 
                  className="status-select glass"
                  value={row.FINAL || ''}
                  onChange={(e) => handleUpdate(row['Nº'], 'FINAL', e.target.value)}
                >
                  <option value="">(Vazio)</option>
                  <option value="ACOMPANHAMENTO">ACOMPANHAMENTO</option>
                  <option value="ATINGIU A META">ATINGIU A META</option>
                  <option value="NÃO ATINGIU A META">NÃO ATINGIU A META</option>
                </select>
              </td>
              <td className="actions-cell">
                <a href={row['LINK FORMULARIO']} target="_blank" rel="noreferrer" className="action-btn view" title="Visualizar PDF">
                  <Eye size={18} />
                </a>
                <a href={row['LINK FORMULARIO']} target="_blank" rel="noreferrer" className="action-btn download" title="Baixar">
                  <Download size={18} />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [currentGid, setCurrentGid] = useState('753985639');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchData(currentGid);
        const cleanedData = result.filter(row => row.INDUSTRIA && row.INDUSTRIA.trim() !== '');
        setData(cleanedData);
      } catch (err) {
        console.error(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentGid]);

  const handleUpdate = async (n, field, value) => {
    setData(prev => prev.map(row => 
      row['Nº'] === n ? { ...row, [field]: value } : row
    ));
    await updateRow(n, field, value);
  };

  const filteredData = data.filter(row => 
    Object.values(row).some(val => 
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const stats = {
    total: data.length,
    campanhas: data.filter(r => r.TIPO === 'CAMPANHA').length,
    acompanhamento: data.filter(r => r.TIPO === 'ACOMPANHAMENTO').length,
    enviada: data.filter(r => r.STATUS === 'ENVIADA').length,
  };

  const dataByPazotti = Object.entries(
    data.reduce((acc, curr) => {
      if (!acc[curr.PAZOTTI]) acc[curr.PAZOTTI] = { name: curr.PAZOTTI, campanhas: 0, acompanhamentos: 0 };
      if (curr.TIPO === 'CAMPANHA') acc[curr.PAZOTTI].campanhas++;
      else acc[curr.PAZOTTI].acompanhamentos++;
      return acc;
    }, {})
  ).map(([_, val]) => val);

  const dataByAnalyst = data.reduce((acc, curr) => {
    const name = (curr.ANALISTA || 'N/A').toUpperCase().trim();
    if (!acc[name]) acc[name] = { name, campanhas: 0, acompanhamentos: 0, total: 0 };
    if (curr.TIPO === 'CAMPANHA') acc[name].campanhas++;
    else if (curr.TIPO === 'ACOMPANHAMENTO') acc[name].acompanhamentos++;
    acc[name].total++;
    return acc;
  }, {});

  const statusCounts = ALL_STATUSES.reduce((acc, status) => {
    acc[status] = data.filter(r => (r.STATUS || '(Vazio)') === status).length;
    return acc;
  }, {});

  const finalCounts = ALL_FINAL.reduce((acc, f) => {
    acc[f] = data.filter(r => (r.FINAL || '(Vazio)') === f).length;
    return acc;
  }, {});

  return (
    <div className="app-container">
      <header className="main-header glass">
        <div className="header-content container">
          <div className="logo-section">
            <img src={brainLogo} alt="Pazotti Logo" className="header-logo" />
            <div className="title-section">
              <h1 className="gold-text">TIME DE ANÁLISES</h1>
              <span className="subtitle">PAZOTTI DISTRIBUIDORA</span>
            </div>
          </div>
          
          <nav className="header-nav">
            <button className={`nav-link ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
              <LayoutDashboard size={20} /> Dashboard
            </button>
            <button className={`nav-link ${view === 'campaigns' ? 'active' : ''}`} onClick={() => setView('campaigns')}>
              <Table size={20} /> Campanhas
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content container">
        {loading ? (
          <div className="loader-container">
            <div className="loader"></div>
            <p className="gold-text">Sincronizando dados...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="loader-container">
            <AlertCircle size={48} color="var(--accent-gold)" />
            <p className="gold-text">Nenhuma informação neste período.</p>
            <button className="primary" onClick={() => setCurrentGid('753985639')}>Abril</button>
          </div>
        ) : (
          view === 'dashboard' ? (
            <Dashboard 
              data={data} stats={stats} 
              dataByPazotti={dataByPazotti} 
              dataByAnalyst={dataByAnalyst}
              statusCounts={statusCounts}
              finalCounts={finalCounts}
              monthName={MONTHS.find(m => m.gid === currentGid)?.name || 'PERÍODO SELECIONADO'}
            />
          ) : (
            <Campaigns 
              filteredData={filteredData} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm}
              currentGid={currentGid}
              setCurrentGid={setCurrentGid}
              handleUpdate={handleUpdate}
            />
          )
        )}
      </main>

      <footer className="main-footer container">
        <p>&copy; 2026 Pazotti Distribuidora - Time de Análises de Vendas</p>
      </footer>

      <style>{`
        .app-container { min-height: 100vh; display: flex; flex-direction: column; }
        .main-header { padding: 1rem 0; border-radius: 0; border-bottom: 1px solid var(--border-color); position: sticky; top: 0; z-index: 100; }
        .header-content { display: flex; justify-content: space-between; align-items: center; }
        .logo-section { display: flex; align-items: center; gap: 1.5rem; }
        .header-logo { height: 60px; border-radius: 50%; border: 2px solid var(--accent-gold); box-shadow: 0 0 15px rgba(212, 175, 55, 0.4); }
        .title-section h1 { font-size: 1.5rem; margin: 0; line-height: 1; }
        .subtitle { font-size: 0.75rem; color: var(--text-secondary); letter-spacing: 0.2em; text-transform: uppercase; }
        .header-nav { display: flex; gap: 1rem; }
        .nav-link { background: transparent; color: var(--text-secondary); padding: 0.5rem 1rem; display: flex; align-items: center; gap: 0.5rem; font-weight: 500; }
        .nav-link:hover { color: var(--accent-gold); }
        .nav-link.active { color: var(--accent-gold); border-bottom: 2px solid var(--accent-gold); border-radius: 0; }
        .main-content { margin-top: 2rem; flex: 1; }
        
        .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .kpi-card { padding: 1.25rem; display: flex; align-items: center; gap: 1rem; transition: var(--transition); border: 1px solid var(--border-color); }
        .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
        .kpi-icon { width: 45px; height: 45px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .kpi-icon.gold { background: rgba(212, 175, 55, 0.1); color: var(--accent-gold); }
        .kpi-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .kpi-icon.pink { background: rgba(255, 0, 102, 0.1); color: #ff0066; }
        .kpi-label { font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; }
        .kpi-value { font-size: 1.5rem; font-weight: 700; font-family: 'Outfit', sans-serif; display: block; }
        
        .chart-grid-main { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2.5rem; }
        .full-width { width: 100%; }
        .chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        @media (max-width: 1024px) { .chart-row { grid-template-columns: 1fr; } }
        .chart-container { padding: 1.5rem; }
        .chart-title { margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; font-size: 1.1rem; }
        
        .analysts-section { margin-top: 3rem; }
        .analysts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
        .analyst-card { display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem; transition: var(--transition); border: 1px solid var(--border-color); border-radius: 12px; }
        .analyst-card:hover { transform: scale(1.02); border-color: var(--accent-gold); }
        .analyst-photo-wrapper { width: 100px; height: 100px; border-radius: 50%; overflow: hidden; border: 2px solid var(--accent-gold); box-shadow: 0 0 10px rgba(0,0,0,0.5); flex-shrink: 0; }
        .analyst-photo { width: 100%; height: 100%; object-fit: cover; }
        .kpi-grid.status-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; margin-bottom: 2rem; }
        .kpi-card.mini { padding: 0.75rem 1rem; }
        .kpi-value.mini { font-size: 1.1rem; }
        .section-title.mini { font-size: 0.9rem; margin-bottom: 0.75rem; }
        .analyst-details { flex-grow: 1; }
        .analyst-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.25rem; }
        .analyst-details h4 { margin: 0; font-size: 1.2rem; }
        .analyst-stats-mini { display: flex; flex-direction: column; gap: 2px; }
        .mini-stat { font-size: 0.7rem; font-weight: 700; padding: 1px 4px; border-radius: 3px; }
        .mini-stat.camp { background: rgba(212, 175, 55, 0.1); color: var(--accent-gold); border: 1px solid rgba(212, 175, 55, 0.2); }
        .mini-stat.aco { background: rgba(255, 0, 102, 0.1); color: #ff0066; border: 1px solid rgba(255, 0, 102, 0.2); }
        .analyst-details p { margin: 0.25rem 0; font-size: 0.85rem; color: var(--text-secondary); }
        .analyst-badge { font-size: 0.7rem; background: rgba(212, 175, 55, 0.1); color: var(--accent-gold); padding: 0.2rem 0.6rem; border-radius: 4px; display: inline-block; margin-top: 0.5rem; }
        
        .month-selector { display: flex; align-items: center; gap: 0.75rem; }
        .month-dropdown { background: #1a1a1a; color: white; padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid var(--accent-gold); outline: none; }
        
        .table-container { overflow-x: auto; }
        .badge.campanha { background: rgba(212, 175, 55, 0.1); color: var(--accent-gold); }
        .badge.acompanhamento { background: rgba(255, 0, 102, 0.1); color: #ff0066; }
        .analyst-name-table { font-size: 0.7rem; color: #a0a0a0; text-transform: uppercase; font-weight: 500; }
        .actions-cell { display: flex; gap: 0.5rem; }
        .action-btn { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: var(--transition); }
        .action-btn.view { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .action-btn.view:hover { background: #3b82f6; color: white; }
        .action-btn.download { background: rgba(212, 175, 55, 0.1); color: var(--accent-gold); }
        .action-btn.download:hover { background: var(--accent-gold); color: black; }
        
        .loader-container { height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; }
        .loader { width: 45px; height: 45px; border: 3px solid rgba(212, 175, 55, 0.1); border-radius: 50%; border-top-color: var(--accent-gold); animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .dashboard-header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .export-actions { display: flex; gap: 0.75rem; }
        .export-btn { padding: 0.5rem 1rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: var(--transition); color: var(--text-secondary); }
        .export-btn:hover { color: var(--accent-gold); border-color: var(--accent-gold); transform: translateY(-2px); }
        .dashboard-content { background: #0a0a0a; padding: 1.5rem; border-radius: 16px; min-width: 1200px; }
        .section-title.main { margin-bottom: 0.25rem; }
        .dashboard-current-month { font-size: 0.9rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0; }
        .dashboard-view { padding: 0; }
      `}</style>
    </div>
  );
};

export default App;
