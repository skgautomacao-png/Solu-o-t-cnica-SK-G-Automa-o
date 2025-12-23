
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="text-sm md:text-base leading-relaxed text-gray-800 space-y-4">
      {renderContentWithTables(content)}
    </div>
  );
};

const renderContentWithTables = (text: string) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let tableRows: string[] = [];
  let inTable = false;

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    const isTableLine = trimmed.startsWith('|') && trimmed.endsWith('|');

    if (isTableLine) {
      if (!inTable) inTable = true;
      tableRows.push(trimmed);
    } else {
      if (inTable) {
        elements.push(<TableBlock key={`table-${i}`} rows={tableRows} />);
        tableRows = [];
        inTable = false;
      }
      
      if (trimmed !== '') {
        elements.push(<LineRenderer key={`line-${i}`} line={line} />);
      }
    }
  });

  if (inTable && tableRows.length > 0) {
    elements.push(<TableBlock key="table-end" rows={tableRows} />);
  }

  return elements;
};

const LineRenderer: React.FC<{ line: string }> = ({ line }) => {
  // Regex para capturar ![alt](url) e **texto**
  const parts = line.split(/(!\[.*?\]\(.*?\))|(\*\*.*?\*\*)/g).filter(Boolean);

  // Verifica se a linha é o cabeçalho do especialista (contém o mascote)
  const hasMascot = line.includes('jAm2QjF.png');

  if (hasMascot) {
    return (
      <div className="flex items-center space-x-3 mb-4 pb-2 border-b border-gray-50 animate-in slide-in-from-left duration-500">
        {parts.map((part, i) => {
          if (part.startsWith('![') && part.includes('jAm2QjF.png')) {
            const url = part.match(/\((.*?)\)/)?.[1] || "";
            return (
              <img 
                key={i} 
                src={url} 
                alt="Especialista SK-G" 
                className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-red-50 shadow-sm bg-white p-1" 
              />
            );
          }
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <h3 key={i} className="text-[#1a365d] font-black text-lg tracking-tight uppercase italic">
                {part.slice(2, -2)}
              </h3>
            );
          }
          return null;
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1 mb-2">
      {parts.map((part, i) => {
        // Imagens genéricas
        if (part.startsWith('![') && part.includes('](')) {
          const alt = part.match(/\[(.*?)\]/)?.[1] || "";
          const url = part.match(/\((.*?)\)/)?.[1] || "";
          
          // Ignora o logo se ele aparecer por engano no markdown da resposta
          if (url.includes('YRLwjsz.png')) return null;

          return <img key={i} src={url} alt={alt} className="max-w-full rounded-xl shadow-md my-4 border border-gray-100" />;
        }

        // Negrito
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-[#1a365d] bg-blue-50/50 px-1 rounded">{part.slice(2, -2)}</strong>;
        }

        // Texto simples
        return <span key={i} className="text-gray-700">{part}</span>;
      })}
    </div>
  );
};

const TableBlock: React.FC<{ rows: string[] }> = ({ rows }) => {
  const dataRows = rows.filter(r => r.trim() !== '' && !r.includes('---'));
  if (dataRows.length === 0) return null;

  const parseRow = (row: string) => {
    const cols = row.split('|');
    return cols.slice(1, -1).map(c => c.trim());
  };

  const headers = parseRow(dataRows[0]);
  const bodyRows = dataRows.slice(1).map(parseRow);

  return (
    <div className="overflow-x-auto my-6 border border-gray-200 rounded-2xl shadow-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#f8f9fa]">
          <tr>
            {headers.map((h, idx) => (
              <th key={idx} className="px-4 py-4 text-left text-[10px] font-black text-[#1a365d] uppercase tracking-widest border-r border-gray-100 last:border-r-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {bodyRows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-red-50/20 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-4 py-3 text-sm text-gray-700 border-r border-gray-50 last:border-r-0">
                   <LineRenderer line={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MarkdownRenderer;
