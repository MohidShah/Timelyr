import React, { useState, useEffect } from 'react';
import { QrCode, Download, Copy } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader } from './ui/Card';

interface QRCodeGeneratorProps {
  url: string;
  title: string;
  className?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  url,
  title,
  className = ''
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQRCode();
  }, [url]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      // Using QR Server API for QR code generation
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '-')}-qr-code.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const copyQRCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
    } catch (error) {
      console.error('Error copying QR code:', error);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <QrCode className="w-5 h-5 mr-2" />
          QR Code
        </h3>
      </CardHeader>
      <CardContent className="text-center">
        {loading ? (
          <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="w-48 h-48 bg-white border border-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
            <img 
              src={qrCodeUrl} 
              alt="QR Code" 
              className="w-44 h-44"
            />
          </div>
        )}
        <p className="text-sm text-gray-600 mb-4">
          Scan with your phone to open the link
        </p>
        <div className="flex justify-center space-x-2">
          <Button variant="secondary" size="sm" onClick={downloadQRCode}>
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
          <Button variant="secondary" size="sm" onClick={copyQRCode}>
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};