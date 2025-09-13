import { useWebSocketStatus, useWebSocketContext } from '@/contexts/WebSocketContext';

export function WebSocketStatus() {
  const { isConnected, hasProvider } = useWebSocketStatus();
  const { connect, disconnect } = useWebSocketContext();

  if (!hasProvider) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 rounded">
        <p className="text-red-700">❌ WebSocket Provider not found</p>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded border ${
      isConnected 
        ? 'bg-green-100 border-green-400' 
        : 'bg-orange-100 border-orange-400'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-orange-500'
          }`} />
          <span className={
            isConnected ? 'text-green-700' : 'text-orange-700'
          }>
            WebSocket {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <div className="space-x-2">
          {!isConnected && (
            <button
              onClick={connect}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Reconnect
            </button>
          )}
          {isConnected && (
            <button
              onClick={disconnect}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-600">
        <p>Status: {isConnected ? '🟢 Active' : '🟠 Inactive'}</p>
        <p>Endpoint: /ws (Unified WebSocket)</p>
      </div>
    </div>
  );
}