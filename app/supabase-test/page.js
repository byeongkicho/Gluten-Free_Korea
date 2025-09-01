'use client';

import { useState, useEffect } from 'react';

export default function SupabaseTestPage() {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [selectedTable, setSelectedTable] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      setConnectionStatus(data);
    } catch (error) {
      setConnectionStatus({
        success: false,
        error: error.message
      });
    }
    setLoading(false);
  };

  const fetchTableData = async (tableName) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/table-data?table=${tableName}&limit=10`);
      const data = await response.json();
      setTableData(data);
    } catch (error) {
      setTableData({
        success: false,
        error: error.message
      });
    }
    setLoading(false);
  };

  const handleTableSelect = (tableName) => {
    setSelectedTable(tableName);
    fetchTableData(tableName);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Supabase Connection Test</h1>
        
        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <button
            onClick={testConnection}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </button>
          
          {connectionStatus && (
            <div className="mt-4">
              <div className={`p-4 rounded-lg ${
                connectionStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <p className="font-semibold">
                  {connectionStatus.success ? '✅ Connected' : '❌ Connection Failed'}
                </p>
                <p className="mt-2">{connectionStatus.message || connectionStatus.error}</p>
                
                {connectionStatus.tables && connectionStatus.tables.length > 0 && (
                  <div className="mt-4">
                    <p className="font-semibold">Available Tables:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {connectionStatus.tables.map((table, index) => (
                        <button
                          key={index}
                          onClick={() => handleTableSelect(table)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded text-sm"
                        >
                          {table}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Table Data */}
        {selectedTable && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Table Data: {selectedTable}</h2>
            
            {loading ? (
              <p>Loading data...</p>
            ) : tableData ? (
              <div>
                {tableData.success ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Showing {tableData.data?.length || 0} records (limit: {tableData.limit})
                    </p>
                    {tableData.data && tableData.data.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              {Object.keys(tableData.data[0]).map((key) => (
                                <th key={key} className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {tableData.data.map((row, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                {Object.values(row).map((value, cellIndex) => (
                                  <td key={cellIndex} className="border border-gray-200 px-4 py-2 text-sm">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-600">No data found in this table.</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-100 text-red-800 p-4 rounded">
                    <p className="font-semibold">Error loading data:</p>
                    <p>{tableData.error}</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Next Steps</h3>
          <ul className="text-blue-800 space-y-2">
            <li>• Make sure you've created a <code className="bg-blue-100 px-1 rounded">.env.local</code> file with your Supabase credentials</li>
            <li>• Test the connection using the button above</li>
            <li>• Click on any table name to view its data</li>
            <li>• Use the <code className="bg-blue-100 px-1 rounded">getSupabaseClient()</code> function in your components to access data</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
