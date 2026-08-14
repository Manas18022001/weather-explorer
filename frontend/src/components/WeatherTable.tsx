import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeatherTableProps {
  data: any[];
}

export const WeatherTable: React.FC<WeatherTableProps> = ({ data }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  if (!data || data.length === 0) return null;

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = page * rowsPerPage;
  const currentData = data.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const handleRowsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(0);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h3 className="font-semibold text-gray-800">Daily Variables</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Rows per page:</span>
          <select 
            value={rowsPerPage} 
            onChange={handleRowsChange}
            className="border-gray-300 rounded text-sm bg-white p-1 outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium text-right">Max Temp (°C)</th>
              <th className="px-6 py-3 font-medium text-right">Min Temp (°C)</th>
              <th className="px-6 py-3 font-medium text-right">Apparent Max (°C)</th>
              <th className="px-6 py-3 font-medium text-right">Apparent Min (°C)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentData.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3 font-medium text-gray-800">{row.date}</td>
                <td className="px-6 py-3 text-right text-red-600">{row.maxTemp}</td>
                <td className="px-6 py-3 text-right text-blue-600">{row.minTemp}</td>
                <td className="px-6 py-3 text-right text-gray-600">{row.appMaxTemp}</td>
                <td className="px-6 py-3 text-right text-gray-600">{row.appMinTemp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, data.length)} of {data.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-2">Page {page + 1} of {totalPages}</span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
