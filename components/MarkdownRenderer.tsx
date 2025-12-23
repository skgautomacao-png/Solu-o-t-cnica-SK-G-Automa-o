
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="text-sm md:text-base leading-relaxed text-gray-800 space-y-3">
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

  // Verifica se a linha contém o mascote (avatar do especialista)
  const isSpecialistHeader = line.includes('jAm2QjF.png');

  if (isSpecialistHeader) {
    return (
      <div className="flex items-center space-x-3 mb-2 pb-2 border-b border-gray-100 animate-in fade-in duration-500">
        {parts.map((part, i) => {
          if (part.startsWith('![') && part.includes('jAm2QjF.png')) {
            const url = part.match(/\((.*?)\)/)?.[1] || "";
            return (
              <img 
                key={i} 
                src={url} 
                alt="Avatar Especialista" 
                className="h-10 w-10 rounded-full border border-red-100 shadow-sm bg-white p-0.5" 
              />
            );
          }
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <span key={i} className="text-[#1a365d] font-black text-sm uppercase tracking-wider italic">
                {part.slice(2, -2)}
              </span>
            );
          }
          return null;
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {parts.map((part, i) => {
        // Filtra imagens
        if (part.startsWith('![') && part.includes('](')) {
          const alt = part.match(/\[(.*?)\]/)?.[1] || "";
          const url = part.match(/\((.*?)\)/)?.[1] || "";
          
          // BLOQUEIO TOTAL DO LOGO NAS MENSAGENS (YRLwjsz.png)
          if (url.includes('YRLwjsz.png')) return null;

          return <img key={i} src={url} alt={alt} className="max-w-full rounded-lg shadow-md my-2 border border-gray-100" />;
        }

        // Negrito
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-[#b11818]">{part.slice(2, -2)}</strong>;
        }

        // Texto
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
    <div className="overflow-x-auto my-4 border border-gray-200 rounded-xl shadow-md bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#fcfcfc]">
          <tr>
            {headers.map((h, idx) => (
              <th key={idx} className="px-3 py-3 text-left text-[9px] font-black text-[#1a365d] uppercase tracking-widest border-r border-gray-50 last:border-r-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {bodyRows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-red-50/10 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3 py-2.5 text-xs text-gray-600 border-r border-gray-50 last:border-r-0">
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
