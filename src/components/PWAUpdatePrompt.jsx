import React from 'react';
import { usePWA } from '../hooks/usePWA';
import { Button, Space, message } from 'antd';
import { ReloadOutlined, CloseOutlined, CloudOutlined } from '@ant-design/icons';

/**
 * Componente que muestra notificaciones cuando hay actualizaciones de la PWA disponibles
 */
export default function PWAUpdatePrompt() {
  const { needRefresh, offlineReady, update, dismiss } = usePWA();

  React.useEffect(() => {
    if (offlineReady) {
      message.info({
        content: 'Aplicación lista para usar sin conexión',
        duration: 3,
        icon: <CloudOutlined />,
      });
    }
  }, [offlineReady]);

  if (!needRefresh) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        background: '#fff',
        padding: '16px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 9999,
        maxWidth: '350px',
        border: '1px solid #e8e8e8',
      }}
    >
      <div style={{ marginBottom: '12px', fontWeight: 500 }}>
        Nueva versión disponible
      </div>
      <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
        Hay una actualización disponible. ¿Deseas actualizar ahora?
      </div>
      <Space>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={update}
          size="small"
        >
          Actualizar
        </Button>
        <Button
          icon={<CloseOutlined />}
          onClick={dismiss}
          size="small"
        >
          Después
        </Button>
      </Space>
    </div>
  );
}

