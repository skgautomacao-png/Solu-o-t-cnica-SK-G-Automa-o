
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="text-sm md:text-base leading-relaxed text-gray-800 space-y-2">
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
      if (!inTable) {
        inTable = true;
      }
      tableRows.push(trimmed);
    } else {
      if (inTable) {
        elements.push(<TableBlock key={`table-${i}`} rows={tableRows} />);
        tableRows = [];
        inTable = false;
      }
      
      if (trimmed !== '') {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        elements.push(
          <p key={`p-${i}`} className="mb-2">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      }
    }
  });

  if (inTable && tableRows.length > 0) {
    elements.push(<TableBlock key="table-end" rows={tableRows} />);
  }

  return elements;
};

const TableBlock: React.FC<{ rows: string[] }> = ({ rows }) => {
  // Filtra linhas vazias e separadores de tabela (|---|)
  const dataRows = rows.filter(r => r.trim() !== '' && !r.includes('---'));
  
  if (dataRows.length === 0) return null;

  const parseRow = (row: string) => {
    const cols = row.split('|');
    // Remove os elementos vazios das extremidades causados pelo split nos pipes externos
    return cols.slice(1, -1).map(c => c.trim());
  };

  const headers = parseRow(dataRows[0]);
  const bodyRows = dataRows.slice(1).map(parseRow);

  return (
    <div className="overflow-x-auto my-4 border border-gray-200 rounded-xl shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h, idx) => (
              <th key={idx} className="px-4 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wider border-r border-gray-100 last:border-r-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {bodyRows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-gray-50 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-4 py-3 text-sm text-gray-700 border-r border-gray-50 last:border-r-0">
                   {cell.split(/(\*\*.*?\*\*)/g).map((part, k) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={k} className="text-black font-bold">{part.slice(2, -2)}</strong>;
                      }
                      return part;
                   })}
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
