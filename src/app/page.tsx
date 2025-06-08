import QRGenerator from '@/components/QRGenerator';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#395f72] to-[#16222a] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            QR Generator
          </h1>
          <p className="text-xl text-white/80">
            Crea códigos QR personalizados
          </p>
        </header>
        
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <QRGenerator />
        </div>
      </div>
    </main>
  );
}
