import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { useModal } from "connectkit";
import { ShieldCheck, Cpu, Globe, FileText, Upload, Activity } from "lucide-react";

export default function Dashboard() {
  const { isConnected } = useAccount();
  const { setOpen } = useModal();
  const navigate = useNavigate();

  const handleProtectedNav = (path: string) => {
    if (isConnected) {
      navigate(path);
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-6 pt-32 pb-20 gap-10">
        <div className="flex-1">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Digital Health Record <br />
            with <span className="text-emerald-500">Blockchain Traceability</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mb-8">
            J-Trace memungkinkan rekam medis Anda tersimpan aman di jaringan terdistribusi,
            transparan, dan dapat diverifikasi lintas fasilitas kesehatan.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => handleProtectedNav("/upload")}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold text-white shadow-[0_0_15px_#00ff9955]"
            >
              Upload Rekam Medis
            </button>
            <button
              onClick={() => handleProtectedNav("/records")}
              className="px-6 py-3 bg-gray-800/60 hover:bg-gray-700 rounded-lg font-semibold border border-gray-700 text-gray-200"
            >
              Lihat Data
            </button>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <img
            src="/medical-chain.png"
            alt="Blockchain Health Illustration"
            className="w-80 h-80 object-contain drop-shadow-[0_0_20px_#00ff99]"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-r from-emerald-900/10 to-transparent py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Bagaimana J-Trace Bekerja</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-white/10 bg-white/10 backdrop-blur-sm">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">1. Hubungkan Wallet</h3>
              <p className="text-gray-600 text-sm">
                Login aman dengan wallet Web3 untuk autentikasi identitas digital.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-white/10 bg-white/10 backdrop-blur-sm">
              <Upload className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">2. Upload Rekam Medis</h3>
              <p className="text-gray-600 text-sm">
                Unggah file rekam medis ke IPFS, dan simpan hash unik di blockchain.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-white/10 bg-white/10 backdrop-blur-sm">
              <Globe className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">3. Verifikasi Data</h3>
              <p className="text-gray-600 text-sm">
                Dokter dan pasien dapat memverifikasi keaslian data kapan saja.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefit Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Mengapa Menggunakan J-Trace?</h2>
        <p className="text-gray-500 max-w-2xl mx-auto mb-12">
          Dengan memanfaatkan blockchain, J-Trace memastikan rekam medis Anda tidak dapat diubah,
          hanya dapat diakses oleh pihak berwenang, dan tetap transparan bagi peserta JKN.
        </p>

        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-lg border bg-white shadow-md">
            <FileText className="w-8 h-8 text-emerald-600 mb-3" />
            <h3 className="font-semibold mb-2">Rekam Medis Terintegrasi</h3>
            <p className="text-sm text-gray-600">
              Data dari berbagai faskes tersinkronisasi dalam satu jaringan terdesentralisasi.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-white shadow-md">
            <Activity className="w-8 h-8 text-emerald-600 mb-3" />
            <h3 className="font-semibold mb-2">Pelacakan Akurat</h3>
            <p className="text-sm text-gray-600">
              Setiap perubahan terekam di blockchain untuk audit yang transparan.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-white shadow-md">
            <Cpu className="w-8 h-8 text-emerald-600 mb-3" />
            <h3 className="font-semibold mb-2">Keamanan Tinggi</h3>
            <p className="text-sm text-gray-600">
              Enkripsi data pasien dengan IPFS dan validasi hash on-chain menjamin integritas.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleProtectedNav("/UploadRecord")}
          className="mt-12 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold text-white shadow-[0_0_20px_#00ff6655]"
        >
          Coba J-Trace Sekarang
        </button>
      </section>
    </>
  );
}
