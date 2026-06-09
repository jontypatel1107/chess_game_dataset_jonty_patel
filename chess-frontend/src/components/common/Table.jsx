import React from 'react';
import Loader from './Loader';

const Table = ({ 
  columns, 
  data, 
  loading = false, 
  onRowClick,
  emptyMessage = "No data available" 
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="w-full text-left border-collapse bg-white dark:bg-gray-900">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map((col, index) => (
              <th 
                key={index}
                className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b dark:border-gray-800"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12">
                <Loader />
              </td>
            </tr>
          ) : data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {col.cell ? col.cell(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
